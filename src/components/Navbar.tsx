import React from 'react';
import { Calendar, Layers, Sliders, Sparkles, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'setup' | 'timetable' | 'constraints' | 'ai-insights';
  setActiveTab: (tab: 'dashboard' | 'setup' | 'timetable' | 'constraints' | 'ai-insights') => void;
  healthScore: number | null;
  conflictCount: number;
  dbInfo: {
    projectId: string;
    connected: boolean;
    isLocalCacheMode: boolean;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  healthScore,
  conflictCount,
  dbInfo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  Smart Schedule <span className="text-blue-600">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  College Admin v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden md:block">
                Automatic College Timetable Generator
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-dashboard-tab"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-setup-tab"
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'setup'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Setup Data</span>
            </button>

            <button
              id="nav-timetable-tab"
              onClick={() => setActiveTab('timetable')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'timetable'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Timetable</span>
              {conflictCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  {conflictCount}
                </span>
              )}
            </button>

            <button
              id="nav-constraints-tab"
              onClick={() => setActiveTab('constraints')}
              className={`hidden md:flex px-3 py-2 rounded-lg text-sm font-semibold transition-colors items-center gap-1.5 ${
                activeTab === 'constraints'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Constraints</span>
            </button>

            <button
              id="nav-ai-insights-tab"
              onClick={() => setActiveTab('ai-insights')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai-insights'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                  : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>Gemini AI</span>
            </button>
          </nav>

          {/* DB Status & Health Pill */}
          <div className="hidden lg:flex items-center gap-3">
            <div
              title={
                dbInfo.connected
                  ? `Connected to Firestore (${dbInfo.projectId})`
                  : `Firestore Project: ${dbInfo.projectId} (Local Cache synced)`
              }
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-700"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Firestore:</span>
              <span className="font-semibold text-slate-800">{dbInfo.projectId}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dbInfo.connected ? 'bg-emerald-500' : 'bg-blue-400'
                }`}
              />
            </div>

            {healthScore !== null && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  healthScore >= 80
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : healthScore >= 60
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <span>Health: {healthScore}/100</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
