'use strict';
// Accessibility regression checks for the game's three visual themes.
// Run: node tests/theme-contrast.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const ui = fs.readFileSync('ui-clarity.css','utf8');
const styles = fs.readFileSync('styles.css','utf8');
const panelStyles = fs.readFileSync('retro-mechanical.css','utf8');
const html = fs.readFileSync('index.html','utf8');
const app = fs.readFileSync('app.js','utf8');

function rgb(hex){
  const h=hex.replace('#','');
  assert.ok(/^[0-9a-f]{6}$/i.test(h),'Invalid hex: '+hex);
  return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);
}
function relativeLuminance(color){
  const v=color.map(x=>x<=.04045 ? x/12.92 : ((x+.055)/1.055)**2.4);
  return .2126*v[0]+.7152*v[1]+.0722*v[2];
}
function contrast(a,b){
  const x=relativeLuminance(a),y=relativeLuminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function hueColor(h,s,l){
  s/=100;l/=100;
  const a=s*Math.min(l,1-l);
  return [0,8,4].map(n=>{
    const k=(n+h/30)%12;
    return l-a*Math.max(-1,Math.min(k-3,9-k,1));
  });
}
const themes={
  party:{sampleBackgrounds:['#efff44','#f8f5ff','#fffdf6','#fffaf0']},
  panel:{sampleBackgrounds:['#ffdbab','#f3d29d','#d1bbaa','#eadfce']},
  minimal:{sampleBackgrounds:['#ffcabd','#f4f1ed','#f9f8f5','#f0f0e8']}
};
let checks=0;
function expect(ok,message){checks++;assert.ok(ok,message);}
for (const [theme,{sampleBackgrounds}] of Object.entries(themes)){
  const pattern=new RegExp('html\\[data-theme="'+theme+'"\\]\\s*\\{([^}]+)\\}');
  const found=ui.match(pattern);
  expect(Boolean(found),'Missing surface-ink tokens for '+theme);
  const val=found[1].match(/--ui-pale-strong:\s*(#[0-9a-f]{6})\s*;/i);
  expect(Boolean(val),'Missing strong text color for '+theme);
  for(const bg of sampleBackgrounds){
    expect(contrast(rgb(val[1]),rgb(bg))>=4.5,theme+' strong text fails 4.5:1 on '+bg);
  }
  for(const selector of ['.gemini-count-hint strong','.info-box strong','.prompt-details summary','.hero-controls b']){
    expect(ui.includes('html[data-theme="'+theme+'"] '+selector),'Missing explicit contrast rule '+theme+' '+selector);
  }
}
for(let hue=0;hue<360;hue++){
  // Minimal hue slider supports 0–359; guard worst case on its pastel accent.
  const ink=rgb('#263b40');
  expect(contrast(ink,hueColor(hue,62,81))>=4.5,'Minimal active hue '+hue+' is too pale for text');
}
expect(ui.includes('html[data-theme="party"] .prompt-details pre'),'Pixel theme prompt text needs a dark code panel');
expect(ui.includes('html[data-theme="minimal"] .prompt-details pre'),'Minimal theme prompt text needs a dark code panel');
expect(panelStyles.includes('html[data-theme="panel"] .prompt-details pre'),'Mechanical theme code panel must keep contrasting text');
expect(ui.includes('html[data-theme="minimal"] .bank-counter'),'Minimal bank counters need independent surface ink');
expect(styles.includes('html[data-theme="party"] .bank-list .bank-counter'),'Pixel bank counters must have a dark badge');
expect(html.indexOf('ui-clarity.css')>html.indexOf('retro-mechanical.css'),'Contrast overrides must load last');
expect(app.includes('首頁設定：<strong>'+String.fromCharCode(36)+'{state.rounds} 題</strong>｜Gemini'),'Question count must remain highlighted without detached punctuation');
console.log('PASS: '+checks+' accessibility contrast regression assertions across party, panel and minimal (360 adjustable hues).');
