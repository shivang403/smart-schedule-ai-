import React, { useState } from 'react';
import {
  Users,
  DoorOpen,
  BookOpen,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Shield,
  Layers,
  AlertCircle,
} from 'lucide-react';
import {
  Teacher,
  Room,
  Subject,
  Constraint,
  DayOfWeek,
  DAYS_OF_WEEK,
} from '../types';

interface SetupDataViewProps {
  teachers: Teacher[];
  rooms: Room[];
  subjects: Subject[];
  constraints: Constraint[];
  subTab?: 'teachers' | 'rooms' | 'subjects' | 'constraints';
  onSubTabChange?: (sub: 'teachers' | 'rooms' | 'subjects' | 'constraints') => void;
  onAddTeacher: (teacher: Teacher) => Promise<void>;
  onDeleteTeacher: (id: string) => Promise<void>;
  onAddRoom: (room: Room) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
  onAddSubject: (subject: Subject) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onAddConstraint: (constraint: Constraint) => Promise<void>;
  onToggleConstraint: (id: string, enabled: boolean) => Promise<void>;
  onDeleteConstraint: (id: string) => Promise<void>;
  onLoadDemoData: () => Promise<void>;
  isLoadingDemo: boolean;
}

export const SetupDataView: React.FC<SetupDataViewProps> = ({
  teachers,
  rooms,
  subjects,
  constraints,
  subTab,
  onSubTabChange,
  onAddTeacher,
  onDeleteTeacher,
  onAddRoom,
  onDeleteRoom,
  onAddSubject,
  onDeleteSubject,
  onAddConstraint,
  onToggleConstraint,
  onDeleteConstraint,
  onLoadDemoData,
  isLoadingDemo,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'teachers' | 'rooms' | 'subjects' | 'constraints'>('teachers');
  const activeSubTab = subTab || internalSubTab;
  const setActiveSubTab = (tab: 'teachers' | 'rooms' | 'subjects' | 'constraints') => {
    setInternalSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  // Teacher Form State
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherDept, setTeacherDept] = useState('Computer Science');
  const [teacherMaxHours, setTeacherMaxHours] = useState(4);
  const [teacherUnavailableDays, setTeacherUnavailableDays] = useState<DayOfWeek[]>([]);
  const [teacherColor, setTeacherColor] = useState('#2563eb');
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);

  // Room Form State
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(60);
  const [roomType, setRoomType] = useState<Room['type']>('Lecture Hall');
  const [roomUnavailAfter, setRoomUnavailAfter] = useState('');
  const [isSavingRoom, setIsSavingRoom] = useState(false);

  // Subject Form State
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectTeacherId, setSubjectTeacherId] = useState('');
  const [subjectSessions, setSubjectSessions] = useState(3);
  const [subjectRoomType, setSubjectRoomType] = useState<Subject['preferredRoomType']>('Lecture Hall');
  const [subjectSections, setSubjectSections] = useState('');
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  // Constraint Form State
  const [constraintTitle, setConstraintTitle] = useState('');
  const [constraintType, setConstraintType] = useState<Constraint['type']>('TEACHER_UNAVAILABLE_DAY');
  const [constraintDesc, setConstraintDesc] = useState('');
  const [constraintTargetId, setConstraintTargetId] = useState('');
  const [constraintDay, setConstraintDay] = useState<DayOfWeek>('Wednesday');
  const [constraintPriority, setConstraintPriority] = useState<'HIGH' | 'MEDIUM'>('HIGH');
  const [isSavingConstraint, setIsSavingConstraint] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Handle Teacher Submit
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      showFeedback('error', 'Teacher name is required.');
      return;
    }
    setIsSavingTeacher(true);
    try {
      const newTeacher: Teacher = {
        id: `t_${Date.now()}`,
        name: teacherName.trim(),
        email: teacherEmail.trim() || `${teacherName.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
        department: teacherDept,
        maxHoursPerDay: Number(teacherMaxHours) || 4,
        unavailableDays: teacherUnavailableDays,
        color: teacherColor,
        createdAt: new Date().toISOString(),
      };
      await onAddTeacher(newTeacher);
      setTeacherName('');
      setTeacherEmail('');
      setTeacherUnavailableDays([]);
      showFeedback('success', `Teacher "${newTeacher.name}" saved to Firestore successfully!`);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to save teacher');
    } finally {
      setIsSavingTeacher(false);
    }
  };

  // Handle Room Submit
  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      showFeedback('error', 'Room name is required.');
      return;
    }
    setIsSavingRoom(true);
    try {
      const newRoom: Room = {
        id: `r_${Date.now()}`,
        name: roomName.trim(),
        capacity: Number(roomCapacity) || 60,
        type: roomType,
        unavailableAfterTime: roomUnavailAfter ? roomUnavailAfter : undefined,
        createdAt: new Date().toISOString(),
      };
      await onAddRoom(newRoom);
      setRoomName('');
      setRoomUnavailAfter('');
      showFeedback('success', `Room "${newRoom.name}" saved to Firestore successfully!`);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to save room');
    } finally {
      setIsSavingRoom(false);
    }
  };

  // Handle Subject Submit
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode.trim() || !subjectName.trim()) {
      showFeedback('error', 'Subject code and title are required.');
      return;
    }
    const teacherId = subjectTeacherId || (teachers[0] ? teachers[0].id : '');
    if (!teacherId) {
      showFeedback('error', 'Please assign a teacher to this subject.');
      return;
    }
    const classSections: string[] = Array.from(new Set<string>(
      subjectSections.split(/[,\n]/).map((section) => section.trim()).filter(Boolean)
    ));
    if (classSections.length === 0) {
      showFeedback('error', 'Enter at least one branch or class section, such as CSE-A or ECE-A.');
      return;
    }
    setIsSavingSubject(true);
    try {
      const newSubject: Subject = {
        id: `s_${Date.now()}`,
        code: subjectCode.trim().toUpperCase(),
        name: subjectName.trim(),
        assignedTeacherId: teacherId,
        weeklySessionsRequired: Number(subjectSessions) || 3,
        preferredRoomType: subjectRoomType,
        classSections,
        createdAt: new Date().toISOString(),
      };
      await onAddSubject(newSubject);
      setSubjectCode('');
      setSubjectName('');
      setSubjectSections('');
      showFeedback('success', `Subject "${newSubject.code}: ${newSubject.name}" saved to Firestore!`);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to save subject');
    } finally {
      setIsSavingSubject(false);
    }
  };

  // Handle Constraint Submit
  const handleConstraintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!constraintTitle.trim()) {
      showFeedback('error', 'Constraint title is required.');
      return;
    }
    setIsSavingConstraint(true);
    try {
      let targetName = '';
      let value: any = {};

      if (constraintType === 'TEACHER_UNAVAILABLE_DAY') {
        const t = teachers.find((x) => x.id === constraintTargetId) || teachers[0];
        targetName = t?.name || 'Selected Faculty';
        value = { day: constraintDay };
      } else if (constraintType === 'ROOM_UNAVAILABLE_AFTER') {
        const r = rooms.find((x) => x.id === constraintTargetId) || rooms[0];
        targetName = r?.name || 'Selected Room';
        value = { afterTime: '14:00', restrictedSlotIndices: [4, 5] };
      } else if (constraintType === 'MAX_CONSECUTIVE_CLASSES') {
        value = { maxConsecutive: 2 };
      }

      const newConstraint: Constraint = {
        id: `c_${Date.now()}`,
        title: constraintTitle.trim(),
        type: constraintType,
        description: constraintDesc.trim() || `Administrative constraint: ${constraintTitle}`,
        targetId: constraintTargetId || undefined,
        targetName: targetName || undefined,
        value,
        enabled: true,
        priority: constraintPriority,
        createdAt: new Date().toISOString(),
      };

      await onAddConstraint(newConstraint);
      setConstraintTitle('');
      setConstraintDesc('');
      showFeedback('success', `Constraint "${newConstraint.title}" saved to Firestore!`);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to save constraint');
    } finally {
      setIsSavingConstraint(false);
    }
  };

  const toggleUnavailableDay = (day: DayOfWeek) => {
    if (teacherUnavailableDays.includes(day)) {
      setTeacherUnavailableDays(teacherUnavailableDays.filter((d) => d !== day));
    } else {
      setTeacherUnavailableDays([...teacherUnavailableDays, day]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Setup Academic Data</h1>
          <p className="text-sm text-slate-600">
            Define faculty availability, room limits, courses, and administrative constraints. All stored in Firestore.
          </p>
        </div>

        <button
          onClick={onLoadDemoData}
          disabled={isLoadingDemo}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingDemo ? 'animate-spin' : ''}`} />
          <span>{isLoadingDemo ? 'Writing Demo to Firestore...' : 'Load Demo Data (6+ Teachers, 5 Rooms)'}</span>
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Subtabs Selector */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('teachers')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'teachers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teachers ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rooms')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'rooms'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Rooms ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('constraints')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'constraints'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Constraints ({constraints.length})</span>
        </button>
      </div>

      {/* ---------------- 1. TEACHERS TAB ---------------- */}
      {activeSubTab === 'teachers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Teacher Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Add Teacher</span>
            </h2>
            <p className="text-xs text-slate-500 mb-5">Creates a new faculty record in the Firestore teachers collection.</p>

            <form onSubmit={handleTeacherSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name & Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. r.sharma@college.edu"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select
                    value={teacherDept}
                    onChange={(e) => setTeacherDept(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Physics & Circuits">Physics & Circuits</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Cyber Security">Cyber Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Daily Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={teacherMaxHours}
                    onChange={(e) => setTeacherMaxHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Unavailable Days Checkboxes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Unavailable Days (Off Days)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleUnavailableDay(d)}
                      className={`px-2 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                        teacherUnavailableDays.includes(d)
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d.slice(0, 3)} {teacherUnavailableDays.includes(d) ? '✕' : ''}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Highlighted days will have 0 classes scheduled.</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Calendar Badge Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={teacherColor}
                    onChange={(e) => setTeacherColor(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border border-slate-300 p-0.5"
                  />
                  <span className="text-xs text-slate-600 font-mono">{teacherColor}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingTeacher}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingTeacher ? 'Saving to Firestore...' : 'Save Teacher to Firestore'}
              </button>
            </form>
          </div>

          {/* Teacher List Table/Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Registered Faculty ({teachers.length})</h2>
                <span className="text-xs text-slate-500 font-medium">Synced with Firestore</span>
              </div>

              {teachers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No teachers found. Click "Load Demo Data" or use the form to add faculty.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {teachers.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: t.color || '#2563eb' }}
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{t.department}</span>
                            <span>•</span>
                            <span>{t.email}</span>
                            <span>•</span>
                            <span>Max: {t.maxHoursPerDay || 4}h/day</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {t.unavailableDays && t.unavailableDays.length > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Off: {t.unavailableDays.join(', ')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Available Mon-Fri
                          </span>
                        )}

                        <button
                          onClick={() => onDeleteTeacher(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Teacher"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 2. ROOMS TAB ---------------- */}
      {activeSubTab === 'rooms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Room Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>Add Classroom / Lab</span>
            </h2>
            <p className="text-xs text-slate-500 mb-5">Persists classroom venue into Firestore rooms collection.</p>

            <form onSubmit={handleRoomSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Room Identifier / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Room 101 or Computer Lab A"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Student Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Facility Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as Room['type'])}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Seminar Room">Seminar Room</option>
                    <option value="Tutorial Room">Tutorial Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Unavailable After Time (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 14:00 or 2 PM"
                  value={roomUnavailAfter}
                  onChange={(e) => setRoomUnavailAfter(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Example: Set "14:00" to restrict classes after 2 PM (such as Room 101 constraint).
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingRoom}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingRoom ? 'Saving to Firestore...' : 'Save Room to Firestore'}
              </button>
            </form>
          </div>

          {/* Rooms List Table */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Campus Facilities ({rooms.length})</h2>
                <span className="text-xs text-slate-500 font-medium">Firestore Synced</span>
              </div>

              {rooms.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No rooms found. Add a room or load demo dataset.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {rooms.map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{r.name}</p>
                          <p className="text-xs text-slate-500">
                            {r.type} • Capacity: {r.capacity} students
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {r.unavailableAfterTime ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Locked after {r.unavailableAfterTime}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            All Day Open
                          </span>
                        )}

                        <button
                          onClick={() => onDeleteRoom(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. SUBJECTS TAB ---------------- */}
      {activeSubTab === 'subjects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Subject Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>Add Subject / Course</span>
            </h2>
            <p className="text-xs text-slate-500 mb-5">Registers academic subject load into Firestore subjects collection.</p>

            <form onSubmit={handleSubjectSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS301"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Subject Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Faculty</label>
                <select
                  value={subjectTeacherId}
                  onChange={(e) => setSubjectTeacherId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Weekly Periods</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subjectSessions}
                    onChange={(e) => setSubjectSessions(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preferred Venue</label>
                  <select
                    value={subjectRoomType}
                    onChange={(e) => setSubjectRoomType(e.target.value as Subject['preferredRoomType'])}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Seminar Room">Seminar Room</option>
                  </select>
                </div>
              </div>

              {/* Dynamic class sections / branches */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Branches / Class Sections</label>
                <input
                  type="text"
                  value={subjectSections}
                  onChange={(e) => setSubjectSections(e.target.value)}
                  placeholder="e.g. CSE-A, CSE-B, ECE-A"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter one or more names separated by commas. You can add any branch or section; each gets {subjectSessions} sessions.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingSubject}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingSubject ? 'Saving to Firestore...' : 'Save Subject to Firestore'}
              </button>
            </form>
          </div>

          {/* Subjects Table */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Course Roster ({subjects.length})</h2>
                <span className="text-xs text-slate-500 font-medium">Firestore Synced</span>
              </div>

              {subjects.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No subjects found. Load demo data or create a course.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {subjects.map((s) => {
                    const teacher = teachers.find((t) => t.id === s.assignedTeacherId);
                    return (
                      <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                              {s.code}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span>Faculty: {teacher ? teacher.name : 'Unassigned'}</span>
                            <span>•</span>
                            <span>{s.weeklySessionsRequired} sessions/week</span>
                            <span>•</span>
                            <span>{s.preferredRoomType || 'Lecture Hall'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {s.classSections.map((sec) => (
                              <span
                                key={sec}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {sec}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => onDeleteSubject(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 4. CONSTRAINTS TAB ---------------- */}
      {activeSubTab === 'constraints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Constraint Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Add Custom Constraint</span>
            </h2>
            <p className="text-xs text-slate-500 mb-5">Saved directly in the Firestore constraints collection.</p>

            <form onSubmit={handleConstraintSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Constraint Rule Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sharma is unavailable on Wednesday"
                  value={constraintTitle}
                  onChange={(e) => setConstraintTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Constraint Type</label>
                <select
                  value={constraintType}
                  onChange={(e) => setConstraintType(e.target.value as Constraint['type'])}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="TEACHER_UNAVAILABLE_DAY">Teacher Unavailable on Day</option>
                  <option value="ROOM_UNAVAILABLE_AFTER">Room Unavailable After Time</option>
                  <option value="MAX_CONSECUTIVE_CLASSES">Avoid More Than 2 Consecutive Classes</option>
                  <option value="NO_CLASS_BEFORE_9AM">No Class Should Start Before 9 AM</option>
                  <option value="CUSTOM">Custom Institutional Rule</option>
                </select>
              </div>

              {constraintType === 'TEACHER_UNAVAILABLE_DAY' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Teacher</label>
                    <select
                      value={constraintTargetId}
                      onChange={(e) => setConstraintTargetId(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    >
                      <option value="">-- Choose Teacher --</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Off Day</label>
                    <select
                      value={constraintDay}
                      onChange={(e) => setConstraintDay(e.target.value as DayOfWeek)}
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {constraintType === 'ROOM_UNAVAILABLE_AFTER' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Restricted Room</label>
                  <select
                    value={constraintTargetId}
                    onChange={(e) => setConstraintTargetId(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  >
                    <option value="">-- Choose Room --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this constraint must be enforced..."
                  value={constraintDesc}
                  onChange={(e) => setConstraintDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Priority</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={constraintPriority === 'HIGH'}
                      onChange={() => setConstraintPriority('HIGH')}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-rose-700">HIGH (Strict)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={constraintPriority === 'MEDIUM'}
                      onChange={() => setConstraintPriority('MEDIUM')}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-amber-700">MEDIUM (Preference)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingConstraint}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingConstraint ? 'Saving to Firestore...' : 'Save Constraint to Firestore'}
              </button>
            </form>
          </div>

          {/* Constraints List Table */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Scheduling Constraints ({constraints.length})</h2>
                <span className="text-xs text-slate-500 font-medium">Firestore Collection: constraints</span>
              </div>

              <div className="space-y-3">
                {constraints.map((c) => (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      c.enabled
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-slate-100/40 border-slate-200/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={c.enabled}
                        onChange={(e) => onToggleConstraint(c.id, e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                        title="Toggle Constraint"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{c.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{c.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          c.enabled
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {c.enabled ? 'Active' : 'Disabled'}
                      </span>

                      <button
                        onClick={() => onDeleteConstraint(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Constraint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
