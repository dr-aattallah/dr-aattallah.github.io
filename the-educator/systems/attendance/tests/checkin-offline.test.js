const assert=require('node:assert/strict');
const test=require('node:test');
const queue=require('../js/checkin-offline.js');

function memoryStorage(){
  const data=new Map();
  return {
    getItem:key=>data.get(key)||null,
    setItem:(key,value)=>data.set(key,value),
    removeItem:key=>data.delete(key)
  };
}

const item={
  universityId:'9001001',
  sessionId:'SESSION-1',
  tagNumber:1,
  cardUid:'CARD-1',
  sessionEndsAt:Date.now()+600000
};

test('queues one safe retry and prevents duplicate submissions',()=>{
  const storage=memoryStorage();
  assert.equal(queue.enqueue(storage,item).queued,true);
  assert.equal(queue.enqueue(storage,item).reason,'duplicate');
  assert.equal(queue.read(storage).length,1);
});

test('drops expired or closed-session retries',()=>{
  const storage=memoryStorage();
  const now=Date.now();
  assert.equal(queue.enqueue(storage,{...item,sessionEndsAt:now-1},now).queued,false);
  queue.enqueue(storage,item,now);
  assert.equal(queue.read(storage,now+queue.MAX_AGE_MS+1).length,0);
});

test('keeps network failures and removes successful retries',async()=>{
  const storage=memoryStorage();
  queue.enqueue(storage,item);
  let attempts=0;
  const failed=await queue.flush(storage,async()=>{
    attempts+=1;
    throw new Error('offline');
  });
  assert.equal(failed.remaining,1);
  const passed=await queue.flush(storage,async()=>({success:true}));
  assert.equal(passed.remaining,0);
  assert.equal(attempts,1);
});

