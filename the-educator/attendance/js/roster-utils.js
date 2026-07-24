(function(root){
  'use strict';
  const STATUSES=['Active','Pending','Dropped','Completed'];
  function parseCsv(text){
    const lines=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/)
      .map(line=>line.trim()).filter(Boolean);
    if(!lines.length)return [];
    const header=lines[0].split(',').map(value=>value.trim().toLowerCase());
    const idIndex=header.findIndex(value=>['university_id','student_id','الرقم الجامعي'].includes(value));
    if(idIndex<0)throw new Error('يجب أن يحتوي الملف على عمود university_id.');
    const sectionIndex=header.findIndex(value=>['section','الشعبة'].includes(value));
    const statusIndex=header.findIndex(value=>['status','الحالة'].includes(value));
    return lines.slice(1).map((line,index)=>{
      const values=line.split(',').map(value=>value.trim());
      const university_id=values[idIndex]||'';
      if(!/^[A-Za-z0-9-]{5,40}$/.test(university_id)){
        throw new Error(`رقم جامعي غير صحيح في الصف ${index+2}.`);
      }
      const status=statusIndex>=0?(values[statusIndex]||'Active'):'Active';
      if(!STATUSES.includes(status))throw new Error(`حالة غير صحيحة في الصف ${index+2}.`);
      return {
        university_id,
        section:sectionIndex>=0?(values[sectionIndex]||null):null,
        status
      };
    });
  }
  const api={STATUSES,parseCsv};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.RosterUtils=api;
})(typeof window!=='undefined'?window:globalThis);
