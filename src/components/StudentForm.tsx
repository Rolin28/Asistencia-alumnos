import { useState, useEffect } from 'react';
import { supabase, Student } from '../lib/supabase';
import { X } from 'lucide-react';

interface StudentFormProps {
  student?: Student | null;
  onClose: () => void;
  onSave: () => void;
}

const CARRERAS = [
  'Administración Industrial',
  'Contabilidad',
  'Electrotecnia Industrial',
  'Electrónica Industrial',
  'Mecánica Automotriz',
  'Mecánica de Mantenimiento',
  'Mecatrónica Industrial',
  'Construcción Civil',
  'Computación e Informática',
  'Confección Industrial',
];

export default function StudentForm({ student, onClose, onSave }: StudentFormProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombres: '',
    apellidos: '',
    dni: '',
    carrera: '',
    semestre: 1,
    email: '',
    telefono: '',
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        codigo: student.codigo,
        nombres: student.nombres,
        apellidos: student.apellidos,
        dni: student.dni,
        carrera: student.carrera,
        semestre: student.semestre,
        email: student.email || '',
        telefono: student.telefono || '',
        activo: student.activo,
      });
    }
  }, [student]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido';
    if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son requeridos';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }
    if (!formData.carrera) newErrors.carrera = 'La carrera es requerida';
    if (formData.semestre < 1 || formData.semestre > 6) {
      newErrors.semestre = 'El semestre debe estar entre 1 y 6';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const dataToSave = {
        ...formData,
        email: formData.email || null,
        telefono: formData.telefono || null,
      };

      if (student) {
        const { error } = await supabase
          .from('students')
          .update(dataToSave)
          .eq('id', student.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('students').insert([dataToSave]);
        if (error) throw error;
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving student:', error);
      if (error.code === '23505') {
        if (error.message.includes('codigo')) {
          setErrors({ codigo: 'Este código ya está registrado' });
        } else if (error.message.includes('dni')) {
          setErrors({ dni: 'Este DNI ya está registrado' });
        } else if (error.message.includes('email')) {
          setErrors({ email: 'Este email ya está registrado' });
        }
      } else {
        alert('Error al guardar el estudiante');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {student ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.codigo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: SEN001"
              />
              {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                maxLength={8}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dni ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345678"
              />
              {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombres ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan Carlos"
              />
              {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.apellidos ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Pérez García"
              />
              {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carrera <span className="text-red-500">*</span>
              </label>
              <select
                name="carrera"
                value={formData.carrera}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.carrera ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar carrera</option>
                {CARRERAS.map((carrera) => (
                  <option key={carrera} value={carrera}>
                    {carrera}
                  </option>
                ))}
              </select>
              {errors.carrera && <p className="text-red-500 text-xs mt-1">{errors.carrera}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semestre <span className="text-red-500">*</span>
              </label>
              <select
                name="semestre"
                value={formData.semestre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.semestre ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}° Semestre
                  </option>
                ))}
              </select>
              {errors.semestre && <p className="text-red-500 text-xs mt-1">{errors.semestre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="estudiante@senati.pe"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="987654321"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
              Estudiante activo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : student ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
