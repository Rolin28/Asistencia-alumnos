import { useState } from 'react';
import { GraduationCap, ClipboardCheck, Users } from 'lucide-react';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import AttendanceList from './components/AttendanceList';
import AttendanceForm from './components/AttendanceForm';
import { Student, AttendanceWithStudent } from './lib/supabase';

type View = 'students' | 'attendance';

function App() {
  const [currentView, setCurrentView] = useState<View>('students');
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceWithStudent | null>(null);
  const [refreshStudents, setRefreshStudents] = useState(0);
  const [refreshAttendance, setRefreshAttendance] = useState(0);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowStudentForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleCloseStudentForm = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
  };

  const handleSaveStudent = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
    setRefreshStudents((prev) => prev + 1);
  };

  const handleAddAttendance = () => {
    setEditingAttendance(null);
    setShowAttendanceForm(true);
  };

  const handleEditAttendance = (attendance: AttendanceWithStudent) => {
    setEditingAttendance(attendance);
    setShowAttendanceForm(true);
  };

  const handleCloseAttendanceForm = () => {
    setShowAttendanceForm(false);
    setEditingAttendance(null);
  };

  const handleSaveAttendance = () => {
    setShowAttendanceForm(false);
    setEditingAttendance(null);
    setRefreshAttendance((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Sistema de Asistencia
                </h1>
                <p className="text-sm text-slate-600 mt-1">SENATI</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentView('students')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                currentView === 'students'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-5 h-5" />
              Estudiantes
            </button>
            <button
              onClick={() => setCurrentView('attendance')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                currentView === 'attendance'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ClipboardCheck className="w-5 h-5" />
              Asistencia
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'students' ? (
          <StudentList
            onEdit={handleEditStudent}
            onAdd={handleAddStudent}
            refreshTrigger={refreshStudents}
          />
        ) : (
          <AttendanceList
            onEdit={handleEditAttendance}
            onAdd={handleAddAttendance}
            refreshTrigger={refreshAttendance}
          />
        )}
      </main>

      {showStudentForm && (
        <StudentForm
          student={editingStudent}
          onClose={handleCloseStudentForm}
          onSave={handleSaveStudent}
        />
      )}

      {showAttendanceForm && (
        <AttendanceForm
          attendance={editingAttendance}
          onClose={handleCloseAttendanceForm}
          onSave={handleSaveAttendance}
        />
      )}

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-600 text-sm">
            Sistema de Gestión de Asistencia - SENATI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
