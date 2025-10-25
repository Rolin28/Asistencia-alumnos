import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Student {
  id: string;
  codigo: string;
  nombres: string;
  apellidos: string;
  dni: string;
  carrera: string;
  semestre: number;
  email?: string;
  telefono?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  fecha: string;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
  hora_entrada?: string;
  curso: string;
  observaciones?: string;
  created_at: string;
  students?: Student;
}

export interface AttendanceWithStudent extends Attendance {
  students: Student;
}
