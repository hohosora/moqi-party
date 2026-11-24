'use strict';
// Regression tests for 默契失控局: self-choice decides poll counts,
// but only the predicted hottest / least-popular nonzero option scores.
// Run: node tests/scoring-rules.cjs
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('app.js','utf8');
const start=source.indexOf('  function evaluateRound(room, players, votes){');
const end=source.indexOf('  function simulateBots(',start);
assert.ok(start>=0&&end>start,'Cannot locate production evaluateRound');
const evaluateRound=Function(source.slice(start,end)+'\nreturn evaluateRound;')();

let count=0;
function eq(actual,expected,message){count++;assert.deepEqual(actual,expected,message);}
function yes(value,message){count++;assert.ok(value,message);}
function makeBallots(counts,guess,{double=false,streak=0,used=false,swapWith=null,priorScore=0}={}){
  const votes=[];
  counts.forEach((n,option)=>{
    for(let i=0;i<n;i++)votes.push({uid:'p'+votes.length,roundIndex:0,choice:option,guess:0,double:false});
  });
  if(votes.length){
    votes[0].guess=guess;
    votes[0].double=double;
    if(Number.isInteger(swapWith)&&swapWith>0&&swapWith<votes.length){
      const choice=votes[0].choice;
      votes[0].choice=votes[swapWith].choice;
      votes[swapWith].choice=choice;
    }
  }
  return {
    players:votes.map(v=>({uid:v.uid})),
    votes,
    room:{scores:priorScore?{p0:priorScore}:{},streaks:streak?{p0:streak}:{},usedDoubles:used?{p0:true}:{}}
  };
}
function run(counts,guess,options={}){
  const inputs=makeBallots(counts,guess,options);
  const result=evaluateRound(inputs.room,inputs.players,inputs.votes);
  return {result,gain:result.lastResult.gains.p0};
}
let a=run([9,6,4,1],0);
eq(a.result.lastResult.top,[0],'one hottest');
eq(a.result.lastResult.cold,[3],'one coldest');
eq(a.gain.total,100,'correct hot = 100');
eq(a.gain.predictionType,'hot','hot classification');
eq(run([9,6,4,1],3).gain.total,40,'correct cold = 40');
eq(run([9,6,4,1],1).gain.total,0,'middle B = 0');
eq(run([9,6,4,1],2).gain.total,0,'middle C = 0');
eq(run([10,7,3,0],3).gain.total,0,'zero-vote option cannot score');
eq(run([10,7,3,0],2).gain.total,40,'smallest positive vote earns cold');
eq(run([7,7,2,2],0).gain.total,100,'first tied hottest');
eq(run([7,7,2,2],1).gain.total,100,'second tied hottest');
eq(run([7,7,2,2],2).gain.total,40,'first tied coldest');
eq(run([7,7,2,2],3).gain.total,40,'second tied coldest');
eq(run([7,7,2,2],0).result.lastResult.cold,[2,3],'both cold options');
eq(run([2,2,2,2],3).gain.total,100,'all ties count only hot');
eq(run([2,2,2,2],0).result.lastResult.cold,[],'all ties have no cold');
eq(run([8,0,0,0],0).gain.total,100,'only voted option is hot');
eq(run([8,0,0,0],1).gain.total,0,'no cold if only one option received votes');
eq(run([1,1,0,0],0).result.lastResult.cold,[],'all positive options tied, no cold');
eq(run([2,1,1,0],2).gain.total,40,'two cold options tie');
eq(run([2,1,1,0],3).gain.total,0,'zero votes excluded even in tie scenario');
eq(run([9,6,4,1],0,{double:true}).gain.total,200,'double hot = 200');
eq(run([9,6,4,1],3,{double:true}).gain.total,80,'double cold = 80');
a=run([9,6,4,1],0,{double:true,streak:1});
eq(a.gain.total,220,'double hot + streak 20, not 240');
eq(a.gain.streakBonus,20,'streak not doubled');
a=run([9,6,4,1],3,{double:true,streak:2});
eq(a.gain.total,120,'double cold + streak 40');
a=run([9,6,4,1],1,{double:true,streak:3});
eq(a.gain.total,0,'double miss yields zero');
eq(a.gain.streak,0,'miss resets streak');
eq(a.result.usedDoubles.p0,true,'double consumed on miss');
a=run([9,6,4,1],0,{double:true,used:true});
eq(a.gain.total,100,'previously-used double does not score twice');
eq(a.gain.doubleUsed,false,'no duplicate powerup use');
eq(a.result.scores.p0,100,'sum score correctly');
a=run([9,6,4,1],3,{priorScore:250});
eq(a.result.scores.p0,290,'prior points preserved');
const original=run([9,6,4,1],0);
const swap=run([9,6,4,1],0,{swapWith:19});
eq(original.result.lastResult.counts,swap.result.lastResult.counts,'swapping personal choices keeps vote counts');
eq(original.gain.total,swap.gain.total,'self choice never changes points if same poll counts and guess');
let room={scores:{},streaks:{},usedDoubles:{}};
for(const [i,guess] of [0,3,0,3,0,1,3].entries()){
  const inputs=makeBallots([9,6,4,1],guess);
  const result=evaluateRound(room,inputs.players,inputs.votes);
  eq(result.lastResult.gains.p0.total,[100,60,140,100,160,0,40][i],'hot/cold mixed streak round '+(i+1));
  room={scores:result.scores,streaks:result.streaks,usedDoubles:result.usedDoubles};
}
eq(room.scores.p0,600,'accumulate mixed streak + reset after miss');
const none=evaluateRound({scores:{},streaks:{},usedDoubles:{}},[],[]);
eq(none.lastResult.top,[],'no votes => no hot');
eq(none.lastResult.cold,[],'no votes => no cold');
yes(source.includes('第一次玩？30 秒看懂玩法與計分'),'home tutorial updated');
yes(source.includes('scoreBreakdown(g,v,q)'),'breakdown visible in reveal');
yes(source.includes('不清楚分數？查看計分規則'),'scoring guide available during voting');
yes(source.includes('猜中熱門 200 分、猜中冷門 80 分'),'powerup copy updated');
yes(!source.includes('counts[v.choice]===1?40'),'old self-choice scoring removed');
console.log('PASS: '+count+' scoring regression assertions (hot/cold, nonzero, ties, streaks, powerup, UI copy).');
