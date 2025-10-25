import { useState, useEffect } from 'react';
import { supabase, AttendanceWithStudent } from '../lib/supabase';
import { Pencil, Trash2, ClipboardList, Calendar, Filter } from 'lucide-react';

interface AttendanceListProps {
  onEdit: (attendance: AttendanceWithStudent) => void;
  onAdd: () => void;
  refreshTrigger?: number;
}

export default function AttendanceList({ onEdit, onAdd, refreshTrigger }: AttendanceListProps) {
  const [attendances, setAttendances] = useState<AttendanceWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCurso, setFilterCurso] = useState('');
  const [cursos, setCursos] = useState<string[]>([]);

  const loadAttendances = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('attendance')
        .select(`
          *,
          students (*)
        `)
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false });

      if (filterDate) {
        query = query.eq('fecha', filterDate);
      }
      if (filterCurso) {
        query = query.eq('curso', filterCurso);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAttendances(data as AttendanceWithStudent[] || []);

      const uniqueCursos = [...new Set((data || []).map(a => a.curso))].sort();
      setCursos(uniqueCursos);
    } catch (error) {
      console.error('Error loading attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendances();
  }, [refreshTrigger, filterDate, filterCurso]);

  const handleDelete = async (id: string, studentName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el registro de asistencia de ${studentName}?`)) return;

    try {
      const { error } = await supabase.from('attendance').delete().eq('id', id);
      if (error) throw error;
      loadAttendances();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Error al eliminar el registro');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const styles = {
      presente: 'bg-green-100 text-green-800',
      ausente: 'bg-red-100 text-red-800',
      tardanza: 'bg-yellow-100 text-yellow-800',
      justificado: 'bg-blue-100 text-blue-800',
    };
    return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoLabel = (estado: string) => {
    const labels = {
      presente: 'Presente',
      ausente: 'Ausente',
      tardanza: 'Tardanza',
      justificado: 'Justificado',
    };
    return labels[estado as keyof typeof labels] || estado;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando registros de asistencia...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Fecha
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Filter className="w-4 h-4 inline mr-1" />
            Curso
          </label>
          <select
            value={filterCurso}
            onChange={(e) => setFilterCurso(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los cursos</option>
            {cursos.map((curso) => (
              <option key={curso} value={curso}>
                {curso}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
        >
          <ClipboardList className="w-5 h-5" />
          Registrar Asistencia
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observaciones
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No hay registros de asistencia para los filtros seleccionados
                  </td>
                </tr>
              ) : (
                attendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(attendance.fecha).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.students.apellidos}, {attendance.students.nombres}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.students.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {attendance.curso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(
                          attendance.estado
                        )}`}
                      >
                        {getEstadoLabel(attendance.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.hora_entrada || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {attendance.observaciones || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(attendance)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              attendance.id,
                              `${attendance.students.nombres} ${attendance.students.apellidos}`
                            )
                          }
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Mostrando {attendances.length} registro{attendances.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
