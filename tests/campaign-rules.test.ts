import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePlacement,makeItem,type Level} from '../src/rules';
import {levels,solutionActions} from '../src/campaign-levels';
import {placementPoint,nextAction} from '../src/flow';

const base:Level={id:'test',grade:9,stage:'transfer',title:'',mission:'',he:'',teach:'',hint:'',kind:'cargo',gap:5,zones:[{id:'cargo',x:0,z:0,label:'Cargo'}]};
test('capacity, load and width constraints belong to the same floating vessel',()=>{
 const level={...base,goals:{minCapacity:8,maxMass:3,maxWidth:2}};
 assert.equal(evaluatePlacement(level,[makeItem('a large wooden crate')]).ready,false);
 assert.equal(evaluatePlacement(level,[makeItem('a light crate')]).ready,false);
 assert.equal(evaluatePlacement(level,[makeItem('a large light metal crate')]).ready,false);
 assert.equal(evaluatePlacement(level,[makeItem('a large light wooden crate')]).ready,true);
 assert.equal(evaluatePlacement(level,[makeItem('a large wooden crate'),makeItem('a light bucket')]).ready,false);
});
test('bounded wind sums actual forward fans and rejects excessive force',()=>{
 const level:Level={...base,kind:'wind',goals:{minForce:8,maxForce:10}};
 const a=makeItem('a fan','a',0,-.5),b=makeItem('a fan','b',0,.5);
 assert.equal(evaluatePlacement(level,[a]).ready,false);
 assert.equal(evaluatePlacement(level,[a,b]).ready,true);
 assert.equal(evaluatePlacement(level,[makeItem('a powerful fan')]).ready,false);
 b.rot=Math.PI;assert.equal(evaluatePlacement(level,[a,b]).ready,false);
 b.rot=0;b.x=5;assert.equal(evaluatePlacement(level,[a,b]).ready,false);
});
test('storm cargo material/weight constraints do not incorrectly bind its fan',()=>{
 const level:Level={...base,kind:'storm',goals:{minCapacity:8,maxMass:3,requiredMaterial:'wooden',minForce:8},zones:[...base.zones,{id:'wind',x:-4,z:0,label:'Wind'}]};
 const cargo=makeItem('a large light wooden crate'),fan=makeItem('a powerful fan','fan',-4,0);
 assert.equal(evaluatePlacement(level,[cargo,fan]).ready,true);
 assert.equal(evaluatePlacement(level,[cargo]).ready,false);
 assert.equal(evaluatePlacement(level,[fan]).ready,false);
});
test('combined route needs the bridge and each functional landmark',()=>{
 const level:Level={...base,kind:'bridge',gap:4,goals:{unlock:true,illuminate:true}};
 const bridge=makeItem('a long plank'),key=makeItem('a key','k',4.5,2.6),lamp=makeItem('a bright lamp','l',7,2.5);
 assert.equal(evaluatePlacement(level,[bridge]).ready,false);
 assert.equal(evaluatePlacement(level,[bridge,key]).ready,false);
 assert.equal(evaluatePlacement(level,[bridge,key,lamp]).ready,true);
 assert.deepEqual(new Set(evaluatePlacement(level,[bridge,key,lamp]).contributors),new Set(['item','k','l']));
 lamp.x=-7;assert.equal(evaluatePlacement(level,[bridge,key,lamp]).ready,false);
});
test('absorption is a sponge property; rain shelter cannot substitute for it',()=>{
 const level:Level={...base,kind:'workshop',gap:0,goals:{minAbsorb:8},zones:[{id:'spill',x:0,z:0,label:'Spill'}]};
 assert.equal(evaluatePlacement(level,[makeItem('an umbrella')]).ready,false);
 assert.equal(evaluatePlacement(level,[makeItem('a sponge')]).ready,false);
 assert.equal(evaluatePlacement(level,[makeItem('a large sponge')]).ready,true);
 assert.equal(evaluatePlacement(level,[makeItem('a sponge','a',0,-.5),makeItem('a sponge','b',0,.5)]).ready,true);
 assert.equal(evaluatePlacement(level,[makeItem('a small sponge','a')]).absorbed,1.6);
});

test('all 50 authored witnesses work with real quantities, seeds and placement',()=>{
 assert.equal(levels.length,50);
 for(const original of levels){
  const level={...original,zones:[...original.zones]};
  if(level.goals?.unlock&&!level.zones.some(z=>z.id==='chest'))level.zones.push({id:'chest',x:4.5,z:2.6,label:'Chest'});
  if(level.goals?.illuminate&&!level.zones.some(z=>z.id==='cave'))level.zones.push({id:'cave',x:7,z:2.5,label:'Cave'});
  let objects=(level.seeds??[]).map(seed=>makeItem(seed.phrase,seed.id,seed.x,seed.z,seed.origin));
  assert.equal(evaluatePlacement(level,objects).ready,false,`${level.number} must begin unsolved`);
  for(const [actionIndex,action] of solutionActions[level.id].entries()){
   assert.equal(makeItem(action.phrase).spec.count,action.zones.length,`${level.id} actual spawned quantity`);
   if(action.modifyId)objects=objects.filter(o=>o.id!==action.modifyId);
   for(const [instance,zoneIndex] of action.zones.entries()){
    const zone=level.zones[zoneIndex];assert.ok(zone,`${level.id} zone${zoneIndex}`);
    objects.push(makeItem(action.phrase,action.modifyId??`witness-${actionIndex}-${instance}`,zone.x,zone.z));
   }
  }
  const result=evaluatePlacement(level,objects);assert.ok(result.ready,`${level.number}: ${result.reason}`);
 }
});
test('late boat and rope references cannot be substituted with an identical new object',()=>{
 for(const number of [42,48]){
  const level=levels[number-1],action=solutionActions[level.id][0],zone=level.zones[0];
  const correct=makeItem(action.phrase,level.targetId,zone.x,zone.z);
  assert.equal(evaluatePlacement(level,[correct]).ready,true);
  assert.equal(evaluatePlacement(level,[{...correct,id:'new-identical-object'}]).ready,false);
  const decoy=level.seeds!.find(seed=>seed.id!==level.targetId)!;
  assert.equal(evaluatePlacement(level,[{...correct,id:decoy.id}]).ready,false);
 }
});
test('metal-only recycling rejects a mixed-material load within its weight range',()=>{
 const level=levels[43],zone=level.zones[0];
 const bucket=makeItem('a metal bucket','metal',zone.x,zone.z),wood=makeItem('a plank','wood',zone.x,zone.z);
 assert.equal(evaluatePlacement(level,[bucket,wood]).mass,9);
 assert.equal(evaluatePlacement(level,[bucket,wood]).ready,false);
 const lamp=makeItem('a metal lamp','lamp',zone.x,zone.z);
 assert.equal(evaluatePlacement(level,[bucket,lamp]).ready,true);
});
test('paired fan and sponge anchors retain their exact valid positions',()=>{
 for(const number of [29,38]){
  const level=levels[number-1],phrase=number===29?'a fan':'a sponge',spec=makeItem(phrase).spec;
  const first=makeItem(phrase,'first',level.zones[0].x,level.zones[0].z);
  const second=placementPoint(level,[first],1,spec);
  assert.equal(second.x,level.zones[1].x);assert.equal(second.z,level.zones[1].z);
  assert.ok(Math.hypot(second.x-first.x,second.z-first.z)<1.25);
 }
});
test('three instances on one pad have separate valid slots',()=>{
 const level=levels[21],objects=[] as ReturnType<typeof makeItem>[];
 for(let n=0;n<3;n++){const spec=makeItem('a crate').spec,point=placementPoint(level,objects,0,spec);objects.push(makeItem('a crate',`crate-${n}`,point.x,point.z));}
 assert.equal(new Set(objects.map(o=>`${o.x},${o.z}`)).size,3);
 assert.ok(objects.every(o=>Math.hypot(o.x-level.zones[0].x,o.z-level.zones[0].z)<1.25));
});
test('a correctly described storm fan can move without inheriting cargo bounds',()=>{
 const level=levels[49],vessel=makeItem('a large light wooden boat','vessel',level.zones[0].x,level.zones[0].z),fan=makeItem('a powerful fan',level.targetId,-6,2);
 assert.equal(nextAction(level,[vessel,fan],fan.id).kind,'move');
});
