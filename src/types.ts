export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export type TimeSlot =
  | '9–10 AM'
  | '10–11 AM'
  | '11–12 PM'
  | '12–1 PM'
  | '2–3 PM'
  | '3–4 PM';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TIME_SLOTS: TimeSlot[] = [
  '9–10 AM',
  '10–11 AM',
  '11–12 PM',
  '12–1 PM',
  '2–3 PM',
  '3–4 PM',
];

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  maxHoursPerDay?: number;
  unavailableDays: DayOfWeek[];
  unavailableSlots?: string[]; // e.g. "Wednesday_12-1 PM"
  color?: string;
  createdAt?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'Lecture Hall' | 'Computer Lab' | 'Seminar Room' | 'Tutorial Room';
  unavailableAfterTime?: string; // e.g. "14:00" or "2 PM"
  unavailableSlots?: string[];
  createdAt?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  assignedTeacherId: string;
  weeklySessionsRequired: number; // e.g. 3 sessions
  preferredRoomType?: 'Lecture Hall' | 'Computer Lab' | 'Seminar Room' | 'Tutorial Room';
  classSections: string[]; // e.g. ["CS-A", "CS-B"]
  createdAt?: string;
}

export type ConstraintType =
  | 'TEACHER_UNAVAILABLE_DAY'
  | 'ROOM_UNAVAILABLE_AFTER'
  | 'NO_CLASS_BEFORE_9AM'
  | 'MAX_CONSECUTIVE_CLASSES'
  | 'CUSTOM';

export interface Constraint {
  id: string;
  title: string;
  type: ConstraintType;
  description: string;
  targetId?: string; // teacherId or roomId
  targetName?: string;
  value?: any; // day name, cutoff time, max hours
  enabled: boolean;
  priority: 'HIGH' | 'MEDIUM';
  createdAt?: string;
}

export interface TimetableSlotEntry {
  id: string;
  day: DayOfWeek;
  timeSlot: TimeSlot;
  timeSlotIndex: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
  classSection: string;
  color?: string;
}

export interface UnscheduledItem {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  classSection: string;
  teacherName: string;
  sessionNumber: number;
  reason: string;
}

export interface ScheduleConflict {
  id: string;
  type: 'TEACHER_CLASH' | 'ROOM_CLASH' | 'SECTION_CLASH' | 'UNAVAILABLE_SLOT' | 'CONSECUTIVE_LIMIT';
  description: string;
  day: DayOfWeek;
  timeSlot: TimeSlot;
  involvedEntities: string[];
}

export interface ConstraintCheckResult {
  constraintId: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM';
  respected: boolean;
  violationCount: number;
  details?: string;
}

export interface GeminiInsights {
  threeEfficiencyReasons: string[];
  oneImprovementSuggestion: string;
  qualitySummary: string;
  analyzedAt: string;
  modelUsed?: string;
}

export interface TimetableDoc {
  id: string;
  name: string;
  createdAt: string;
  classSections: string[];
  slots: TimetableSlotEntry[];
  unscheduledItems: UnscheduledItem[];
  conflictCount: number;
  conflicts: ScheduleConflict[];
  healthScore: number; // 0 - 100
  teacherWorkloadScore: number; // 0 - 100
  roomUtilizationRate: number; // 0 - 100
  constraintCheckResults: ConstraintCheckResult[];
  geminiInsights?: GeminiInsights;
}

export interface DashboardMetrics {
  teacherCount: number;
  roomCount: number;
  subjectCount: number;
  timetableCount: number;
  activeConstraintsCount: number;
  latestHealthScore: number | null;
}
