'use strict';
// No Firebase networking: verify untrusted output and secure invite identifiers.
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const key=fs.readFileSync('app-check-config.js','utf8');
let checks=0;
const ok=(v,n)=>{checks++;assert.ok(v,n)};
const extract=name=>{
  const m=src.match(new RegExp('function '+name+'\\([^)]*\\)\\{[^}]*\\}'));
  ok(m,'Function '+name+' present');return new Function('return ('+m[0]+')')();
};
const score=extract('safeScore'),votes=extract('safeVoteCount');
for(const x of [0,1,19,100,440,1000000])ok(score(x)===x,'Valid score '+x);
for(const x of [-1,1000001,NaN,Infinity,-Infinity,1.5,'0','45','<img src=x onerror=alert(1)>',null,undefined,{},[],true,1n])
  ok(score(x)===0,'Reject invalid score '+String(x));
for(const x of [0,1,20])ok(votes(x)===x,'Valid vote count '+x);
for(const x of [-1,21,100,'4','<img src=x onerror=alert(1)>',null,undefined,NaN,1.4,{},[]])
  ok(votes(x)===0,'Reject invalid vote count '+String(x));
for(const bad of ['${map[p.uid]||0}','${scores[p.uid]||0}','${g.guess||0}','${g.rare||0}','${g.streakBonus||0}','${state.room.scores?.[winner?.uid]||0}'])
  ok(!src.includes(bad),'Unsafe HTML interpolation '+bad);
for(const good of ['${safeScore(map[p.uid])}','${safeScore(scores[p.uid])}','${safeScore(g.guess)}','${safeScore(g.rare)}','${safeScore(g.streakBonus)}','${safeScore(state.room.scores?.[winner?.uid])}','raw.counts.map(safeVoteCount)'])
  ok(src.includes(good),'Missing sanitized render '+good);
ok(src.includes('function evaluateRound(room, players, votes)'),'Retain scoring algorithm');
const match=src.match(/function randomCode\(\)\{[\s\S]*?\n  \}/);
ok(Boolean(match),'CSPRNG code function');
ok(!/Math\.random\s*\(/.test(match[0].replace(/\/\/[^\n]*/g,'')),'No insecure PRNG call');
const create=crypto=>new Function('globalThis',match[0]+';return randomCode;')({crypto});
for(const [b,ch] of [[0,'A'],[8,'J'],[31,'9']])ok(create({getRandomValues:bytes=>bytes.fill(b)})()===ch.repeat(6),'Alphabet map '+b);
const sample=create({getRandomValues:bytes=>{for(let i=0;i<bytes.length;i++)bytes[i]=(i*53+15)&255;}})();
ok(/^[A-HJ-NP-Z2-9]{6}$/.test(sample),'Room ID format');
ok((()=>{try{create(undefined)();return false}catch(e){return e.message.includes('HTTPS')}})(),'Secure entropy required');
ok(html.indexOf('firebase-config.js')<html.indexOf('app-check-config.js'),'Config order');
ok(html.indexOf('app-check-config.js')<html.indexOf('app.js?'),'Runtime order');
// Production now uses a registered PUBLIC reCAPTCHA Enterprise web site key.
const registered=key.match(/window\.GAME_APP_CHECK_SITE_KEY\s*=\s*'([A-Za-z0-9_-]+)'/);
ok(Boolean(registered),'App Check public site key must be configured');
ok(registered[1].length===40,'Expected a 40-character reCAPTCHA Enterprise site key');
ok(!/\b(secretKey|privateKey|debugToken)\s*=/.test(key),'Never put server credentials in the public web key config');
ok(src.includes("console.warn('Firebase App Check 驗證未完成"),'Attestation failure should remain visible in console');
ok(!src.includes("throw new Error('網站安全驗證暫時無法完成"),'Observe-only phase must not block gameplay');

ok(src.includes("const siteKey=String(window.GAME_APP_CHECK_SITE_KEY||'').trim()"),'Opt-in site key');
ok(src.indexOf('initializeAppCheck(app,')<src.indexOf('const auth=authLib.getAuth(app)'),'App Check before Auth');
ok(src.includes('ReCaptchaEnterpriseProvider(siteKey)'),'Enterprise provider');
ok(src.includes('await appCheckLib.getToken(appCheck)'),'Attestation before use');
ok(src.includes('isTokenAutoRefreshEnabled:true'),'Automatic token refresh');
console.log('PASS: '+checks+' client security and optional App Check regression assertions.');
