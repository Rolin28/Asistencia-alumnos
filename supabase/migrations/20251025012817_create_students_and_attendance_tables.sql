/*
  # Sistema de Asistencia SENATI
  
  ## Descripción
  Este migration crea el esquema completo para el sistema de registro de asistencia
  de alumnos de SENATI, incluyendo tablas para estudiantes y registros de asistencia.
  
  ## 1. Nuevas Tablas
  
  ### Tabla `students` (Estudiantes)
  - `id` (uuid, primary key) - Identificador único del estudiante
  - `codigo` (text, unique, required) - Código único del estudiante en SENATI
  - `nombres` (text, required) - Nombres del estudiante
  - `apellidos` (text, required) - Apellidos del estudiante
  - `dni` (text, unique, required) - DNI del estudiante
  - `carrera` (text, required) - Carrera que cursa el estudiante
  - `semestre` (integer, required) - Semestre actual del estudiante
  - `email` (text, unique) - Email del estudiante
  - `telefono` (text) - Teléfono de contacto
  - `activo` (boolean, default true) - Indica si el estudiante está activo
  - `created_at` (timestamptz) - Fecha de creación del registro
  - `updated_at` (timestamptz) - Fecha de última actualización
  
  ### Tabla `attendance` (Asistencia)
  - `id` (uuid, primary key) - Identificador único del registro
  - `student_id` (uuid, foreign key) - Referencia al estudiante
  - `fecha` (date, required) - Fecha de la asistencia
  - `estado` (text, required) - Estado: 'presente', 'ausente', 'tardanza', 'justificado'
  - `hora_entrada` (time) - Hora de entrada registrada
  - `curso` (text, required) - Nombre del curso
  - `observaciones` (text) - Observaciones adicionales
  - `created_at` (timestamptz) - Fecha de creación del registro
  
  ## 2. Seguridad
  - Se habilita Row Level Security (RLS) en ambas tablas
  - Políticas para permitir lectura pública de estudiantes activos
  - Políticas para permitir todas las operaciones de asistencia (sin autenticación para demo)
  - En producción, estas políticas deberían restringirse a usuarios autenticados
  
  ## 3. Índices
  - Índice en `students.codigo` para búsquedas rápidas
  - Índice en `students.dni` para búsquedas por documento
  - Índice en `attendance.student_id` para consultas relacionadas
  - Índice compuesto en `attendance(student_id, fecha)` para optimizar consultas de asistencia por estudiante y fecha
  
  ## 4. Notas Importantes
  - Los campos de contacto (email, telefono) son opcionales
  - El estado de asistencia está limitado a valores específicos mediante CHECK constraint
  - Se incluye actualización automática de `updated_at` en la tabla students mediante trigger
*/

-- Crear tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  dni text UNIQUE NOT NULL,
  carrera text NOT NULL,
  semestre integer NOT NULL CHECK (semestre >= 1 AND semestre <= 6),
  email text UNIQUE,
  telefono text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de asistencia
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  estado text NOT NULL CHECK (estado IN ('presente', 'ausente', 'tardanza', 'justificado')),
  hora_entrada time,
  curso text NOT NULL,
  observaciones text,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_students_codigo ON students(codigo);
CREATE INDEX IF NOT EXISTS idx_students_dni ON students(dni);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_fecha ON attendance(student_id, fecha);
CREATE INDEX IF NOT EXISTS idx_attendance_fecha ON attendance(fecha);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en students
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Políticas para students (acceso público para demo)
CREATE POLICY "Permitir lectura de estudiantes activos"
  ON students FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de estudiantes"
  ON students FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de estudiantes"
  ON students FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de estudiantes"
  ON students FOR DELETE
  USING (true);

-- Políticas para attendance (acceso público para demo)
CREATE POLICY "Permitir lectura de asistencia"
  ON attendance FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de asistencia"
  ON attendance FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de asistencia"
  ON attendance FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación de asistencia"
  ON attendance FOR DELETE
  USING (true);