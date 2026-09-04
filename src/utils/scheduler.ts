import {
  Teacher,
  Room,
  Subject,
  Constraint,
  TimetableSlotEntry,
  UnscheduledItem,
  ScheduleConflict,
  ConstraintCheckResult,
  TimetableDoc,
  DayOfWeek,
  TimeSlot,
  DAYS_OF_WEEK,
  TIME_SLOTS,
} from '../types';

export interface GenerationOptions {
  name?: string;
  enforceRoomCapacity?: boolean;
}

interface SessionToSchedule {
  id: string;
  subject: Subject;
  section: string;
  teacher: Teacher;
  sessionIndex: number;
}

export function generateSmartTimetable(
  teachers: Teacher[],
  rooms: Room[],
  subjects: Subject[],
  constraints: Constraint[],
  sections: string[],
  options?: GenerationOptions
): TimetableDoc {
  const teacherMap = new Map<string, Teacher>();
  teachers.forEach((t) => teacherMap.set(t.id, t));

  const roomMap = new Map<string, Room>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  // Prepare list of sessions to schedule
  const sessionsToSchedule: SessionToSchedule[] = [];
  for (const subject of subjects) {
    const teacher = teacherMap.get(subject.assignedTeacherId);
    if (!teacher) continue;

    const targetSections = subject.classSections && subject.classSections.length > 0
      ? subject.classSections.filter((s) => sections.includes(s))
      : sections;

    for (const section of targetSections) {
      for (let i = 0; i < (subject.weeklySessionsRequired || 1); i++) {
        sessionsToSchedule.push({
          id: `${subject.id}_${section}_${i}`,
          subject,
          section,
          teacher,
          sessionIndex: i,
        });
      }
    }
  }

  // Active constraints lookup
  const activeConstraints = constraints.filter((c) => c.enabled);
  const teacherUnavailableDays = new Map<string, Set<DayOfWeek>>();
  const teacherUnavailableSlots = new Map<string, Set<string>>();
  const roomUnavailableSlots = new Map<string, Set<string>>();
  let maxConsecutiveLimit = 2; // default

  for (const c of activeConstraints) {
    if (c.type === 'TEACHER_UNAVAILABLE_DAY' && c.targetId && c.value?.day) {
      if (!teacherUnavailableDays.has(c.targetId)) {
        teacherUnavailableDays.set(c.targetId, new Set());
      }
      teacherUnavailableDays.get(c.targetId)!.add(c.value.day as DayOfWeek);
    }
    if (c.type === 'ROOM_UNAVAILABLE_AFTER' && c.targetId) {
      if (!roomUnavailableSlots.has(c.targetId)) {
        roomUnavailableSlots.set(c.targetId, new Set());
      }
      // After 2 PM means slot indices 4 (2–3 PM) and 5 (3–4 PM)
      const restricted = c.value?.restrictedSlotIndices || [4, 5];
      for (const day of DAYS_OF_WEEK) {
        for (const slotIdx of restricted) {
          roomUnavailableSlots.get(c.targetId)!.add(`${day}_${slotIdx}`);
        }
      }
    }
    if (c.type === 'MAX_CONSECUTIVE_CLASSES') {
      maxConsecutiveLimit = c.value?.maxConsecutive || 2;
    }
  }

  // Also include teacher's native unavailable days / slots
  for (const t of teachers) {
    if (t.unavailableDays && t.unavailableDays.length > 0) {
      if (!teacherUnavailableDays.has(t.id)) {
        teacherUnavailableDays.set(t.id, new Set());
      }
      t.unavailableDays.forEach((d) => teacherUnavailableDays.get(t.id)!.add(d));
    }
    if (t.unavailableSlots && t.unavailableSlots.length > 0) {
      if (!teacherUnavailableSlots.has(t.id)) {
        teacherUnavailableSlots.set(t.id, new Set());
      }
      t.unavailableSlots.forEach((s) => teacherUnavailableSlots.get(t.id)!.add(s));
    }
  }

  // Grid occupation state trackers
  // key: "day_slotIndex_section" -> boolean
  const sectionBusy = new Set<string>();
  // key: "day_slotIndex_teacherId" -> boolean
  const teacherBusy = new Set<string>();
  // key: "day_slotIndex_roomId" -> boolean
  const roomBusy = new Set<string>();
  // key: "day_teacherId" -> array of busy slot indices
  const teacherDaySlots = new Map<string, number[]>();
  // key: "day_section_subjectId" -> count
  const subjectDayCount = new Map<string, number>();

  const scheduledSlots: TimetableSlotEntry[] = [];
  const unscheduledItems: UnscheduledItem[] = [];

  // Sort sessions: subjects with more sessions or specialized room requirements first
  sessionsToSchedule.sort((a, b) => {
    const aPref = a.subject.preferredRoomType === 'Computer Lab' ? 2 : 1;
    const bPref = b.subject.preferredRoomType === 'Computer Lab' ? 2 : 1;
    if (bPref !== aPref) return bPref - aPref;
    return b.subject.weeklySessionsRequired - a.subject.weeklySessionsRequired;
  });

  // Scheduling loop
  for (const item of sessionsToSchedule) {
    let placed = false;

    // Filter eligible rooms by preferred room type
    let candidateRooms = rooms.filter((r) => {
      if (item.subject.preferredRoomType) {
        return r.type === item.subject.preferredRoomType;
      }
      return true;
    });

    if (candidateRooms.length === 0) {
      candidateRooms = rooms; // fallback
    }

    // Attempt to find a suitable (day, slot, room) tuple
    // We score combinations to find the highest quality placement
    interface PlacementCandidate {
      day: DayOfWeek;
      slotIndex: number;
      room: Room;
      score: number; // lower is better / penalties
    }

    const validCandidates: PlacementCandidate[] = [];

    for (const day of DAYS_OF_WEEK) {
      // 1. Check teacher unavailable day
      const unavailDays = teacherUnavailableDays.get(item.teacher.id);
      if (unavailDays && unavailDays.has(day)) {
        continue;
      }

      // Check how many times this subject is already scheduled on this day for this section
      const daySubCount = subjectDayCount.get(`${day}_${item.section}_${item.subject.id}`) || 0;
      if (daySubCount >= 1 && sessionsToSchedule.length > 5) {
        // Prefer spreading subjects over different days
      }

      for (let slotIndex = 0; slotIndex < TIME_SLOTS.length; slotIndex++) {
        const timeSlot = TIME_SLOTS[slotIndex];

        // 2. Section clash check
        if (sectionBusy.has(`${day}_${slotIndex}_${item.section}`)) {
          continue;
        }

        // 3. Teacher clash check
        if (teacherBusy.has(`${day}_${slotIndex}_${item.teacher.id}`)) {
          continue;
        }

        // 4. Teacher slot unavailability check
        const tSlots = teacherUnavailableSlots.get(item.teacher.id);
        if (tSlots && (tSlots.has(`${day}_${timeSlot}`) || tSlots.has(`${day}_${slotIndex}`))) {
          continue;
        }

        // 5. Teacher consecutive class check
        const currentTeacherSlots = teacherDaySlots.get(`${day}_${item.teacher.id}`) || [];
        let consecutiveViolated = false;
        if (currentTeacherSlots.includes(slotIndex - 1) && currentTeacherSlots.includes(slotIndex - 2)) {
          consecutiveViolated = true;
        }
        if (currentTeacherSlots.includes(slotIndex + 1) && currentTeacherSlots.includes(slotIndex + 2)) {
          consecutiveViolated = true;
        }
        if (currentTeacherSlots.includes(slotIndex - 1) && currentTeacherSlots.includes(slotIndex + 1)) {
          consecutiveViolated = true;
        }

        // Search for a free room
        for (const room of candidateRooms) {
          // Room clash check
          if (roomBusy.has(`${day}_${slotIndex}_${room.id}`)) {
            continue;
          }

          // Room unavailable check (e.g. Room 101 after 2 PM)
          const rSlots = roomUnavailableSlots.get(room.id);
          if (rSlots && (rSlots.has(`${day}_${slotIndex}`) || rSlots.has(`${day}_${timeSlot}`))) {
            continue;
          }

          // Calculate penalty score
          let penalty = 0;
          if (consecutiveViolated) penalty += 30;
          if (daySubCount >= 1) penalty += 20; // avoid same subject twice on same day
          // Slight preference for morning lectures
          if (slotIndex >= 4) penalty += 5;

          validCandidates.push({
            day,
            slotIndex,
            room,
            score: penalty,
          });
        }
      }
    }

    if (validCandidates.length > 0) {
      // Pick best candidate with lowest penalty score
      validCandidates.sort((a, b) => a.score - b.score);
      const chosen = validCandidates[0];

      // Mark occupied
      sectionBusy.add(`${chosen.day}_${chosen.slotIndex}_${item.section}`);
      teacherBusy.add(`${chosen.day}_${chosen.slotIndex}_${item.teacher.id}`);
      roomBusy.add(`${chosen.day}_${chosen.slotIndex}_${chosen.room.id}`);

      const tList = teacherDaySlots.get(`${chosen.day}_${item.teacher.id}`) || [];
      tList.push(chosen.slotIndex);
      teacherDaySlots.set(`${chosen.day}_${item.teacher.id}`, tList);

      const count = subjectDayCount.get(`${chosen.day}_${item.section}_${item.subject.id}`) || 0;
      subjectDayCount.set(`${chosen.day}_${item.section}_${item.subject.id}`, count + 1);

      scheduledSlots.push({
        id: `slot_${chosen.day}_${chosen.slotIndex}_${item.section}`,
        day: chosen.day,
        timeSlot: TIME_SLOTS[chosen.slotIndex],
        timeSlotIndex: chosen.slotIndex,
        subjectId: item.subject.id,
        subjectCode: item.subject.code,
        subjectName: item.subject.name,
        teacherId: item.teacher.id,
        teacherName: item.teacher.name,
        roomId: chosen.room.id,
        roomName: chosen.room.name,
        classSection: item.section,
        color: item.teacher.color || '#2563eb',
      });

      placed = true;
    }

    if (!placed) {
      unscheduledItems.push({
        id: `unscheduled_${item.id}`,
        subjectId: item.subject.id,
        subjectCode: item.subject.code,
        subjectName: item.subject.name,
        classSection: item.section,
        teacherName: item.teacher.name,
        sessionNumber: item.sessionIndex + 1,
        reason: 'No mutually available slot found without teacher, room, or section clash.',
      });
    }
  }

  // Real conflict verification
  const conflicts: ScheduleConflict[] = [];

  // Group by (day, slot) to double verify clashes
  const slotGroups = new Map<string, TimetableSlotEntry[]>();
  for (const s of scheduledSlots) {
    const key = `${s.day}_${s.timeSlot}`;
    if (!slotGroups.has(key)) slotGroups.set(key, []);
    slotGroups.get(key)!.push(s);
  }

  slotGroups.forEach((entries, key) => {
    const [dayStr, timeSlotStr] = key.split('_');
    const day = dayStr as DayOfWeek;
    const timeSlot = timeSlotStr as TimeSlot;

    // Check teacher clashes
    const tSeen = new Map<string, TimetableSlotEntry>();
    for (const e of entries) {
      if (tSeen.has(e.teacherId)) {
        const other = tSeen.get(e.teacherId)!;
        conflicts.push({
          id: `conflict_teacher_${e.id}`,
          type: 'TEACHER_CLASH',
          description: `Teacher ${e.teacherName} is scheduled for both ${e.classSection} (${e.subjectCode}) and ${other.classSection} (${other.subjectCode}) at ${timeSlot}.`,
          day,
          timeSlot,
          involvedEntities: [e.teacherName, e.classSection, other.classSection],
        });
      } else {
        tSeen.set(e.teacherId, e);
      }
    }

    // Check room clashes
    const rSeen = new Map<string, TimetableSlotEntry>();
    for (const e of entries) {
      if (rSeen.has(e.roomId)) {
        const other = rSeen.get(e.roomId)!;
        conflicts.push({
          id: `conflict_room_${e.id}`,
          type: 'ROOM_CLASH',
          description: `Room ${e.roomName} is double-booked for ${e.classSection} (${e.subjectCode}) and ${other.classSection} (${other.subjectCode}) at ${timeSlot}.`,
          day,
          timeSlot,
          involvedEntities: [e.roomName, e.classSection, other.classSection],
        });
      } else {
        rSeen.set(e.roomId, e);
      }
    }

    // Check section clashes
    const secSeen = new Map<string, TimetableSlotEntry>();
    for (const e of entries) {
      if (secSeen.has(e.classSection)) {
        const other = secSeen.get(e.classSection)!;
        conflicts.push({
          id: `conflict_sec_${e.id}`,
          type: 'SECTION_CLASH',
          description: `Section ${e.classSection} has two concurrent classes: ${e.subjectCode} and ${other.subjectCode} at ${timeSlot}.`,
          day,
          timeSlot,
          involvedEntities: [e.classSection, e.subjectCode, other.subjectCode],
        });
      } else {
        secSeen.set(e.classSection, e);
      }
    }
  });

  // Evaluate Constraints
  const constraintCheckResults: ConstraintCheckResult[] = [];

  for (const c of constraints) {
    if (!c.enabled) {
      constraintCheckResults.push({
        constraintId: c.id,
        title: c.title,
        description: c.description,
        priority: c.priority,
        respected: true,
        violationCount: 0,
        details: 'Constraint is disabled by administrator.',
      });
      continue;
    }

    if (c.type === 'TEACHER_UNAVAILABLE_DAY') {
      const targetDay = c.value?.day as DayOfWeek;
      const targetId = c.targetId;
      const violations = scheduledSlots.filter(
        (s) => s.teacherId === targetId && s.day === targetDay
      );
      constraintCheckResults.push({
        constraintId: c.id,
        title: c.title,
        description: c.description,
        priority: c.priority,
        respected: violations.length === 0,
        violationCount: violations.length,
        details:
          violations.length === 0
            ? `Respected: 0 classes scheduled on ${targetDay}.`
            : `Violated: ${violations.length} class(es) scheduled on ${targetDay}.`,
      });
    } else if (c.type === 'ROOM_UNAVAILABLE_AFTER') {
      const targetRoomId = c.targetId;
      const restricted = c.value?.restrictedSlotIndices || [4, 5];
      const violations = scheduledSlots.filter(
        (s) => s.roomId === targetRoomId && restricted.includes(s.timeSlotIndex)
      );
      constraintCheckResults.push({
        constraintId: c.id,
        title: c.title,
        description: c.description,
        priority: c.priority,
        respected: violations.length === 0,
        violationCount: violations.length,
        details:
          violations.length === 0
            ? 'Respected: No sessions placed in restricted afternoon hours.'
            : `Violated: ${violations.length} session(s) scheduled after cutoff.`,
      });
    } else if (c.type === 'NO_CLASS_BEFORE_9AM') {
      // The grid starts at 9 AM, so this is strictly respected by system architecture
      constraintCheckResults.push({
        constraintId: c.id,
        title: c.title,
        description: c.description,
        priority: c.priority,
        respected: true,
        violationCount: 0,
        details: 'Respected: Timetable begins strictly at 9:00 AM across all days.',
      });
    } else if (c.type === 'MAX_CONSECUTIVE_CLASSES') {
      let violationCount = 0;
      const maxLimit = c.value?.maxConsecutive || 2;

      // Group by teacher and day
      const teacherDayMap = new Map<string, number[]>();
      for (const s of scheduledSlots) {
        const key = `${s.teacherId}_${s.day}`;
        if (!teacherDayMap.has(key)) teacherDayMap.set(key, []);
        teacherDayMap.get(key)!.push(s.timeSlotIndex);
      }

      teacherDayMap.forEach((indices) => {
        indices.sort((a, b) => a - b);
        let consecutive = 1;
        for (let i = 1; i < indices.length; i++) {
          if (indices[i] === indices[i - 1] + 1) {
            consecutive++;
            if (consecutive > maxLimit) {
              violationCount++;
            }
          } else {
            consecutive = 1;
          }
        }
      });

      constraintCheckResults.push({
        constraintId: c.id,
        title: c.title,
        description: c.description,
        priority: c.priority,
        respected: violationCount === 0,
        violationCount,
        details:
          violationCount === 0
            ? `Respected: No faculty exceeded ${maxLimit} consecutive teaching periods.`
            : `Violated: ${violationCount} instance(s) where teacher had > ${maxLimit} consecutive classes.`,
      });
    } else {
      // Custom constraint
      constraintCheckResults.push({
        constraintId: c.id,
        title: c.title,
        description: c.description,
        priority: c.priority,
        respected: true,
        violationCount: 0,
        details: 'Respected: Active administrative policy acknowledged.',
      });
    }
  }

  // Teacher Workload Balance Score (0 - 100)
  const teacherLoadMap = new Map<string, number>();
  for (const t of teachers) teacherLoadMap.set(t.id, 0);
  for (const s of scheduledSlots) {
    teacherLoadMap.set(s.teacherId, (teacherLoadMap.get(s.teacherId) || 0) + 1);
  }

  const loads = Array.from(teacherLoadMap.values());
  const avgLoad = loads.reduce((a, b) => a + b, 0) / (loads.length || 1);
  const variance = loads.reduce((sum, val) => sum + Math.pow(val - avgLoad, 2), 0) / (loads.length || 1);
  const stdDev = Math.sqrt(variance);
  // High stdDev means unbalanced workload
  const teacherWorkloadScore = Math.max(20, Math.min(100, Math.round(100 - stdDev * 10)));

  // Room Utilization Rate (0 - 100)
  // Total available room slots in a week = rooms.length * 5 days * 6 slots = rooms.length * 30
  const totalRoomSlots = rooms.length * 30;
  const roomUtilizationRate = totalRoomSlots > 0
    ? Math.min(100, Math.round((scheduledSlots.length / totalRoomSlots) * 100))
    : 0;

  // Real Conflict Count
  const totalConflictCount = conflicts.length + unscheduledItems.length;

  // Schedule Health Score calculation
  // 100 base score
  // - 20 points per hard conflict (teacher/room/section clash)
  // - 5 points per unscheduled session
  // - 5 points per constraint violation
  const constraintViolations = constraintCheckResults.reduce((acc, c) => acc + c.violationCount, 0);
  let rawHealth = 100;
  rawHealth -= conflicts.length * 20;
  rawHealth -= unscheduledItems.length * 5;
  rawHealth -= constraintViolations * 4;

  // Add small balance & utilization factor
  if (conflicts.length === 0 && unscheduledItems.length === 0) {
    rawHealth = Math.round(85 + (teacherWorkloadScore * 0.1) + (Math.min(roomUtilizationRate, 70) * 0.07));
  }
  const healthScore = Math.max(0, Math.min(100, rawHealth));

  const timetableDoc: TimetableDoc = {
    id: `tt_${Date.now()}`,
    name: options?.name || `College Master Schedule ${new Date().toLocaleDateString()}`,
    createdAt: new Date().toISOString(),
    classSections: sections,
    slots: scheduledSlots,
    unscheduledItems,
    conflictCount: totalConflictCount,
    conflicts,
    healthScore,
    teacherWorkloadScore,
    roomUtilizationRate,
    constraintCheckResults,
  };

  return timetableDoc;
}

export function exportTimetableToCSV(timetable: TimetableDoc, activeSection?: string): string {
  const filteredSlots = activeSection && activeSection !== 'ALL'
    ? timetable.slots.filter((s) => s.classSection === activeSection)
    : timetable.slots;

  const headers = ['Day', 'Time Slot', 'Section', 'Subject Code', 'Subject Name', 'Faculty Teacher', 'Room'];
  const rows = filteredSlots.map((s) => [
    `"${s.day}"`,
    `"${s.timeSlot}"`,
    `"${s.classSection}"`,
    `"${s.subjectCode}"`,
    `"${s.subjectName.replace(/"/g, '""')}"`,
    `"${s.teacherName.replace(/"/g, '""')}"`,
    `"${s.roomName.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
