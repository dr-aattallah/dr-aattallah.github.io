(function(root){
  'use strict';

  const STORAGE_KEY='educator.attendance.pending.v1';
  const MAX_AGE_MS=10*60*1000;

  function fingerprint(item){
    return [
      item.universityId,
      item.sessionId,
      item.tagNumber
    ].join(':');
  }

  function valid(item,now=Date.now()){
    return Boolean(
      item &&
      /^[A-Za-z0-9-]{5,40}$/.test(item.universityId||'') &&
      item.sessionId &&
      Number.isInteger(Number(item.tagNumber)) &&
      now-Number(item.queuedAt||0)<=MAX_AGE_MS &&
      Number(item.sessionEndsAt||0)>=now
    );
  }

  function read(storage,now=Date.now()){
    try{
      const parsed=JSON.parse(storage.getItem(STORAGE_KEY)||'[]');
      return Array.isArray(parsed)
        ? parsed.filter(item=>valid(item,now))
        : [];
    }catch{
      return [];
    }
  }

  function write(storage,items){
    if(items.length)storage.setItem(STORAGE_KEY,JSON.stringify(items));
    else storage.removeItem(STORAGE_KEY);
  }

  function enqueue(storage,item,now=Date.now()){
    const normalized={...item,queuedAt:now};
    if(!valid(normalized,now))return {queued:false,reason:'invalid'};
    const items=read(storage,now);
    const key=fingerprint(normalized);
    if(items.some(entry=>fingerprint(entry)===key)){
      return {queued:false,reason:'duplicate'};
    }
    items.push(normalized);
    write(storage,items);
    return {queued:true,count:items.length};
  }

  async function flush(storage,sender,now=Date.now()){
    const items=read(storage,now);
    const remaining=[];
    const results=[];
    for(const item of items){
      try{
        const result=await sender(item);
        results.push({item,result,success:true});
      }catch(error){
        if(error?.retryable!==false)remaining.push(item);
        results.push({item,error,success:false});
      }
    }
    write(storage,remaining);
    return {results,remaining:remaining.length};
  }

  const api={STORAGE_KEY,MAX_AGE_MS,fingerprint,valid,read,enqueue,flush};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.CheckinOfflineQueue=api;
})(typeof window!=='undefined'?window:globalThis);

