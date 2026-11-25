'use strict';
// Real rendered UI with controlled SDK stubs; no actual Firebase requests.
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));
 if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(p,(e,data)=>{if(e){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});
const modules={
 'firebase-app.js':"export function getApps(){return []} export function initializeApp(){return {}}",
 'firebase-app-check.js':"export class ReCaptchaEnterpriseProvider{} export function initializeAppCheck(){window.__hostMock.events.push('appcheck-init');return {}} export async function getToken(){const m=window.__hostMock;m.events.push('appcheck-start');await m.token.promise;m.events.push('appcheck-done');return {token:'test'}}",
 'firebase-auth.js':"const auth={currentUser:null};export function getAuth(){window.__hostMock.events.push('auth');return auth} export function onAuthStateChanged(a,cb){queueMicrotask(cb);return ()=>{}} export async function signInAnonymously(a){window.__hostMock.events.push('signin');a.currentUser={uid:'test-host'};return {user:a.currentUser}}",
 'firebase-firestore.js':"export function getFirestore(){return {}} export function doc(db,...parts){return parts.join('/')} export function collection(db,...parts){return parts.join('/')} export async function getDocFromServer(ref){window.__hostMock.events.push('code-read');return {exists:()=>false}} export async function setDoc(ref,data){const m=window.__hostMock;const player=ref.includes('/players/');m.events.push(player?'host-write':'room-write');if(m.failRoom&&!player)throw Object.assign(Error('mock denial'),{code:'permission-denied'});await (player?m.host:m.room).promise;m.events.push(player?'host-ack':'room-ack')} export function onSnapshot(){return ()=>{}}"
};
function luminance(rgb){const v=rgb.match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];}
function contrast(f,b){const x=luminance(f),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let passed=0;
 try{
  for(const width of [320,390,1280]){
   const ctx=await browser.newContext({viewport:{width,height:844}}),page=await ctx.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   await ctx.addInitScript(()=>{const gate=()=>{let resolve;const promise=new Promise(r=>{resolve=r});return {promise,resolve}};window.__hostMock={events:[],token:gate(),room:gate(),host:gate(),failRoom:false};});
   await ctx.route('**/*',route=>{
    const u=new URL(route.request().url());
    if(u.origin===url)return route.continue();
    const key=u.pathname.split('/').at(-1);
    if(u.hostname==='www.gstatic.com'&&modules[key])return route.fulfill({status:200,contentType:'text/javascript',headers:{'Access-Control-Allow-Origin':'*'},body:modules[key]});
    return route.abort();
   });
   const events=()=>page.evaluate(()=>window.__hostMock.events.slice());
   const resolve=k=>page.evaluate(k=>{window.__hostMock[k].resolve()},k);
   const waitEvent=e=>page.waitForFunction(e=>window.__hostMock.events.includes(e),e);
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.locator('[data-action="open-host"]').click();await waitEvent('appcheck-start');
   assert.deepEqual(await events(),['appcheck-init','appcheck-start'],'preparation before explicit create; no auth or Firestore');
   await page.locator('[data-action="'+(width===390?'choose-host-quick':'choose-host-custom')+'"]').click();
   await page.locator('[name="nickname"]').fill('測試主持');
   await page.locator('[data-action="host"]').click();
   const stage=page.locator('.host-create-stage'),code=page.locator('.code-digits');
   assert.match(await stage.innerText(),/安全驗證/);assert.equal(await code.count(),0);
   assert.equal(await page.locator('[data-action="host"]').isDisabled(),true);
   assert.equal(await page.locator('[name="nickname"]').isDisabled(),true);
   await resolve('token');await waitEvent('room-write');
   assert.match(await stage.innerText(),/房間建立/);assert.equal(await code.count(),0);
   await resolve('room');await waitEvent('host-write');
   assert.match(await stage.innerText(),/主持人加入/);assert.equal(await code.count(),0);
   await resolve('host');await code.waitFor();
   assert.match(await code.innerText(),/^[A-HJ-NP-Z2-9]{6}$/);
   assert.equal(await page.locator('.host-create-progress').count(),0);
   assert.deepEqual(await events(),['appcheck-init','appcheck-start','appcheck-done','auth','signin','code-read','room-write','room-ack','host-write','host-ack']);
   for(const sel of ['.code-digits','.lobby-code .eyebrow','.header-room-status .status-tag']){
    const style=await page.locator(sel).evaluate(el=>{const c=getComputedStyle(el),b=el.getBoundingClientRect();return {color:c.color,bg:c.backgroundColor,left:b.left,right:b.right,scroll:el.scrollWidth,client:el.clientWidth,viewport:window.innerWidth}});
    assert.ok(contrast(style.color,style.bg)>=7,'AAA contrast '+sel+' '+JSON.stringify(style));
    assert.ok(style.left>=0&&style.right<=style.viewport+1,'no viewport overflow '+sel);
    assert.ok(style.scroll<=style.client+1,'no clipped code '+sel);
   }
   assert.deepEqual(errors,[]);
   console.log('PASS '+width+'px: warm preparation, two server acknowledgements, room-code AAA contrast; no Firebase network');passed++;
   await ctx.close();
  }
  // Failure is not success: a rejected write must not expose a room code.
  const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage();
  await ctx.addInitScript(()=>{window.__hostMock={events:[],token:{promise:Promise.resolve()},room:{promise:Promise.resolve()},host:{promise:Promise.resolve()},failRoom:true};});
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===url)return r.continue();const key=u.pathname.split('/').at(-1);if(u.hostname==='www.gstatic.com'&&modules[key])return r.fulfill({status:200,contentType:'text/javascript',headers:{'Access-Control-Allow-Origin':'*'},body:modules[key]});return r.abort();});
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="open-host"]').click();await page.locator('[data-action="choose-host-custom"]').click();await page.locator('[name="nickname"]').fill('測試主持');
  await page.locator('[data-action="host"]').click();await page.locator('.notice[role="alert"]').waitFor();
  assert.equal(await page.locator('.code-digits').count(),0);assert.equal(await page.locator('[data-action="host"]').isDisabled(),false);
  assert.equal(await page.locator('[name="nickname"]').isDisabled(),false);
  assert.ok(!(await page.evaluate(()=>window.__hostMock.events)).includes('host-write'));
  await page.evaluate(()=>{window.__hostMock.failRoom=false});await page.locator('[data-action="host"]').click();await page.locator('.code-digits').waitFor();
  assert.equal(await page.evaluate(()=>window.__hostMock.events.filter(x=>x==='signin').length),1);
  await ctx.close();passed++;console.log('PASS denied room write never displays code; explicit retry succeeds without another sign-in');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
 console.log('PASS: '+passed+' mocked online host browser scenarios; no real cloud latency claims.');
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
