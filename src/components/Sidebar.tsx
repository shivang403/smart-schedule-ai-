import React from 'react';
import {
  Layers,
  Users,
  DoorOpen,
  BookOpen,
  Calendar,
  CheckCircle2,
  Sparkles,
  Database,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'setup' | 'timetable' | 'constraints' | 'ai-insights';
  setActiveTab: (tab: 'dashboard' | 'setup' | 'timetable' | 'constraints' | 'ai-insights') => void;
  setupSubTab?: 'teachers' | 'rooms' | 'subjects' | 'constraints';
  setSetupSubTab?: (sub: 'teachers' | 'rooms' | 'subjects' | 'constraints') => void;
  healthScore: number | null;
  conflictCount: number | null;
  dbInfo: {
    projectId: string;
    connected: boolean;
    isLocalCacheMode?: boolean;
    isConfigured?: boolean;
    error?: string | null;
  };
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  setupSubTab,
  setSetupSubTab,
  healthScore,
  conflictCount,
  dbInfo,
  isOpenMobile,
  onCloseMobile,
}) => {
  const currentHealth = healthScore;

  const handleNavClick = (tab: 'dashboard' | 'setup' | 'timetable' | 'constraints' | 'ai-insights') => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSetupSubClick = (sub: 'teachers' | 'rooms' | 'subjects') => {
    if (setSetupSubTab) setSetupSubTab(sub);
    setActiveTab('setup');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-xl italic shadow-xs">
              S
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base block">Smart Schedule AI</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">College Admin</span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {/* Dashboard */}
          <div
            id="sidebar-dashboard-link"
            onClick={() => handleNavClick('dashboard')}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors text-sm font-medium ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </div>

          {/* Timetable Grid */}
          <div
            id="sidebar-timetable-link"
            onClick={() => handleNavClick('timetable')}
            className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-sm font-medium ${
              activeTab === 'timetable'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className={`w-5 h-5 ${activeTab === 'timetable' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>Timetable Grid</span>
            </div>
            {conflictCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {conflictCount}
              </span>
            )}
          </div>

          {/* Teachers Section */}
          <div
            id="sidebar-teachers-link"
            onClick={() => handleSetupSubClick('teachers')}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors text-sm font-medium ${
              activeTab === 'setup' && setupSubTab === 'teachers'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 text-slate-400" />
            <span>Teachers</span>
          </div>

          {/* Rooms Section */}
          <div
            id="sidebar-rooms-link"
            onClick={() => handleSetupSubClick('rooms')}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors text-sm font-medium ${
              activeTab === 'setup' && setupSubTab === 'rooms'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <DoorOpen className="w-5 h-5 text-slate-400" />
            <span>Rooms</span>
          </div>

          {/* Subjects Section */}
          <div
            id="sidebar-subjects-link"
            onClick={() => handleSetupSubClick('subjects')}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors text-sm font-medium ${
              activeTab === 'setup' && setupSubTab === 'subjects'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 text-slate-400" />
            <span>Subjects</span>
          </div>

          {/* Constraints */}
          <div
            id="sidebar-constraints-link"
            onClick={() => handleNavClick('constraints')}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors text-sm font-medium ${
              activeTab === 'constraints'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${activeTab === 'constraints' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>Constraints</span>
          </div>

          {/* Gemini AI Insights */}
          <div
            id="sidebar-ai-insights-link"
            onClick={() => handleNavClick('ai-insights')}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors text-sm font-medium ${
              activeTab === 'ai-insights'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${activeTab === 'ai-insights' ? 'text-indigo-400' : 'text-indigo-400'}`} />
            <span>Gemini AI</span>
          </div>
        </nav>

        {/* Database Status in Sidebar */}
        <div className="px-4 py-2 border-t border-slate-800 text-slate-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[130px]">{dbInfo.projectId}</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              dbInfo.connected ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
            title={dbInfo.connected ? 'Firestore Connected (smart-schedule-ai)' : (dbInfo.error || 'Firebase Configuration Missing')}
          />
        </div>

        {/* Health Score Box matching Design HTML */}
        <div className="p-4 bg-slate-800 m-4 rounded-xl">
          <div className="text-xs text-indigo-300 font-bold uppercase mb-2 tracking-widest">
            Health Score
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-light text-white">{currentHealth ?? '—'}</span>
            {currentHealth !== null && <span className="text-emerald-400 text-sm mb-1 font-medium">/ 100</span>}
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                currentHealth === null
                  ? 'bg-slate-600'
                  : currentHealth >= 80
                  ? 'bg-emerald-500'
                  : currentHealth >= 60
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${currentHealth === null ? 0 : Math.min(100, Math.max(5, currentHealth))}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
