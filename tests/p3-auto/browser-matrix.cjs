'use strict';
// Local demo, no Firebase network. Browser/device emulation, not real devices.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,firefox,webkit,devices}=require('playwright');
const root=path.resolve(__dirname,'..','..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));
 if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(p,(e,data)=>{if(e){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const scenarios=[
  [chromium,'Chromium desktop',{viewport:{width:1440,height:900}}],
  [chromium,'Chromium Android',devices['Pixel 7']],
  [webkit,'WebKit iPhone',devices['iPhone 13']],
  [firefox,'Firefox narrow',{viewport:{width:375,height:812}}]
 ];let count=0;
 try{
  for(const [engine,label,opts] of scenarios){
   const browser=await engine.launch({headless:true});
   try{for(const theme of ['party','panel','minimal']){
    const ctx=await browser.newContext(opts);const page=await ctx.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    let firebaseRequests=0;
    await ctx.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===url)return route.continue();if(u.hostname==='www.gstatic.com'&&u.pathname.includes('/firebasejs/'))firebaseRequests++;return route.abort();});
    await page.goto(url,{waitUntil:'domcontentloaded'});
    // Fresh visitor: never visit the host form before learning.
    const entry=page.locator('[data-action="demo"]');
    assert.match(await entry.innerText(),/新手教學模式/);
    await entry.focus();await entry.press('Enter');
    assert.equal(await page.locator('[data-tutorial-step="welcome"]').count(),1);
    assert.equal(await page.locator('.avatar-pill .host-badge').count(),1,'Only self tag, not host badge');
    assert.equal(await page.evaluate(()=>window.__GAME_TEST__.getRoom().hostUid),'demo-system');
    const fits=await page.locator('.tutorial-guide').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&el.scrollWidth<=el.clientWidth+1;});
    assert.ok(fits,'Tutorial guide fits the viewport');
    await page.locator('[data-action="tutorial-skip-all"]').press('Enter');
    assert.equal(await page.locator('.tutorial-guide').count(),0);
    assert.match(await page.locator('#timer').getAttribute('aria-label'),/倒數計時/);
    await page.locator('[data-action="tutorial-help"]').click();
    assert.equal(await page.locator('[data-tutorial-step="choice"]').count(),1);
    assert.equal(await page.locator('#timer').getAttribute('aria-label'),'教學暫停');
    assert.equal(firebaseRequests,0,'Fresh tutorial cannot load Firebase SDK');
    page.once('dialog',d=>d.accept());
    await page.locator('[data-action="tutorial-exit"]').click();
    await page.locator('[data-action="open-host"]').click();
    await page.locator('[data-action="choose-host-custom"]').click();
    await page.locator('[data-action="choose-theme"][data-theme-id="'+theme+'"]').click();
    assert.equal(await page.locator('[data-action="demo"]').count(),0);
    await page.locator('[name="rounds"]').selectOption('6');
    assert.deepEqual(await page.locator('[name="seconds"] option').evaluateAll(es=>es.map(e=>e.value)),['30','45','60']);
    assert.equal(await page.locator('[name="seconds"]').inputValue(),'45');
    for(const seconds of ['30','45','60']){await page.locator('[name="seconds"]').selectOption(seconds);assert.equal(await page.locator('[name="seconds"]').inputValue(),seconds);}
    await page.locator('[name="bankMode"]').selectOption('custom');
    await page.locator('[data-action="open-home"]').click();
    await page.locator('[data-action="demo"]').click();
    const demo=await page.evaluate(()=>window.__GAME_TEST__.getRoom());
    assert.equal(demo.totalRounds,3);assert.equal(demo.seconds,20);
    assert.equal(demo.questions.length,3);assert.equal(demo.theme,theme);assert.equal(demo.hostUid,'demo-system');
    assert.equal(await page.locator('[data-action="start"],.host-vote-tools,[data-action="choose-theme"]').count(),0);
    assert.equal(await page.evaluate(()=>localStorage.getItem('mqs_name')),null);
    page.once('dialog',d=>d.accept());
    await page.locator('[data-action="tutorial-exit"]').click();
    await page.locator('[data-action="open-host"]').click();
    await page.locator('[data-action="choose-host-custom"]').click();
    assert.equal(await page.locator('[name="rounds"]').inputValue(),'6');
    assert.equal(await page.locator('[name="seconds"]').inputValue(),'60');
    assert.equal(await page.locator('[name="bankMode"]').inputValue(),'custom');
    await page.locator('[data-action="open-home"]').click();
    await page.locator('[data-action="open-host"]').click();
    await page.locator('[data-action="choose-host-quick"]').click();
    assert.deepEqual(await page.locator('[name="seconds"] option').evaluateAll(es=>es.map(e=>e.value)),['30','45','60']);
    assert.equal(await page.locator('[name="seconds"]').inputValue(),'45');
    await page.locator('[name="seconds"]').selectOption('60');
    assert.match(await page.locator('.quick-host-summary').innerText(),/每題 60 秒/);
    await page.locator('[data-action="host-choice-back"]').click();
    await page.locator('[data-action="choose-host-custom"]').click();
    await page.locator('[data-action="open-home"]').click();
    await page.locator('[data-action="demo"]').click();
    await page.locator('[data-action="tutorial-continue"]').click();
    assert.equal(await page.locator('[data-tutorial-step="choice"]').count(),1);
    assert.equal(await page.locator('.tutorial-focus').count(),1);
    const deadline=await page.evaluate(()=>window.__GAME_TEST__.getRoom().deadline);
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('#timer').getAttribute('aria-label'),'教學暫停');
    assert.equal(await page.evaluate(()=>window.__GAME_TEST__.getRoom().deadline),deadline);
    assert.equal(await page.locator('.host-vote-tools,[data-action="reveal"]').count(),0);
    await page.locator('[data-action="tutorial-skip-step"]').click();
    await page.locator('[data-choice="0"]').click();
    assert.equal(await page.locator('[data-tutorial-step="guess"]').count(),1);
    await page.locator('[data-guess="1"]').click();
    assert.equal(await page.locator('[data-tutorial-step="double"]').count(),1);
    await page.locator('[data-action="tutorial-continue"]').click();
    assert.equal(await page.locator('[data-tutorial-step="submit"]').count(),1);
    await page.locator('[data-action="submit"]').click();
    assert.equal(await page.locator('[data-tutorial-step="wait"]').count(),1);
    await page.locator('[data-action="tutorial-continue"]').click();
    await page.locator('[data-tutorial-step="result"]').waitFor({timeout:25000});
    assert.equal(await page.locator('[data-action="next"]').count(),0);
    await page.locator('[data-action="tutorial-continue"]').click();
    assert.equal(await page.evaluate(()=>window.__GAME_TEST__.getRoom().roundIndex),1);
    await page.locator('[data-action="tutorial-help"]').click();
    assert.equal(await page.locator('[data-tutorial-step="choice"]').count(),1);
    await page.locator('[data-action="tutorial-skip-all"]').click();
    assert.equal(await page.locator('.tutorial-guide').count(),0);
    assert.equal(await page.locator('[data-action="tutorial-help"]').count(),1);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.brand-title').waitFor();
    assert.equal(await page.evaluate(()=>Boolean(window.__MOQI_CONNECTION_DIAGNOSTICS__)),false);
    assert.deepEqual(errors,[]);
    console.log('PASS '+label+' / '+theme+' demo vote, reveal, reload');count++;
    await ctx.close();
   }}finally{await browser.close();}
  }
 }finally{await new Promise(r=>server.close(r));}
 console.log('PASS: '+count+' browser/theme scenarios, no external network');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
