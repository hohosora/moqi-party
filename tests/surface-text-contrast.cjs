'use strict';
// Contrast audit for actual text surfaces used by the game's Pixel / Minimal themes.
// Run: node tests/surface-text-contrast.cjs
const fs=require('node:fs');
const assert=require('node:assert/strict');
const ui=fs.readFileSync('ui-clarity.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('app.js','utf8');
const css=ui.slice(ui.indexOf('/* v10 | Across-screen text contrast audit'));
let checks=0;
function expect(ok,msg){checks++;assert.ok(ok,msg);}
function rgb(hex){
  const h=hex.replace('#','');
  expect(/^[0-9a-f]{6}$/i.test(h),'Invalid audit palette '+hex);
  return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);
}
function hueColor(h,s,l){
  s/=100;l/=100;const a=s*Math.min(l,1-l);
  return [0,8,4].map(n=>{
    const k=(n+h/30)%12;
    return l-a*Math.max(-1,Math.min(k-3,9-k,1));
  });
}
function luminance(color){
  const p=color.map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  return .2126*p[0]+.7152*p[1]+.0722*p[2];
}
function contrast(a,b){
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function atLeast(foreground,background,min,label){
  expect(contrast(rgb(foreground),rgb(background))>=min,
    label+' must reach '+min+':1: '+foreground+' on '+background);
}
function scope(theme,selector){
  const full='html[data-theme="'+theme+'"] '+selector;
  expect(css.includes(full),'Missing on-surface rule: '+full);
}
expect(css.length>4000,'Missing v10 comprehensive contrast section');
expect(!css.includes('data-theme="panel"'),'Unchanged mechanical style remains untouched by this patch');
expect(html.includes('ui-clarity.css')&&html.indexOf('ui-clarity.css')>html.indexOf('retro-mechanical.css'),
  'Contrast overrides must load last');
const selectors={
  party:[
    '.score-highlight','.score-highlight .eyebrow','.score-highlight .score-detail',
    '.quick-ranking .full-rank-toggle','.quick-ranking .full-rank-toggle > summary',
    '.quick-ranking .full-rank-toggle .rank-index',
    '.leader-top .podium .fineprint','.leader-top .podium .name',
    '.rank-list .rank-index','.host-vote-tools > summary',
    '.host-vote-tools .fineprint','.how-to-play li',
    '.card .mint-text','.card .accent-text','.host-mode-footnote',
    '.quick-host-card .fineprint','.quick-host-card .field span'
  ],
  minimal:[
    '.landing-note','.muted','.fineprint','.vote-tip','.look-up-note',
    '.host-vote-tools > summary','.host-vote-tools .fineprint',
    '.quick-ranking .full-rank-toggle','.quick-ranking .full-rank-toggle > summary',
    '.leader-top .podium .fineprint','.rank-list .rank-index',
    '.score-highlight .score-detail','.mint-text','.accent-text',
    '.notice','.field input::placeholder','.field textarea::placeholder',
    '.score-highlight .eyebrow','.score-highlight .score-big',
    '.quick-ranking .quick-rank-line b','.quick-host-card .fineprint',
    '.quick-host-card .field span'
  ]
};
for(const [theme,items] of Object.entries(selectors)){
  for(const selector of items)scope(theme,selector);
}
// Fixed backgrounds on game views: AA at 4.5:1 for standard-size copy.
for(const [ink,background,name] of [
  ['#291934','#ffffff','Pixel points and details'],
  ['#291934','#f8f5ff','Pixel breakdown'],
  ['#271b31','#ffffff','Pixel rank and podium'],
  ['#211b27','#f8f5ff','Pixel host helper'],
  ['#381273','#fffdf7','Pixel highlighted text on pale cards'],
  ['#f8f5ff','#3d009a','Pixel home hosting note'],
  ['#30393c','#f4f1ed','Minimal explanatory copy'],
  ['#252f32','#f4f1ed','Minimal leaderboard and result'],
  ['#25373b','#f4f1ed','Minimal accented copy'],
  ['#732421','#ffede9','Minimal alert and error'],
  ['#30393c','#efede9','Minimal placeholder'],
  ['#253034','#f4f1ed','Minimal score text']
])atLeast(ink,background,4.5,name);
for(const [ink,specs,name] of [
  ['#30393c',[[49,77],[57,84],[51,77],[62,81],[60,91]],'Minimal body/help'],
  ['#252f32',[[49,77],[57,87],[51,77],[62,81]],'Minimal rank/reveal'],
  ['#25373b',[[49,77],[57,87],[62,81]],'Minimal underlined/accent'],
  ['#253034',[[62,81],[57,87]],'Minimal score'],
  ['#30393c',[[51,77]],'Minimal placeholder']
]){
  for(const [s,l] of specs)for(let hue=0;hue<360;hue++){
    expect(contrast(rgb(ink),hueColor(hue,s,l))>=4.5,
      name+' fails contrast at hue '+hue+', saturation '+s+', lightness '+l);
  }
}
// Verify all audit surfaces correspond to real UI, not inert CSS-only selectors.
for(const className of [
  'score-highlight','score-detail','full-rank-toggle','host-vote-tools',
  'how-to-play','landing-note','vote-tip','look-up-note','podium',
  'rank-index','quick-ranking','score-big','mint-text','accent-text',
  'host-mode-footnote','quick-host-card','notice'
]){
  expect(app.includes(className),'Missing actual game/UI surface: '+className);
}
expect(ui.includes('/* v9 | Score legibility:'),
  'Existing score palette protection must remain in place');
console.log('PASS: '+checks+' full-text contrast checks for Pixel/Minimal across all 360 minimal color hues, with mechanical style unchanged.');
