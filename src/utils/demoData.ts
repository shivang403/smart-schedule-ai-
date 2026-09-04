import { Teacher, Room, Subject, Constraint } from '../types';

export const DEMO_SECTIONS = ['CS-A', 'CS-B', 'IT-A'];

export const DEMO_TEACHERS: Teacher[] = [
  {
    id: 't-sharma',
    name: 'Dr. Rajesh Sharma',
    email: 'r.sharma@college.edu',
    department: 'Computer Science',
    maxHoursPerDay: 4,
    unavailableDays: ['Wednesday'],
    unavailableSlots: ['Wednesday_9–10 AM', 'Wednesday_10–11 AM', 'Wednesday_11–12 PM', 'Wednesday_12–1 PM', 'Wednesday_2–3 PM', 'Wednesday_3–4 PM'],
    color: '#2563eb', // blue
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-patel',
    name: 'Prof. Anita Patel',
    email: 'a.patel@college.edu',
    department: 'Mathematics',
    maxHoursPerDay: 4,
    unavailableDays: [],
    unavailableSlots: ['Friday_2–3 PM', 'Friday_3–4 PM'],
    color: '#7c3aed', // purple
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-davis',
    name: 'Dr. Emily Davis',
    email: 'e.davis@college.edu',
    department: 'Artificial Intelligence',
    maxHoursPerDay: 4,
    unavailableDays: [],
    unavailableSlots: [],
    color: '#059669', // emerald
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-mehta',
    name: 'Prof. Vikram Mehta',
    email: 'v.mehta@college.edu',
    department: 'Information Technology',
    maxHoursPerDay: 3,
    unavailableDays: [],
    unavailableSlots: ['Monday_9–10 AM'],
    color: '#d97706', // amber
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-jenkins',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@college.edu',
    department: 'Physics & Circuits',
    maxHoursPerDay: 4,
    unavailableDays: ['Thursday'],
    unavailableSlots: ['Thursday_9–10 AM', 'Thursday_10–11 AM', 'Thursday_11–12 PM', 'Thursday_12–1 PM', 'Thursday_2–3 PM', 'Thursday_3–4 PM'],
    color: '#0891b2', // cyan
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-nair',
    name: 'Prof. Arjun Nair',
    email: 'a.nair@college.edu',
    department: 'Software Engineering',
    maxHoursPerDay: 4,
    unavailableDays: [],
    unavailableSlots: [],
    color: '#4f46e5', // indigo
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-rao',
    name: 'Dr. Meera Rao',
    email: 'm.rao@college.edu',
    department: 'Cyber Security & Networks',
    maxHoursPerDay: 3,
    unavailableDays: [],
    unavailableSlots: [],
    color: '#db2777', // pink
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_ROOMS: Room[] = [
  {
    id: 'r-101',
    name: 'Room 101 (Lecture Hall A)',
    capacity: 75,
    type: 'Lecture Hall',
    unavailableAfterTime: '14:00', // Unavailable after 2 PM
    unavailableSlots: ['Monday_2–3 PM', 'Monday_3–4 PM', 'Tuesday_2–3 PM', 'Tuesday_3–4 PM', 'Wednesday_2–3 PM', 'Wednesday_3–4 PM', 'Thursday_2–3 PM', 'Thursday_3–4 PM', 'Friday_2–3 PM', 'Friday_3–4 PM'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r-102',
    name: 'Room 102 (Lecture Hall B)',
    capacity: 65,
    type: 'Lecture Hall',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r-labA',
    name: 'Computer Lab A',
    capacity: 45,
    type: 'Computer Lab',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r-labB',
    name: 'AI & Networks Lab',
    capacity: 40,
    type: 'Computer Lab',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r-seminar',
    name: 'Seminar Hall 201',
    capacity: 120,
    type: 'Seminar Room',
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_SUBJECTS: Subject[] = [
  {
    id: 's-cs301',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    assignedTeacherId: 't-nair', // Prof. Arjun Nair
    weeklySessionsRequired: 3,
    preferredRoomType: 'Lecture Hall',
    classSections: ['CS-A', 'CS-B'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-cs302',
    code: 'CS302',
    name: 'Database Management Systems',
    assignedTeacherId: 't-sharma', // Dr. Rajesh Sharma
    weeklySessionsRequired: 3,
    preferredRoomType: 'Lecture Hall',
    classSections: ['CS-A', 'CS-B', 'IT-A'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-cs303',
    code: 'CS303',
    name: 'Operating Systems',
    assignedTeacherId: 't-mehta', // Prof. Vikram Mehta
    weeklySessionsRequired: 3,
    preferredRoomType: 'Lecture Hall',
    classSections: ['CS-A', 'IT-A'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-math201',
    code: 'MATH201',
    name: 'Discrete Mathematics',
    assignedTeacherId: 't-patel', // Prof. Anita Patel
    weeklySessionsRequired: 3,
    preferredRoomType: 'Lecture Hall',
    classSections: ['CS-A', 'CS-B', 'IT-A'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-ai401',
    code: 'AI401',
    name: 'Machine Learning Fundamentals',
    assignedTeacherId: 't-davis', // Dr. Emily Davis
    weeklySessionsRequired: 3,
    preferredRoomType: 'Computer Lab',
    classSections: ['CS-A', 'CS-B'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-cs304',
    code: 'CS304',
    name: 'Computer Networks & Protocols',
    assignedTeacherId: 't-rao', // Dr. Meera Rao
    weeklySessionsRequired: 2,
    preferredRoomType: 'Computer Lab',
    classSections: ['CS-B', 'IT-A'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-phy101',
    code: 'PHY101',
    name: 'Applied Physics & Circuits',
    assignedTeacherId: 't-jenkins', // Dr. Sarah Jenkins
    weeklySessionsRequired: 2,
    preferredRoomType: 'Lecture Hall',
    classSections: ['CS-A', 'IT-A'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-se305',
    code: 'SE305',
    name: 'Software Engineering & Agile',
    assignedTeacherId: 't-nair', // Prof. Arjun Nair
    weeklySessionsRequired: 2,
    preferredRoomType: 'Seminar Room',
    classSections: ['CS-B', 'IT-A'],
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_CONSTRAINTS: Constraint[] = [
  {
    id: 'c-sharma-wed',
    title: 'Dr. Sharma is unavailable on Wednesday',
    type: 'TEACHER_UNAVAILABLE_DAY',
    description: 'Dr. Rajesh Sharma has administrative duties and cannot conduct classes on Wednesdays.',
    targetId: 't-sharma',
    targetName: 'Dr. Rajesh Sharma',
    value: { day: 'Wednesday' },
    enabled: true,
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c-room101-2pm',
    title: 'Room 101 is unavailable after 2 PM',
    type: 'ROOM_UNAVAILABLE_AFTER',
    description: 'Room 101 is booked for college entrance counseling and workshops after 2:00 PM.',
    targetId: 'r-101',
    targetName: 'Room 101 (Lecture Hall A)',
    value: { afterTime: '14:00', restrictedSlotIndices: [4, 5] },
    enabled: true,
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c-start-9am',
    title: 'No class should start before 9 AM',
    type: 'NO_CLASS_BEFORE_9AM',
    description: 'Campus regulation: Earliest lecture begins strictly at 9:00 AM sharp.',
    enabled: true,
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c-max-consec',
    title: 'Avoid more than two consecutive classes for a teacher',
    type: 'MAX_CONSECUTIVE_CLASSES',
    description: 'Prevent faculty fatigue by limiting consecutive teaching periods to 2 in a row.',
    value: { maxConsecutive: 2 },
    enabled: true,
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c-jenkins-thu',
    title: 'Dr. Sarah Jenkins is unavailable on Thursday',
    type: 'TEACHER_UNAVAILABLE_DAY',
    description: 'Dr. Jenkins conducts external laboratory research on Thursdays.',
    targetId: 't-jenkins',
    targetName: 'Dr. Sarah Jenkins',
    value: { day: 'Thursday' },
    enabled: true,
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
  },
];
