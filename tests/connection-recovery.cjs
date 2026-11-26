'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync('app.js','utf8');
const segment=src.split('// RECOVERY_HELPERS_START')[1].split('// RECOVERY_HELPERS_END')[0];
const {makeVoteDelivery,makeSnapshotRecovery}=new Function(segment+';return {makeVoteDelivery,makeSnapshotRecovery};')();
function clock(){let now=0,id=0;const tasks=new Map();return {now:()=>now,schedule:(fn,delay)=>{tasks.set(++id,{fn,at:now+delay});return id;},cancel:i=>tasks.delete(i),advance(ms){const end=now+ms;while(true){const a=[...tasks].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!a)break;tasks.delete(a[0]);now=a[1].at;a[1].fn();}now=end;},size:()=>tasks.size};}
const flush=()=>Promise.resolve();
const server={metadata:{fromCache:false,hasPendingWrites:false}};
const cache={metadata:{fromCache:true,hasPendingWrites:false}};
const optimistic={metadata:{fromCache:false,hasPendingWrites:true}};
test('lost/delayed ACK releases UI call, reports unknown, never resends; server confirms',async()=>{
 const t=clock(),reports=[];let resolve,writes=0;
 const v=makeVoteDelivery({...t,write:()=>{writes++;return new Promise(r=>resolve=r)},active:()=>true,report:x=>reports.push(x)});
 assert.equal(v.start(),undefined);t.advance(5000);
 assert.deepEqual(reports,['sending','unknown']);assert.equal(writes,1);v.confirm();resolve();await flush();
 assert.deepEqual(reports,['sending','unknown','sent']);assert.equal(t.size(),0);
});
test('old round and disposed sessions ignore delayed ACK or rejection',async()=>{
 const t=clock(),reports=[];let active=true,resolve,reject;
 const a=makeVoteDelivery({...t,write:()=>new Promise(r=>resolve=r),active:()=>active,report:x=>reports.push(x)});
 a.start();active=false;t.advance(6000);resolve();await flush();assert.deepEqual(reports,['sending']);
 active=true;const b=makeVoteDelivery({...t,write:()=>new Promise((_,r)=>reject=r),active:()=>active,report:x=>reports.push(x)});
 b.start();b.dispose();reject({code:'permission-denied'});await flush();assert.deepEqual(reports,['sending','sending']);
});
test('server ACK wins over later error and no ambiguous resend',async()=>{
 const t=clock(),reports=[];let reject;
 const a=makeVoteDelivery({...t,write:()=>new Promise((_,r)=>reject=r),active:()=>true,report:x=>reports.push(x)});
 a.start();a.confirm();reject({code:'permission-denied'});await flush();assert.deepEqual(reports,['sending','sent']);
 const b=makeVoteDelivery({...t,write:()=>Promise.reject({code:'permission-denied'}),active:()=>true,report:x=>reports.push(x)});
 b.start();await flush();assert.equal(reports.at(-1),'rejected');
});
function watches(){const t=clock(),attempts=[],accepted=[];let online=true;const r=makeSnapshotRecovery({...t,random:()=>0,isOnline:()=>online});const watch=(key)=>r.watch(key,(next,fail)=>{const a={key,next,fail,off:false};attempts.push(a);return ()=>{a.off=true};},s=>accepted.push([key,s]));return {t,r,watch,attempts,accepted,setOnline:v=>{online=v}};}
test('cache miss and optimistic snapshots are never accepted as server state',()=>{
 const x=watches();x.watch('room');const a=x.attempts[0];a.next(cache);a.next(optimistic);
 assert.equal(x.accepted.length,0);assert.equal(x.r.ready(['room']),false);
 a.next(server);assert.equal(x.accepted.length,1);assert.equal(x.r.ready(['room']),true);
 a.next(cache);assert.equal(x.accepted.length,1);assert.equal(x.r.ready(['room']),false);
});
test('terminal transient error retries at most 3 times, stale callbacks ignored',()=>{
 const x=watches();x.watch('room');for(const wait of [1000,2000,4000]){const a=x.attempts.at(-1);a.fail({code:'unavailable'});a.next(server);assert.equal(a.off,true);x.t.advance(wait);}
 const a=x.attempts.at(-1);a.fail({code:'unavailable'});x.t.advance(60000);x.r.resume();
 assert.equal(x.attempts.length,4);assert.equal(x.accepted.length,0);assert.deepEqual(x.r.state(),['blocked']);
});
test('permission failure does not retry; changing round invalidates old watch',()=>{
 const x=watches();x.watch('votes');const a=x.attempts[0];a.fail({code:'permission-denied'});x.t.advance(60000);x.r.resume();assert.equal(x.attempts.length,1);
 x.watch('votes');a.next(server);x.attempts[1].next(server);assert.equal(x.accepted.length,1);
 x.r.dispose();x.attempts[1].next(server);assert.equal(x.accepted.length,1);
});
test('offline pauses retry; resume schedules one retry, healthy foreground does not reconnect',()=>{
 const x=watches();x.watch('room');x.setOnline(false);x.attempts[0].fail({code:'unavailable'});x.t.advance(60000);assert.equal(x.attempts.length,1);
 x.setOnline(true);x.r.resume();x.r.resume();x.t.advance(1000);assert.equal(x.attempts.length,2);
 x.attempts[1].next(server);x.t.advance(60000);x.r.resume();assert.equal(x.attempts.length,2);assert.equal(x.r.ready(['room']),true);
});
test('stale cached foreground watch refreshes without duplicating listeners',()=>{
 const x=watches();x.watch('room');x.attempts[0].next(cache);x.t.advance(12000);x.r.resume();x.r.resume();x.t.advance(1000);
 assert.equal(x.attempts.length,2);assert.equal(x.attempts[0].off,true);x.attempts[0].next(server);assert.equal(x.accepted.length,0);
 x.attempts[1].next(server);assert.equal(x.accepted.length,1);
});
test('production wiring uses same vote ID, never awaits ACK in submitVote and gates settlement',()=>{
 const submit=src.split('async function submitVote(){')[1].split('async function revealRound(){')[0];
 assert.match(submit,/uid\+'_' \+round|uid\+'_'\+round/);
 assert.doesNotMatch(submit,/await L\.setDoc/);assert.match(submit,/delivery\.start\(\)/);
 assert.match(src,/visibilitychange',resumeOnline/);assert.match(src,/disposePendingVote\(\);state\.choice=null/);
 assert.match(src,/if\(!onlineReady\(true\)\)throw new Error/);
});
