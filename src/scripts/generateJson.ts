import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface Student {
  section: string;
  ipa: string;
  svp: string;
}

interface ClassInfo {
  subject: string;
  faculty: string;
  room: string;
}

interface DayRoutine {
  [period: string]: ClassInfo | null;
}

interface SectionRoutine {
  [day: string]: DayRoutine;
}

interface ElectiveRoutine {
  [day: string]: {
    [period: string]: ClassInfo | null;
  };
}

interface RoutineData {
  students: Record<string, Student>;
  core: Record<string, SectionRoutine>;
  ipa: Record<string, ElectiveRoutine>;
  svp: Record<string, ElectiveRoutine>;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const normalizeCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
};

const extractCellDetails = (rawCell: string): { subject: string; faculty: string; room: string } => {
  const normalized = rawCell.replace(/\r\n/g, '\n').trim();
  const parts = normalized
    .split(/\n+/)
    .map(part => part.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return { subject: parts[0], faculty: parts[1], room: parts[2] };
  }
  return {
    subject: parts[0] || '',
    faculty: '',
    room: parts[1] || '',
  };
};

function parseSectionAllocationGrid(sheet: XLSX.WorkSheet): Record<string, Record<string, string>> {
  const data = XLSX.utils.sheet_to_json(sheet, {header: 1, raw: false}) as string[][];
  const facultyMap: Record<string, Record<string, string>> = {};

  let currentSubjects: string[] = [];

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    if (!row || !row[0]) continue;

    const firstCol = normalizeCellValue(row[0]);

    const headerMatch = firstCol.match(/Sem 5 \| (.+?)(?:-S5)?(?:-PE[12])?$/);
    if (headerMatch) {
      const sectionType = headerMatch[1];
      currentSubjects = [];
      // Next row should have subject headers
      const nextRow = data[rowIndex + 1];
      if (nextRow) {
        for (let c = 1; c < nextRow.length; c++) {
          const subj = normalizeCellValue(nextRow[c]);
          if (subj) {
            const cleanSubj = subj.replace(/\n.*$/, '').trim();
            currentSubjects.push(cleanSubj);
          }
        }
      }
      continue;
    }

    if (currentSubjects.length > 0 && row[1]) {
      const section = firstCol;
      if (!facultyMap[section]) {
        facultyMap[section] = {};
      }
      for (let c = 0; c < currentSubjects.length; c++) {
        const faculty = normalizeCellValue(row[c + 1] || '');
        if (faculty) {
          facultyMap[section][currentSubjects[c]] = faculty;
        }
      }
    }

    if (firstCol.startsWith('Sem ') && !firstCol.includes(`Sem 5`)) {
      currentSubjects = [];
    }
  }

  return facultyMap;
}

function parseTimetableWithFaculty(
  sheet: XLSX.WorkSheet,
  facultyMap: Record<string, Record<string, string>>,
  groupPattern: RegExp,
  groupNameExtractor: (match: RegExpMatchArray) => string,
  sectionNameExtractor?: (firstCol: string) => string | null,
): Record<string, SectionRoutine> {
  const data = XLSX.utils.sheet_to_json(sheet, {header: 1, raw: false}) as string[][];
  const routines: Record<string, SectionRoutine> = {};

  let currentGroup = '';

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    if (!row || row.length === 0) continue;

    const firstCol = normalizeCellValue(row[0]);

    const groupMatch = firstCol.match(groupPattern);
    if (groupMatch) {
      currentGroup = groupNameExtractor(groupMatch);
      routines[currentGroup] = {};
      continue;
    }

    if (sectionNameExtractor) {
      const extractedName = sectionNameExtractor(firstCol);
      if (extractedName && extractedName === currentGroup && normalizeCellValue(row[1])) {
        const dayStr = normalizeCellValue(row[1]);
        if (DAYS.includes(dayStr)) {
          if (!routines[currentGroup][dayStr]) {
            routines[currentGroup][dayStr] = {};
          }

          for (let col = 2; col < Math.min(row.length, 12); col++) {
            const cell = normalizeCellValue(row[col]);
            if (!cell) continue;

            const { subject, faculty: inlineFaculty, room } = extractCellDetails(cell);
            const periodKey = `P${col - 1}`;

            const sectionFaculty = facultyMap[currentGroup] || {};
            const faculty = sectionFaculty[subject] || inlineFaculty;

            routines[currentGroup][dayStr][periodKey] = {
              subject,
              faculty,
              room,
            };
          }
        }
      }
    } else if (firstCol === currentGroup && normalizeCellValue(row[1])) {
      const dayStr = normalizeCellValue(row[1]);
      if (DAYS.includes(dayStr)) {
        if (!routines[currentGroup][dayStr]) {
          routines[currentGroup][dayStr] = {};
        }

        for (let col = 2; col < Math.min(row.length, 12); col++) {
          const cell = normalizeCellValue(row[col]);
          if (!cell) continue;

          const { subject, faculty: inlineFaculty, room } = extractCellDetails(cell);
          const periodKey = `P${col - 1}`;

          const sectionFaculty = facultyMap[currentGroup] || {};
          const faculty = sectionFaculty[subject] || inlineFaculty;

          routines[currentGroup][dayStr][periodKey] = {
            subject,
            faculty,
            room,
          };
        }
      }
    }
  }

  return routines;
}

async function main() {
  try {
    const rootDir = process.cwd();
    const sectionFile = path.join(rootDir, 'Section detail_5th.xlsx');
    const timetableFile = path.join(rootDir, '5th_Semester_timetable_core_elective_student (1).xlsx');
    const cdDmdwFile = path.join(rootDir, 'CD and DMDW new section.xlsx');
    const outputDir = path.join(rootDir, 'assets', 'data');
    const srcOutputDir = path.join(rootDir, 'src', 'assets', 'data');
    const androidOutputDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'data');

    if (!fs.existsSync(sectionFile)) {
      console.error('Section file not found:', sectionFile);
      process.exit(1);
    }
    if (!fs.existsSync(timetableFile)) {
      console.error('Timetable file not found:', timetableFile);
      process.exit(1);
    }

    const data: RoutineData = {
      students: {},
      core: {},
      ipa: {},
      svp: {},
    };

    console.log('Parsing student sections...');
    const sectionWorkbook = XLSX.readFile(sectionFile);
    const coreSheet = sectionWorkbook.Sheets['Core'];
    const electiveSheet = sectionWorkbook.Sheets['Elective'];

    if (coreSheet) {
      const coreData = XLSX.utils.sheet_to_json(coreSheet, {header: 1, raw: false}) as string[][];
      for (let i = 1; i < coreData.length; i++) {
        const row = coreData[i];
        if (row && normalizeCellValue(row[0]) && normalizeCellValue(row[1])) {
          const rollNo = normalizeCellValue(row[0]);
          const section = normalizeCellValue(row[1]);
          if (!data.students[rollNo]) {
            data.students[rollNo] = {section: '', ipa: '', svp: ''};
          }
          data.students[rollNo].section = section;
        }
      }
    }

    if (electiveSheet) {
      const electiveData = XLSX.utils.sheet_to_json(electiveSheet, {header: 1, raw: false}) as string[][];
      for (let i = 1; i < electiveData.length; i++) {
        const row = electiveData[i];
        if (row && normalizeCellValue(row[0])) {
          const rollNo = normalizeCellValue(row[0]);
          const ipa = normalizeCellValue(row[1]);
          const svp = normalizeCellValue(row[2]);
          if (!data.students[rollNo]) {
            data.students[rollNo] = {section: '', ipa: '', svp: ''};
          }
          data.students[rollNo].ipa = ipa;
          data.students[rollNo].svp = svp;
        }
      }
    }

    // Apply updated CD/DMDW section assignments from the new list.
    // The new timetable has dedicated DMDW1-DMDW25 sections (separate from CD1-CD8),
    // so DMDW is no longer mapped to CD. This override fixes the SVP (PE2) elective
    // for students whose CD/DMDW section was reassigned.
    let cdDmdwUpdated = 0;
    if (fs.existsSync(cdDmdwFile)) {
      const cdDmdwWorkbook = XLSX.readFile(cdDmdwFile);
      const newListSheet = cdDmdwWorkbook.Sheets['new list'];
      if (newListSheet) {
        const newListData = XLSX.utils.sheet_to_json(newListSheet, { header: 1, raw: false }) as string[][];
        for (let i = 1; i < newListData.length; i++) {
          const row = newListData[i];
          if (!row || !normalizeCellValue(row[0]) || !normalizeCellValue(row[1])) continue;
          const rollNo = normalizeCellValue(row[0]);
          const newSection = normalizeCellValue(row[1]);
          if (!data.students[rollNo]) {
            data.students[rollNo] = { section: '', ipa: '', svp: '' };
          }
          data.students[rollNo].svp = newSection;
          cdDmdwUpdated++;
        }
      }
    }
    if (cdDmdwUpdated > 0) console.log(`  Applied updated CD/DMDW section to ${cdDmdwUpdated} students`);

    console.log('Parsing timetables...');
    const timetableWorkbook = XLSX.readFile(timetableFile);
    const timetableSheetName = timetableWorkbook.SheetNames.find(
      s => s.toLowerCase().includes('section grid') || s.toLowerCase().includes('time-table') || s.toLowerCase().includes('timetable')
    ) || timetableWorkbook.SheetNames[0];
    const timetableSheet = timetableWorkbook.Sheets[timetableSheetName];

    let facultyMap: Record<string, Record<string, string>> = {};

    if (timetableSheet) {
      // Parse core sections (CS, CSCE, CSSE, IT)
      data.core = parseTimetableWithFaculty(
        timetableSheet,
        facultyMap,
        /Sem 5 \| (?:CS-S5|CSCE-S5|CSSE-S5|IT-S5) \| (CS\d+|CSCE\d+|CSSE\d+|IT\d+)/,
        match => match[1],
        firstCol => {
          const m = firstCol.match(/^(CS\d+|CSCE\d+|CSSE\d+|IT\d+)$/);
          return m ? m[1] : null;
        },
      );

      // Parse PE1 (IPA) groups
      data.ipa = parseTimetableWithFaculty(
        timetableSheet,
        facultyMap,
        /Sem 5 \| [A-Za-z0-9]+-S5-PE1 \| ([A-Za-z0-9]+)/,
        match => match[1],
      );

      // Parse PE2 (SVP) groups
      data.svp = parseTimetableWithFaculty(
        timetableSheet,
        facultyMap,
        /Sem 5 \| [A-Za-z0-9]+-S5-PE2 \| ([A-Za-z0-9]+)/,
        match => match[1],
      );
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true});
    }
    if (!fs.existsSync(srcOutputDir)) {
      fs.mkdirSync(srcOutputDir, {recursive: true});
    }
    if (!fs.existsSync(androidOutputDir)) {
      fs.mkdirSync(androidOutputDir, {recursive: true});
    }

    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(path.join(outputDir, 'routines.json'), jsonContent, 'utf-8');
    fs.writeFileSync(path.join(srcOutputDir, 'routines.json'), jsonContent, 'utf-8');
    fs.writeFileSync(path.join(androidOutputDir, 'routines.json'), jsonContent, 'utf-8');

    console.log('\nGenerated routines.json');
    console.log(`Total students: ${Object.keys(data.students).length}`);
    console.log(`Core sections: ${Object.keys(data.core).length}`);
    console.log(`IPA groups: ${Object.keys(data.ipa).length}`);
    console.log(`SVP groups: ${Object.keys(data.svp).length}`);
    console.log('\nOutput files:');
    console.log(`  ${path.join(outputDir, 'routines.json')}`);
    console.log(`  ${path.join(srcOutputDir, 'routines.json')}`);
    console.log(`  ${path.join(androidOutputDir, 'routines.json')}`);
  } catch (error) {
    console.error('Error generating JSON:', error);
    process.exit(1);
  }
}

main();
