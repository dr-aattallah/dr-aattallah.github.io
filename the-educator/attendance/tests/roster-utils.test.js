const assert=require('node:assert/strict');
const test=require('node:test');
const {parseCsv}=require('../js/roster-utils.js');
test('parses roster CSV with section and status',()=>{
  assert.deepEqual(parseCsv('university_id,section,status\n9001001,C1,Active'),[
    {university_id:'9001001',section:'C1',status:'Active'}
  ]);
});
test('requires university id column',()=>{
  assert.throws(()=>parseCsv('name,section\nStudent,C1'),/university_id/);
});
test('rejects invalid enrollment status',()=>{
  assert.throws(()=>parseCsv('university_id,status\n9001001,Unknown'),/حالة/);
});
