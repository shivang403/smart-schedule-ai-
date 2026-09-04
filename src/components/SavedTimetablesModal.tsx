import React from 'react';
import {
  X,
  CalendarCheck,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { TimetableDoc } from '../types';

interface SavedTimetablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetables: TimetableDoc[];
  activeTimetableId: string | null;
  onSelectTimetable: (timetable: TimetableDoc) => void;
  onDeleteTimetable: (id: string) => void;
}

export const SavedTimetablesModal: React.FC<SavedTimetablesModalProps> = ({
  isOpen,
  onClose,
  timetables,
  activeTimetableId,
  onSelectTimetable,
  onDeleteTimetable,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Saved Timetables in Firestore</h2>
              <p className="text-xs text-slate-500">Firestore collection: timetables</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {timetables.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No saved timetables yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Generate a timetable from the dashboard and it will be stored here automatically.
              </p>
            </div>
          ) : (
            timetables.map((t) => {
              const isActive = t.id === activeTimetableId;
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                      {isActive && (
                        <span className="px-2 py-0.2 rounded text-[10px] font-extrabold bg-purple-600 text-white">
                          Currently Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Saved: {new Date(t.createdAt).toLocaleDateString()} at {new Date(t.createdAt).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>{t.slots.length} Class Slots</span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${
                          t.conflictCount === 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {t.conflictCount === 0 ? '0 Clashes' : `${t.conflictCount} Conflicts`}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">Health: {t.healthScore}/100</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectTimetable(t);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span>Load View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteTimetable(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete saved timetable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{timetables.length} Timetable record(s) persisted in Firestore</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
