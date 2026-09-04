import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TimetableDoc, GeminiInsights, Constraint } from '../types';

interface GeminiInsightsPanelProps {
  currentTimetable: TimetableDoc | null;
  constraints: Constraint[];
  onUpdateTimetableInsights: (insights: GeminiInsights) => void;
  onNavigateToTimetable: () => void;
}

export const GeminiInsightsPanel: React.FC<GeminiInsightsPanelProps> = ({
  currentTimetable,
  constraints,
  onUpdateTimetableInsights,
  onNavigateToTimetable,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const insights = currentTimetable?.geminiInsights || null;

  const handleRunAnalysis = async () => {
    if (!currentTimetable) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/analyze-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetable: currentTimetable,
          constraints,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate timetable analysis.');
      }

      const generatedInsights: GeminiInsights = {
        threeEfficiencyReasons: data.threeEfficiencyReasons || [],
        oneImprovementSuggestion: data.oneImprovementSuggestion || '',
        qualitySummary: data.qualitySummary || '',
        analyzedAt: data.analyzedAt || new Date().toISOString(),
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
      };

      onUpdateTimetableInsights(generatedInsights);
    } catch (err: any) {
      console.error('Gemini call failed:', err);
      setErrorMessage(
        err?.message ||
          'Unable to reach Gemini API. Ensure the server is running and GEMINI_API_KEY is configured in your project settings.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!insights) return;
    const text = `
SMART SCHEDULE AI - GEMINI TIMETABLE AUDIT REPORT
==================================================
Schedule: ${currentTimetable?.name || 'College Timetable'}
Health Score: ${currentTimetable?.healthScore}/100
Conflict Count: ${currentTimetable?.conflictCount}
Faculty Workload Balance: ${currentTimetable?.teacherWorkloadScore}/100
Room Utilization: ${currentTimetable?.roomUtilizationRate}%

QUALITY SUMMARY:
${insights.qualitySummary}

WHY THIS TIMETABLE IS EFFICIENT:
1. ${insights.threeEfficiencyReasons[0] || 'Optimized clash avoidance'}
2. ${insights.threeEfficiencyReasons[1] || 'Respects institutional constraints'}
3. ${insights.threeEfficiencyReasons[2] || 'Balanced faculty teaching hours'}

ACTIONABLE IMPROVEMENT SUGGESTION:
• ${insights.oneImprovementSuggestion}

Model: ${insights.modelUsed} | Analyzed At: ${insights.analyzedAt}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            <span>Server-Side Gemini 3.8 Flash • AI Scheduling Auditor</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Gemini Timetable Intelligence
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed mb-6">
            Leverage Gemini 3.8 to conduct deep schedule analysis, evaluate pedagogical workload distribution,
            verify constraint compliance, and receive prioritized institutional suggestions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="gemini-run-audit-btn"
              onClick={handleRunAnalysis}
              disabled={isLoading || !currentTimetable}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-indigo-950 hover:bg-indigo-50 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analyzing Timetable with Gemini...' : 'Run Gemini AI Audit'}</span>
            </button>

            {currentTimetable && (
              <button
                onClick={onNavigateToTimetable}
                className="px-4 py-3 rounded-xl font-semibold text-xs text-indigo-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <span>Back to Timetable Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message if API Key missing or call failed */}
      {errorMessage && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>AI Scheduling Audit Notice</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            {errorMessage}
          </p>
          <div className="pt-2 text-xs text-amber-700">
            <span className="font-bold">How to enable:</span> In Google AI Studio, make sure you add your{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">GEMINI_API_KEY</code> in the
            Secrets/Environment variables. The server will automatically use it on the next analysis run.
          </div>
        </div>
      )}

      {/* Main Insights Result Card */}
      {insights ? (
        <div className="bg-white rounded-2xl border border-indigo-200/80 shadow-md p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {insights.modelUsed}
                </span>
                <span className="text-xs text-slate-500">
                  Audited at {new Date(insights.analyzedAt).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Schedule Diagnostic Assessment</h2>
            </div>

            <button
              onClick={handleCopyReport}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer self-start sm:self-auto"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>

          {/* Quality Summary */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Executive Quality Assessment</span>
            </h3>
            <p className="text-slate-800 text-sm leading-relaxed font-medium">
              {insights.qualitySummary}
            </p>
          </div>

          {/* 3 Efficiency Reasons */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Why This Timetable Structure Is Efficient</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.threeEfficiencyReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span>Efficiency Pillar {idx + 1}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 1 Improvement Suggestion */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Recommended Schedule Optimization</span>
            </h3>
            <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-3 font-medium">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                AI
              </div>
              <p className="leading-relaxed text-slate-800">
                {insights.oneImprovementSuggestion}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-200">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Ready for Gemini Scheduling Audit</h3>
          <p className="text-slate-600 max-w-md mx-auto mb-6 text-xs leading-relaxed">
            Click the "Run Gemini AI Audit" button above to evaluate your timetable for pedagogical flow, faculty
            workload distribution, and room allocation efficiency.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={isLoading || !currentTimetable}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Running Gemini Analysis...' : 'Analyze Current Timetable'}
          </button>
        </div>
      )}
    </div>
  );
};
