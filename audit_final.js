const d = require('./assets/data/routines.json');
const s = d.students;

// Check students by section
const bySection = {};
Object.entries(s).forEach(([roll, info]) => {
  if (!bySection[info.section]) bySection[info.section] = { count: 0, noIPA: 0, noSVP: 0, missingCore: 0, missingIPA: 0, missingSVP: 0 };
  bySection[info.section].count++;
  if (!info.ipa) bySection[info.section].noIPA++;
  if (!info.svp) bySection[info.section].noSVP++;
  if (!d.core[info.section]) bySection[info.section].missingCore++;
  if (info.ipa && !d.ipa[info.ipa]) bySection[info.section].missingIPA++;
  if (info.svp && !d.svp[info.svp]) bySection[info.section].missingSVP++;
});

console.log('=== SECTION SUMMARY ===');
Object.entries(bySection).sort().forEach(([sec, st]) => {
  const issues = [];
  if (st.missingCore) issues.push('noCore:' + st.missingCore);
  if (st.missingIPA) issues.push('noIPA:' + st.missingIPA);
  if (st.missingSVP) issues.push('noSVP:' + st.missingSVP);
  if (st.noIPA) issues.push('blankIPA:' + st.noIPA);
  if (st.noSVP) issues.push('blankSVP:' + st.noSVP);
  console.log(sec + ': ' + st.count + ' students' + (issues.length ? ' [' + issues.join(', ') + ']' : ''));
});

// Check DMDW existence
console.log('\n=== DMDW GROUPS IN TIMETABLE ===');
for (let i = 1; i <= 25; i++) {
  const g = 'DMDW' + i;
  const hasData = !!d.svp[g];
  const students = Object.values(s).filter(x => x.svp === g).length;
  if (students > 0 || hasData) console.log(g + ': timetable=' + (hasData ? 'YES' : 'NO') + ' students=' + students);
}

// Check total slots
let totalSlots = 0;
['core','ipa','svp'].forEach(cat => {
  Object.entries(d[cat]).forEach(([group, days]) => {
    Object.entries(days).forEach(([day, periods]) => {
      Object.entries(periods).forEach(([period, cls]) => {
        if (cls) totalSlots++;
      });
    });
  });
});
console.log('\nTotal class slots:', totalSlots);
console.log('Groups: core=' + Object.keys(d.core).length + ' ipa=' + Object.keys(d.ipa).length + ' svp=' + Object.keys(d.svp).length);
