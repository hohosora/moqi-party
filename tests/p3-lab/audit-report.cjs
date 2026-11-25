'use strict';
// Read-only dependency report. Never npm audit fix --force, never print credentials.
const {spawnSync}=require('node:child_process');
function run(args){
  const r=spawnSync('npm',args,{encoding:'utf8',maxBuffer:12*1024*1024});
  if(r.error)throw r.error;
  let json;
  try{json=JSON.parse(r.stdout);}catch{throw new Error('npm '+args[0]+' did not return JSON (exit '+r.status+')');}
  if(json.error)throw new Error('npm '+args[0]+' returned an error');
  return json;
}
const a=run(['audit','--json','--ignore-scripts']);
if(!a.metadata?.vulnerabilities||!a.vulnerabilities)throw new Error('Missing npm audit metadata');
console.log('Severity totals:',JSON.stringify(a.metadata.vulnerabilities));
for(const [name,v] of Object.entries(a.vulnerabilities)){
  console.log(JSON.stringify({name,severity:v.severity,range:v.range,
    via:v.via.map(x=>typeof x==='string'?x:{name:x.name,range:x.range,url:x.url}),
    fixAvailable:v.fixAvailable}));
}
const o=run(['outdated','--json','--depth=0']);
for(const [name,v] of Object.entries(o)){
  console.log('Direct dependency:',JSON.stringify({name,current:v.current,wanted:v.wanted,latest:v.latest}));
}
if(a.metadata.vulnerabilities.high||a.metadata.vulnerabilities.critical){
  console.error('New or remaining high/critical test dependency findings require review.');
  process.exitCode=1;
}
