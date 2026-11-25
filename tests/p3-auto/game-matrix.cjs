'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {initializeTestEnvironment,assertFails}=require('@firebase/rules-unit-testing');
const L=require('firebase/firestore');
const {performance}=require('node:perf_hooks');
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8081')throw Error('Loopback emulator required');
const src=fs.readFileSync('app.js','utf8');
const helpers=src.split('// P3_ADMISSION_HELPERS_START')[1].split('// P3_ADMISSION_HELPERS_END')[0];
const {p3Refs,p3CreateRoom,p3JoinRoom,p3StartRoom}=new Function(helpers+';return {p3Refs,p3CreateRoom,p3JoinRoom,p3StartRoom};')();
const score=src.slice(src.indexOf('  function evaluateRound('),src.indexOf('  function simulateBots('));
const evaluateRound=new Function(score+';return evaluateRound;')();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function waitFor(ref,accept,ms=15000){
 return new Promise((resolve,reject)=>{
  let stop=()=>{};const timer=setTimeout(()=>{stop();reject(Error('snapshot timeout'));},ms);
  stop=L.onSnapshot(ref,{includeMetadataChanges:true},snap=>{if(!snap.metadata.fromCache&&accept(snap)){clearTimeout(timer);stop();resolve(snap);}},err=>{clearTimeout(timer);stop();reject(err);});
 });
}
async function main(){
 const env=await initializeTestEnvironment({projectId:'demo-moqi-party-p1',firestore:{host:'127.0.0.1',port:8081,rules:fs.readFileSync('firestore.rules','utf8')}});
 try{
  await env.withSecurityRulesDisabled(ctx=>L.setDoc(L.doc(ctx.firestore(),'rolloutControls/p3Admission'),{createEnabled:true}));
  const counts=[2,5,10,15,20], codes=['ABCDE2','ABCDE3','ABCDE4','ABCDE5','ABCDE6'];let voteTotal=0,roundTotal=0;
  for(let k=0;k<counts.length;k++){
   const n=counts[k],code=codes[k],ids=Array.from({length:n},(_,i)=>'matrix-'+k+'-'+i), dbs=ids.map(uid=>env.authenticatedContext(uid).firestore()), host=dbs[0],hr=p3Refs(L,host,code,ids[0]);
   const player=uid=>({uid,name:'測試',emoji:'😎',joinedAt:Date.now()});
   const data={hostUid:ids[0],phase:'lobby',roundIndex:-1,totalRounds:6,seconds:45,questions:Array.from({length:6},(_,i)=>({q:'測試題 '+i,a:['A','B','C','D'],talk:'分享'})),scores:{},streaks:{},usedDoubles:{},lastResult:null,deadline:null,createdAt:Date.now(),theme:['party','panel','minimal'][k%3]};
   await p3CreateRoom(L,host,code,data,player(ids[0]));
   // Deterministic small waves limit contention while exercising concurrent joins.
   for(let i=1;i<n;i+=3)await Promise.all(dbs.slice(i,i+3).map((db,j)=>p3JoinRoom(L,db,code,player(ids[i+j]))));
   assert.equal((await L.getDocFromServer(hr.gate)).data().count,n);
   if(n===20){
    const extra=env.authenticatedContext('matrix-overflow').firestore();
    await assert.rejects(p3JoinRoom(L,extra,code,player('matrix-overflow')),/20 人/);
   }
   const initialScores=Object.fromEntries(ids.map(uid=>[uid,0]));
   await p3StartRoom(L,host,code,ids[0],{phase:'voting',roundIndex:0,deadline:Date.now()+45000,scores:initialScores,streaks:{},usedDoubles:{},lastResult:null});
   let prior={scores:initialScores,streaks:{},usedDoubles:{}};
   const times=[];
   for(let round=0;round<6;round++){
    const col=L.collection(host,'rooms',code,'votes'),q=L.query(col,L.where('roundIndex','==',round));
    const observed=waitFor(q,s=>s.size===n&&!s.metadata.hasPendingWrites);
    // Attach a rejection handler immediately; the awaited promise still propagates.
    observed.catch(()=>{});
    const t=performance.now();
    const votes=ids.map((uid,i)=>({uid,roundIndex:round,choice:(i+round)%4,guess:round%4,double:round===1,at:Date.now()}));
    await Promise.all(dbs.map(async(db,i)=>{
     await sleep((i%4)*15);
     await L.setDoc(L.doc(db,'rooms',code,'votes',ids[i]+'_'+round),votes[i]);
    }));
    await observed;times.push(Math.round(performance.now()-t));
    const snap=await L.getDocsFromServer(q);
    assert.equal(snap.size,n);assert.equal(new Set(snap.docs.map(x=>x.data().uid)).size,n);
    await assertFails(L.setDoc(L.doc(dbs[1],'rooms',code,'votes',ids[1]+'_'+round),{...votes[1],choice:(votes[1].choice+1)%4}));
    if(round===2){
     // Offline then online: recreate the read path using same anonymous identity.
     await L.disableNetwork(dbs[1]);await sleep(80);await L.enableNetwork(dbs[1]);
     await p3JoinRoom(L,dbs[1],code,player(ids[1]));
     assert.equal((await L.getDocFromServer(L.doc(dbs[1],'rooms',code,'votes',ids[1]+'_'+round))).exists(),true);
     assert.equal((await L.getDocFromServer(hr.gate)).data().count,n);
    }
    const result=evaluateRound(prior,ids.map(uid=>({uid})),snap.docs.map(x=>x.data()));
    assert.equal(result.lastResult.totalVotes,n);
    assert.deepEqual(result.lastResult.counts,votes.reduce((a,v)=>(a[v.choice]++,a),[0,0,0,0]));
    await L.updateDoc(hr.room,result);
    const remote=await Promise.all(dbs.map((db,i)=>L.getDocFromServer(p3Refs(L,db,code,ids[i]).room)));
    for(const s of remote){assert.equal(s.data().phase,'reveal');assert.deepEqual(s.data().scores,result.scores);}
    prior=result;voteTotal+=n;roundTotal++;
    if(round<5)await L.updateDoc(hr.room,{phase:'voting',roundIndex:round+1,deadline:Date.now()+45000,lastResult:null});
    else await L.updateDoc(hr.room,{phase:'finished',deadline:null});
   }
   const finished=await L.getDocFromServer(hr.room);assert.equal(finished.data().phase,'finished');assert.equal(Object.keys(finished.data().scores).length,n);
   console.log(JSON.stringify({players:n,rounds:6,votes:n*6,localSnapshotMs:times,maxLocalMs:Math.max(...times),status:'PASS'}));
  }
  console.log('PASS: '+roundTotal+' complete emulator rounds; '+voteTotal+' votes; 21st player denied; no production requests');
 }finally{await env.cleanup();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
