'use strict';
// Quick-start question quality, variety, scenario matching and routing regression.
// Run: node tests/quick-host.cjs
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('app.js','utf8');
const first=source.slice(source.indexOf('  const QUESTIONS = ['),source.indexOf('  const BOT_NAMES = ['));
const shuffler=source.slice(source.indexOf('  function shuffle(xs)'),source.indexOf('  function sampleQuestions(n)'));
const functions=source.slice(source.indexOf('  function normalKey(q)'),source.indexOf('  function selectedQuestions(){'));
assert.ok(first.includes('ORIGINAL_QUESTION_META'),'Question tags missing');
assert.ok(functions.includes('function makeQuickQuestions'),'Quick picker missing');
const memory={};
const storage={
  getItem:(k)=>Object.prototype.hasOwnProperty.call(memory,k)?memory[k]:null,
  setItem:(k,v)=>{memory[k]=v}
};
const state={hostMode:'quick',quickScene:'general',quickQuestions:[]};
const library=Function('localStorage','state',first+shuffler+functions+
  '\nreturn {QUESTIONS,ORIGINAL_QUESTION_META,CURATED_EXTRA_QUESTIONS,QUICK_SCENES,QUICK_CATEGORIES,QUICK_SIZE,makeQuickQuestions,quickQuestionMeta,prepareQuickQuestions,saveQuickHistory,normalKey,questionClean};')(storage,state);
const {QUESTIONS,QUICK_SCENES,QUICK_CATEGORIES,normalKey,questionClean,quickQuestionMeta,makeQuickQuestions}=library;
let count=0;
function expect(value,label){count++;assert.ok(value,label)}
function eq(a,b,label){count++;assert.deepEqual(a,b,label)}
eq(QUESTIONS.length,100,'Built-in bank has exactly 100 questions');
eq(library.ORIGINAL_QUESTION_META.length,28,'Original 28 are preserved');
eq(library.CURATED_EXTRA_QUESTIONS.length,72,'72 new questions present');
eq(library.QUICK_SIZE,8,'Quick start always selects eight');
eq(QUICK_CATEGORIES.length,4,'All four categories in picker');
eq(Object.keys(QUICK_SCENES).length,7,'Six situations plus general');
let keys=new Set();
const distribution=Object.fromEntries(QUICK_CATEGORIES.map(c=>[c,0]));
for(let i=0;i<QUESTIONS.length;i++){
  const q=QUESTIONS[i];
  const cleaned=questionClean(q);
  eq(cleaned.a.length,4,'Each item has four choices (#'+i+')');
  expect(q.q.length<=120 && q.talk.length<=160,'Length cap (#'+i+')');
  expect(!keys.has(normalKey(q.q)),'No repeated questions (#'+i+')');
  keys.add(normalKey(q.q));
  const m=quickQuestionMeta(i);
  expect(Boolean(m),'Every question classified (#'+i+')');
  expect(QUICK_CATEGORIES.includes(m.category),'Known category (#'+i+')');
  expect(Array.isArray(m.scenes)&&m.scenes.length>0,'Activity tags (#'+i+')');
  expect(m.scenes.every(tag=>tag==='all'||QUICK_SCENES[tag]),'Valid activity tags (#'+i+')');
  distribution[m.category]++;
}
for(const key of QUICK_CATEGORIES)expect(distribution[key]>=20,'Category has enough variety: '+key);
let distributions=0;
for(const scene of Object.keys(QUICK_SCENES)){
  for(let n=0;n<35;n++){
    const selected=makeQuickQuestions(scene);
    eq(selected.length,8,'Eight questions for '+scene);
    expect(new Set(selected.map(q=>normalKey(q.q))).size===8,'No repeated questions within game: '+scene);
    const byCategory=Object.fromEntries(QUICK_CATEGORIES.map(category=>[category,0]));
    for(const q of selected){
      const index=QUESTIONS.findIndex(item=>normalKey(item.q)===normalKey(q.q));
      const meta=quickQuestionMeta(index);
      byCategory[meta.category]++;
      expect(meta.scenes.includes('all')||(scene!=='general'&&meta.scenes.includes(scene)),
        'Do not leak questions from another situation: '+scene+' / '+q.q);
    }
    eq(Object.values(byCategory),[2,2,2,2],'Balanced question types: '+scene);
    distributions++;
  }
}
const initial=library.prepareQuickQuestions(),again=library.prepareQuickQuestions();
eq(initial.map(q=>q.q),again.map(q=>q.q),'Preview remains the actual game order during rerenders');
library.saveQuickHistory(initial);
const newBatch=makeQuickQuestions('general');
eq(newBatch.filter(q=>initial.some(old=>old.q===q.q)).length,0,'No immediate repeated question on next run');
const oldBankModeSource=source.slice(source.indexOf('  function selectedQuestions(){'),source.indexOf('  function bankModeName()'));
expect(oldBankModeSource.includes("if(state.hostMode==='quick')return prepareQuickQuestions()"),
  'Quick start uses its own curated pool instead of private bank/Gemini');
expect(oldBankModeSource.includes("state.bankMode!=='mixed'"),'Advanced bank selection preserved');
expect(source.includes("data-action=\"choose-host-quick\""),'Quick entry visible');
expect(source.includes("data-action=\"choose-host-custom\""),'Original host mode entry visible');
expect(source.includes("data-action=\"quick-reshuffle\""),'Change question set available');
expect(source.includes("if(e.target.name==='quickScene'"),'Activity dropdown reselects questions');
expect(source.includes("state.page==='quick-host'?renderQuickHost()"),'Quick page routed');
expect(source.includes("state.page==='host'?renderHost()"),'Full old host page routed');
expect(source.includes("saveQuickHistory(preparedQuestions)"),'Recent games recorded only when opened');
expect(source.includes("🎤 主持小提醒"),'Novice host reminders during game');
expect(source.includes("內建精選 <span>"),'Full internal question bank visible in management');
expect(source.includes("quickMode:state.hostMode==='quick'"),'Quick mode saved into room for reconnecting host');
expect(!source.includes('經典 28 題，永久保留'),'Old 28-only label gone');
console.log('PASS: '+count+' assertions for 100 curated questions, '+distributions+' scenario-balanced games, quick/custom entry, recent-question protection.');
