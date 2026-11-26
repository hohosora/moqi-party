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
    await ctx.route('**/*',route=>new URL(route.request().url()).origin===url?route.continue():route.abort());
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('[data-action="open-host"]').click();
    await page.locator('[data-action="choose-host-custom"]').click();
    await page.locator('[data-action="choose-theme"][data-theme-id="'+theme+'"]').click();
    assert.equal(await page.locator('[data-action="demo"]').count(),0);
    await page.locator('[name="rounds"]').selectOption('6');
    await page.locator('[name="seconds"]').selectOption('15');
    await page.locator('[name="bankMode"]').selectOption('custom');
    await page.locator('[data-action="open-home"]').click();
    await page.locator('[data-action="demo"]').click();
    const demo=await page.evaluate(()=>window.__GAME_TEST__.getRoom());
    assert.equal(demo.totalRounds,8);assert.equal(demo.seconds,30);
    assert.equal(demo.questions.length,8);assert.equal(demo.theme,theme);
    assert.equal(await page.evaluate(()=>localStorage.getItem('mqs_name')),null);
    await page.locator('[data-action="leave"]').click();
    await page.locator('[data-action="open-host"]').click();
    await page.locator('[data-action="choose-host-custom"]').click();
    assert.equal(await page.locator('[name="rounds"]').inputValue(),'6');
    assert.equal(await page.locator('[name="seconds"]').inputValue(),'15');
    assert.equal(await page.locator('[name="bankMode"]').inputValue(),'custom');
    await page.locator('[data-action="open-home"]').click();
    await page.locator('[data-action="demo"]').click();
    await page.locator('[data-action="start"]').click();
    await page.locator('[data-choice="0"]').click();
    await page.locator('[data-guess="1"]').click();
    await page.locator('[data-action="submit"]').click();
    await page.locator('.host-vote-tools summary').click();
    await page.locator('[data-action="reveal"]').click();
    await page.locator('[data-action="next"]').click();
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
