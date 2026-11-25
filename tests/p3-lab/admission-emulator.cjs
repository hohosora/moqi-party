'use strict';
// No production writes: only the CLI-started loopback Firestore emulator.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {initializeTestEnvironment,assertSucceeds,assertFails} = require('@firebase/rules-unit-testing');
const {doc,collection,getDoc,getDocs,setDoc,updateDoc,writeBatch,runTransaction,serverTimestamp} = require('firebase/firestore');
const PROJECT='demo-moqi-party-p1';
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8081') {
  throw new Error('P3 lab requires the local emulator at 127.0.0.1:8081');
}
const refs=(db,code,uid)=>({
  gate:doc(db,'p3LabInvites',code),
  room:doc(db,'p3LabRooms',code),
  self:doc(db,'p3LabRooms',code,'members',uid),
  members:collection(db,'p3LabRooms',code,'members')
});
const initial={phase:'lobby',count:1,seats:{'1':true}};
async function hostCreate(db,code,uid){
  const r=refs(db,code,uid), batch=writeBatch(db);
  batch.set(r.gate,initial);
  batch.set(r.room,{hostUid:uid,protocol:3});
  batch.set(r.self,{seat:'1',joinedAt:serverTimestamp()});
  return batch.commit();
}
async function join(db,code,uid){
  const r=refs(db,code,uid);
  return runTransaction(db,async tx=>{
    // Read own membership first; an existing player can rejoin any phase.
    const self=await tx.get(r.self);
    if(self.exists())return 'existing';
    const gate=await tx.get(r.gate);
    if(!gate.exists())throw new Error('room-not-found');
    const g=gate.data();
    if(g.phase!=='lobby')throw new Error('room-started');
    if(g.count>=20)throw new Error('room-full');
    const seat=Array.from({length:20},(_,i)=>String(i+1)).find(s=>!g.seats[s]);
    if(!seat)throw new Error('inconsistent-capacity');
    tx.update(r.gate,{count:g.count+1,seats:{...g.seats,[seat]:true}});
    tx.set(r.self,{seat,joinedAt:serverTimestamp()});
    return 'joined';
  },{maxAttempts:10});
}
async function main(){
  const env=await initializeTestEnvironment({
    projectId:PROJECT,firestore:{host:'127.0.0.1',port:8081,
      rules:fs.readFileSync(path.join(__dirname,'admission.rules'),'utf8')}
  });
  let assertions=0;
  const yes=async(p,label)=>{const v=await assertSucceeds(p);assertions++;console.log('ALLOW '+label);return v;};
  const no=async(p,label)=>{await assertFails(p);assertions++;console.log('DENY  '+label);};
  const eq=(v,w,label)=>{assert.equal(v,w,label);assertions++;console.log('CHECK '+label);};
  const db=uid=>env.authenticatedContext(uid).firestore();
  try {
    const h=db('host'), outsider=db('outsider'), unauth=env.unauthenticatedContext().firestore();
    const code='ABCDEF', hr=refs(h,code,'host'), or=refs(outsider,code,'outsider');
    await no(setDoc(hr.gate,initial),'gate cannot be created alone');
    await no(setDoc(hr.room,{hostUid:'host',protocol:3}),'room cannot be created alone');
    await no(getDoc(refs(unauth,code,'none').gate),'unauthenticated invite lookup');
    await yes(hostCreate(h,code,'host'),'host atomically creates room and own seat');
    eq((await yes(getDoc(hr.gate),'host sees occupancy')).data().count,1,'host uses one seat');
    await yes(getDoc(or.gate),'signed-in exact invite lookup');
    await no(getDocs(collection(outsider,'p3LabInvites')),'invite collection enumeration');
    await no(getDoc(or.room),'nonmember private room read');
    await no(getDocs(or.members),'nonmember roster read');
    eq((await yes(getDoc(or.self),'own missing membership lookup')).exists(),false,'own membership absent');
    await no(setDoc(or.self,{seat:'2',joinedAt:serverTimestamp()}),'member cannot be created without occupancy update');
    await no(updateDoc(or.gate,{count:2,seats:{'1':true,'2':true}}),'occupancy cannot be incremented alone');
    const malicious=writeBatch(outsider);
    malicious.update(or.gate,{count:3,seats:{'1':true,'2':true,'3':true}});
    malicious.set(or.self,{seat:'2',joinedAt:serverTimestamp()});
    await no(malicious.commit(),'one membership cannot consume two seats');
    const forged=writeBatch(outsider);
    forged.update(or.gate,{count:2,seats:{'1':true,'2':true}});
    forged.set(refs(outsider,code,'other-uid').self,{seat:'2',joinedAt:serverTimestamp()});
    await no(forged.commit(),'cannot create another UID membership');
    const joined=db('player2');
    eq(await yes(join(joined,code,'player2'),'second player transaction'),'joined','2nd player joins');
    const jr=refs(joined,code,'player2');
    await yes(getDoc(jr.room),'member private room read');
    await yes(getDocs(jr.members),'member roster read');
    await no(updateDoc(jr.gate,{phase:'voting'}),'nonhost cannot start');
    await no(updateDoc(jr.self,{seat:'3'}),'member seat immutable');
    await no(setDoc(refs(joined,code,'someone').self,{seat:'3',joinedAt:serverTimestamp()}),'cannot forge another member');
    eq(await yes(join(joined,code,'player2'),'repeat join'),'existing','same UID rejoin does not reserve a seat');
    eq((await getDoc(hr.gate)).data().count,2,'two seats occupied');
    // Sequential scale points check actual emulator records, not browser latency.
    for(let i=3;i<=19;i++){
      const uid='player'+i;
      eq(await join(db(uid),code,uid),'joined','join '+i);
      if([5,10,15].includes(i)){
        eq((await getDoc(hr.gate)).data().count,i,'occupancy scale '+i);
        eq((await getDocs(hr.members)).size,i,'roster scale '+i);
      }
    }
    // Both clients contend for the last seat. Only one may commit.
    const rivals=['last-a','last-b'];
    const outcomes=await Promise.allSettled(rivals.map(uid=>join(db(uid),code,uid)));
    eq(outcomes.filter(x=>x.status==='fulfilled'&&x.value==='joined').length,1,'one of two concurrent contenders joins');
    eq(outcomes.filter(x=>x.status==='rejected').length,1,'one contender rejected');
    const last=(await getDoc(hr.gate)).data();
    eq(last.count,20,'gate stops at 20 including host');
    eq(Object.keys(last.seats).length,20,'20 unique occupied seats');
    const roster=await getDocs(hr.members);
    eq(roster.size,20,'exactly 20 member documents');
    eq(new Set(roster.docs.map(x=>x.data().seat)).size,20,'no duplicated seat');
    await assert.rejects(join(db('overflow'),code,'overflow'),/room-full/);assertions++;
    const extra=db('overflow'), er=refs(extra,code,'overflow'), extraBatch=writeBatch(extra);
    extraBatch.update(er.gate,{count:21,seats:{...last.seats,'21':true}});
    extraBatch.set(er.self,{seat:'21',joinedAt:serverTimestamp()});
    await no(extraBatch.commit(),'direct 21st seat write denied by rules');
    await yes(updateDoc(hr.gate,{phase:'voting'}),'host starts only after players exist');
    eq(await yes(join(joined,code,'player2'),'rejoin started room'),'existing','rejoin during voting');
    // Race start against a new join in a not-full room; both serial outcomes valid.
    const code2='BCDEFG', hr2=refs(h,code2,'host');
    await yes(hostCreate(h,code2,'host'),'second room setup');
    await no(updateDoc(hr2.gate,{phase:'voting'}),'single-player room cannot start');
    await yes(join(joined,code2,'player2'),'second room second member');
    const racing=await Promise.allSettled([updateDoc(hr2.gate,{phase:'voting'}),join(db('racer'),code2,'racer')]);
    eq(racing[0].status,'fulfilled','host start succeeds');
    const final=(await getDoc(hr2.gate)).data();
    eq(final.phase,'voting','start and join race final phase');
    eq(final.count,racing[1].status==='fulfilled'?3:2,'race serial occupancy outcome');
    eq((await getDocs(hr2.members)).size,final.count,'race no orphan member');
    await assert.rejects(join(db('late'),code2,'late'),/room-started/);assertions++;
    const late=db('late'), lr=refs(late,code2,'late'), lateBatch=writeBatch(late);
    lateBatch.update(lr.gate,{count:final.count+1,seats:{...final.seats,[String(final.count+1)]:true}});
    lateBatch.set(lr.self,{seat:String(final.count+1),joinedAt:serverTimestamp()});
    await no(lateBatch.commit(),'direct late join rejected');
    console.log('PASS: '+assertions+' isolated admission assertions');
  } finally { await env.cleanup(); }
}
main().catch(err=>{console.error(err);process.exitCode=1;});
