import React from 'react';
import { Menu, RefreshCw, Zap, Archive, Download, Sparkles } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onOpenMobileMenu: () => void;
  onOpenSaved: () => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Build better timetables in seconds.',
  onOpenMobileMenu,
  onOpenSaved,
  onGenerate,
  isGenerating = false,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-xl font-semibold text-slate-800 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenSaved}
          className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Archive className="w-4 h-4 text-slate-500" />
          <span>View Saved</span>
        </button>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Generate Smart Timetable</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
