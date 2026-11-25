'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{test}=require('node:test');
const source=fs.readFileSync('app.js','utf8').split('// CONNECTION_DIAGNOSTICS_START')[1].split('// CONNECTION_DIAGNOSTICS_END')[0];
const make=new Function(source+';return makeConnectionDiagnostics;')();
test('staging opt-in timings, no identifiers or raw errors',async()=>{
 let now=0;const d=make(true,()=>now);
 assert.equal(await d.measure('auth-restore',async()=>{now=17;return 'private uid'}),'private uid');
 await assert.rejects(d.measure('appcheck-token',async()=>{now=31;throw Error('private token')}));
 const first=d.first('room-first');now=42;first('ok');now=99;first('error');
 await d.measure('unknown-private-stage',async()=>{});
 assert.deepEqual(d.snapshot(),[{stage:'auth-restore',ms:17,outcome:'ok'},{stage:'appcheck-token',ms:14,outcome:'error'},{stage:'room-first',ms:11,outcome:'ok'}]);
 d.snapshot()[0].stage='changed';assert.equal(d.snapshot()[0].stage,'auth-restore');
 for(let i=0;i<120;i++)await d.measure('room-read',async()=>{});
 assert.equal(d.snapshot().length,100);
});
test('disabled mode never calls clock and stores nothing',async()=>{
 const d=make(false,()=>{throw Error('clock should not run')});
 assert.equal(await d.measure('sdk',async()=>42),42);d.first('room-first')('ok');assert.deepEqual(d.snapshot(),[]);
});
