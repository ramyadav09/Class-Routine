const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

interface StudentRecord {
  section: string;
  ipa: string;
  svp: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const normalizeCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
};

const parseClassCell = (rawCell: string) => {
  const normalized = rawCell.replace(/\r\n/g, '\n').trim();
  const parts = normalized
    .split(/\n+/)
    .map((part: string) => part.trim())
    .filter(Boolean);

  return {
    subject: parts[0] || '',
    faculty: parts[1] || '',
    room: parts[2] || '',
  };
};

function parseCoreTimetable(sheet: typeof XLSX.WorkSheet) {
  const data = XLSX.utils.sheet_to_json(sheet, {header: 1, raw: false});
  const routines: Record<string, Record<string, Record<string, {subject: string; faculty: string; room: string}>>> = {};
  let currentSection = '';

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    if (!row || row.length === 0) continue;

    const firstCol = normalizeCellValue(row[0]);
    const sectionHeader = firstCol.match(/Sem 5 \| (?:CS-S5|CSCE-S5|CSSE-S5|IT-S5) \| (CS\d+|CSCE\d+|CSSE\d+|IT\d+)/);
    if (sectionHeader) {
      currentSection = sectionHeader[1];
      routines[currentSection] = {};
      continue;
    }

    const sectionDayMatch = firstCol.match(/^(CS\d+|CSCE\d+|CSSE\d+|IT\d+)$/);
    if (sectionDayMatch && normalizeCellValue(row[1])) {
      const dayStr = normalizeCellValue(row[1]);
      if (DAYS.includes(dayStr)) {
        if (!routines[currentSection]) routines[currentSection] = {};
        routines[currentSection][dayStr] = {};

        let periodIdx = 1;
        for (let col = 2; col < row.length; col++) {
          const cell = normalizeCellValue(row[col]);
          if (!cell) continue;
          const parsedClass = parseClassCell(cell);
          const periodKey = `P${periodIdx}`;
          periodIdx++;
          routines[currentSection][dayStr][periodKey] = {
            subject: parsedClass.subject,
            faculty: parsedClass.faculty,
            room: parsedClass.room,
          };
        }
      }
    }
  }
  return routines;
}

function parseElectiveTimetable(sheet: typeof XLSX.WorkSheet, prefix: string) {
  const data = XLSX.utils.sheet_to_json(sheet, {header: 1, raw: false});
  const routines: Record<string, Record<string, Record<string, {subject: string; faculty: string; room: string}>>> = {};
  let currentGroup = '';

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    if (!row || row.length === 0) continue;

    const firstCol = normalizeCellValue(row[0]);
    const headerMatch = firstCol.match(new RegExp(`Sem 5 \\| ${prefix}-S5-PE\\d+ \\| (${prefix}\\d+)`));
    if (headerMatch) {
      currentGroup = headerMatch[1];
      routines[currentGroup] = {};
      continue;
    }

    const dayMatch = firstCol.match(new RegExp(`^(${prefix}\\d+)$`));
    if (dayMatch && normalizeCellValue(row[1])) {
      const dayStr = normalizeCellValue(row[1]);
      if (DAYS.includes(dayStr)) {
        if (!routines[currentGroup]) routines[currentGroup] = {};
        routines[currentGroup][dayStr] = {};

        let periodIdx = 1;
        for (let col = 2; col < row.length; col++) {
          const cell = normalizeCellValue(row[col]);
          if (!cell) continue;
          const parsedClass = parseClassCell(cell);
          const periodKey = `P${periodIdx}`;
          periodIdx++;
          routines[currentGroup][dayStr][periodKey] = {
            subject: parsedClass.subject,
            faculty: parsedClass.faculty,
            room: parsedClass.room,
          };
        }
      }
    }
  }
  return routines;
}

function main() {
  try {
    const rootDir = process.cwd();
    const sectionFile = path.join(rootDir, 'Section detail_5th.xlsx');
    const timetableFile = path.join(rootDir, '5th_Semester_timetable_core_elective_student.xlsx');
    const outputDir = path.join(rootDir, 'assets', 'data');
    const srcOutputDir = path.join(rootDir, 'src', 'assets', 'data');
    const androidOutputDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'data');

    const outputFiles = [
      path.join(outputDir, 'routines.json'),
      path.join(srcOutputDir, 'routines.json'),
      path.join(androidOutputDir, 'routines.json'),
    ];

    if (outputFiles.every(filePath => fs.existsSync(filePath))) {
      console.log('routines.json already exists. Skipping regeneration.');
      process.exit(0);
    }

    const data: {students: Record<string, StudentRecord>; core: Record<string, Record<string, Record<string, {subject: string; faculty: string; room: string}>>>; ipa: Record<string, Record<string, Record<string, {subject: string; faculty: string; room: string}>>>; svp: Record<string, Record<string, Record<string, {subject: string; faculty: string; room: string}>>>} = {students: {}, core: {}, ipa: {}, svp: {}};

    const sectionWorkbook = XLSX.readFile(sectionFile);

    if (sectionWorkbook.Sheets['Core']) {
      const coreData = XLSX.utils.sheet_to_json(sectionWorkbook.Sheets['Core'], {header: 1, raw: false});
      for (let i = 1; i < coreData.length; i++) {
        const row = coreData[i];
        if (row && normalizeCellValue(row[0]) && normalizeCellValue(row[1])) {
          data.students[normalizeCellValue(row[0])] = {
            section: normalizeCellValue(row[1]),
            ipa: '',
            svp: '',
          };
        }
      }
    }

    if (sectionWorkbook.Sheets['Elective']) {
      const electiveData = XLSX.utils.sheet_to_json(sectionWorkbook.Sheets['Elective'], {header: 1, raw: false});
      for (let i = 1; i < electiveData.length; i++) {
        const row = electiveData[i];
        if (row && normalizeCellValue(row[0])) {
          const roll = normalizeCellValue(row[0]);
          if (!data.students[roll]) data.students[roll] = {section: '', ipa: '', svp: ''};
          data.students[roll].ipa = normalizeCellValue(row[1]);
          data.students[roll].svp = normalizeCellValue(row[2]);
        }
      }
    }

    const timetableWorkbook = XLSX.readFile(timetableFile);
    const sectionGridSheet = timetableWorkbook.Sheets['Section Grid'];
    if (sectionGridSheet) {
      data.core = parseCoreTimetable(sectionGridSheet);
      data.ipa = parseElectiveTimetable(sectionGridSheet, 'IPA');
      data.svp = parseElectiveTimetable(sectionGridSheet, 'SVP');
    }

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, {recursive: true});
    if (!fs.existsSync(srcOutputDir)) fs.mkdirSync(srcOutputDir, {recursive: true});
    if (!fs.existsSync(androidOutputDir)) fs.mkdirSync(androidOutputDir, {recursive: true});

    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(path.join(outputDir, 'routines.json'), jsonStr, 'utf-8');
    fs.writeFileSync(path.join(srcOutputDir, 'routines.json'), jsonStr, 'utf-8');
    fs.writeFileSync(path.join(androidOutputDir, 'routines.json'), jsonStr, 'utf-8');

    console.log('routines.json generated successfully!');
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();