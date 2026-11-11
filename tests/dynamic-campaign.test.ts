import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,solutionActions,type SolutionAction} from '../src/campaign-levels';
import {evaluatePlacement,makeItem,parsePhrase,type CampaignLevel,type Item} from '../src/rules';

/** Mirrors the real creation count and destination system, including auxiliary stations. */
function play(number:number,actions:SolutionAction[]){
 const source=levels[number-1];
 const level:CampaignLevel={...source,zones:[...source.zones]};
 if(level.goals?.unlock&&!level.zones.some(zone=>zone.id==='chest'))level.zones.push({id:'chest',x:4.5,z:2.6,label:'Chest'});
 if(level.goals?.illuminate&&!level.zones.some(zone=>zone.id==='cave'))level.zones.push({id:'cave',x:7,z:2.5,label:'Cave'});
 let items:Item[]=(level.seeds??[]).map(seed=>makeItem(seed.phrase,seed.id,seed.x,seed.z,seed.origin));
 for(const [actionIndex,action] of actions.entries()){
  const parsed=parsePhrase(action.phrase);assert.ok(parsed.ok,action.phrase);
  assert.equal(parsed.spec.count,action.zones.length,`${number}: the phrase must spawn the actual number placed`);
  if(action.modifyId)items=items.filter(item=>item.id!==action.modifyId);
  for(const [instance,index] of action.zones.entries()){
   const zone=level.zones[index];assert.ok(zone,`${number}: missing destination ${index}`);
   items.push(makeItem(action.phrase,action.modifyId??`alternative-${actionIndex}-${instance}`,zone.x,zone.z));
  }
 }
 return {level,items,state:evaluatePlacement(level,items)};
}
const one=(phrase:string,zone=0):SolutionAction=>({phrase,zones:[zone]});
const alternatives:Record<number,SolutionAction[][]>={
 1:[[one('a ladder')],[one('a rope')],[one('a log')],[one('a bridge')]],
 2:[[one('an umbrella')],[one('a tarp')],[one('a tent')],[one('a raincoat')]],
 3:[[{phrase:'two umbrellas',zones:[0,1]}],[one('a large tarp')],[{phrase:'two tents',zones:[0,1]}]],
 4:[[one('a rope')],[one('a ladder')],[one('a log')],[one('a bridge')]],
 5:[[{phrase:'three umbrellas',zones:[0,1,2]}],[{phrase:'three raincoats',zones:[0,1,2]}],[{phrase:'three tarps',zones:[0,1,2]}]],
 6:[[one('a boat')],[one('a canoe')],[one('a raft')],[one('a balloon')],[one('a long bridge')]],
 7:[[one('a cart')],[one('a rock')],[one('a crate')],[one('a chest')]],
 8:[[one('a sponge')],[one('a large towel')]],
 10:[[one('a barrel'),one('a key',1)],[one('a raft'),one('a key',1)],[one('a canoe'),one('a key',1)]],
 11:[[one('a long plank')],[one('a long ladder')],[one('a long bridge')],[one('a long log')]],
 12:[[one('a tent')],[one('a tarp')],[one('a large umbrella')],[{phrase:'two umbrellas',zones:[0,1]}]],
 14:[[one('a heavy bucket')],[one('a rock')],[one('a heavy barrel')]],
 15:[[one('a chest')],[one('a barrel')],[one('a canoe')],[one('a large crate')]],
 16:[[one('a wooden raft')],[one('a wooden canoe')],[one('a large wooden crate')]],
 17:[[one('a torch')],[one('a candle')],[one('a bright lamp')]],
 18:[[one('a canoe')],[one('a barrel')],[one('a small boat')]],
 19:[[one('a barrel')],[one('a canoe')],[one('a crate')]],
 20:[[{phrase:'two tarps',zones:[0,1]},one('a candle',2)],[{phrase:'two umbrellas',zones:[0,1]},one('a torch',2)]],
 21:[[one('a cart')],[one('a chest')],[one('a barrel')]],
 22:[[one('a rock')],[{phrase:'two crates',zones:[0,1]}],[{phrase:'three bells',zones:[0,1,2]}]],
 23:[[one('a long rope')],[one('a long ladder')],[one('a long light bridge')],[one('a long log')]],
 24:[[one('a light bridge')],[one('a large plank')],[one('a large ladder')]],
 25:[[one('a fan')],[one('a blower')]],
 28:[[one('a boat')],[one('a canoe')],[one('a large crate')]],
 29:[[{phrase:'two fans',zones:[0,1]}],[one('a fan'),one('a blower',1)],[one('a windmill')]],
 30:[[one('a small canoe'),{phrase:'two fans',zones:[1,2]}],[one('a barrel'),one('a windmill',1)]],
 31:[[one('a large wooden chest')],[one('a raft')],[one('a boat')],[one('a large barrel')]],
 32:[[one('a raft')],[one('a large wooden boat')],[one('a large wooden chest')]],
 33:[[one('a long rope')],[one('a long light log')]],
 34:[[one('a light wooden canoe')],[one('a light wooden raft')],[one('a light wooden boat')]],
 35:[[one('a windmill')],[one('a powerful fan')],[{phrase:'two blowers',zones:[0,1]}]],
 38:[[{phrase:'three sponges',zones:[0,1,2]}],[{phrase:'two large towels',zones:[0,1]}]],
 39:[[{phrase:'two large towels',zones:[0,1]},one('a key',2)],[one('a large sponge'),one('a key',2)]],
 43:[[one('a light windmill')],[one('a light powerful fan')],[{phrase:'two light blowers',zones:[0,1]}]],
 44:[[one('a metal plank')],[one('a large metal bucket')],[{phrase:'three bells',zones:[0,0,0]}]],
 46:[[{phrase:'two large sponges',zones:[0,1]},one('a torch',3)],[{phrase:'three large towels',zones:[0,1,2]},one('a candle',3)]],
 47:[[one('a light wooden raft'),{phrase:'two fans',zones:[1,2]}],[one('a large light wooden canoe'),one('a windmill',1)]],
 49:[[one('a raft'),one('a key',1),one('a torch',2)],[one('a large wooden boat'),one('a key',1),one('a candle',2)]],
};

for(const [number,plans] of Object.entries(alternatives)){
 test(`island ${number}: distinct practical solutions satisfy its actual properties`,()=>{
  for(const actions of plans){
   const {state}=play(Number(number),actions);
   assert.ok(state.ready,`${actions.map(action=>action.phrase).join(' + ')}: ${state.reason}`);
  }
 });
}

test('authored route uses at least 25 distinct nouns and changes its primary object on every island',()=>{
 const primary=levels.map(level=>{
  const parsed=parsePhrase(solutionActions[level.id][0].phrase);assert.ok(parsed.ok);return parsed.spec.noun;
 });
 const nouns=new Set(levels.flatMap(level=>solutionActions[level.id].map(action=>{
  const parsed=parsePhrase(action.phrase);assert.ok(parsed.ok);return parsed.spec.noun;
 })));
 assert.ok(nouns.size>=25,`only ${nouns.size} distinct authored nouns`);
 for(let index=1;index<primary.length;index++)assert.notEqual(primary[index],primary[index-1],`islands ${index} and ${index+1} repeat the same primary noun`);
});

test('default campaign copy contains no prefilled solution or copyable authored phrase',()=>{
 for(const level of levels){
  assert.equal(level.guide,undefined,`island ${level.number} gives away a prefilled answer`);
  const displayed=(level.mission+' '+level.he).toLowerCase();
  for(const action of solutionActions[level.id])assert.ok(!displayed.includes(action.phrase),`${level.number} reveals ${action.phrase}`);
  assert.ok(level.hint.length>15&&level.teach.length>15,`${level.number}: conceptual help remains available`);
 }
});

test('every island has a scene, weather and a unique consequence, without changing its saved ID',()=>{
 assert.equal(new Set(levels.map(level=>level.incident)).size,50);
 assert.equal(new Set(levels.map(level=>level.atmosphere)).size,5);
 assert.equal(new Set(levels.map(level=>level.weather)).size,4);
 for(const level of levels){
  assert.ok(level.incident&&level.incident.length>10);
  if(level.kind==='shelter')assert.equal(level.weather,'rain');
  assert.equal(play(level.number,solutionActions[level.id]).state.ready,true,level.id);
 }
});

test('rain cover cannot dry a puddle, and a floating carrier still needs sufficient capacity',()=>{
 assert.equal(play(8,[one('a tarp')]).state.ready,false);
 assert.equal(play(15,[one('a log')]).state.ready,false);
 assert.equal(play(33,[one('a long log')]).state.ready,false,'ordinary long log exceeds the stated mass limit');
 assert.equal(play(44,[one('a rock')]).state.ready,false,'a valid weight is not a valid metal return');
 assert.equal(play(29,[one('a powerful blower')]).state.ready,false,'too much force remains a failure even with a new noun');
});
