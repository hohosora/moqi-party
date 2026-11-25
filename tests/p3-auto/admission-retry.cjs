'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{test}=require('node:test');
const src=fs.readFileSync('app.js','utf8').split('// P3_ADMISSION_HELPERS_START')[1].split('// P3_ADMISSION_HELPERS_END')[0];
const join=new Function(src+';return p3JoinRoom;')();
const snap=data=>({exists:()=>data!==null,data:()=>data});
function mock(latest,existing=false){
 let calls=0,reads=0,write;
 const denial=Object.assign(new Error('denied'),{code:'permission-denied'});
 const initial={phase:'lobby',count:1,seats:{'1':true}};
 const L={doc:(_db,...p)=>p.join('/'),
 runTransaction:async(_db,fn)=>{
  calls++;const g=calls===1?initial:latest;
  await fn({get:async ref=>ref.includes('/players/')?snap(null):snap(g),update:(_r,v)=>{write=v},set:()=>{}});
  if(calls===1)throw denial;
 },
 getDocFromServer:async ref=>{reads++;return ref.includes('/players/')?snap(existing?{}:null):ref.startsWith('roomInvites/')?snap(latest):snap({phase:'lobby'});}
 };
 return {L,denial,calls:()=>calls,reads:()=>reads,write:()=>write};
}
const player={uid:'test',name:'test',emoji:'x',joinedAt:1};
test('retry only when fresh occupancy advanced',async()=>{
 const m=mock({phase:'lobby',count:2,seats:{'1':true,'2':true}});
 await join(m.L,{},'ABCDEF',player);assert.equal(m.calls(),2);assert.equal(m.write().count,3);assert.equal(m.write().seats['3'],true);
});
test('unchanged occupancy preserves permission denial without retry',async()=>{
 const m=mock({phase:'lobby',count:1,seats:{'1':true}});
 await assert.rejects(join(m.L,{},'ABCDEF',player),e=>e===m.denial);assert.equal(m.calls(),1);
});
test('full room after contention does not retry',async()=>{
 const m=mock({phase:'lobby',count:20,seats:{}});
 await assert.rejects(join(m.L,{},'ABCDEF',player),/20 人/);assert.equal(m.calls(),1);
});
test('started room after contention does not retry',async()=>{
 const m=mock({phase:'voting',count:2,seats:{}});
 await assert.rejects(join(m.L,{},'ABCDEF',player),/已經開始/);assert.equal(m.calls(),1);
});
test('same uid already committed remains idempotent',async()=>{
 const m=mock({phase:'lobby',count:2,seats:{}},true);
 await join(m.L,{},'ABCDEF',player);assert.equal(m.calls(),1);
});
