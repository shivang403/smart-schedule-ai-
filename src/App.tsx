import React, { lazy, Suspense, useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SignInView } from './components/SignInView';
const DashboardView = lazy(() => import('./components/DashboardView').then((module) => ({ default: module.DashboardView })));
const SetupDataView = lazy(() => import('./components/SetupDataView').then((module) => ({ default: module.SetupDataView })));
const TimetableView = lazy(() => import('./components/TimetableView').then((module) => ({ default: module.TimetableView })));
const ConstraintChecker = lazy(() => import('./components/ConstraintChecker').then((module) => ({ default: module.ConstraintChecker })));
const GeminiInsightsPanel = lazy(() => import('./components/GeminiInsightsPanel').then((module) => ({ default: module.GeminiInsightsPanel })));
const SavedTimetablesModal = lazy(() => import('./components/SavedTimetablesModal').then((module) => ({ default: module.SavedTimetablesModal })));
import {
  Teacher,
  Room,
  Subject,
  Constraint,
  TimetableDoc,
  GeminiInsights,
} from './types';
import {
  getTeachers,
  saveTeacher,
  deleteTeacher,
  getRooms,
  saveRoom,
  deleteRoom,
  getSubjects,
  saveSubject,
  deleteSubject,
  getConstraints,
  saveConstraint,
  toggleConstraint,
  deleteConstraint,
  getSavedTimetables,
  saveTimetable,
  deleteTimetable,
  loadDemoDataToFirestore,
  getFirestoreConnectionInfo,
  signOutUser,
  subscribeToAuthState,
} from './lib/firebase';
import type { User } from 'firebase/auth';
import { generateSmartTimetable } from './utils/scheduler';
import { DEMO_SECTIONS } from './utils/demoData';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'setup' | 'timetable' | 'constraints' | 'ai-insights'
  >('dashboard');

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [timetables, setTimetables] = useState<TimetableDoc[]>([]);
  const [currentTimetable, setCurrentTimetable] = useState<TimetableDoc | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [setupSubTab, setSetupSubTab] = useState<'teachers' | 'rooms' | 'subjects' | 'constraints'>('teachers');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const dbInfo = getFirestoreConnectionInfo();
  const [firebaseError, setFirebaseError] = useState<string | null>(dbInfo.error);

  useEffect(() => subscribeToAuthState((user) => {
    setAuthUser(user);
    setIsAuthLoading(false);
  }), []);

  // Load initial data from Firestore
  useEffect(() => {
    if (isAuthLoading) return;
    if (!authUser) {
      setTeachers([]);
      setRooms([]);
      setSubjects([]);
      setConstraints([]);
      setTimetables([]);
      setCurrentTimetable(null);
      return;
    }

    let cancelled = false;
    async function loadData() {
      if (!dbInfo.isConfigured) {
        setFirebaseError(dbInfo.error);
        return;
      }
      try {
        const [loadedTeachers, loadedRooms, loadedSubjects, loadedConstraints, loadedTimetables] =
          await Promise.all([
            getTeachers(),
            getRooms(),
            getSubjects(),
            getConstraints(),
            getSavedTimetables(),
          ]);

        if (cancelled) return;
        setTeachers(loadedTeachers);
        setRooms(loadedRooms);
        setSubjects(loadedSubjects);
        setConstraints(loadedConstraints);
        setTimetables(loadedTimetables);

        if (loadedTimetables.length > 0) {
          setCurrentTimetable(loadedTimetables[0]);
        } else if (loadedTeachers.length > 0 && loadedSubjects.length > 0) {
          // Pre-generate a baseline schedule so administrator arrives at a populated grid
          const initial = generateSmartTimetable(
            loadedTeachers,
            loadedRooms,
            loadedSubjects,
            loadedConstraints,
            DEMO_SECTIONS,
            { name: `College Master Schedule ${new Date().toLocaleDateString()}` }
          );
          setCurrentTimetable(initial);
          saveTimetable(initial).catch(console.warn);
          setTimetables([initial]);
        }
      } catch (err: any) {
        console.error('Initial data loading error from Firestore:', err);
        if (!cancelled) setFirebaseError(err?.message || 'Failed to connect to Firestore database.');
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [authUser?.uid, isAuthLoading]);

  // Generate Smart Timetable action
  const handleGenerateTimetable = async () => {
    if (teachers.length === 0 || rooms.length === 0 || subjects.length === 0) {
      alert('Please add teachers, rooms, and subjects before generating a timetable, or click "Load Demo Data".');
      return;
    }

    setIsGenerating(true);
    try {
      // Algorithmic optimization pass
      await new Promise((resolve) => setTimeout(resolve, 400));

      const generated = generateSmartTimetable(
        teachers,
        rooms,
        subjects,
        constraints,
        DEMO_SECTIONS,
        {
          name: `College Master Schedule ${new Date().toLocaleDateString()} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        }
      );

      // Persist to real Firestore
      await saveTimetable(generated);

      setCurrentTimetable(generated);
      setTimetables((prev) => [generated, ...prev.filter((t) => t.id !== generated.id)]);
      setActiveTab('timetable');
    } catch (err: any) {
      console.error('Error generating timetable:', err);
      setFirebaseError(err?.message || 'Failed to save timetable to Firestore.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Real Firestore Load Demo Data action
  const handleLoadDemoData = async () => {
    if (!dbInfo.isConfigured) {
      setFirebaseError(
        dbInfo.error ||
          "Firebase configuration is missing: 'VITE_FIREBASE_API_KEY' is not configured for project 'smart-schedule-ai'. Please configure your Firebase Web API Key in Settings or environment variables."
      );
      setIsLoadingDemo(false);
      return;
    }

    setIsLoadingDemo(true);
    setFirebaseError(null);
    try {
      // 1. Real Firestore writes for teachers, rooms, subjects, and constraints
      await loadDemoDataToFirestore();

      // 2. Fresh read from real Firestore
      const [t, r, s, c] = await Promise.all([
        getTeachers(),
        getRooms(),
        getSubjects(),
        getConstraints(),
      ]);

      // 3. Immediately update state so dashboard counts update instantly
      setTeachers(t);
      setRooms(r);
      setSubjects(s);
      setConstraints(c);

      // 4. Generate schedule from the new data and persist to Firestore
      const generated = generateSmartTimetable(t, r, s, c, DEMO_SECTIONS, {
        name: `College Master Schedule ${new Date().toLocaleDateString()}`,
      });
      await saveTimetable(generated);
      setCurrentTimetable(generated);
      setTimetables((prev) => [generated, ...prev.filter((item) => item.id !== generated.id)]);
      setFirebaseError(null);
    } catch (err: any) {
      console.error('Error writing demo data to Firestore:', err);
      setFirebaseError(err?.message || 'Failed to write demo data to Firestore.');
    } finally {
      // Always stop the loading state, including when an error happens
      setIsLoadingDemo(false);
    }
  };

  // CRUD for Teachers
  const handleAddTeacher = async (teacher: Teacher) => {
    await saveTeacher(teacher);
    setTeachers((prev) => prev.filter((t) => t.id !== teacher.id).concat(teacher));
  };

  const handleDeleteTeacher = async (id: string) => {
    await deleteTeacher(id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  // CRUD for Rooms
  const handleAddRoom = async (room: Room) => {
    await saveRoom(room);
    setRooms((prev) => prev.filter((r) => r.id !== room.id).concat(room));
  };

  const handleDeleteRoom = async (id: string) => {
    await deleteRoom(id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  // CRUD for Subjects
  const handleAddSubject = async (subject: Subject) => {
    await saveSubject(subject);
    setSubjects((prev) => prev.filter((s) => s.id !== subject.id).concat(subject));
  };

  const handleDeleteSubject = async (id: string) => {
    await deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // CRUD for Constraints
  const handleAddConstraint = async (constraint: Constraint) => {
    await saveConstraint(constraint);
    setConstraints((prev) => prev.filter((c) => c.id !== constraint.id).concat(constraint));
  };

  const handleToggleConstraint = async (id: string, enabled: boolean) => {
    await toggleConstraint(id, enabled);
    setConstraints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled } : c))
    );
  };

  const handleDeleteConstraint = async (id: string) => {
    await deleteConstraint(id);
    setConstraints((prev) => prev.filter((c) => c.id !== id));
  };

  // Saved Timetable Actions
  const handleSelectTimetable = (selected: TimetableDoc) => {
    setCurrentTimetable(selected);
    setActiveTab('timetable');
  };

  const handleDeleteTimetable = async (id: string) => {
    await deleteTimetable(id);
    setTimetables((prev) => prev.filter((t) => t.id !== id));
    if (currentTimetable?.id === id) {
      const remaining = timetables.filter((t) => t.id !== id);
      setCurrentTimetable(remaining.length > 0 ? remaining[0] : null);
    }
  };

  // Gemini Insights update
  const handleUpdateTimetableInsights = async (insights: GeminiInsights) => {
    if (!currentTimetable) return;
    const updated: TimetableDoc = {
      ...currentTimetable,
      geminiInsights: insights,
    };
    setCurrentTimetable(updated);
    setTimetables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    await saveTimetable(updated);
  };

  if (isAuthLoading) {
    return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-600">Checking sign-in…</div>;
  }

  if (!authUser) {
    return <SignInView configError={dbInfo.error} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Dark Slate Navigation Sidebar matching Clean Utility Design Theme */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setupSubTab={setupSubTab}
        setSetupSubTab={setSetupSubTab}
        healthScore={currentTimetable ? currentTimetable.healthScore : null}
        conflictCount={currentTimetable?.conflictCount ?? null}
        dbInfo={dbInfo}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Clean Top Header matching Design Theme */}
        <Header
          title={
            activeTab === 'dashboard'
              ? 'Build better timetables in seconds.'
              : activeTab === 'timetable'
              ? 'Collegiate Weekly Timetable'
              : activeTab === 'setup'
              ? 'Academic Data Management'
              : activeTab === 'constraints'
              ? 'Institutional Constraint Checker'
              : 'Gemini AI Timetable Intelligence'
          }
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenSaved={() => setIsSavedModalOpen(true)}
          onGenerate={handleGenerateTimetable}
          isGenerating={isGenerating}
          signedInEmail={authUser.email || undefined}
          onSignOut={signOutUser}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-slate-50">
          {/* Visible Error Banner if Firebase configuration is missing or operation failed */}
          {firebaseError && (
            <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Firebase Configuration Notice</h4>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed">{firebaseError}</p>
                </div>
              </div>
              <button
                onClick={() => setFirebaseError(null)}
                className="text-rose-600 hover:text-rose-900 p-1 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading view…</div>}>
            {activeTab === 'dashboard' && (
              <DashboardView
              teachers={teachers}
              rooms={rooms}
              subjects={subjects}
              constraints={constraints}
              timetables={timetables}
              currentTimetable={currentTimetable}
              onGenerate={handleGenerateTimetable}
              onLoadDemoData={handleLoadDemoData}
              onNavigate={setActiveTab}
              isGenerating={isGenerating}
              isLoadingDemo={isLoadingDemo}
            />
            )}

            {activeTab === 'setup' && (
              <SetupDataView
              teachers={teachers}
              rooms={rooms}
              subjects={subjects}
              constraints={constraints}
              subTab={setupSubTab}
              onSubTabChange={setSetupSubTab}
              onAddTeacher={handleAddTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onAddRoom={handleAddRoom}
              onDeleteRoom={handleDeleteRoom}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              onAddConstraint={handleAddConstraint}
              onToggleConstraint={handleToggleConstraint}
              onDeleteConstraint={handleDeleteConstraint}
              onLoadDemoData={handleLoadDemoData}
              isLoadingDemo={isLoadingDemo}
            />
            )}

            {activeTab === 'timetable' && (
              <TimetableView
              timetable={currentTimetable}
              constraints={constraints}
              teacherCount={teachers.length}
              roomCount={rooms.length}
              subjectCount={subjects.length}
              onRegenerate={handleGenerateTimetable}
              onOpenSavedModal={() => setIsSavedModalOpen(true)}
              onNavigateToGemini={() => setActiveTab('ai-insights')}
              onUpdateTimetableInsights={handleUpdateTimetableInsights}
              isGenerating={isGenerating}
            />
            )}

            {activeTab === 'constraints' && (
              <ConstraintChecker
              currentTimetable={currentTimetable}
              constraints={constraints}
              onNavigateToSetup={() => {
                setSetupSubTab('constraints');
                setActiveTab('setup');
              }}
            />
            )}

            {activeTab === 'ai-insights' && (
              <GeminiInsightsPanel
              currentTimetable={currentTimetable}
              constraints={constraints}
              onUpdateTimetableInsights={handleUpdateTimetableInsights}
              onNavigateToTimetable={() => setActiveTab('timetable')}
            />
            )}
          </Suspense>
        </main>
      </div>

      {/* Saved Timetables Modal */}
      {isSavedModalOpen && (
        <Suspense fallback={null}>
          <SavedTimetablesModal
            isOpen={isSavedModalOpen}
            onClose={() => setIsSavedModalOpen(false)}
            timetables={timetables}
            activeTimetableId={currentTimetable ? currentTimetable.id : null}
            onSelectTimetable={handleSelectTimetable}
            onDeleteTimetable={handleDeleteTimetable}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
