'use strict';
// Read-only administrator tool. Never deletes, writes, or changes rules.
// Run locally with ADC; never put service account credentials in GitHub.
const {assessRoom,ROOM_CODE}=require('./room-retention.cjs');
const PROJECT='moqi-party',PAGE=50,CHILD_LIMIT=501;
function parse(argv){
  const opts={};
  for(let i=0;i<argv.length;i+=2){
    const k=argv[i],v=argv[i+1];
    if(!['--project','--room','--after'].includes(k)||!v||Object.hasOwn(opts,k))throw Error('Invalid arguments');
    opts[k]=v;
  }
  if(opts['--project']!==PROJECT)throw Error('Explicit --project moqi-party required');
  if(opts['--room']&&opts['--after'])throw Error('Use --room OR --after');
  for(const k of ['--room','--after'])if(opts[k]&&!ROOM_CODE.test(opts[k]))throw Error('Invalid room code');
  return opts;
}
async function main(){
  const opts=parse(process.argv.slice(2));
  if(process.env.FIRESTORE_EMULATOR_HOST)throw Error('Emulator environment set; refuse to target production by accident');
  const {initializeApp,applicationDefault,deleteApp}=require('firebase-admin/app');
  const {getFirestore,FieldPath}=require('firebase-admin/firestore');
  const app=initializeApp({projectId:PROJECT,credential:applicationDefault()});
  try{
    const db=getFirestore(app),rooms=db.collection('rooms');
    let docs;
    if(opts['--room']){
      const d=await rooms.doc(opts['--room']).get();
      docs=d.exists?[d]:[];
    }else{
      let q=rooms.orderBy(FieldPath.documentId()).select('phase').limit(PAGE);
      if(opts['--after'])q=q.startAfter(opts['--after']);
      docs=(await q.get()).docs;
    }
    const now=Date.now();
    let candidates=0;
    for(const d of docs){
      if(!ROOM_CODE.test(d.id)){console.log('SKIP unexpected document ID');continue;}
      const phase=d.get('phase'),root=d.updateTime?.toMillis();
      if(!assessRoom(phase,root,now).eligible)continue;
      const children=[];
      let skip=false;
      for(const name of ['players','votes']){
        const snap=await d.ref.collection(name).select('uid').limit(CHILD_LIMIT).get();
        if(snap.size===CHILD_LIMIT){skip=true;break;}
        children.push(...snap.docs.map(x=>x.updateTime?.toMillis()));
      }
      if(skip){console.log('REVIEW MANUALLY '+d.id+' child scan limit reached');continue;}
      const result=assessRoom(phase,root,now,children);
      if(!result.eligible)continue;
      // Re-read parent to identify a concurrent phase change. This is not an
      // atomic deletion lock; administrator must pause play before deletion.
      const fresh=await d.ref.get();
      if(!fresh.exists||fresh.updateTime?.toMillis()!==root){console.log('SKIP changed '+d.id);continue;}
      candidates++;
      console.log(JSON.stringify({room:d.id,phase,lastActivity:new Date(result.lastActivity).toISOString(),retentionDays:result.days,scannedChildren:children.length,action:'manual-review-only'}));
    }
    console.log(JSON.stringify({project:PROJECT,scannedRooms:docs.length,candidates,nextAfter:!opts['--room']&&docs.length===PAGE?docs[docs.length-1].id:null,deleted:0}));
  }finally{await deleteApp(app);}
}
main().catch(e=>{console.error('Preview failed:',e.message);process.exitCode=1;});
