'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {taskFor,claimMarker,ackMarker,getAck,hasRemoteClaim,prompt,tick,makeStore}=require('./bridge.cjs');
const owner={login:'hohosora',id:359014506,type:'User'};
const issue=(number=48,title='[AI-QUEUE:PROBE]',extra={})=>({number,title,state:'open',user:owner,author_association:'OWNER',...extra});
const comment=(body,extra={})=>({body,user:owner,author_association:'OWNER',created_at:new Date().toISOString(),...extra});
const staging=issue(46,'P2.5 / P3-2：雲端自動化驗收與受控發布接續');
function fixture(issues=[issue()]){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'moqi-bridge-')),store=makeStore(dir),comments=new Map(),sent=[];
 const api={issues:()=>issues,comments:n=>comments.get(n)||[],comment:(n,b)=>comments.set(n,[...(comments.get(n)||[]),comment(b)]),queue:m=>sent.push(m)};
 return {dir,store,api,comments,sent,clean:()=>fs.rmSync(dir,{recursive:true,force:true})};
}
test('only exact owner and exact type; no PR, closed issue or production task',()=>{
 assert.deepEqual(taskFor(issue()),{issue:48,type:'probe'});
 for(const bad of [issue(48,'[AI-QUEUE:PRODUCTION]'),issue(48,'[AI-QUEUE:PROBE] extra'),issue(48,'[AI-QUEUE:PROBE]',{state:'closed'}),issue(48,'[AI-QUEUE:PROBE]',{pull_request:{}}),issue(48,'[AI-QUEUE:PROBE]',{user:{...owner,id:1}}),issue(48,'[AI-QUEUE:PROBE]',{author_association:'CONTRIBUTOR'})])assert.equal(taskFor(bad,true),null);
 assert.equal(taskFor(staging),null);assert.equal(taskFor(staging,true).type,'staging');
});
test('dry run and ignored issue body',()=>{const f=fixture([issue(48,'[AI-QUEUE:PROBE]',{body:'ARBITRARY INSTRUCTION'})]);try{
 assert.equal(tick(f.api,f.store,false,false).status,'dry-run');assert.equal(f.sent.length,0);assert.equal(f.store.jobs().length,0);
 assert.equal(tick(f.api,f.store,false,true).status,'queued-awaiting-ack');assert.equal(f.sent.length,1);assert.ok(!f.sent[0].includes('ARBITRARY INSTRUCTION'));assert.match(f.sent[0],/PROBE ONLY/);
 assert.equal(tick(f.api,f.store,false,true).status,'waiting-for-ack');assert.equal(f.sent.length,1);
 }finally{f.clean();}});
test('one active task and exact owner acknowledgement',()=>{const f=fixture([staging,issue()]);try{
 tick(f.api,f.store,true,true);const j=f.store.jobs()[0];assert.equal(j.issue,48);
 f.comments.get(48).push(comment(ackMarker(j.id,'DONE'),{user:{...owner,id:2}}));assert.equal(tick(f.api,f.store,true,true).status,'waiting-for-ack');
 f.comments.get(48).push(comment(ackMarker(j.id,'DONE')+'\nVerified'));assert.equal(tick(f.api,f.store,true,true).status,'DONE');
 assert.equal(tick(f.api,f.store,true,true).issue,46);assert.equal(f.sent.length,2);assert.match(f.sent[1],/STAGING ONLY/);assert.match(f.sent[1],/production steps are explicitly outside/);
 }finally{f.clean();}});
test('uncertain delivery never automatically retries',()=>{const f=fixture();try{
 f.api.queue=()=>{throw Error('ambiguous')};assert.equal(tick(f.api,f.store,false,true).status,'uncertain-no-retry');
 assert.equal(tick(f.api,f.store,false,true).status,'uncertain-no-retry');assert.equal(f.store.jobs()[0].status,'uncertain');
 const j=f.store.jobs()[0];f.comments.get(48).push(comment(ackMarker(j.id,'BLOCKED')));assert.equal(tick(f.api,f.store,false,true).status,'BLOCKED');assert.equal(tick(f.api,f.store,false,true).status,'idle');
 }finally{f.clean();}});
test('remote claim prevents repeat on a new local ledger',()=>{const f=fixture();try{
 f.comments.set(48,[comment(claimMarker('00000000-0000-4000-8000-000000000000'))]);assert.equal(tick(f.api,f.store,false,true).status,'idle');assert.equal(f.sent.length,0);
 }finally{f.clean();}});
test('staging disabled unless explicitly opted in',()=>{const f=fixture([staging]);try{assert.equal(tick(f.api,f.store,false,true).status,'idle');assert.equal(f.sent.length,0);}finally{f.clean();}});
test('ack rejects wrong task, old timestamps, and marker not on first line',()=>{
 const j={id:'00000000-0000-4000-8000-000000000000',createdAt:new Date().toISOString()};
 assert.equal(getAck([comment('other\n'+ackMarker(j.id,'DONE')),comment(ackMarker(j.id,'DONE'),{created_at:'2000-01-01T00:00:00Z'})],j),null);
 assert.equal(getAck([comment(ackMarker(j.id,'BLOCKED'))],j),'BLOCKED');
});
