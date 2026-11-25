'use strict';
// Cross-device emoji smoke test; demo mode only, no production Firebase writes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end();}
  const file=path.resolve(root,pathname==='/'?'index.html':pathname.replace(/^\/+/,''));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(error,bytes)=>{
    if(error){res.writeHead(404);return res.end('Not found');}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
  });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  let screens=0;
  try{
    for(const viewport of [{width:1366,height:900},{width:390,height:844}]){
      for(const theme of ['party','panel','minimal']){
        const context=await browser.newContext({viewport});
        const page=await context.newPage(),errors=[];
        page.on('pageerror',err=>errors.push(String(err)));
        await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
        await page.locator('.brand-title').waitFor();
        const verify=async(screen,selector)=>{
          // Read glyph count and CSS atomically from a stable container:
          // the 1-second timer can replace its child bdi between two queries.
          const sample=await page.locator(selector).first().evaluate(root=>{
            const glyphs=root.querySelectorAll('bdi.emoji-glyph');
            return {count:glyphs.length,family:glyphs.length?getComputedStyle(glyphs[0]).fontFamily:''};
          });
          assert.ok(sample.count>=1,theme+'/'+viewport.width+'/'+screen+': no emoji in '+selector);
          const family=sample.family;
          assert.match(family,/Segoe UI Emoji/,'Explicit Windows emoji font required');
          assert.match(family,/Apple Color Emoji/,'Apple emoji font required');
          assert.equal(await page.locator('.brand-mark bdi.emoji-glyph').count(),0,'Logo ornament must preserve its font');
          screens++;
        };
        await verify('home','.grid-hero');
        await page.locator('[data-action="open-host"]').click();
        await page.locator('[data-action="choose-host-custom"]').click();
        await page.locator('[data-action="choose-theme"][data-theme-id="'+theme+'"]').click();
        await verify('host','.entry-heading');
        await page.locator('[data-action="manage"]').click();
        await verify('question bank','.manager-heading');
        await page.locator('[data-action="manager-back"]').click();
        await page.locator('[name="nickname"]').fill('跨平台符號測試');
        await page.locator('[data-action="demo"]').click();
        await verify('lobby','.avatars');
        assert.equal(await page.locator('.avatar-pill').count(),13,'Twelve demo guests plus the host are unchanged');
        await page.locator('[data-action="start"]').click();
        await verify('vote count','#vote-count');
        await verify('timer','#timer');
        const timerBefore=await page.locator('#timer').getAttribute('aria-label');
        // setInterval is not aligned with the round start. Wait for the
        // actual countdown change rather than assuming a fixed 1.35 s delay.
        await page.waitForFunction(before=>document.getElementById('timer')?.getAttribute('aria-label')!==before,timerBefore,{timeout:5000});
        await verify('live timer','#timer');
        const duplicates=await page.evaluate(()=>{
          const root=document.getElementById('app');
          const count=root.querySelectorAll('bdi.emoji-glyph').length;
          window.MOQI_EMOJI_COMPAT.decorate(root);
          return root.querySelectorAll('bdi.emoji-glyph').length-count;
        });
        assert.equal(duplicates,0,'Emoji decorator must be idempotent');
        assert.deepEqual(errors,[],'No JS errors on '+theme+'/'+viewport.width);
        await context.close();
      }
    }
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
  console.log('PASS: '+screens+' desktop/mobile glyph checks across all themes; live timer and event interactions preserved.');
})().catch(err=>{console.error(err);server.close();process.exitCode=1;});
