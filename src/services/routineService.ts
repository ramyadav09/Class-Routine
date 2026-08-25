import {RoutineData, Student, SectionRoutine, ClassInfo, CellDetail, DAYS, PERIODS} from '../types';

let cachedData: RoutineData | null = null;
let loadPromise: Promise<RoutineData> | null = null;

export const loadRoutineData = async (): Promise<RoutineData> => {
  if (cachedData) {
    return cachedData;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const data = require('../assets/data/routines.json') as RoutineData;
      cachedData = data;
      return data;
    } catch (err) {
      throw new Error('Failed to load routine data. Please ensure the app is properly installed.');
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
};

const routineCache = new Map<string, {
  student: Student;
  coreRoutine: SectionRoutine | null;
  mergedRoutine: Record<string, Record<string, ClassInfo | null>>;
}>();

export const getStudentRoutine = async (
  rollNumber: string,
): Promise<{
  student: Student;
  coreRoutine: SectionRoutine | null;
  mergedRoutine: Record<string, Record<string, ClassInfo | null>>;
} | null> => {
  const cached = routineCache.get(rollNumber);
  if (cached) {
    return cached;
  }

  const data = await loadRoutineData();
  const student = data.students[rollNumber];

  if (!student) {
    return null;
  }

  const coreRoutine = data.core[student.section] || null;

  const mergedRoutine: Record<string, Record<string, ClassInfo | null>> = {};

  for (const day of DAYS) {
    mergedRoutine[day] = {};

    if (coreRoutine && coreRoutine[day]) {
      for (const period of PERIODS) {
        if (coreRoutine[day][period]) {
          mergedRoutine[day][period] = coreRoutine[day][period];
        }
      }
    }

    if (student.ipa && data.ipa[student.ipa] && data.ipa[student.ipa][day]) {
      const ipaDay = data.ipa[student.ipa][day];
      for (const period of Object.keys(ipaDay)) {
        if (ipaDay[period] && !mergedRoutine[day][period]) {
          mergedRoutine[day][period] = ipaDay[period];
        }
      }
    }

    if (student.svp && data.svp[student.svp] && data.svp[student.svp][day]) {
      const svpDay = data.svp[student.svp][day];
      for (const period of Object.keys(svpDay)) {
        if (svpDay[period] && !mergedRoutine[day][period]) {
          mergedRoutine[day][period] = svpDay[period];
        }
      }
    }
  }

  const result = {student, coreRoutine, mergedRoutine};
  routineCache.set(rollNumber, result);
  return result;
};

export const searchClasses = (
  routine: Record<string, Record<string, ClassInfo | null>>,
  query: string,
): CellDetail[] => {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const results: CellDetail[] = [];

  for (const day of DAYS) {
    if (routine[day]) {
      for (const period of PERIODS) {
        const cls = routine[day][period];
        if (cls) {
          const match =
            cls.subject.toLowerCase().includes(lowerQuery) ||
            cls.faculty.toLowerCase().includes(lowerQuery) ||
            cls.room.toLowerCase().includes(lowerQuery);

          if (match) {
            results.push({
              subject: cls.subject,
              faculty: cls.faculty,
              room: cls.room,
              section: '',
              day,
              period,
            });
          }
        }
      }
    }
  }

  return results;
};

export const getCurrentDay = (): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

export const getCurrentPeriod = (): string | null => {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();

  const periodTimes = [
    {period: 'P1', start: 8 * 60, end: 9 * 60},
    {period: 'P2', start: 9 * 60, end: 10 * 60},
    {period: 'P3', start: 10 * 60, end: 11 * 60},
    {period: 'P4', start: 11 * 60, end: 12 * 60},
    {period: 'P5', start: 12 * 60, end: 13 * 60},
    {period: 'P6', start: 13 * 60, end: 14 * 60},
    {period: 'P7', start: 14 * 60, end: 15 * 60},
    {period: 'P8', start: 15 * 60, end: 16 * 60},
    {period: 'P9', start: 16 * 60, end: 17 * 60},
    {period: 'P10', start: 17 * 60, end: 18 * 60},
  ];

  for (const pt of periodTimes) {
    if (totalMinutes >= pt.start && totalMinutes < pt.end) {
      return pt.period;
    }
  }

  return null;
};
