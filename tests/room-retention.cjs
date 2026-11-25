'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {assessRoom,ROOM_CODE,DAY}=require('../admin/room-retention.cjs');
const now=100*DAY,old=n=>now-n*DAY;
test('finished and abandoned lobby require seven full days',()=>{
  for(const phase of ['finished','lobby']){
    assert.equal(assessRoom(phase,old(7),now).eligible,true);
    assert.equal(assessRoom(phase,old(7)+1,now).eligible,false);
  }
});
test('voting/reveal require thirty days and manual review',()=>{
  for(const phase of ['voting','reveal']){
    assert.equal(assessRoom(phase,old(29),now).eligible,false);
    assert.equal(assessRoom(phase,old(30),now).reason,'review-required');
  }
});
test('recent children prevent candidate designation',()=>{
  assert.equal(assessRoom('finished',old(10),now,[old(1)]).eligible,false);
  assert.equal(assessRoom('voting',old(40),now,[old(29)]).eligible,false);
  assert.equal(assessRoom('lobby',old(9),now,[old(8)]).eligible,true);
});
test('malformed or future metadata fails closed',()=>{
  for(const t of [NaN,undefined,null,0,now+1]){
    assert.equal(assessRoom('finished',t,now).eligible,false);
    assert.equal(assessRoom('finished',old(8),now,[t]).eligible,false);
  }
  assert.equal(assessRoom('other',old(99),now).eligible,false);
});
test('room path validation rejects wildcard and nested paths',()=>{
  assert.equal(ROOM_CODE.test('ABC234'),true);
  for(const c of ['*','rooms/ABC234','ABC234/votes','ABC12I','ABC2345'])assert.equal(ROOM_CODE.test(c),false);
});
