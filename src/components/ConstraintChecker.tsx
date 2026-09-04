import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Clock,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { ConstraintCheckResult, Constraint, TimetableDoc } from '../types';

interface ConstraintCheckerProps {
  currentTimetable: TimetableDoc | null;
  constraints: Constraint[];
  onNavigateToSetup: () => void;
}

export const ConstraintChecker: React.FC<ConstraintCheckerProps> = ({
  currentTimetable,
  constraints,
  onNavigateToSetup,
}) => {
  const checkResults = currentTimetable?.constraintCheckResults || [];

  const respectedCount = checkResults.filter((r) => r.respected).length;
  const violatedCount = checkResults.filter((r) => !r.respected).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Constraint Checker</h1>
          </div>
          <p className="text-sm text-slate-600">
            Real-time audit verifying that faculty availability, classroom limits, and maximum consecutive load rules are respected.
          </p>
        </div>

        <button
          onClick={onNavigateToSetup}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200 cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
        >
          <span>Configure Constraints</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
            {checkResults.length || constraints.length}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Evaluated Rules</p>
            <p className="text-lg font-extrabold text-slate-900">Total Constraints Checked</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
            {respectedCount}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Fully Respected</p>
            <p className="text-lg font-extrabold text-slate-900">Compliant Rules</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-lg">
            {violatedCount}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Violations</p>
            <p className="text-lg font-extrabold text-slate-900">Unsatisfied Hard/Soft Rules</p>
          </div>
        </div>
      </div>

      {/* Constraints Breakdown Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Detailed Constraint Audit</h2>

        {checkResults.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>Generate a timetable first to run the automated constraint checker.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {checkResults.map((result, idx) => (
              <div
                key={result.constraintId || idx}
                className={`p-5 rounded-xl border transition-all ${
                  result.respected
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/50 border-rose-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    {result.respected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900 text-base">{result.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                        result.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {result.priority}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        result.respected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {result.respected ? 'Passed' : `Violated (${result.violationCount})`}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-2">{result.description}</p>

                <div
                  className={`p-3 rounded-lg text-xs font-medium ${
                    result.respected
                      ? 'bg-emerald-100/60 text-emerald-900'
                      : 'bg-rose-100/70 text-rose-900'
                  }`}
                >
                  <span className="font-bold">Audit Finding:</span> {result.details}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
