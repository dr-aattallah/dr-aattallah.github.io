(function(root){
  'use strict';

  function normalizeTime(value){
    const match=String(value||'').match(/^(\d{2}:\d{2})/);
    return match?match[1]:'';
  }

  function groupMeetings(meetings){
    const groups=new Map();
    (Array.isArray(meetings)?meetings:[]).forEach(meeting=>{
      const normalized={
        day:Number(meeting.day_of_week),
        start:normalizeTime(meeting.start_time),
        end:normalizeTime(meeting.end_time),
        room:String(meeting.room||''),
        mode:String(meeting.delivery_mode||'InPerson'),
        tag:Number(meeting.tag_number||1)
      };
      const key=[
        normalized.start,normalized.end,normalized.room,
        normalized.mode,normalized.tag
      ].join('|');
      if(!groups.has(key)){
        groups.set(key,{...normalized,days:[]});
      }
      if(Number.isInteger(normalized.day)&&normalized.day>=0&&normalized.day<=6){
        groups.get(key).days.push(normalized.day);
      }
    });
    return Array.from(groups.values()).map(group=>({
      days:Array.from(new Set(group.days)).sort((a,b)=>a-b),
      start:group.start,
      end:group.end,
      room:group.room,
      mode:group.mode,
      tag:group.tag
    }));
  }

  const api={normalizeTime,groupMeetings};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.CoursePlanEditorUtils=api;
})(typeof window!=='undefined'?window:globalThis);
