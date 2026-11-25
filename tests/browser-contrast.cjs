'use strict';
// Browser-level contrast audit for the two light-card themes.
// This starts a local static server and uses demo mode: no production Firebase writes.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.gif':'image/gif'};
const server=http.createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end()}
  const relative=pathname==='/'?'index.html':pathname.replace(/^\/+/,'');
  const filepath=path.resolve(root,relative);
  if(!filepath.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  fs.readFile(filepath,(err,content)=>{
    if(err){res.writeHead(404);return res.end('Not found')}
    res.writeHead(200,{'Content-Type':mime[path.extname(filepath)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(content);
  });
});
async function main(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const results=[],browserErrors=[];
  try{
    for(const theme of ['party','minimal']){
      const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
      const page=await context.newPage();
      page.on('pageerror',e=>browserErrors.push(theme+': '+String(e)));
      await page.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
      await page.locator('.brand-title').waitFor();
      async function audit(screen,hue){
        if(hue!==undefined)await page.evaluate(h=>document.documentElement.style.setProperty('--m-hue',String(h)),hue);
        const report=await new AxeBuilder({page}).withRules(['color-contrast']).analyze();
        const violations=report.violations.filter(v=>v.id==='color-contrast');
        const failures=violations.flatMap(v=>v.nodes.map(n=>({
          target:n.target.join(' '),
          summary:(n.failureSummary||'').slice(0,220)
        })));
        results.push({theme,screen,hue,violations:failures});
        // Axe cannot resolve some gradients: explicitly check known on-surface
        // text when its containing background is CSS-gradient or transparent.
        const selectors=theme==='party'
          ?{reveal:['.score-highlight .eyebrow','.score-highlight .score-detail'],
             voting:['.host-vote-tools summary'],
             'reveal-expanded':['.quick-ranking .full-rank-toggle summary','.podium .fineprint']}
          :{home:['.landing-note'],
             voting:['.vote-tip','.host-vote-tools summary'],
             'reveal-expanded':['.quick-ranking .full-rank-toggle summary','.podium .fineprint'],
             reveal:['.score-highlight .eyebrow','.score-highlight .score-detail']};
        for(const selector of selectors[screen]||[]){
          const info=await page.locator(selector).first().evaluate(el=>{
            const cs=getComputedStyle(el);
            return {text:(el.textContent||'').trim().slice(0,30),color:cs.color,background:cs.backgroundColor};
          }).catch(()=>null);
          if(!info)browserErrors.push(theme+': '+screen+' missing '+selector);
        }
      }
      async function home(){await page.locator('[data-action="brand-home"]').first().click()}
      if(theme==='minimal'){
        await page.locator('[data-action="open-host"]').click();
        await page.locator('[data-action="choose-host-custom"]').click();
        await page.locator('[data-action="choose-theme"][data-theme-id="minimal"]').click();
        await home();
      }
      await audit('home');
      if(theme==='minimal'){
        await audit('home-blue',240);
        await audit('home-green',120);
      }
      await page.locator('[data-action="open-join"]').click();
      await audit('join');
      await home();
      await page.locator('[data-action="open-host"]').click();
      await audit('host-choice');
      await page.locator('[data-action="choose-host-quick"]').click();
      await audit('quick-host');
      await page.locator('[data-action="host-choice-back"]').click();
      await page.locator('[data-action="choose-host-custom"]').click();
      await audit('host-custom');
      await page.locator('[data-action="manage"]').click();
      await audit('manager-custom');
      await page.locator('[data-action="bank-tab"][data-tab="ai"]').click();
      await audit('manager-gemini');
      await page.locator('[data-action="bank-tab"][data-tab="classic"]').click();
      await audit('manager-classic');
      await page.locator('[data-action="manager-back"]').click();
      // Verify error messages too, before entering demo mode.
      await page.locator('[data-action="demo"]').click();
      await audit('host-error');
      await page.locator('[name="nickname"]').fill('對比測試主持');
      await page.locator('[data-action="demo"]').click();
      await audit('lobby');
      await page.locator('[data-action="start"]').click();
      await audit('voting');
      await page.locator('[data-choice="0"]').click();
      await audit('guess');
      await page.locator('[data-guess="1"]').click();
      await page.locator('[data-action="submit"]').click();
      await audit('submitted');
      const room=await page.evaluate(()=>window.__GAME_TEST__?.getRoom());
      if(!room||!room.totalRounds)throw new Error('Demo room missing in '+theme);
      for(let round=0;round<room.totalRounds;round++){
        await page.locator('.host-vote-tools summary').click();
        await page.locator('[data-action="reveal"]').click();
        if(round===0){
          await audit('reveal');
          await page.locator('.full-rank-toggle summary').click();
          await audit('reveal-expanded');
          if(theme==='minimal')await audit('reveal-expanded-blue',240);
        }
        await page.locator('[data-action="next"]').click();
      }
      await audit('finished');
      await context.close();
    }
  }finally{
    await browser.close();await new Promise(resolve=>server.close(resolve));
  }
  let count=0;
  for(const r of results){
    count++;
    for(const v of r.violations){
      console.error('FAIL contrast '+r.theme+'/'+r.screen+(r.hue===undefined?'':' hue '+r.hue)+' '+v.target+' '+v.summary);
    }
  }
  for(const error of browserErrors)console.error('FAIL browser: '+error);
  const violations=results.reduce((n,r)=>n+r.violations.length,0);
  if(violations||browserErrors.length)throw new Error(violations+' contrast failures, '+browserErrors.length+' browser issues on '+count+' screens');
  console.log('PASS: '+count+' rendered mobile screens for pixel/minimal with automated WCAG AA text-contrast audit.');
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
