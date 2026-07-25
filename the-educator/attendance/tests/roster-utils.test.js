const assert=require('node:assert/strict');
const test=require('node:test');
const {parseCsv,parseRosterCsv}=require('../js/roster-utils.js');

test('parses the Arabic university roster after course metadata',()=>{
  const csv=[
    'الفصل الدراسي:,202602,,',
    'المقرر:,اساسيات البرمجة,,',
    'الرقم المرجعى للشعبة:,50221 الشعبة: S1,,',
    ',,,,',
    'الرقم الجامعى,الاسم,الاسبوع 1,الاسبوع 2',
    '2436317,سعود ثائر سيف القحمي,online,online',
    '2437674,"يامن طارق فهيد السلمي",online,online'
  ].join('\n');
  const parsed=parseRosterCsv(csv);
  assert.deepEqual(parsed.students,[
    {university_id:'2436317',name:'سعود ثائر سيف القحمي',status:'Active'},
    {university_id:'2437674',name:'يامن طارق فهيد السلمي',status:'Active'}
  ]);
  assert.equal(parsed.metadata.term,'202602');
  assert.equal(parsed.metadata.course,'اساسيات البرمجة');
});

test('parses English headers and quoted comma in a name',()=>{
  assert.deepEqual(parseCsv('university_id,name,status\n9001001,\"Student, One\",Active'),[
    {university_id:'9001001',name:'Student, One',status:'Active'}
  ]);
});

test('requires both university id and name columns',()=>{
  assert.throws(()=>parseCsv('name,section\nStudent,C1'),/الرقم الجامعي والاسم/);
});

test('rejects invalid university id',()=>{
  assert.throws(()=>parseCsv('university_id,name\n12,Student'),/رقم جامعي/);
});

test('deduplicates repeated students by university id',()=>{
  assert.equal(parseCsv('university_id,name\n9001001,Student One\n9001001,Student Updated').length,1);
  assert.equal(parseCsv('university_id,name\n9001001,Student One\n9001001,Student Updated')[0].name,'Student Updated');
});
