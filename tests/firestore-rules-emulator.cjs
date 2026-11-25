'use strict';
// These tests run only against the local Firebase Emulator. They NEVER reach production.
// Run after npm install: npm run test:rules
const fs = require('node:fs');
const {initializeTestEnvironment, assertSucceeds, assertFails} = require('@firebase/rules-unit-testing');
const {doc,collection,setDoc,updateDoc,getDoc,getDocs,query,where,deleteDoc} = require('firebase/firestore');

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
    await deny(setDoc(doc(host,'rooms/CDEFGH'),{...room(),unused:'injected'}),'Unknown room fields blocked');
    await deny(setDoc(doc(host,'rooms/DEFGHJ'),{...room(),theme:'unknown'}),'Unknown style blocked');
    await deny(setDoc(doc(host,'rooms/EFGHJK'),{...room(),quickScene:'missing-scene'}),'Unknown quick scene blocked');
    await deny(setDoc(doc(host,'rooms/FGHJKL'),{...room(),questions:questions.slice(0,5)}),'Incorrect question count blocked');
    await deny(setDoc(doc(host,'rooms/GHJKLM'),{...room(),questions:questions.map((q,i)=>i? q:{...q,q:'A'.repeat(121)})}),'Oversized question blocked');
    await deny(setDoc(doc(host,'rooms/HJKLMN'),{...room(),hostUid:'guestB'}),'Cannot claim another host ID');
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
    await deny(setDoc(doc(host,path+'/players/hostC'),{uid:'hostC',name:'X'.repeat(30),emoji:'😎',joinedAt:Date.now()}),'Overlong nickname blocked');
    await deny(setDoc(doc(host,path+'/players/hostD'),{uid:'hostD',name:'不合法',emoji:'😎',joinedAt:Date.now(),admin:true}),'Player document extra fields blocked');
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
    console.log('PASS: '+checks+' Firestore security emulator assertions');
  } finally{
    await env.cleanup();
  }
}
main().catch(err=>{console.error(err);process.exitCode=1});
