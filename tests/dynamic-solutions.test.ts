import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,parsePhrase,makeItem,evaluatePlacement,modeledPhrase, type Level} from '../src/rules';
import {nextAction,usefulObjectKind,placementPoint} from '../src/flow';
const base:Level={id:'open',grade:7,stage:'independent',title:'',mission:'',he:'',teach:'',hint:'',kind:'bridge',gap:2.4,zones:[{id:'crossing',x:0,z:0,label:'Crossing'}]};
test('all dictionary nouns create a distinct physical object, with plurals and full phrase round trips',()=>{
 assert.ok(catalog.length>=28);assert.equal(new Set(catalog.map(c=>c.noun)).size,catalog.length);
 for(const {noun} of catalog){const result=parsePhrase(`${/^[aeiou]/.test(noun)?'an':'a'} ${noun}`);assert.ok(result.ok,noun);if(!result.ok)continue;
  const plural=parsePhrase(`three ${noun}s`);assert.ok(plural.ok,noun);if(plural.ok){assert.equal(plural.spec.count,3);assert.ok(parsePhrase(modeledPhrase(plural.spec)).ok);}
 }
});
test('river accepts walkable crossings and actual floating routes without a word password',()=>{
 for(const noun of ['plank','ladder','rope','bridge','log','boat','raft','canoe']){
  const item=makeItem(`a ${noun}`,'created-solution');const result=evaluatePlacement(base,[item]);
  assert.equal(result.ready,true,noun);assert.equal(result.traversable,item.spec.span,noun);
  assert.equal(nextAction(base,[item],item.id).kind,'travel');
 }
 assert.equal(evaluatePlacement(base,[makeItem('a cart')]).ready,false);
});
test('alternative river transport respects every stated restriction',()=>{
 const restricted={...base,gap:4.7,goals:{maxMass:2,maxWidth:1}};
 for(const phrase of ['a raft','a canoe','a light boat','a log','a bridge'])assert.equal(evaluatePlacement(restricted,[makeItem(phrase)]).ready,false,phrase);
 assert.equal(evaluatePlacement(restricted,[makeItem('a long rope')]).ready,true);
});
test('rain shelter accepts several shapes and a single broad cover can shelter two parcels',()=>{
 const level:Level={...base,kind:'shelter',gap:0,zones:[{id:'parcel-a',x:0,z:-1.6,label:'A'},{id:'parcel-b',x:0,z:1.6,label:'B'}]};
 for(const phrase of ['an umbrella','a tarp','a tent','a raincoat']){
  const a=makeItem(phrase,'a',0,-1.6),b=makeItem(phrase,'b',0,1.6);
  assert.equal(evaluatePlacement(level,[a,b]).ready,true,phrase);assert.equal(usefulObjectKind(level,a.spec),true);
 }
 const wide=makeItem('a tarp');assert.equal(evaluatePlacement(level,[wide]).covered,2);
 const narrow=makeItem('an umbrella');assert.equal(evaluatePlacement(level,[narrow]).covered,0);
});
test('new light, absorption and wind sources participate in guidance and precise conditions',()=>{
 const light:Level={...base,kind:'workshop',gap:0,goals:{illuminate:true},zones:[{id:'cave',x:7,z:2.5,label:'Cave'}]};
 for(const noun of ['torch','candle']){const o=makeItem(`a ${noun}`,'created-light',7,2.5);assert.equal(evaluatePlacement(light,[o]).ready,true);assert.equal(usefulObjectKind(light,o.spec),true);
  assert.equal(nextAction(light,[{...o,x:-7}],o.id).kind,'move');assert.equal(evaluatePlacement(light,[makeItem(`an unlit ${noun}`,'l',7,2.5)]).ready,false);
 }
 const spill:Level={...base,kind:'workshop',gap:0,goals:{minAbsorb:6},zones:[{id:'spill',x:0,z:0,label:'Spill'}]};
 const towels=[makeItem('a towel','a',0,-.3),makeItem('a towel','b',0,.3)];assert.equal(evaluatePlacement(spill,towels).ready,true);
 assert.equal(usefulObjectKind(spill,towels[0].spec),true);
 const wind:Level={...base,kind:'wind',goals:{minForce:8,maxForce:10}};
 assert.equal(evaluatePlacement(wind,[makeItem('a windmill')]).ready,true);
 assert.equal(evaluatePlacement(wind,[makeItem('a blower','a',0,-.3),makeItem('a fan','b',0,.3)]).force,10);
 assert.equal(evaluatePlacement(wind,[makeItem('a powerful blower')]).ready,false);
 const stopped=makeItem('a powerless blower');assert.equal(stopped.spec.force,0);
});
test('aliases and larger batches are reviewed while unsupported English is described honestly',()=>{
 for(const [input,noun] of [['a board','plank'],['a tarpaulin','tarp'],['a stone','rock'],['a flashlight','torch'],['a dinghy','canoe']]){const r=parsePhrase(input);assert.ok(r.ok,input);if(r.ok)assert.equal(r.spec.noun,noun);}
 const r=parsePhrase('four towels');assert.ok(r.ok);if(r.ok){assert.equal(r.spec.count,4);assert.equal(r.spec.evidence.count,true);}
 assert.equal(parsePhrase('a dragon').ok,false);
});
test('multiple new items get separate slots without blocking placement on adjacent pads',()=>{
 for(const phrase of ['a towel','a blower','a barrel']){const items=[];for(let i=0;i<3;i++){const spec=makeItem(phrase).spec,p=placementPoint(base,items,0,spec);items.push(makeItem(phrase,String(i),p.x,p.z));}assert.equal(new Set(items.map(o=>o.z)).size,3);}
});
