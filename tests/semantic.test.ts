import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePhrase, makeItem, evaluatePlacement, evaluateExtras, supportsBothBanks, supportsPoint, modeledPhrase, type Item, type Level } from '../src/rules';
import { levels } from '../src/levels';

const level = (id:string):Level => { const found=levels.find(l=>l.id===id); assert.ok(found,id); return found; };
const spec = (phrase:string,assisted=false) => {const r=parsePhrase(phrase,assisted); assert.equal(r.ok,true,phrase); if(!r.ok)throw Error(r.message); return r.spec;};
const itemAt = (l:Level,phrase:string,id='created',zone=0):Item => makeItem(phrase,id,l.zones[zone].x,l.zones[zone].z);
const ready = (id:string,objects:Item[]) => evaluatePlacement(level(id),objects).ready;

test('historical curriculum fixtures retain their IDs and contrasts for regression/migration',()=>{
 for(const grade of [7,8,9]) assert.deepEqual(levels.filter(l=>l.grade===grade).map(l=>l.stage),['guided','independent','transfer']);
 assert.equal(new Set(levels.map(l=>l.id)).size,9);
 assert.notEqual(level('g7-crossing').kind,level('g7-inlet').kind);
 assert.notEqual(level('g8-length').kind,level('g8-history').kind);
 assert.notEqual(level('g9-cargo').kind,level('g9-storm').kind);
});

test('article follows the next spoken sound in the supported vocabulary',()=>{
 assert.equal(spec('an umbrella').evidence.article,true);
 assert.equal(spec('a large umbrella').evidence.article,true);
 assert.equal(spec('an unlit lamp').evidence.article,true);
 for(const phrase of ['a umbrella','an large umbrella','a unlit lamp']) assert.equal(parsePhrase(phrase).ok,false,phrase);
});

test('singular and plural count agreement creates actual quantities',()=>{
 assert.equal(spec('two umbrellas').count,2);
 assert.equal(spec('three boxes').count,3);
 assert.equal(spec('a crate').count,1);
 for(const phrase of ['two crate','a umbrellas','an umbrellas','one fans']) assert.equal(parsePhrase(phrase).ok,false,phrase);
});

test('definite plural is not silently modeled as a single object',()=>{
 assert.ok(spec('the umbrellas').count>1);
});

test('reviewed aliases and case/whitespace normalization retain semantics',()=>{
 assert.equal(spec('  A   BIG wooden BOX ').noun,'crate');
 assert.equal(spec('a lantern').noun,'lamp');
 assert.equal(spec('two boxes').count,2);
 assert.equal(spec('a large wooden crate').capacity,spec('a big wooden box').capacity);
});

test('bare noun editor shorthand proves no article production',()=>{
 const s=spec('plank'); assert.equal(s.evidence.article,false); assert.equal(s.evidence.shorthand,true);
});

test('accepted assisted phrase is never counted as unaided article/spelling/modifier/family production',()=>{
 const e=spec('a large powerful fan',true).evidence;
 assert.equal(e.assisted,true);
 for(const key of ['article','count','spelling','modifiers','order','family'] as const) assert.equal(e[key],false,key);
});

test('order production needs two modifiers, not a vacuous one-word check',()=>{
 assert.equal(spec('a crate').evidence.order,false);
 assert.equal(spec('a wooden crate').evidence.order,false);
 assert.equal(spec('a wooden wooden crate').evidence.order,false);
 assert.equal(spec('a large big crate').evidence.order,false);
 assert.equal(spec('a large wooden crate').evidence.order,true);
});

test('common adjective order is taught without invalidating an imaginable object',()=>{
 const r=parsePhrase('a wooden large crate'); assert.ok(r.ok);
 if(r.ok){assert.ok(r.warning);assert.equal(r.spec.evidence.order,false);assert.equal(r.spec.capacity,10);}
});

test('real words outside the finite workshop are unsupported rather than bad English',()=>{
 const r=parsePhrase('a helicopter');assert.equal(r.ok,false);
 if(!r.ok) assert.match(r.message,/לא אומר.*שגויה/);
 const d=parsePhrase('a silent fan');assert.equal(d.ok,false);
 if(!d.ok) assert.match(d.message,/מגבלת הקטלוג/);
});

test('near-spelling is proposed, never silently accepted as unaided spelling',()=>{
 const r=parsePhrase('a plnak');assert.equal(r.ok,false);
 if(!r.ok) assert.equal(r.suggestion,'a plank');
 assert.equal(spec('a plank',true).evidence.spelling,false);
});

test('power is distinguished from powerful/powerless with observable force',()=>{
 assert.equal(parsePhrase('a power fan').ok,false);
 assert.equal(spec('a powerful fan').force,12);
 assert.equal(spec('a powerless fan').force,0);
 assert.equal(spec('a powerful fan').evidence.family,true);
 assert.equal(spec('a fan').evidence.family,false);
});

test('contradictory or undefined property combinations explain workshop limits',()=>{
 for(const phrase of ['a long short plank','a powerful powerless fan','a metal wooden crate','a powerful umbrella']) assert.equal(parsePhrase(phrase).ok,false,phrase);
});

test('guided crossing accepts different real spanning objects',()=>{
 for(const phrase of ['a plank','a ladder','a rope']) assert.ok(ready('g7-crossing',[makeItem(phrase)]),phrase);
 assert.equal(ready('g7-crossing',[makeItem('a short plank')]),false);
});

test('same-looking crossing with longer gap changes valid property action',()=>{
 assert.ok(ready('g7-crossing',[makeItem('a plank')]));
 assert.equal(ready('g8-length',[makeItem('a plank')]),false);
 for(const phrase of ['a long plank','a long ladder','a long rope']) assert.ok(ready('g8-length',[makeItem(phrase)]),phrase);
});

test('bridge requires placement near both supports and correct orientation',()=>{
 assert.equal(ready('g8-length',[makeItem('a long plank','p',4,0)]),false);
 const across=makeItem('a long plank');across.rot=Math.PI/2;
 assert.equal(ready('g8-length',[across]),false);
 across.rot=0;across.placed=false;
 assert.equal(ready('g8-length',[across]),false);
});

test('independent rain is about actual separated coverage',()=>{
 const l=level('g7-rain');
 assert.equal(ready(l.id,[itemAt(l,'an umbrella')]),false);
 assert.ok(ready(l.id,[itemAt(l,'an umbrella','n',0),itemAt(l,'an umbrella','s',1)]));
 assert.equal(ready(l.id,[makeItem('an umbrella','mid',1,0)]),false);
 assert.ok(ready(l.id,[itemAt(l,'a bucket','n',0),itemAt(l,'a sponge','s',1)]));
});

test('transfer ferry permits a boat or physically long alternate bridge',()=>{
 const l=level('g7-inlet');
 assert.ok(ready(l.id,[itemAt(l,'a boat')]));
 assert.ok(ready(l.id,[makeItem('a long ladder')]));
 assert.equal(ready(l.id,[makeItem('a plank')]),false);
 assert.equal(ready(l.id,[itemAt(l,'a metal crate')]),false);
});

test('weight comparative uses real mass rather than size or noun password',()=>{
 const l=level('g8-weight');
 assert.equal(ready(l.id,[itemAt(l,'a crate')]),false);
 assert.equal(ready(l.id,[itemAt(l,'a large crate')]),false);
 assert.ok(ready(l.id,[itemAt(l,'a heavy crate')]));
 assert.ok(ready(l.id,[itemAt(l,'a heavy bucket')]));
 assert.equal(ready(l.id,[itemAt(l,'a heavy bucket','p')].map(o=>({...o,x:0}))),false);
});

test('strict heavier-than boundary respects the comparison reference',()=>{
 const l=level('g8-weight');const object=itemAt(l,'a heavy crate');object.spec.mass=6;
 assert.equal(evaluatePlacement(l,[object]).ready,false);
 object.spec.mass=6.01;assert.ok(evaluatePlacement(l,[object]).ready);
 const altered={...l,reference:13};assert.equal(evaluatePlacement(altered,[object]).ready,false);
});

test('history changes the valid crate while preserving identical visible noun',()=>{
 const l=level('g8-history');
 assert.ok(ready(l.id,[itemAt(l,'a heavy crate','medicine')]));
 assert.equal(ready(l.id,[itemAt(l,'a heavy crate','garden')]),false);
 const alternate={...l,targetId:'garden'};
 assert.ok(evaluatePlacement(alternate,[itemAt(l,'a heavy crate','garden')]).ready);
 assert.equal(evaluatePlacement(alternate,[itemAt(l,'a heavy crate','medicine')]).ready,false);
 assert.ok(l.seeds?.every(s=>s.phrase==='a crate'));
 assert.equal(new Set(l.seeds?.map(s=>s.origin)).size,2);
});

test('unrelated weight cannot substitute for making the identified medicine crate heavier',()=>{
 const l=level('g8-history');
 assert.equal(ready(l.id,[itemAt(l,'a crate','medicine'),itemAt(l,'a heavy bucket','other')]),false);
});

test('size and material independently change cargo capacity/floatability',()=>{
 const l=level('g9-cargo');
 assert.equal(ready(l.id,[itemAt(l,'a wooden crate')]),false);
 assert.equal(ready(l.id,[itemAt(l,'a large metal crate')]),false);
 assert.ok(ready(l.id,[itemAt(l,'a large wooden crate')]));
 assert.ok(ready(l.id,[itemAt(l,'a big wooden box')]));
 assert.ok(ready(l.id,[itemAt(l,'a boat')]));
 assert.equal(spec('a boat').evidence.modifiers,false);
});

test('Fan A is the known referent even when both fans match additional information',()=>{
 const l=level('g9-power');
 assert.ok(l.mission.includes('Fan A, which'));
 assert.equal(l.seeds?.filter(s=>/repaired/.test(s.origin)).length,2);
 assert.equal(ready(l.id,[itemAt(l,'a powerful fan','fan-b')]),false);
 assert.ok(ready(l.id,[itemAt(l,'a powerful fan','fan-a')]));
 assert.equal(ready(l.id,[itemAt(l,'a powerless fan','fan-a')]),false);
});

test('fan force needs correct direction as well as word family choice',()=>{
 const l=level('g9-power');const f=itemAt(l,'a powerful fan','fan-a');f.rot=Math.PI;
 assert.equal(ready(l.id,[f]),false);f.rot=0;assert.ok(ready(l.id,[f]));
});

test('G9 transfer combines cargo and identified force with multiple valid containers',()=>{
 const l=level('g9-storm');const f=itemAt(l,'a powerful fan','tree-fan',1);
 for(const phrase of ['a large wooden crate','a large wooden boat','a big wooden box']) assert.ok(ready(l.id,[itemAt(l,phrase),f]),phrase);
 assert.equal(ready(l.id,[f]),false);
 assert.equal(ready(l.id,[itemAt(l,'a large wooden crate')]),false);
 assert.equal(ready(l.id,[itemAt(l,'a large wooden crate'),itemAt(l,'a powerful fan','fountain-fan',1)]),false);
 assert.equal(ready(l.id,[itemAt(l,'a large metal crate'),f]),false);
});


test('only relevant solved objects contribute evidence, not a parked vocabulary display',()=>{
 const l=level('g9-cargo');const vessel=itemAt(l,'a boat','vessel');const distractor=makeItem('a large powerful fan','unrelated',-7,3);
 const result=evaluatePlacement(l,[vessel,distractor]);assert.ok(result.ready);assert.deepEqual(result.contributors,['vessel']);
 assert.equal(vessel.spec.evidence.modifiers,false);assert.equal(vessel.spec.evidence.family,false);
});

test('optional key and lamp have location/property consequences',()=>{
 assert.deepEqual(evaluateExtras([]),{unlocked:false,illuminated:false});
 assert.equal(evaluateExtras([makeItem('a key','k',4.5,2.6)]).unlocked,true);
 assert.equal(evaluateExtras([makeItem('a key','k',0,0)]).unlocked,false);
 assert.equal(evaluateExtras([makeItem('an unlit lamp','l',7,2.5)]).illuminated,false);
 assert.equal(evaluateExtras([makeItem('a bright lamp','l',7,2.5)]).illuminated,true);
 assert.equal(evaluateExtras([makeItem('a bright lamp','l',-7,2.5)]).illuminated,false);
});


test('bridge endpoints both reach bank supports even when object center is shifted',()=>{
 const l=level('g7-crossing');const ordinary=makeItem('a plank','p',.5,0);
 assert.equal(supportsBothBanks(l,ordinary),false);assert.equal(evaluatePlacement(l,[ordinary]).ready,false);
 ordinary.x=.15;assert.ok(supportsBothBanks(l,ordinary));
 const long=makeItem('a long plank','long',1.5,0);assert.ok(supportsBothBanks(l,long));assert.ok(evaluatePlacement(l,[long]).ready);
});

test('traversal support follows actual narrow rope and wider plank rectangles',()=>{
 const l=level('g7-crossing'),rope=makeItem('a rope'),plank=makeItem('a plank');
 assert.ok(supportsPoint(l,[rope],0,0));assert.equal(supportsPoint(l,[rope],0,.5),false);
 assert.ok(supportsPoint(l,[plank],0,.5));assert.equal(supportsPoint(l,[plank],0,.6),false);
 assert.equal(supportsPoint(l,[plank],2.5,0),false);
 const rotated=makeItem('a long plank');rotated.rot=.3;assert.ok(supportsPoint(l,[rotated],0,0));
 assert.equal(supportsPoint(l,[rotated],0,1),false);
});


test('editor full-phrase model follows supported sound/count while shorthand earns no article/count credit',()=>{
 for(const [raw,modeled] of [['plank','a plank'],['umbrella','an umbrella'],['large umbrella','a large umbrella'],['unlit lamp','an unlit lamp'],['umbrellas','two umbrellas']]){
  const value=spec(raw);assert.equal(modeledPhrase(value),modeled);assert.equal(value.evidence.article,false);assert.equal(value.evidence.count,false);
 }
});


test('modifier evidence requires distinct meanings rather than repeated or synonymous words',()=>{
 assert.equal(spec('a large large crate').evidence.modifiers,false);
 assert.equal(spec('a large big crate').evidence.modifiers,false);
 assert.equal(spec('a wooden wooden crate').evidence.modifiers,false);
 assert.equal(spec('a large wooden crate').evidence.modifiers,true);
 assert.equal(spec('a heavy powerful fan').evidence.modifiers,true);
});
