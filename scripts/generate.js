const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseCoreTimetable(sheet) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
  const routines = {};
  let currentSection = '';
  let currentDay = '';

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    if (!row || row.length === 0) continue;

    const firstCol = (row[0] || '').toString().trim();

    const sectionHeader = firstCol.match(/Sem 5 \| (?:CS-S5|CSCE-S5|CSSE-S5|IT-S5) \| (CS\d+|CSCE\d+|CSSE\d+|IT\d+)/);
    if (sectionHeader) {
      currentSection = sectionHeader[1];
      routines[currentSection] = {};
      continue;
    }

    const sectionDayMatch = firstCol.match(/^(CS\d+|CSCE\d+|CSSE\d+|IT\d+)$/);
    if (sectionDayMatch && row[1]) {
      const dayStr = (row[1] || '').toString().trim();
      if (DAYS.includes(dayStr)) {
        currentDay = dayStr;
        if (!routines[currentSection]) routines[currentSection] = {};
        routines[currentSection][currentDay] = {};

        let periodIdx = 1;
        for (let col = 2; col < row.length; col++) {
          const cell = (row[col] || '').toString().trim();
          if (cell) {
            const periodKey = 'P' + periodIdx;
            periodIdx++;
            
            let faculty = '';
            let room = '';
            if (rowIndex + 1 < data.length && data[rowIndex + 1]) {
              faculty = (data[rowIndex + 1][col] || '').toString().trim();
            }
            if (rowIndex + 2 < data.length && data[rowIndex + 2]) {
              room = (data[rowIndex + 2][col] || '').toString().trim();
            }

            routines[currentSection][currentDay][periodKey] = {
              subject: cell,
              faculty: faculty,
              room: room,
            };
          }
        }
      }
    }
  }
  return routines;
}

function parseElectiveTimetable(sheet, prefix) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
  const routines = {};
  let currentGroup = '';
  let currentDay = '';

  const regex = new RegExp('^' + prefix + '\\d+$');
  const headerRegex = new RegExp('Sem 5 \\| ' + prefix + '-S5-PE\\d+ \\| (' + prefix + '\\d+)');

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    if (!row || row.length === 0) continue;

    const firstCol = (row[0] || '').toString().trim();

    const headerMatch = firstCol.match(headerRegex);
    if (headerMatch) {
      currentGroup = headerMatch[1];
      routines[currentGroup] = {};
      continue;
    }

    if (firstCol.match(regex) && row[1]) {
      const dayStr = (row[1] || '').toString().trim();
      if (DAYS.includes(dayStr)) {
        currentDay = dayStr;
        if (!routines[currentGroup]) routines[currentGroup] = {};
        routines[currentGroup][currentDay] = {};

        let periodIdx = 1;
        for (let col = 2; col < row.length; col++) {
          const cell = (row[col] || '').toString().trim();
          if (cell) {
            const periodKey = 'P' + periodIdx;
            periodIdx++;
            
            let faculty = '';
            let room = '';
            if (rowIndex + 1 < data.length && data[rowIndex + 1]) {
              faculty = (data[rowIndex + 1][col] || '').toString().trim();
            }
            if (rowIndex + 2 < data.length && data[rowIndex + 2]) {
              room = (data[rowIndex + 2][col] || '').toString().trim();
            }

            routines[currentGroup][currentDay][periodKey] = {
              subject: cell,
              faculty: faculty,
              room: room,
            };
          }
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

    console.log('Root dir:', rootDir);
    console.log('Section file exists:', fs.existsSync(sectionFile));
    console.log('Timetable file exists:', fs.existsSync(timetableFile));

    if (!fs.existsSync(sectionFile) || !fs.existsSync(timetableFile)) {
      console.error('Excel files not found!');
      process.exit(1);
    }

    const data = { students: {}, core: {}, ipa: {}, svp: {} };

    const sectionWorkbook = XLSX.readFile(sectionFile);
    
    if (sectionWorkbook.Sheets['Core']) {
      const coreData = XLSX.utils.sheet_to_json(sectionWorkbook.Sheets['Core'], { header: 1, raw: false });
      for (let i = 1; i < coreData.length; i++) {
        const row = coreData[i];
        if (row && row[0] && row[1]) {
          data.students[row[0].toString().trim()] = {
            section: row[1].toString().trim(),
            ipa: '',
            svp: '',
          };
        }
      }
    }

    if (sectionWorkbook.Sheets['IPA']) {
      const ipaData = XLSX.utils.sheet_to_json(sectionWorkbook.Sheets['IPA'], { header: 1, raw: false });
      for (let i = 1; i < ipaData.length; i++) {
        const row = ipaData[i];
        if (row && row[0] && row[1]) {
          const roll = row[0].toString().trim();
          if (!data.students[roll]) data.students[roll] = { section: '', ipa: '', svp: '' };
          data.students[roll].ipa = row[1].toString().trim();
        }
      }
    }

    if (sectionWorkbook.Sheets['SVP']) {
      const svpData = XLSX.utils.sheet_to_json(sectionWorkbook.Sheets['SVP'], { header: 1, raw: false });
      for (let i = 1; i < svpData.length; i++) {
        const row = svpData[i];
        if (row && row[0] && row[1]) {
          const roll = row[0].toString().trim();
          if (!data.students[roll]) data.students[roll] = { section: '', ipa: '', svp: '' };
          data.students[roll].svp = row[1].toString().trim();
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

    console.log('Students:', Object.keys(data.students).length);
    console.log('Core sections:', Object.keys(data.core).length);
    console.log('IPA groups:', Object.keys(data.ipa).length);
    console.log('SVP groups:', Object.keys(data.svp).length);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    if (!fs.existsSync(srcOutputDir)) fs.mkdirSync(srcOutputDir, { recursive: true });

    const jsonStr = JSON.stringify(data);
    fs.writeFileSync(path.join(outputDir, 'routines.json'), jsonStr, 'utf-8');
    fs.writeFileSync(path.join(srcOutputDir, 'routines.json'), jsonStr, 'utf-8');
    
    console.log('routines.json generated successfully!');
    console.log('Output size:', (jsonStr.length / 1024).toFixed(1), 'KB');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();