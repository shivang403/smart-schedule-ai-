import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  Auth,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { Teacher, Room, Subject, Constraint, TimetableDoc } from '../types';
import { DEMO_TEACHERS, DEMO_ROOMS, DEMO_SUBJECTS, DEMO_CONSTRAINTS } from '../utils/demoData';
import rawConfig from '../firebase-applet-config.json';

// Firestore collection names for smart-schedule-ai
export const COLLECTIONS = {
  TEACHERS: 'teachers',
  ROOMS: 'rooms',
  SUBJECTS: 'subjects',
  CONSTRAINTS: 'constraints',
  TIMETABLES: 'timetables',
} as const;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(errMessage);
}

// Timeout helper to guarantee async operations never hang indefinitely
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMsg)), ms)
    ),
  ]);
}

// Resolve configuration for project 'smart-schedule-ai'
const envApiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const rawApiKey = (rawConfig.apiKey || '').trim();
const resolvedApiKey = envApiKey || rawApiKey;

const firebaseConfig = {
  apiKey: resolvedApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || 'smart-schedule-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || 'smart-schedule-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || 'smart-schedule-ai.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig.appId || '',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isConfigured = false;
let isConnected = false;
let configError: string | null = null;

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.length === 0) {
  configError = `Firebase configuration is missing: 'VITE_FIREBASE_API_KEY' is not set for project '${firebaseConfig.projectId}'. Please configure your Firebase API Key in environment variables or Settings to connect to Firestore.`;
  isConfigured = false;
  isConnected = false;
} else {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    auth = getAuth(app);
    isConfigured = true;
    isConnected = true;
  } catch (err: any) {
    configError = err?.message || 'Failed to initialize Firebase.';
    isConfigured = false;
    isConnected = false;
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!auth) {
    throw new Error(configError || 'Firebase Authentication is not configured.');
  }
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(): Promise<void> {
  if (auth) await signOut(auth);
}

export function getFirestoreConnectionInfo() {
  return {
    projectId: firebaseConfig.projectId,
    connected: isConnected,
    isConfigured,
    error: configError,
  };
}

// ----------------- TEACHERS -----------------
export async function getTeachers(): Promise<Teacher[]> {
  if (!db || !isConfigured) {
    return [];
  }
  try {
    const snap = await withTimeout(
      getDocs(collection(db, COLLECTIONS.TEACHERS)),
      10000,
      'Timed out fetching teachers from Firestore.'
    );
    const teachers: Teacher[] = [];
    snap.forEach((d) => {
      teachers.push({ id: d.id, ...(d.data() as Omit<Teacher, 'id'>) });
    });
    return teachers;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.TEACHERS);
  }
}

export async function saveTeacher(teacher: Teacher): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      setDoc(doc(db, COLLECTIONS.TEACHERS, teacher.id), teacher),
      10000,
      `Timed out saving teacher ${teacher.name} to Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.TEACHERS}/${teacher.id}`);
  }
}

export async function deleteTeacher(teacherId: string): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      deleteDoc(doc(db, COLLECTIONS.TEACHERS, teacherId)),
      10000,
      `Timed out deleting teacher ${teacherId} from Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.TEACHERS}/${teacherId}`);
  }
}

// ----------------- ROOMS -----------------
export async function getRooms(): Promise<Room[]> {
  if (!db || !isConfigured) {
    return [];
  }
  try {
    const snap = await withTimeout(
      getDocs(collection(db, COLLECTIONS.ROOMS)),
      10000,
      'Timed out fetching rooms from Firestore.'
    );
    const rooms: Room[] = [];
    snap.forEach((d) => {
      rooms.push({ id: d.id, ...(d.data() as Omit<Room, 'id'>) });
    });
    return rooms;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.ROOMS);
  }
}

export async function saveRoom(room: Room): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      setDoc(doc(db, COLLECTIONS.ROOMS, room.id), room),
      10000,
      `Timed out saving room ${room.name} to Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.ROOMS}/${room.id}`);
  }
}

export async function deleteRoom(roomId: string): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      deleteDoc(doc(db, COLLECTIONS.ROOMS, roomId)),
      10000,
      `Timed out deleting room ${roomId} from Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.ROOMS}/${roomId}`);
  }
}

// ----------------- SUBJECTS -----------------
export async function getSubjects(): Promise<Subject[]> {
  if (!db || !isConfigured) {
    return [];
  }
  try {
    const snap = await withTimeout(
      getDocs(collection(db, COLLECTIONS.SUBJECTS)),
      10000,
      'Timed out fetching subjects from Firestore.'
    );
    const subjects: Subject[] = [];
    snap.forEach((d) => {
      subjects.push({ id: d.id, ...(d.data() as Omit<Subject, 'id'>) });
    });
    return subjects;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.SUBJECTS);
  }
}

export async function saveSubject(subject: Subject): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      setDoc(doc(db, COLLECTIONS.SUBJECTS, subject.id), subject),
      10000,
      `Timed out saving subject ${subject.code} to Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.SUBJECTS}/${subject.id}`);
  }
}

export async function deleteSubject(subjectId: string): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      deleteDoc(doc(db, COLLECTIONS.SUBJECTS, subjectId)),
      10000,
      `Timed out deleting subject ${subjectId} from Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.SUBJECTS}/${subjectId}`);
  }
}

// ----------------- CONSTRAINTS -----------------
export async function getConstraints(): Promise<Constraint[]> {
  if (!db || !isConfigured) {
    return [];
  }
  try {
    const snap = await withTimeout(
      getDocs(collection(db, COLLECTIONS.CONSTRAINTS)),
      10000,
      'Timed out fetching constraints from Firestore.'
    );
    const constraints: Constraint[] = [];
    snap.forEach((d) => {
      constraints.push({ id: d.id, ...(d.data() as Omit<Constraint, 'id'>) });
    });
    return constraints;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.CONSTRAINTS);
  }
}

export async function saveConstraint(constraint: Constraint): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      setDoc(doc(db, COLLECTIONS.CONSTRAINTS, constraint.id), constraint),
      10000,
      `Timed out saving constraint ${constraint.title} to Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.CONSTRAINTS}/${constraint.id}`);
  }
}

export async function toggleConstraint(constraintId: string, enabled: boolean): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      setDoc(doc(db, COLLECTIONS.CONSTRAINTS, constraintId), { enabled }, { merge: true }),
      10000,
      `Timed out updating constraint ${constraintId} in Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.CONSTRAINTS}/${constraintId}`);
  }
}

export async function deleteConstraint(constraintId: string): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      deleteDoc(doc(db, COLLECTIONS.CONSTRAINTS, constraintId)),
      10000,
      `Timed out deleting constraint ${constraintId} from Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.CONSTRAINTS}/${constraintId}`);
  }
}

// ----------------- TIMETABLES -----------------
export async function getSavedTimetables(): Promise<TimetableDoc[]> {
  if (!db || !isConfigured) {
    return [];
  }
  try {
    const q = query(collection(db, COLLECTIONS.TIMETABLES), orderBy('createdAt', 'desc'));
    const snap = await withTimeout(
      getDocs(q),
      10000,
      'Timed out fetching timetables from Firestore.'
    );
    const timetables: TimetableDoc[] = [];
    snap.forEach((d) => {
      timetables.push({ id: d.id, ...(d.data() as Omit<TimetableDoc, 'id'>) });
    });
    return timetables;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.TIMETABLES);
  }
}

export async function saveTimetable(timetable: TimetableDoc): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      setDoc(doc(db, COLLECTIONS.TIMETABLES, timetable.id), timetable),
      10000,
      `Timed out saving timetable ${timetable.name} to Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTIONS.TIMETABLES}/${timetable.id}`);
  }
}

export async function deleteTimetable(timetableId: string): Promise<void> {
  if (!db || !isConfigured) {
    throw new Error(configError || 'Firebase is not configured.');
  }
  try {
    await withTimeout(
      deleteDoc(doc(db, COLLECTIONS.TIMETABLES, timetableId)),
      10000,
      `Timed out deleting timetable ${timetableId} from Firestore.`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.TIMETABLES}/${timetableId}`);
  }
}

// ----------------- REAL FIRESTORE BULK DEMO WRITE -----------------
export async function loadDemoDataToFirestore(): Promise<{
  teachers: number;
  rooms: number;
  subjects: number;
  constraints: number;
}> {
  if (!db || !isConfigured) {
    throw new Error(
      configError ||
      `Firebase configuration is missing: 'VITE_FIREBASE_API_KEY' is not configured for project '${firebaseConfig.projectId}'.`
    );
  }

  try {
    const batch = writeBatch(db);

    DEMO_TEACHERS.forEach((t) => {
      batch.set(doc(db!, COLLECTIONS.TEACHERS, t.id), t);
    });
    DEMO_ROOMS.forEach((r) => {
      batch.set(doc(db!, COLLECTIONS.ROOMS, r.id), r);
    });
    DEMO_SUBJECTS.forEach((s) => {
      batch.set(doc(db!, COLLECTIONS.SUBJECTS, s.id), s);
    });
    DEMO_CONSTRAINTS.forEach((c) => {
      batch.set(doc(db!, COLLECTIONS.CONSTRAINTS, c.id), c);
    });

    await withTimeout(
      batch.commit(),
      15000,
      'Batch write to Firestore timed out after 15 seconds. Please check network connectivity and Firestore permissions.'
    );

    return {
      teachers: DEMO_TEACHERS.length,
      rooms: DEMO_ROOMS.length,
      subjects: DEMO_SUBJECTS.length,
      constraints: DEMO_CONSTRAINTS.length,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'batch/demo-data');
  }
}
