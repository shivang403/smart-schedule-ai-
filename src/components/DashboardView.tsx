import React from 'react';
import {
  Users,
  DoorOpen,
  BookOpen,
  CalendarCheck,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Teacher, Room, Subject, TimetableDoc, Constraint } from '../types';

interface DashboardViewProps {
  teachers: Teacher[];
  rooms: Room[];
  subjects: Subject[];
  constraints: Constraint[];
  timetables: TimetableDoc[];
  currentTimetable: TimetableDoc | null;
  onGenerate: () => void;
  onLoadDemoData: () => void;
  onNavigate: (tab: 'dashboard' | 'setup' | 'timetable' | 'constraints' | 'ai-insights') => void;
  isGenerating: boolean;
  isLoadingDemo: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  teachers,
  rooms,
  subjects,
  constraints,
  timetables,
  currentTimetable,
  onGenerate,
  onLoadDemoData,
  onNavigate,
  isGenerating,
  isLoadingDemo,
}) => {
  const activeConstraints = constraints.filter((c) => c.enabled);
  const healthScore = currentTimetable ? currentTimetable.healthScore : 94;
  const conflictCount = currentTimetable ? currentTimetable.conflictCount : 0;
  const teacherScore = currentTimetable ? currentTimetable.teacherWorkloadScore : 88;
  const roomUtil = currentTimetable ? currentTimetable.roomUtilizationRate : 74;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* 4 Clean Utility Stat Cards (matching Design HTML) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('setup')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1 tracking-wider">Teachers</div>
          <div className="text-2xl font-bold text-slate-800">{teachers.length}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Manage faculty &rarr;</div>
        </div>

        <div
          onClick={() => onNavigate('setup')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1 tracking-wider">Rooms</div>
          <div className="text-2xl font-bold text-slate-800">{rooms.length < 10 ? `0${rooms.length}` : rooms.length}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">View facilities &rarr;</div>
        </div>

        <div
          onClick={() => onNavigate('setup')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1 tracking-wider">Subjects</div>
          <div className="text-2xl font-bold text-slate-800">{subjects.length}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Course roster &rarr;</div>
        </div>

        <div
          onClick={() => onNavigate('timetable')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div className="text-slate-400 text-xs font-semibold uppercase mb-1 tracking-wider">Conflicts</div>
          <div
            className={`text-2xl font-bold ${
              conflictCount === 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {conflictCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {conflictCount === 0 ? 'Optimal schedule' : 'Needs attention'}
          </div>
        </div>
      </div>

      {/* Hero / Quick Action Banner in Clean Utility Style */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Automatic Timetable Generator</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            Build better timetables in seconds.
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed">
            Eliminates teacher overlaps, room collisions, and class section double-booking while strictly honoring faculty availability and institutional constraints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onLoadDemoData}
            disabled={isLoadingDemo}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDemo ? 'animate-spin' : ''}`} />
            <span>{isLoadingDemo ? 'Loading Demo...' : 'Load Demo Data'}</span>
          </button>

          <button
            onClick={onGenerate}
            disabled={isGenerating || teachers.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Solving Constraints...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Generate Smart Timetable</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detail Panels: Health Gauge & Active Policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
              Schedule Health Score
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-light text-slate-900">{healthScore}</span>
              <span className="text-emerald-600 text-sm font-semibold">/ 100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
              <div
                className={`h-full transition-all duration-700 ${
                  healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Clash Freedom:</span>
              <span className={conflictCount === 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {conflictCount === 0 ? '100% (0 Clashes)' : `${conflictCount} Conflicts`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Workload Balance:</span>
              <span className="text-indigo-600 font-bold">{teacherScore}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Room Utilization:</span>
              <span className="text-slate-700 font-bold">{roomUtil}%</span>
            </div>
          </div>
        </div>

        {/* Active Constraints */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Constraints</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {activeConstraints.length} Active
              </span>
            </div>
            <div className="space-y-2.5">
              {constraints.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-xs text-slate-600">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      c.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <span className="truncate">{c.title}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('constraints')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-4 border-t border-slate-100 flex items-center gap-1 cursor-pointer"
          >
            <span>Constraint Checker &rarr;</span>
          </button>
        </div>

        {/* Gemini AI Snapshot */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Gemini AI Audit</span>
              <span className="text-[10px] text-slate-400 font-mono">gemini-3.8-flash</span>
            </div>

            {currentTimetable?.geminiInsights ? (
              <div className="space-y-2 text-xs">
                <div className="bg-indigo-50/50 p-2.5 rounded border border-indigo-100 text-indigo-900 font-medium">
                  {currentTimetable.geminiInsights.qualitySummary}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  Tip: {currentTimetable.geminiInsights.oneImprovementSuggestion}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                <span>Click "Generate Smart Timetable" to trigger automatic AI analysis.</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('ai-insights')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-4 border-t border-slate-100 flex items-center gap-1 cursor-pointer"
          >
            <span>Detailed AI Audit &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
