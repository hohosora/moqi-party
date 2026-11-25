'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync('app.js','utf8');
const segment=src.split('// HOST_VOTE_SYNC_START')[1].split('// HOST_VOTE_SYNC_END')[0];
function setup(){
  let now=0,watched=0,calls=0,updates=0;
  const state={mode:'online',roomCode:'ABC234',room:{roundIndex:1,phase:'voting'},watchedRound:1,players:[{}, {}, {}],hostVoteSync:null,autoRevealing:false,host:true};
  const document={visibilityState:'visible'};
  let resolve,reject;
  state.firebase={dbLib:{query:(c,w)=>[c,w],where:(...a)=>a,getCountFromServer:()=>{calls++;return new Promise((res,rej)=>{resolve=res;reject=rej;});}}};
  const api=new Function('state','isHost','currentVoteCount','performance','document','votesCollection','updateVoteStatusUI','console',segment+';return {refreshHostVoteCount,displayVoteCount,voteSyncMessage};')(state,()=>state.host,()=>watched,{now:()=>now},document,c=>c,()=>updates++,{warn:()=>{}});
  return {state,document,...api,advance:n=>{now+=n},watch:n=>{watched=n},resolve:n=>resolve({data:()=>({count:n})}),reject:()=>reject({code:'unavailable'}),calls:()=>calls,updates:()=>updates};
}
test('host server count arrives before listener; older watch cannot lower it',async()=>{
  const x=setup();const p=x.refreshHostVoteCount();x.resolve(2);await p;
  assert.equal(x.displayVoteCount(),2);assert.equal(x.updates(),1);x.watch(1);assert.equal(x.displayVoteCount(),2);x.watch(3);assert.equal(x.displayVoteCount(),3);
  x.advance(3000);await x.refreshHostVoteCount();assert.equal(x.calls(),1);
});
test('single in-flight, 2-second throttle and stop at full roster',async()=>{
  const x=setup();const p=x.refreshHostVoteCount();await x.refreshHostVoteCount();assert.equal(x.calls(),1);x.resolve(1);await p;
  x.advance(1999);await x.refreshHostVoteCount();assert.equal(x.calls(),1);
  x.advance(1);const q=x.refreshHostVoteCount();x.resolve(3);await q;x.advance(2000);await x.refreshHostVoteCount();assert.equal(x.calls(),2);
});
test('no polling for players, demo, hidden tab, reveal or settlement',async()=>{
  const x=setup();x.state.host=false;await x.refreshHostVoteCount();x.state.host=true;x.state.mode='demo';await x.refreshHostVoteCount();x.state.mode='online';x.document.visibilityState='hidden';await x.refreshHostVoteCount();x.document.visibilityState='visible';x.state.room.phase='reveal';await x.refreshHostVoteCount();x.state.room.phase='voting';x.state.autoRevealing=true;await x.refreshHostVoteCount();assert.equal(x.calls(),0);
});
test('stale round and cleared session results cannot update current display',async()=>{
  const x=setup();const p=x.refreshHostVoteCount();x.state.room.roundIndex=2;x.state.watchedRound=2;x.state.hostVoteSync=null;x.resolve(2);await p;assert.equal(x.updates(),0);assert.equal(x.displayVoteCount(),0);
  const q=x.refreshHostVoteCount();x.state.hostVoteSync=null;x.resolve(3);await q;assert.equal(x.updates(),0);
});
test('fallback failure preserves live count and allows retry',async()=>{
  const x=setup();x.watch(1);const p=x.refreshHostVoteCount();x.reject();await p;assert.equal(x.displayVoteCount(),1);assert.match(x.voteSyncMessage(),/延遲/);
  x.advance(2000);const q=x.refreshHostVoteCount();x.resolve(2);await q;assert.equal(x.displayVoteCount(),2);assert.match(x.voteSyncMessage(),/伺服器確認/);
});
test('count bounded and per-round attempts limited',async()=>{
  const x=setup();for(let i=0;i<24;i++){const p=x.refreshHostVoteCount();x.resolve(i===0?21:0);await p;x.advance(2000);}
  await x.refreshHostVoteCount();assert.equal(x.calls(),24);assert.equal(x.displayVoteCount(),0);
});
test('settlement continues to use server vote documents, not aggregate count',()=>{
  const reveal=src.split('async function revealRound(){')[1].split('function currentTimeTick(){')[0];
  assert.match(reveal,/getDocsFromServer/);assert.match(reveal,/evaluateRound\(state.room,state.players,votes\)/);assert.doesNotMatch(reveal,/displayVoteCount|getCountFromServer/);
});
