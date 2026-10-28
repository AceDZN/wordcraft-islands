import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../src/campaign-levels';
import {evaluatePlacement,makeItem,supportsBothBanks,type CampaignLevel,type Item} from '../src/rules';
import {nextAction,objectiveStatus} from '../src/flow';

const level=(number:number):CampaignLevel=>levels[number-1];
const at=(number:number,phrase:string,id='created-qa',zone=0):Item=>{
 const point=level(number).zones[zone];return makeItem(phrase,id,point.x,point.z);
};

test('a selected unlit lamp is revised instead of creating an unnecessary second lamp',()=>{
 const lamp=at(17,'an unlit lamp');
 assert.equal(evaluatePlacement(level(17),[lamp]).ready,false);
 assert.equal(nextAction(level(17),[lamp],lamp.id).kind,'revise');
});

for(const [number,phrase] of [[1,'a plank'],[2,'an umbrella'],[6,'a boat'],[9,'a key'],[25,'a fan']] as const){
 test(`level ${number}: an otherwise suitable ${phrase} in the wrong place offers Move`,()=>{
  const item=makeItem(phrase,'created-off-target',-7,3);
  assert.equal(evaluatePlacement(level(number),[item]).ready,false);
  assert.equal(nextAction(level(number),[item],item.id).kind,'move');
  const point=level(number).zones[0],moved={...item,x:point.x,z:point.z};
  assert.equal(evaluatePlacement(level(number),[moved]).ready,true,'the same object works after moving alone');
 });
}

test('a rotated working fan offers orientation recovery rather than a new power word',()=>{
 const fan=at(25,'a fan');fan.rot=Math.PI;
 assert.equal(evaluatePlacement(level(25),[fan]).ready,false);
 assert.equal(nextAction(level(25),[fan],fan.id).kind,'move');
 fan.rot=0;assert.equal(evaluatePlacement(level(25),[fan]).ready,true);
});

test('all deleted authored targets explicitly offer recovery',()=>{
 for(const current of levels.filter(l=>l.targetId)){
  const survivors=(current.seeds??[]).filter(s=>s.id!==current.targetId).map(s=>makeItem(s.phrase,s.id,s.x,s.z,s.origin));
  const action=nextAction(current,survivors);
  assert.equal(action.kind,'recover',`level ${current.number}: missing ${current.targetId}`);
  assert.match(action.label+' '+action.instruction,/ביטול|שחזר|החזיר/);
 }
});

test('mass failure on a physically spanning bridge is not described as missing bank support',()=>{
 const current=level(23),bridge=at(23,'a long heavy plank');
 assert.equal(supportsBothBanks(current,bridge),true);
 const state=evaluatePlacement(current,[bridge]);assert.equal(state.ready,false);
 assert.match(state.reason,/משקל|ק״ג/);assert.match(state.reason,/4/);
 assert.match(objectiveStatus(current,[bridge]),/משקל|תכונ|מגבל/);
});

test('width failure on a physically spanning bridge names its actual width constraint',()=>{
 const current=level(24),rope=at(24,'a long rope');
 assert.equal(supportsBothBanks(current,rope),true);
 const state=evaluatePlacement(current,[rope]);assert.equal(state.ready,false);
 assert.match(state.reason,/רוחב/);assert.match(state.reason,/1\.5/);
});

test('recycling feedback names the metal rule and the stated 7–9 kg interval',()=>{
 const current=level(44),metal=at(44,'a metal bucket','metal'),wood=at(44,'a plank','wood');
 const state=evaluatePlacement(current,[metal,wood]);
 assert.equal(state.mass,9);assert.equal(state.ready,false);
 assert.match(state.reason,/מתכת/);assert.match(state.reason,/7/);assert.match(state.reason,/9/);
});

test('an overweight powerful fan explains its mass limit instead of only reporting zero usable force',()=>{
 const current=level(43),fan=at(43,'a powerful fan');
 const state=evaluatePlacement(current,[fan]);
 assert.equal(fan.spec.force,12);assert.equal(fan.spec.mass,4);assert.equal(state.ready,false);
 assert.match(state.reason,/משקל|ק״ג/);assert.match(state.reason,/2/);
});

test('a metal cargo vessel gives a material or flotation reason before suggesting more capacity',()=>{
 const current=level(16),vessel=at(16,'a large metal crate');
 assert.equal(vessel.spec.capacity,10);assert.equal(vessel.spec.float,false);
 const state=evaluatePlacement(current,[vessel]);assert.equal(state.ready,false);
 assert.match(state.reason,/עץ|צף|ציפ/);
});

test('light never makes an already lightweight object heavier',()=>{
 for(const noun of ['balloon','sponge','key','umbrella','crate','boat','fan']){
  const plain=makeItem(`${noun==='umbrella'?'an':'a'} ${noun}`).spec;
  const lighter=makeItem(`a light ${noun}`).spec;
  assert.ok(lighter.mass<=plain.mass,`${noun}: light changed ${plain.mass} kg into ${lighter.mass} kg`);
 }
 const current=level(41),balloon=at(41,'a light balloon');
 assert.equal(evaluatePlacement(current,[balloon]).ready,true,'adding light must not defeat the existing 0.5 kg maximum');
});

test('completed auxiliary selection does not hide the final named fan task',()=>{
 const current=level(50),seeds=(current.seeds??[]).map(s=>makeItem(s.phrase,s.id,s.x,s.z,s.origin));
 const vessel=at(50,'a large light wooden boat'),key=makeItem('a key','created-key',4.5,2.6),lamp=makeItem('a bright lamp','created-lamp',7,2.5);
 const items=[...seeds,vessel,key,lamp],state=evaluatePlacement(current,items);
 assert.equal(state.ready,false);assert.equal(state.capacity,30);
 assert.equal(state.checks.every(check=>check.ready),true);
 for(const chosen of [key,lamp])assert.equal(nextAction(current,items,chosen.id).kind,'select',chosen.spec.noun);
});

test('rain coverage already completed is not described as wet when only the marker is missing',()=>{
 const current=level(20),covers=current.zones.map((zone,i)=>makeItem('an umbrella',`created-cover-${i}`,zone.x,zone.z));
 const wrong=at(20,'a ladder','created-wrong'),items=[...covers,wrong],state=evaluatePlacement(current,items);
 assert.equal(state.covered,2);assert.equal(state.primaryReady,true);assert.equal(state.ready,false);
 const action=nextAction(current,items,wrong.id);
 assert.match(action.instruction,/אור|חשוך|סמן/);
 assert.doesNotMatch(action.instruction,/עדיין נרטבת/);
});

test('ferry feedback retains the width and mass limits from its mission',()=>{
 const narrow=level(18),wideBoat=at(18,'a boat'),widthFailure=evaluatePlacement(narrow,[wideBoat]);
 assert.equal(widthFailure.ready,false);assert.match(widthFailure.reason,/רוחב/);assert.match(widthFailure.reason,/1\.3/);
 const air=level(41),heavyBalloon=at(41,'a heavy balloon'),massFailure=evaluatePlacement(air,[heavyBalloon]);
 assert.equal(massFailure.ready,false);assert.match(massFailure.reason,/משקל|ק״ג/);assert.match(massFailure.reason,/0\.5/);
});

test('the final mission explicitly states every numeric goal constraint',()=>{
 const current=level(50),mission=current.mission;
 const number='(\\d+(?:\\.\\d+)?)';
 const read=(pattern:RegExp,label:string)=>{
  const match=mission.match(pattern);assert.ok(match,`final mission must disclose ${label}`);
  return Number(match[1]);
 };
 const force=mission.match(new RegExp(`\\bbetween ${number} and ${number} N\\b`));
 assert.ok(force,'final mission must disclose both force bounds');
 const stated={
  minCapacity:read(new RegExp(`\\bCarry ${number} parcels\\b`),'parcel capacity'),
  maxWidth:read(new RegExp(`\\bno wider than ${number} m\\b`),'maximum width'),
  maxMass:read(new RegExp(`\\bno heavier than ${number} kg\\b`),'maximum mass'),
  minForce:Number(force[1]),maxForce:Number(force[2]),
 };
 const numericGoals=Object.fromEntries(Object.entries(current.goals??{}).filter(([,value])=>typeof value==='number'));
 assert.deepEqual(stated,numericGoals,'stated numbers and enforced numeric goals must match in both directions');
});
