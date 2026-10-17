import React, { useEffect, useState } from 'react';
import {
  Download,
  RefreshCw,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
  Printer,
  Pencil,
  X,
  Save,
} from 'lucide-react';
import {
  TimetableDoc,
  TimetableSlotEntry,
  DayOfWeek,
  TimeSlot,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  Constraint,
  GeminiInsights,
  Teacher,
  Room,
  Subject,
  ScheduleConflict,
} from '../types';
import { exportTimetableToCSV } from '../utils/scheduler';

interface TimetableViewProps {
  timetable: TimetableDoc | null;
  constraints?: Constraint[];
  teacherCount: number;
  roomCount: number;
  subjectCount: number;
  onRegenerate: () => void;
  onOpenSavedModal: () => void;
  onNavigateToGemini: () => void;
  onUpdateTimetableInsights?: (insights: GeminiInsights) => void;
  onUpdateTimetable?: (timetable: TimetableDoc) => Promise<void>;
  teachers: Teacher[];
  rooms: Room[];
  subjects: Subject[];
  isGenerating: boolean;
}

// Map color accents in Clean Utility / Minimal style
const ACCENT_STYLES = [
  { bg: 'bg-blue-50', border: 'border-blue-400', textTitle: 'text-blue-900', textSub: 'text-blue-700' },
  { bg: 'bg-emerald-50', border: 'border-emerald-400', textTitle: 'text-emerald-900', textSub: 'text-emerald-700' },
  { bg: 'bg-indigo-50', border: 'border-indigo-400', textTitle: 'text-indigo-900', textSub: 'text-indigo-700' },
  { bg: 'bg-violet-50', border: 'border-violet-400', textTitle: 'text-violet-900', textSub: 'text-violet-700' },
  { bg: 'bg-orange-50', border: 'border-orange-400', textTitle: 'text-orange-900', textSub: 'text-orange-700' },
];

function getAccentForSubject(code: string) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ACCENT_STYLES.length;
  return ACCENT_STYLES[index];
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  timetable,
  constraints = [],
  teacherCount,
  roomCount,
  subjectCount,
  onRegenerate,
  onOpenSavedModal,
  onNavigateToGemini,
  onUpdateTimetableInsights,
  onUpdateTimetable,
  teachers,
  rooms,
  subjects,
  isGenerating,
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('ALL');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlotEntry | null>(null);
  const [selectedEditSection, setSelectedEditSection] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setSelectedSection('');
    setSelectedTeacher('ALL');
  }, [timetable?.id]);

  if (!timetable) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto my-12 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-indigo-600 mx-auto mb-3">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">No Schedule Generated</h2>
        <p className="text-slate-500 text-xs mb-4">
          Click below to run the scheduling engine with current faculty, rooms, and constraints.
        </p>
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 cursor-pointer"
        >
          {isGenerating ? 'Generating...' : 'Generate Smart Timetable'}
        </button>
      </div>
    );
  }

  // Filter slots
  const filteredSlots = timetable.slots.filter((slot) => {
    if (!selectedSection || slot.classSection !== selectedSection) return false;
    if (selectedTeacher !== 'ALL' && slot.teacherName !== selectedTeacher) return false;
    return true;
  });

  const availableSections = Array.from(new Set<string>([
    ...(timetable.classSections || []),
    ...timetable.slots.map((slot) => slot.classSection),
  ])).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const availableTeachers = Array.from(new Set<string>(
    timetable.slots
      .filter((slot) => slot.classSection === selectedSection)
      .map((slot) => slot.teacherName)
  )).sort((a, b) => a.localeCompare(b));

  const getSlot = (day: DayOfWeek, slotIndex: number): TimetableSlotEntry | undefined => {
    return filteredSlots.find(
      (s) => s.day === day && (s.timeSlotIndex === slotIndex || s.timeSlot === TIME_SLOTS[slotIndex])
    );
  };

  const handleDownloadCSV = () => {
    if (!selectedSection) return;
    const csvData = exportTimetableToCSV(timetable, selectedSection);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${timetable.name.replace(/\s+/g, '_')}_${selectedSection}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => window.print();

  const handleSaveSlot = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingSlot || !onUpdateTimetable) return;
    const form = new FormData(event.currentTarget);
    const subject = subjects.find((item) => item.id === form.get('subjectId'));
    const teacher = teachers.find((item) => item.id === form.get('teacherId'));
    const room = rooms.find((item) => item.id === form.get('roomId'));
    const classSection = String(form.get('classSection') || editingSlot.classSection).trim();
    const day = String(form.get('day')) as DayOfWeek;
    const timeSlotIndex = Number(form.get('timeSlotIndex'));
    if (!subject || !teacher || !room || !DAYS_OF_WEEK.includes(day) || !TIME_SLOTS[timeSlotIndex]) return;
    if (!subject.classSections.includes(classSection)) {
      setEditError(`Subject ${subject.code} is not assigned to section ${classSection}.`);
      return;
    }

    const updatedSlots = timetable.slots.map((slot) => slot.id === editingSlot.id ? {
      ...slot,
      day,
      timeSlotIndex,
      timeSlot: TIME_SLOTS[timeSlotIndex],
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      roomId: room.id,
      roomName: room.name,
      classSection,
    } : slot);
    const bySlot = new Map<string, TimetableSlotEntry[]>();
    updatedSlots.forEach((slot) => {
      const key = `${slot.day}|${slot.timeSlotIndex}`;
      bySlot.set(key, [...(bySlot.get(key) || []), slot]);
    });
    const conflicts: ScheduleConflict[] = [];
    bySlot.forEach((sameTime) => {
      const checks: Array<{ type: ScheduleConflict['type']; label: string; getId: (slot: TimetableSlotEntry) => string }> = [
        { type: 'SECTION_CLASH', label: 'section', getId: (slot) => slot.classSection },
        { type: 'TEACHER_CLASH', label: 'teacher', getId: (slot) => slot.teacherId },
        { type: 'ROOM_CLASH', label: 'room', getId: (slot) => slot.roomId },
      ];
      checks.forEach(({ type, label, getId }) => {
        const seen = new Set<string>();
        sameTime.forEach((slot) => {
          const id = getId(slot);
          if (seen.has(id)) conflicts.push({
            id: `edit-${type}-${slot.id}`,
            type,
            description: `Edited timetable has a ${label} conflict for ${slot.subjectCode} (${slot.classSection}) on ${slot.day} at ${slot.timeSlot}.`,
            day: slot.day,
            timeSlot: slot.timeSlot,
            involvedEntities: [slot.classSection, slot.teacherName, slot.roomName],
          });
          seen.add(id);
        });
      });
    });
    const updated: TimetableDoc = {
      ...timetable,
      slots: updatedSlots,
      classSections: Array.from(new Set([...timetable.classSections, ...updatedSlots.map((slot) => slot.classSection)])),
      conflicts,
      conflictCount: conflicts.length + timetable.unscheduledItems.length,
      geminiInsights: undefined,
    };
    setIsSavingEdit(true);
    try {
      await onUpdateTimetable(updated);
      setEditingSlot(null);
      setEditError('');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleQuickGeminiAnalyze = async () => {
    if (!timetable || !onUpdateTimetableInsights) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timetable, constraints }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateTimetableInsights(data);
      }
    } catch (e) {
      console.warn('Quick Gemini analyze warning:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeInsights = timetable.geminiInsights;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* 4 Clean Utility Stat Cards (matching Design HTML) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1 tracking-wider">Teachers</div>
          <div className="text-2xl font-bold text-slate-800">{teacherCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1 tracking-wider">Rooms</div>
          <div className="text-2xl font-bold text-slate-800">{roomCount < 10 ? `0${roomCount}` : roomCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1 tracking-wider">Subjects</div>
          <div className="text-2xl font-bold text-slate-800">{subjectCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1 tracking-wider">Conflicts</div>
          <div
            className={`text-2xl font-bold ${
              timetable.conflictCount === 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {timetable.conflictCount}
          </div>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="no-print bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" /> Choose branch / section:
            <select
              value={selectedSection}
              onChange={(event) => {
                setSelectedSection(event.target.value);
                setSelectedTeacher('ALL');
              }}
              className="normal-case text-sm font-medium text-slate-700 border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a branch or section…</option>
              {availableSections.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {selectedSection && availableTeachers.length > 0 && (
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="text-xs font-medium text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Faculty</option>
              {availableTeachers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleDownloadCSV}
            disabled={!selectedSection}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={!selectedSection}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
          </button>
        </div>
      </div>

      {!selectedSection ? (
        <div className="rounded-2xl border border-dashed border-indigo-200 bg-white px-6 py-16 text-center shadow-sm">
          <Layers className="mx-auto mb-3 h-10 w-10 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-800">Choose a branch timetable</h2>
          <p className="mt-2 text-sm text-slate-500">Select a branch or class section above to view its weekly schedule.</p>
        </div>
      ) : (
      /* Main 12-Column Layout matching Design HTML */
      <div className="print-timetable grid grid-cols-12 gap-6">
        {/* Left 9 Columns: Monday-to-Friday Timetable Grid */}
        <div className="col-span-12 xl:col-span-9 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Header Row: Blank + 5 Days */}
          <div className="grid grid-cols-6 border-b border-slate-100 bg-slate-50/50">
            <div className="p-3 border-r border-slate-100 text-center text-[10px] font-bold uppercase text-slate-400">
              Time
            </div>
            {DAYS_OF_WEEK.map((day, idx) => (
              <div
                key={day}
                className={`p-3 text-center text-xs font-bold uppercase text-slate-500 ${
                  idx < DAYS_OF_WEEK.length - 1 ? 'border-r border-slate-100' : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time Slot Rows */}
          <div className="flex-1 divide-y divide-slate-100">
            {/* Slot 0: 9 - 10 AM */}
            <TimetableRow
              timeLabel="9 - 10 AM"
              slotIndex={0}
              days={DAYS_OF_WEEK}
              getSlot={getSlot}
              onEdit={(slot) => { setEditingSlot(slot); setSelectedEditSection(slot.classSection); setEditError(''); }}
            />

            {/* Slot 1: 10 - 11 AM */}
            <TimetableRow
              timeLabel="10 - 11 AM"
              slotIndex={1}
              days={DAYS_OF_WEEK}
              getSlot={getSlot}
              onEdit={(slot) => { setEditingSlot(slot); setSelectedEditSection(slot.classSection); setEditError(''); }}
            />

            {/* Slot 2: 11 - 12 PM */}
            <TimetableRow
              timeLabel="11 - 12 PM"
              slotIndex={2}
              days={DAYS_OF_WEEK}
              getSlot={getSlot}
              onEdit={(slot) => { setEditingSlot(slot); setSelectedEditSection(slot.classSection); setEditError(''); }}
            />

            {/* Break & Lab Sessions (12 - 2 PM) */}
            <div className="grid grid-cols-6 border-b border-slate-50 bg-slate-50/20">
              <div className="p-2 flex flex-col justify-center items-center text-[10px] text-slate-300 border-r border-slate-100 font-medium italic">
                12 - 2 PM
              </div>
              <div className="col-span-5 p-2 flex items-center justify-center text-[10px] text-slate-300 uppercase tracking-[0.3em] font-medium select-none">
                Break & Lab Sessions
              </div>
            </div>

            {/* Slot 4: 2 - 3 PM */}
            <TimetableRow
              timeLabel="2 - 3 PM"
              slotIndex={4}
              days={DAYS_OF_WEEK}
              getSlot={getSlot}
              onEdit={(slot) => { setEditingSlot(slot); setSelectedEditSection(slot.classSection); setEditError(''); }}
            />

            {/* Slot 5: 3 - 4 PM */}
            <TimetableRow
              timeLabel="3 - 4 PM"
              slotIndex={5}
              days={DAYS_OF_WEEK}
              getSlot={getSlot}
              onEdit={(slot) => { setEditingSlot(slot); setSelectedEditSection(slot.classSection); setEditError(''); }}
            />
          </div>
        </div>

        {/* Right 3 Columns: Gemini AI Insights & Constraints Panel (matching Design HTML) */}
        <div className="no-print col-span-12 xl:col-span-3 flex flex-col gap-6">
          {/* Gemini AI Insights Box */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-sm text-slate-700 uppercase tracking-wide">
                Gemini AI Insights
              </h2>
            </div>

            <div className="flex-1 space-y-4">
              {/* Why it works */}
              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <div className="text-[10px] font-bold text-indigo-800 mb-1 uppercase tracking-wider">
                  Why it works:
                </div>
                {activeInsights ? (
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc ml-3">
                    {activeInsights.threeEfficiencyReasons.slice(0, 3).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : <p className="text-[11px] text-slate-600">Run the analysis to see findings for this timetable.</p>}
              </div>

              {/* Improvement */}
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-800 mb-1 uppercase tracking-wider">
                  Improvement:
                </div>
                <p className="text-[11px] text-slate-600">
                  {activeInsights?.oneImprovementSuggestion || 'No analysis yet.'}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-[10px] font-bold text-slate-800 mb-1 uppercase tracking-wider">
                  Summary:
                </div>
                <p className="text-[11px] text-slate-600">
                  {activeInsights?.qualitySummary ||
                    `${timetable.roomUtilizationRate}% room utilization and ${timetable.conflictCount} reported conflicts.`}
                </p>
              </div>
            </div>

            <button
              onClick={handleQuickGeminiAnalyze}
              disabled={isAnalyzing}
              className="mt-4 w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isAnalyzing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Again'}</span>
            </button>
          </div>

          {/* Constraints Status Card (matching Design HTML) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
              Constraints
            </div>
            <div className="space-y-2.5">
              {constraints.filter((constraint) => constraint.enabled).length ? constraints.filter((constraint) => constraint.enabled).map((constraint) => (
                <div key={constraint.id} className="flex items-center gap-2 text-[11px] text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div><span>{constraint.title}</span>
                </div>
              )) : <p className="text-[11px] text-slate-500">No active constraints configured.</p>}
            </div>
          </div>

          {/* Unscheduled Sessions Drawer if any exist */}
          {timetable.unscheduledItems && timetable.unscheduledItems.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Unscheduled ({timetable.unscheduledItems.length})</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {timetable.unscheduledItems.map((u) => (
                  <div key={u.id} className="text-[10px] text-rose-700 bg-white p-1.5 rounded border border-rose-100">
                    <span className="font-bold">{u.subjectCode}</span> ({u.classSection}) - {u.reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
      {editingSlot && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-slot-title">
          <form onSubmit={handleSaveSlot} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between"><h2 id="edit-slot-title" className="text-lg font-bold">Edit timetable class</h2><button type="button" onClick={() => setEditingSlot(null)} aria-label="Close editor"><X className="h-5 w-5" /></button></div>
            <p className="text-sm text-slate-500">Changes save to this timetable. Review conflicts after moving a class.</p>
            <label className="block text-sm font-medium">Section<select name="classSection" value={selectedEditSection} onChange={(event) => { setSelectedEditSection(event.target.value); setEditError(''); }} className="mt-1 w-full rounded-lg border p-2">{availableSections.map((section) => <option key={section}>{section}</option>)}</select></label>
            <label className="block text-sm font-medium">Subject<select name="subjectId" defaultValue={editingSlot.subjectId} onChange={() => setEditError('')} className="mt-1 w-full rounded-lg border p-2">{subjects.filter((item) => item.classSections.includes(selectedEditSection)).map((item) => <option key={item.id} value={item.id}>{item.code}: {item.name}</option>)}</select></label>
            <label className="block text-sm font-medium">Teacher<select name="teacherId" defaultValue={editingSlot.teacherId} className="mt-1 w-full rounded-lg border p-2">{teachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="block text-sm font-medium">Room<select name="roomId" defaultValue={editingSlot.roomId} className="mt-1 w-full rounded-lg border p-2">{rooms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Day<select name="day" defaultValue={editingSlot.day} className="mt-1 w-full rounded-lg border p-2">{DAYS_OF_WEEK.map((day) => <option key={day}>{day}</option>)}</select></label><label className="block text-sm font-medium">Time<select name="timeSlotIndex" defaultValue={editingSlot.timeSlotIndex} className="mt-1 w-full rounded-lg border p-2">{TIME_SLOTS.map((time, index) => <option key={time} value={index}>{time}</option>)}</select></label></div>
            {editError && <p role="alert" className="text-sm text-rose-700">{editError}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingSlot(null)} className="rounded-lg border px-4 py-2">Cancel</button><button disabled={isSavingEdit} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"><Save className="h-4 w-4" />{isSavingEdit ? 'Saving…' : 'Save changes'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

// Row component for timetable grid
const TimetableRow: React.FC<{
  timeLabel: string;
  slotIndex: number;
  days: DayOfWeek[];
  getSlot: (day: DayOfWeek, slotIndex: number) => TimetableSlotEntry | undefined;
  onEdit: (slot: TimetableSlotEntry) => void;
}> = ({ timeLabel, slotIndex, days, getSlot, onEdit }) => {
  return (
    <div className="grid grid-cols-6 border-b border-slate-50 last:border-0">
      {/* Time Label Column */}
      <div className="p-2 flex flex-col justify-center items-center text-[10px] text-slate-400 bg-slate-50/30 border-r border-slate-100 font-medium">
        {timeLabel}
      </div>

      {/* 5 Day Columns */}
      {days.map((day, idx) => {
        const slot = getSlot(day, slotIndex);
        const isLast = idx === days.length - 1;

        if (!slot) {
          return (
            <div
              key={day}
              className={`p-2 min-h-[76px] ${!isLast ? 'border-r border-slate-100' : ''}`}
            />
          );
        }

        const accent = getAccentForSubject(slot.subjectCode);

        return (
          <div
            key={day}
            className={`p-2 min-h-[76px] ${!isLast ? 'border-r border-slate-100' : ''}`}
          >
            <div className={`${accent.bg} border-l-4 ${accent.border} p-2 rounded h-full flex flex-col justify-between`}>
              <div>
                <div className={`text-[10px] font-bold ${accent.textTitle} leading-tight truncate`}>
                  {slot.subjectCode}: {slot.subjectName}
                </div>
                <div className={`text-[9px] ${accent.textSub} mt-1 truncate`}>
                  {slot.teacherName} • {slot.roomName}
                </div>
              </div>
              <div className="text-[9px] font-bold text-slate-500 mt-1">
                Sec: {slot.classSection}
              </div>
              <button type="button" onClick={() => onEdit(slot)} className="no-print mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:underline"><Pencil className="h-3 w-3" /> Edit</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
