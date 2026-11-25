'use strict';
// These tests run only against the local Firebase Emulator. They NEVER reach production.
// Run after npm install: npm run test:rules
const fs = require('node:fs');
const {initializeTestEnvironment, assertSucceeds, assertFails} = require('@firebase/rules-unit-testing');
const L=require('firebase/firestore');
const {doc,collection,setDoc,updateDoc,getDoc,getDocs,query,where,deleteDoc}=L;
const assert=require('node:assert/strict');
const source=fs.readFileSync('app.js','utf8');
const helpers=source.split('// P3_ADMISSION_HELPERS_START')[1].split('// P3_ADMISSION_HELPERS_END')[0];
const {p3Refs,p3CreateRoom,p3JoinRoom,p3StartRoom,P3_ADMISSION_READS_ENABLED,P3_ADMISSION_CREATE_ENABLED}=new Function(helpers+';return {p3Refs,p3CreateRoom,p3JoinRoom,p3StartRoom,P3_ADMISSION_READS_ENABLED,P3_ADMISSION_CREATE_ENABLED};')();
assert.equal(P3_ADMISSION_READS_ENABLED,false);
assert.equal(P3_ADMISSION_CREATE_ENABLED,false);

async function main(){
  const env=await initializeTestEnvironment({
    projectId:'demo-moqi-party-p1',
    firestore:{host:'127.0.0.1',port:8081,rules:fs.readFileSync('firestore.rules','utf8')}
  });
  let checks=0;
  const allow=async(p,label)=>{await assertSucceeds(p);checks++;console.log('ALLOW '+label)};
  const deny=async(p,label)=>{await assertFails(p);checks++;console.log('DENY  '+label)};
  try{
    const host=env.authenticatedContext('hostA').firestore();
    const guest=env.authenticatedContext('guestB').firestore();
    const nobody=env.unauthenticatedContext().firestore();
    const path='rooms/ABCDEF';
    const ref=doc(host,path);
    const questions=Array.from({length:6},(_,i)=>({
      q:'如果今天能送自己一份小禮物 '+(i+1)+'？',
      a:['一杯茶','一片蛋糕','散步一下','一本小說'],
      talk:'邀請一位朋友自願分享理由。'
    }));
    const room=()=>({
      hostUid:'hostA',phase:'lobby',roundIndex:-1,totalRounds:6,seconds:30,
      questions,scores:{},streaks:{},usedDoubles:{},lastResult:null,deadline:null,
      createdAt:Date.now(),heroImage:'',theme:'party',minimalHue:20,quickMode:true,quickScene:'general'
    });
    await deny(getDoc(doc(nobody,path)),'Anonymous cannot read room');
    await deny(setDoc(doc(nobody,'rooms/BCDEFG'),room()),'Anonymous cannot create room');
    await allow(setDoc(ref,room()),'Host creates valid quick-mode room');
    await allow(getDoc(doc(guest,path)),'Signed-in guest may look up invited room');
    await deny(getDocs(collection(host,'rooms')),'Room codes cannot be enumerated');
    // Explicitly cover every supported custom-host round count, not only quick start.
    for(const num of [8,10,12]){
      const roomCode={8:'BCDEFG',10:'CDEFGH',12:'DEFGHJ'}[num];
      const completeQuestions=Array.from({length:num},(_,i)=>({...questions[0],q:'新題 '+num+'-'+i}));
      await allow(setDoc(doc(host,'rooms/'+roomCode),{...room(),totalRounds:num,questions:completeQuestions}),'Valid '+num+'-question custom room');
    }
    await deny(setDoc(doc(host,'rooms/GHJKLN'),{...room(),unused:'injected'}),'Unknown room fields blocked');
    await deny(setDoc(doc(host,'rooms/HJKLMN'),{...room(),theme:'unknown'}),'Unknown style blocked');
    await deny(setDoc(doc(host,'rooms/JKLMNP'),{...room(),quickScene:'missing-scene'}),'Unknown quick scene blocked');
    await deny(setDoc(doc(host,'rooms/KMNPQR'),{...room(),questions:questions.slice(0,5)}),'Incorrect question count blocked');
    await deny(setDoc(doc(host,'rooms/MNPQRS'),{...room(),questions:questions.map((q,i)=>i? q:{...q,q:'A'.repeat(121)})}),'Oversized question blocked');
    await deny(setDoc(doc(host,'rooms/NPQRST'),{...room(),hostUid:'guestB'}),'Cannot claim another host ID');
    await allow(updateDoc(ref,{theme:'panel',minimalHue:50}),'Host may change theme and hue');
    await deny(updateDoc(doc(guest,path),{theme:'minimal'}),'Guest cannot change host theme');
    await deny(updateDoc(ref,{createdAt:1}),'Host cannot rewrite creation time');
    await deny(updateDoc(ref,{questions:[...questions].reverse()}),'Host cannot rewrite locked questions');
    await deny(updateDoc(ref,{scores:{hostA:999}}),'Host cannot arbitrarily edit scores in lobby');
    await deny(updateDoc(ref,{phase:'finished'}),'Cannot skip directly to finished');
    const self={uid:'hostA',name:'主辦人',emoji:'😎',joinedAt:Date.now()};
    await allow(setDoc(doc(host,path+'/players/hostA'),self),'Host adds own player document');
    await allow(setDoc(doc(guest,path+'/players/guestB'),{uid:'guestB',name:'小芳',emoji:'🐼',joinedAt:Date.now()}),'Guest joins lobby');
    await deny(setDoc(doc(guest,path+'/players/guestC'),{uid:'guestC',name:'冒名',emoji:'😎',joinedAt:Date.now()}),'Guest cannot forge identity');
    await deny(setDoc(doc(env.authenticatedContext('hostC').firestore(),path+'/players/hostC'),{uid:'hostC',name:'X'.repeat(30),emoji:'😎',joinedAt:Date.now()}),'Overlong nickname blocked');
    await deny(setDoc(doc(env.authenticatedContext('hostD').firestore(),path+'/players/hostD'),{uid:'hostD',name:'不合法',emoji:'😎',joinedAt:Date.now(),admin:true}),'Player document extra fields blocked');
    await allow(updateDoc(ref,{phase:'voting',roundIndex:0,deadline:Date.now()+30000,scores:{hostA:0,guestB:0},streaks:{},usedDoubles:{},lastResult:null}),'Host starts normal first round');
    await deny(updateDoc(ref,{roundIndex:3}),'Host cannot skip a live round');
    const vote={uid:'hostA',roundIndex:0,choice:1,guess:0,double:false,at:Date.now()};
    await allow(setDoc(doc(host,path+'/votes/hostA_0'),vote),'Player submits own vote');
    await deny(setDoc(doc(host,path+'/votes/hostA_1'),{...vote,roundIndex:1}),'Player cannot vote in wrong round');
    await deny(setDoc(doc(guest,path+'/votes/guestB_0'),{...vote,uid:'guestB',choice:5}),'Invalid option blocked');
    await deny(setDoc(doc(guest,path+'/votes/guestB_0'),{...vote,uid:'guestB',at:'not-a-date'}),'Invalid vote timestamp blocked');
    await deny(setDoc(doc(host,path+'/votes/hostA_0'),{...vote,guess:3}),'Vote cannot be overwritten');
    const lastResult={counts:[0,1,0,0],top:[1],cold:[],totalVotes:1,gains:{hostA:{total:0,guess:0,streakBonus:0,doubleUsed:false,correct:false,predictionType:'miss',basePoints:0,streak:0}}};
    await deny(updateDoc(ref,{phase:'reveal',lastResult:{foo:1}}),'Malformed result blocked');
    await allow(updateDoc(ref,{phase:'reveal',scores:{hostA:0,guestB:0},streaks:{hostA:0},usedDoubles:{},lastResult}),'Host reveals with bounded results');
    await deny(setDoc(doc(guest,path+'/votes/guestB_0'),{...vote,uid:'guestB'}),'No new votes after reveal');
    await deny(updateDoc(ref,{phase:'finished',deadline:null}),'Cannot finish before last round');
    await allow(updateDoc(ref,{phase:'voting',roundIndex:1,deadline:Date.now()+30000,lastResult:null}),'Host advances exactly one round');
    await deny(deleteDoc(ref),'Host cannot delete room');
    await env.withSecurityRulesDisabled(async ctx=>{
      await setDoc(doc(ctx.firestore(),path),{...room(),phase:'reveal',roundIndex:5,deadline:Date.now(),lastResult});
    });
    await allow(updateDoc(ref,{phase:'finished',deadline:null}),'Final reveal can finish game');
    // Exercise the actual browser helpers with integrated candidate rules.
    const code='PQRSTU',ph=p3Refs(L,host,code,'hostA');
    const outsider=env.authenticatedContext('outsider').firestore(),po=p3Refs(L,outsider,code,'outsider');
    const player=uid=>({uid,name:'玩家',emoji:'😎',joinedAt:Date.now()});
    const v3room={...room(),questions:Array.from({length:12},()=>questions[0]),totalRounds:12};
    await deny(setDoc(ph.room,{...v3room,protocol:3}),'V3 room without gate/host denied');
    await deny(setDoc(ph.gate,{phase:'lobby',count:1,seats:{'1':true}}),'V3 gate alone denied');
    // Both halves remain mandatory: invalid first or last question must reject
    // the whole transaction, with no orphan invitation or host player.
    for(const [badCode,badIndex] of [['QRSTUV',0],['RSTUVW',11]]){
      const broken={...v3room,questions:v3room.questions.map((q,i)=>i===badIndex?{...q,a:['invalid']}:q)};
      await deny(p3CreateRoom(L,host,badCode,broken,player('hostA')),'V3 rejects malformed question '+badIndex);
      const badRefs=p3Refs(L,host,badCode,'hostA');
      assert.equal((await getDoc(badRefs.gate)).exists(),false);checks++;
      assert.equal((await getDoc(badRefs.self)).exists(),false);checks++;
    }
    await allow(p3CreateRoom(L,host,code,v3room,player('hostA')),'V3 browser creates 12-question room atomically');
    await allow(getDoc(po.gate),'V3 outsider exact invite lookup');
    await deny(getDoc(po.room),'V3 outsider private room denied');
    await deny(getDocs(collection(outsider,'rooms',code,'players')),'V3 outsider roster denied');
    await deny(getDocs(collection(outsider,'rooms',code,'votes')),'V3 outsider votes denied');
    await deny(setDoc(po.self,player('outsider')),'V3 old client player write denied');
    await deny(updateDoc(po.gate,{count:2,seats:{'1':true,'2':true}}),'V3 unpaired gate denied');
    await deny(setDoc(po.self,{...player('outsider'),seat:'2'}),'V3 unpaired member denied');
    await allow(p3JoinRoom(L,guest,code,player('guestB')),'V3 browser joins');
    await allow(p3JoinRoom(L,guest,code,player('guestB')),'V3 rejoin');
    assert.equal((await getDoc(ph.gate)).data().count,2);checks++;
    const ids=['hostA','guestB'];
    for(let i=3;i<=19;i++){
      const uid='v3-player-'+i;ids.push(uid);
      await allow(p3JoinRoom(L,env.authenticatedContext(uid).firestore(),code,player(uid)),'V3 join '+i);
    }
    const rivals=['v3-last-a','v3-last-b'];
    const race=await Promise.allSettled(rivals.map(uid=>p3JoinRoom(L,env.authenticatedContext(uid).firestore(),code,player(uid))));
    assert.equal(race.filter(x=>x.status==='fulfilled').length,1);checks++;
    ids.push(rivals[race.findIndex(x=>x.status==='fulfilled')]);
    assert.equal((await getDoc(ph.gate)).data().count,20);checks++;
    assert.equal((await getDocs(collection(host,'rooms',code,'players'))).size,20);checks++;
    await assert.rejects(p3JoinRoom(L,outsider,code,player('outsider')),/20 人/);checks++;
    const bad=L.writeBatch(outsider),gate=(await getDoc(po.gate)).data();
    bad.update(po.gate,{count:21,seats:{...gate.seats,'21':true}});
    bad.set(po.self,{...player('outsider'),seat:'21'});
    await deny(bad.commit(),'V3 direct 21st seat denied');
    const patch={phase:'voting',roundIndex:0,deadline:Date.now()+30000,scores:Object.fromEntries(ids.map(uid=>[uid,0])),streaks:{},usedDoubles:{},lastResult:null};
    await deny(updateDoc(ph.room,patch),'V3 start without gate denied');
    await deny(updateDoc(ph.gate,{phase:'voting'}),'V3 gate close without start denied');
    await allow(p3StartRoom(L,host,code,'hostA',patch),'V3 browser starts game atomically');
    await allow(p3JoinRoom(L,guest,code,player('guestB')),'V3 existing player rejoin during voting');
    await allow(setDoc(doc(host,'rooms',code,'votes','hostA_0'),vote),'V3 host vote');
    await allow(setDoc(doc(guest,'rooms',code,'votes','guestB_0'),{...vote,uid:'guestB'}),'V3 member vote');
    await allow(getDocs(query(collection(host,'rooms',code,'votes'),where('roundIndex','==',0))),'V3 settlement query');
    await deny(getDocs(collection(outsider,'rooms',code,'votes')),'V3 outsider votes denied during voting');
    await allow(updateDoc(ph.room,{phase:'reveal',scores:patch.scores,streaks:{hostA:0},usedDoubles:{},lastResult}),'V3 existing reveal');
    await allow(updateDoc(ph.room,{phase:'voting',roundIndex:1,deadline:Date.now()+30000,lastResult:null}),'V3 next question');
    await deny(getDoc(po.room),'V3 outsider still denied');
    console.log('PASS: '+checks+' Firestore security emulator assertions');
  } finally{
    await env.cleanup();
  }
}
main().catch(err=>{console.error(err);process.exitCode=1});
