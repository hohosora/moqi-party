'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {taskFor,claimMarker,ackMarker,getAck,hasRemoteClaim,prompt,tick,makeStore,queue,execProbe,statusReport}=require('./bridge.cjs');
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
test('staging disabled without explicit opt-in AND acknowledged local probe',()=>{const f=fixture([staging]);try{
 assert.equal(tick(f.api,f.store,false,true).status,'idle');
 assert.equal(tick(f.api,f.store,true,true).status,'idle');
 assert.equal(f.sent.length,0);
 }finally{f.clean();}});
test('ack rejects wrong task, old timestamps, and marker not on first line',()=>{
 const j={id:'00000000-0000-4000-8000-000000000000',createdAt:new Date().toISOString()};
 assert.equal(getAck([comment('other\n'+ackMarker(j.id,'DONE')),comment(ackMarker(j.id,'DONE'),{created_at:'2000-01-01T00:00:00Z'})],j),null);
 assert.equal(getAck([comment(ackMarker(j.id,'BLOCKED'))],j),'BLOCKED');
});

// Real Windows subprocess, fake CLI only. Do not contact any Codex server.
test('Windows preflight uses codex.cmd instead of npm PowerShell shim and propagates failure',{skip:process.platform!=='win32'},()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'moqi-cli-test-')),oldPath=process.env.PATH;
 try{
  fs.writeFileSync(path.join(dir,'codex.ps1'),"throw 'PowerShell shim must not run'\n");
  fs.writeFileSync(path.join(dir,'codex.cmd'),'@echo off\r\nif "%1"=="queue" if "%2"=="--help" (echo MOCK-CODEX-CMD-OK & exit /b 0)\r\nexit /b 7\r\n');
  process.env.PATH=dir+path.delimiter+oldPath;
  const id='00000000-0000-4000-8000-000000000000';
  assert.match(queue(id,'',true),/MOCK-CODEX-CMD-OK/);
  fs.writeFileSync(path.join(dir,'codex.cmd'),'@echo off\r\nexit /b 7\r\n');
  assert.throws(()=>queue(id,'',true),{message:'command failed: powershell.exe (7)'});
 }finally{process.env.PATH=oldPath;fs.rmSync(dir,{recursive:true,force:true});}
});

test('exec validates exact task-specific final file and refuses non-probe jobs',()=>{
 const j={id:'00000000-0000-4000-8000-000000000000',type:'probe'};
 assert.equal(execProbe(j,(message,out)=>{assert.match(message,/Do not use tools/);fs.writeFileSync(out,'BRIDGE_EXEC_OK '+j.id+'\n');}),true);
 assert.throws(()=>execProbe(j,(_,out)=>fs.writeFileSync(out,'wrong')),/response mismatch/);
 assert.throws(()=>execProbe(j,()=>{}));
 assert.throws(()=>execProbe({...j,type:'staging'},()=>{}),/only an identified probe/);
});
test('exec pilot completes only exact probe with verified comment, never unlocks staging',()=>{const f=fixture([staging,issue()]);try{
 let calls=0;f.api.execProbe=j=>{calls++;assert.equal(j.type,'probe');return true;};
 assert.equal(tick(f.api,f.store,false,false,'exec').status,'dry-run');assert.equal(calls,0);
 assert.equal(tick(f.api,f.store,false,true,'exec').status,'DONE');assert.equal(calls,1);
 assert.equal(f.store.jobs()[0].transport,'exec');assert.equal(f.sent.length,0);
 assert.equal(tick(f.api,f.store,true,true,'queue').status,'idle');
 assert.throws(()=>tick(f.api,f.store,true,true,'exec'),/cannot authorize staging/);
}finally{f.clean();}});
test('ambiguous exec failure is not replayed or silently switched to queue',()=>{const f=fixture();try{
 let calls=0;f.api.execProbe=()=>{calls++;throw Error('timeout');};
 assert.equal(tick(f.api,f.store,false,true,'exec').status,'uncertain-no-retry');
 assert.equal(tick(f.api,f.store,false,true,'queue').status,'uncertain-no-retry');
 assert.equal(calls,1);assert.equal(f.sent.length,0);
}finally{f.clean();}});

test('status-only selects only status, never invokes AI or staging, and reads back acknowledgement',()=>{const f=fixture([issue(),staging,issue(52,'[AI-QUEUE:STATUS]',{body:'UNTRUSTED'})]);try{
 let reports=0;f.api.statusReport=()=>{reports++;return 'Fixed status evidence';};f.api.execProbe=()=>{throw Error('must not call Exec');};
 assert.equal(tick(f.api,f.store,false,false,'status-only').issue,52);assert.equal(reports,0);
 assert.deepEqual(tick(f.api,f.store,false,true,'status-only'),{status:'DONE',issue:52,transport:'status-only'});
 assert.equal(reports,1);assert.equal(f.sent.length,0);assert.equal(tick(f.api,f.store,false,true,'status-only').status,'idle');
 assert.throws(()=>tick(f.api,f.store,true,true,'status-only'),/cannot authorize staging/);
}finally{f.clean();}});
test('status report uses exact revision, known workflow names and sanitized fields only',()=>{
 const sha='a'.repeat(40),name='AI bridge safety tests';
 const r=statusReport({object:{sha}},[{name,head_sha:sha,id:123,status:'completed',conclusion:'success',display_title:'SECRET'},{name,head_sha:'b'.repeat(40),id:124,status:'completed',conclusion:'failure'},{name:'INJECT',head_sha:sha,id:125,status:'completed',conclusion:'success'}]);
 assert.match(r,/actions\/runs\/123/);assert.match(r,/completed \/ success/);assert.ok(!r.includes('SECRET')&&!r.includes('INJECT')&&!r.includes('/124'));
 assert.match(statusReport({object:{sha}},[]),/no matching run/);
 assert.throws(()=>statusReport({object:{sha:'bad'}},[]),/invalid status metadata/);
});
test('status-only failure is uncertain and not retried',()=>{const f=fixture([issue(52,'[AI-QUEUE:STATUS]')]);try{
 let n=0;f.api.statusReport=()=>{n++;throw Error('network');};
 assert.equal(tick(f.api,f.store,false,true,'status-only').status,'uncertain-no-retry');
 assert.equal(tick(f.api,f.store,false,true,'status-only').status,'uncertain-no-retry');assert.equal(n,1);
}finally{f.clean();}});

// Cloud-hosted CI task types are intentionally not executable by the local bridge.
test('engineering CI tasks cannot reach any existing local transport',()=>{
 for(const title of ['[AI-CI:TEST]','[AI-CI:AUDIT]']){
  const f=fixture([issue(99,title,{body:'malicious local command'})]);try{
   assert.equal(taskFor(issue(99,title),true),null);
   for(const transport of ['queue','exec','status-only'])assert.equal(tick(f.api,f.store,false,true,transport).status,'idle');
   assert.equal(f.sent.length,0);assert.equal(f.store.jobs().length,0);
  }finally{f.clean();}
 }
});
