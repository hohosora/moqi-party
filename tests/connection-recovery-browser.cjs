'use strict';
// Actual rendered client with deterministic SDK stubs, no production network.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));
 if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(p,(e,data)=>{if(e){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});
const modules={
 'firebase-app.js':'export function getApps(){return []} export function initializeApp(){return {}}',
 'firebase-app-check.js':'export class ReCaptchaEnterpriseProvider{} export function initializeAppCheck(){return {}} export async function getToken(){return {token:"test"}}',
 'firebase-auth.js':'const auth={currentUser:{uid:"p1"}};export function getAuth(){return auth} export function onAuthStateChanged(a,cb){queueMicrotask(cb);return ()=>{}}',
 'firebase-firestore.js':[
  'const m=window.__recoveryMock;',
  'export function getFirestore(){return {}}',
  'export function doc(db,...p){return p.join("/")}',
  'export function collection(db,...p){return p.join("/")}',
  'export function where(...p){return p}',
  'export function query(ref,w){return {ref,round:w[2]}}',
  'export async function getDoc(ref){return m.roomSnap(false)}',
  'export async function getDocs(ref){return m.listSnap(m.players,false)}',
  'export function setDoc(ref,payload){return new Promise((resolve,reject)=>m.writes.push({ref,payload,resolve,reject}))}',
  'export function onSnapshot(ref,opts,next,fail){const k=typeof ref==="object"?"votes":ref.endsWith("/players")?"players":"room";const a={k,ref,next,fail,off:false};m.subs.push(a);queueMicrotask(()=>{if(!a.off)m.send(a)});return ()=>{a.off=true}}'
 ].join('\n')
};
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,1280]){
   const ctx=await browser.newContext({viewport:{width,height:844}}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   await ctx.addInitScript(()=>{
    const players=Array.from({length:20},(_,i)=>({uid:'p'+i,name:'玩家'+i,emoji:'😎',joinedAt:i}));
    const m=window.__recoveryMock={players,writes:[],subs:[],votes:[],room:{hostUid:'p0',phase:'voting',roundIndex:0,totalRounds:6,seconds:45,questions:Array.from({length:6},(_,i)=>({q:'測試題 '+i,a:['A','B','C','D'],talk:'分享'})),scores:Object.fromEntries(players.map(p=>[p.uid,0])),streaks:{},usedDoubles:{},lastResult:null,deadline:Date.now()+60000,theme:'party'}};
    m.meta=cache=>({fromCache:cache,hasPendingWrites:false});
    m.roomSnap=(cache,missing=false)=>({metadata:m.meta(cache),exists:()=>!missing,data:()=>structuredClone(m.room)});
    m.listSnap=(arr,cache)=>({size:arr.length,metadata:m.meta(cache),docs:arr.map(v=>({id:v.uid,data:()=>structuredClone(v),metadata:m.meta(cache)}))});
    m.send=a=>{if(a.k==='room')a.next(m.roomSnap(false));else if(a.k==='players')a.next(m.listSnap(m.players,false));else a.next(m.listSnap(m.votes.filter(v=>v.roundIndex===a.ref.round),false));};
    m.live=k=>m.subs.filter(a=>a.k===k&&!a.off).at(-1);
   });
   await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===url)return r.continue();const key=u.pathname.split('/').at(-1);if(u.hostname==='www.gstatic.com'&&modules[key])return r.fulfill({status:200,contentType:'text/javascript',headers:{'Access-Control-Allow-Origin':'*'},body:modules[key]});return r.abort();});
   await page.goto(url+'/?room=ABC234',{waitUntil:'domcontentloaded'});
   await page.locator('[name="nickname"]').fill('測試玩家');
   await page.locator('[data-action="join"]').click();
   await page.waitForFunction(()=>document.getElementById('room-connection-status')?.textContent.includes('房間已同步'));
   const submit=async()=>{await page.locator('[data-choice="0"]').click();await page.locator('[data-guess="1"]').click();await page.locator('[data-action="submit"]').click();};
   await submit();
   await page.waitForFunction(()=>window.__recoveryMock.writes.length===1);
   await page.locator('.submitted').getByText('送達尚未確認',{exact:false}).waitFor({timeout:10000});
   assert.equal(await page.evaluate(()=>window.__recoveryMock.writes[0].ref),'rooms/ABC234/votes/p1_0');
   await page.evaluate(()=>{const m=window.__recoveryMock;m.live('room').next(m.roomSnap(true,true));});
   assert.match(await page.locator('.question-text').innerText(),/測試題 0/);
   await page.evaluate(()=>{const m=window.__recoveryMock;m.old=m.live('room');m.old.fail({code:'unavailable'});m.old.next(m.roomSnap(false,true));});
   await page.waitForFunction(()=>window.__recoveryMock.subs.filter(x=>x.k==='room').length===2);
   await page.waitForFunction(()=>document.getElementById('room-connection-status')?.textContent.includes('房間已同步'));
   assert.equal(await page.evaluate(()=>window.__recoveryMock.writes.length),1);
   await page.evaluate(()=>{const m=window.__recoveryMock;m.room.roundIndex=1;m.room.deadline=Date.now()+60000;m.send(m.live('room'));m.writes[0].resolve();});
   await page.locator('[data-choice="0"]').waitFor();
   assert.match(await page.locator('.question-text').innerText(),/測試題 1/);
   assert.equal(await page.locator('.submitted').count(),0);
   await submit();
   await page.waitForFunction(()=>window.__recoveryMock.writes.length===2);
   await page.evaluate(()=>{const m=window.__recoveryMock;m.votes.push(m.writes[1].payload);m.send(m.live('votes'));m.writes[1].reject({code:'unavailable'});});
   await page.locator('.submitted').getByText('答案已成功送達',{exact:false}).waitFor();
   assert.equal(await page.evaluate(()=>window.__recoveryMock.writes.length),2);
   assert.match(await page.locator('#vote-count').innerText(),/1\s*\/\s*20/);
   assert.deepEqual(errors,[]);
   console.log('PASS '+width+'px: lost ACK, cache miss, terminal watch recovery, stale ACK, authoritative confirmation, exactly two writes across rounds');
   await ctx.close();
  }
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
