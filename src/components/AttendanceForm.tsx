import { useState, useEffect } from 'react';
import { supabase, Student, AttendanceWithStudent } from '../lib/supabase';
import { X, Search } from 'lucide-react';

interface AttendanceFormProps {
  attendance?: AttendanceWithStudent | null;
  onClose: () => void;
  onSave: () => void;
}

export default function AttendanceForm({ attendance, onClose, onSave }: AttendanceFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudentList, setShowStudentList] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'presente' as 'presente' | 'ausente' | 'tardanza' | 'justificado',
    hora_entrada: '',
    curso: '',
    observaciones: '',
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadStudents();
    if (attendance) {
      setFormData({
        student_id: attendance.student_id,
        fecha: attendance.fecha,
        estado: attendance.estado,
        hora_entrada: attendance.hora_entrada || '',
        curso: attendance.curso,
        observaciones: attendance.observaciones || '',
      });
      setSelectedStudent(attendance.students);
    }
  }, [attendance]);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('activo', true)
        .order('apellidos', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    return (
      student.nombres.toLowerCase().includes(search) ||
      student.apellidos.toLowerCase().includes(search) ||
      student.codigo.toLowerCase().includes(search)
    );
  });

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormData((prev) => ({ ...prev, student_id: student.id }));
    setShowStudentList(false);
    setSearchTerm('');
    if (errors.student_id) {
      setErrors((prev) => ({ ...prev, student_id: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_id) newErrors.student_id = 'Debe seleccionar un estudiante';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.curso.trim()) newErrors.curso = 'El curso es requerido';

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
        hora_entrada: formData.hora_entrada || null,
        observaciones: formData.observaciones || null,
      };

      if (attendance) {
        const { error } = await supabase
          .from('attendance')
          .update(dataToSave)
          .eq('id', attendance.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('attendance').insert([dataToSave]);
        if (error) throw error;
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      alert('Error al guardar el registro de asistencia');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {attendance ? 'Editar Asistencia' : 'Registrar Asistencia'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante <span className="text-red-500">*</span>
            </label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedStudent.apellidos}, {selectedStudent.nombres}
                  </div>
                  <div className="text-sm text-gray-600">
                    Código: {selectedStudent.codigo} | {selectedStudent.carrera}
                  </div>
                </div>
                {!attendance && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      setFormData((prev) => ({ ...prev, student_id: '' }));
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Cambiar
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar estudiante por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowStudentList(true);
                    }}
                    onFocus={() => setShowStudentList(true)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.student_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {showStudentList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">
                        No se encontraron estudiantes
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => selectStudent(student)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {student.apellidos}, {student.nombres}
                          </div>
                          <div className="text-sm text-gray-600">
                            {student.codigo} | {student.carrera}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fecha ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="presente">Presente</option>
                <option value="ausente">Ausente</option>
                <option value="tardanza">Tardanza</option>
                <option value="justificado">Justificado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="curso"
                value={formData.curso}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.curso ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Matemáticas I"
              />
              {errors.curso && <p className="text-red-500 text-xs mt-1">{errors.curso}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrada</label>
              <input
                type="time"
                name="hora_entrada"
                value={formData.hora_entrada}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales sobre la asistencia..."
            />
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : attendance ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
