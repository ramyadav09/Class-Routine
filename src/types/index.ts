export interface Student {
  section: string;
  ipa: string;
  svp: string;
}

export interface ClassInfo {
  subject: string;
  faculty: string;
  room: string;
}

export interface DayRoutine {
  [period: string]: ClassInfo | null;
}

export interface SectionRoutine {
  [day: string]: DayRoutine;
}

export interface ElectiveRoutine {
  [day: string]: {
    [period: string]: ClassInfo | null;
  };
}

export interface RoutineData {
  students: Record<string, Student>;
  core: Record<string, SectionRoutine>;
  ipa: Record<string, ElectiveRoutine>;
  svp: Record<string, ElectiveRoutine>;
}

export interface CellDetail {
  subject: string;
  faculty: string;
  room: string;
  section: string;
  day: string;
  period: string;
}

export type ThemeMode = 'light' | 'dark';

export const DAYS: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const PERIODS: string[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];
export const UPTO_PERIODS: string[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];