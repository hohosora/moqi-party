'use strict';
const DAY=24*60*60*1000;
const ROOM_CODE=/^[A-HJ-NP-Z2-9]{6}$/;
// Policy is intentionally conservative and based on server metadata, never
// the client-supplied createdAt, deadline, joinedAt or vote at values.
function assessRoom(phase, rootUpdatedMs, nowMs, childUpdatedMs=[]){
  const days=phase==='finished'||phase==='lobby'?7:phase==='voting'||phase==='reveal'?30:null;
  if(days===null||!Number.isFinite(nowMs)||![rootUpdatedMs,...childUpdatedMs].every(t=>Number.isFinite(t)&&t>0&&t<=nowMs))
    return {eligible:false,reason:'unknown-phase-or-timestamp'};
  const lastActivity=Math.max(rootUpdatedMs,...childUpdatedMs);
  const eligible=nowMs-lastActivity>=days*DAY;
  return {eligible,days,lastActivity,reason:eligible?'review-required':'recent-activity'};
}
module.exports={assessRoom,ROOM_CODE,DAY};
