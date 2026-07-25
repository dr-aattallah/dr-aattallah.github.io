(function(root){
  'use strict';
  const STATUSES=['Active','Pending','Dropped','Completed'];
  function parseRows(text){
    const rows=[];let row=[],cell='',quoted=false;
    const source=String(text||'').replace(/^\uFEFF/,'');
    for(let index=0;index<source.length;index+=1){
      const char=source[index],next=source[index+1];
      if(char==='"'&&quoted&&next==='"'){cell+='"';index+=1;continue}
      if(char==='"'){quoted=!quoted;continue}
      if(char===','&&!quoted){row.push(cell.trim());cell='';continue}
      if((char==='\n'||char==='\r')&&!quoted){
        if(char==='\r'&&next==='\n')index+=1;
        row.push(cell.trim());cell='';
        if(row.some(Boolean))rows.push(row);
        row=[];continue;
      }
      cell+=char;
    }
    row.push(cell.trim());
    if(row.some(Boolean))rows.push(row);
    return rows;
  }
  function normalizeHeader(value){
    return String(value||'').trim().toLowerCase()
      .replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
      .replace(/[\u064B-\u065F\u0670ـ:：]/g,'').replace(/\s+/g,' ');
  }
  function parseRosterCsv(text){
    const rows=parseRows(text);
    if(!rows.length)return {students:[],metadata:{}};
    const normalized=rows.map(row=>row.map(normalizeHeader));
    let headerIndex=-1,idIndex=-1,nameIndex=-1,statusIndex=-1;
    normalized.some((row,rowIndex)=>{
      const possibleId=row.findIndex(value=>['university_id','student_id','الرقم الجامعي','الرقم الجامعي للطالب'].includes(value));
      const possibleName=row.findIndex(value=>['name','student_name','الاسم','اسم الطالب'].includes(value));
      if(possibleId>=0&&possibleName>=0){
        headerIndex=rowIndex;idIndex=possibleId;nameIndex=possibleName;
        statusIndex=row.findIndex(value=>['status','الحاله'].includes(value));
        return true;
      }
      return false;
    });
    if(headerIndex<0)throw new Error('لم أجد صف عناوين يحتوي على الرقم الجامعي والاسم.');
    const metadata={};
    rows.slice(0,headerIndex).forEach(row=>{
      row.forEach((value,index)=>{
        const key=normalizeHeader(value),next=(row[index+1]||'').trim();
        if(key.includes('الفصل الدراسي')&&next)metadata.term=next;
        if(key.includes('المقرر')&&next)metadata.course=next;
        if(key.includes('الشعبه')&&next)metadata.section=next;
      });
    });
    const students=[];
    rows.slice(headerIndex+1).forEach((values,offset)=>{
      const university_id=String(values[idIndex]||'').trim();
      const name=String(values[nameIndex]||'').trim();
      if(!university_id&&!name)return;
      if(!/^[A-Za-z0-9-]{5,40}$/.test(university_id)){
        throw new Error(`رقم جامعي غير صحيح في الصف ${headerIndex+offset+2}.`);
      }
      if(name.length<2)throw new Error(`اسم الطالب مفقود في الصف ${headerIndex+offset+2}.`);
      const rawStatus=statusIndex>=0?String(values[statusIndex]||'Active').trim():'Active';
      const status=STATUSES.includes(rawStatus)?rawStatus:'Active';
      students.push({university_id,name,status});
    });
    const unique=new Map();
    students.forEach(student=>unique.set(student.university_id,student));
    return {students:Array.from(unique.values()),metadata};
  }
  function parseCsv(text){
    return parseRosterCsv(text).students;
  }
  const api={STATUSES,parseCsv,parseRosterCsv};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.RosterUtils=api;
})(typeof window!=='undefined'?window:globalThis);
