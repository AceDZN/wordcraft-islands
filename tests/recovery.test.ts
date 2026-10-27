import test from 'node:test';
import assert from 'node:assert/strict';
import {makeItem,parsePhrase,evaluatePlacement,type Spec} from '../src/rules';
import {prepareObjectEdit} from '../src/editing';
import {nextAction} from '../src/flow';
import {levels} from '../src/campaign-levels';

const spec=(phrase:string):Spec=>{
 const parsed=parsePhrase(phrase);assert.ok(parsed.ok,phrase);
 if(!parsed.ok)throw Error(parsed.message);
 return parsed.spec;
};

test('a player-created wrong ladder can become an umbrella directly',()=>{
 const old=makeItem('a ladder','created-2',1,0);
 const result=prepareObjectEdit(old,spec('an umbrella'));
 assert.ok(result.ok);if(!result.ok)return;
 assert.equal(result.replacingType,true);
 assert.equal(result.spec.noun,'umbrella');
 assert.ok(result.spec.rain>0);
});

test('the offered level 2 recovery action can actually solve the rain task',()=>{
 const level=levels[1],old=makeItem('a ladder','created-2',level.zones[0].x,level.zones[0].z);
 assert.equal(evaluatePlacement(level,[old]).ready,false);
 assert.equal(nextAction(level,[old],old.id).kind,'replace');
 const result=prepareObjectEdit(old,spec('an umbrella'));
 assert.ok(result.ok);if(!result.ok)return;
 assert.equal(evaluatePlacement(level,[{...old,spec:result.spec}]).ready,true);
});

test('a replacement can explicitly request a new quantity',()=>{
 const result=prepareObjectEdit(makeItem('a ladder','created-2'),spec('two umbrellas'));
 assert.ok(result.ok);if(!result.ok)return;
 assert.equal(result.spec.count,2);
 assert.equal(result.spec.evidence.count,true);
});

test('canonical aliases modify the same object type',()=>{
 const result=prepareObjectEdit(makeItem('a crate','created-1'),spec('a heavy box'));
 assert.ok(result.ok);if(!result.ok)return;
 assert.equal(result.replacingType,false);
 assert.equal(result.spec.noun,'crate');
 assert.equal(result.spec.mass,12);
});

test('an authored story object cannot be changed into a different noun',()=>{
 const medicine=makeItem('a crate','medicine',-4,1.4,'The crate that carried the medicine.');
 const before=structuredClone(medicine);
 const result=prepareObjectEdit(medicine,spec('a heavy bucket'));
 assert.equal(result.ok,false);
 if(!result.ok)assert.match(result.message,/סיפור|מסוים/);
 assert.deepEqual(medicine,before);
});

test('an authored story object cannot be multiplied to bypass its identity',()=>{
 const result=prepareObjectEdit(makeItem('a crate','medicine'),spec('two heavy crates'));
 assert.equal(result.ok,false);
});

test('an authored object accepts a property change and its canonical alias',()=>{
 const old=makeItem('a crate','medicine',-4,1.4,'Medicine delivery');
 const result=prepareObjectEdit(old,spec('a heavy box'));
 assert.ok(result.ok);if(!result.ok)return;
 assert.equal(result.replacingType,false);
 assert.equal(result.spec.mass,12);
 assert.equal(result.spec.count,1);
 assert.equal(old.id,'medicine');
 assert.equal(old.origin,'Medicine delivery');
});

test('preparing an edit mutates neither the live item nor the parser result',()=>{
 const old=makeItem('a fan','fan-a',-4,-1,'Fan A, repaired yesterday.');
 const next=spec('a heavy powerful fan'),oldBefore=structuredClone(old),nextBefore=structuredClone(next);
 const result=prepareObjectEdit(old,next);assert.ok(result.ok);if(!result.ok)return;
 assert.deepEqual(old,oldBefore);assert.deepEqual(next,nextBefore);
 result.spec.adjectives.push('large');result.spec.evidence.family=false;
 assert.deepEqual(old,oldBefore);assert.deepEqual(next,nextBefore);
});

test('prefilled article and spelling are excluded from edit production evidence',()=>{
 const result=prepareObjectEdit(makeItem('a crate','created-1'),spec('a large wooden crate'));
 assert.ok(result.ok);if(!result.ok)return;
 assert.equal(result.spec.evidence.article,false);
 assert.equal(result.spec.evidence.spelling,false);
 assert.equal(result.spec.evidence.modifiers,true);
 assert.equal(result.spec.evidence.order,true);
});

test('unchanged modifiers and power word are not credited again',()=>{
 const result=prepareObjectEdit(makeItem('a large powerful fan','fan-a'),spec('a large powerful fan'));
 assert.ok(result.ok);if(!result.ok)return;
 assert.equal(result.spec.evidence.modifiers,false);
 assert.equal(result.spec.evidence.order,false);
 assert.equal(result.spec.evidence.family,false);
});

test('a newly changed power word remains observable learning evidence',()=>{
 const result=prepareObjectEdit(makeItem('a powerless fan','fan-a'),spec('a powerful fan'));
 assert.ok(result.ok);if(!result.ok)return;
 assert.equal(result.spec.force,12);
 assert.equal(result.spec.evidence.family,true);
});
