import test from 'node:test';
import assert from 'node:assert/strict';
import {nextAction,screenDirection,walkingRoute,type Point} from '../src/flow';
import {levels} from '../src/levels';
import {makeItem,evaluatePlacement,supportsPoint,type Item,type Level} from '../src/rules';
const level=(id:string)=>{const l=levels.find(l=>l.id===id);assert.ok(l,id);return l;};
const at=(l:Level,phrase:string,id='created-1',zone=0)=>makeItem(phrase,id,l.zones[zone].x,l.zones[zone].z);
function assertRouteHasFloor(l:Level,items:Item[],start:Point,end:Point){
 const route=walkingRoute(l,items,start,end);let from=start;
 for(const to of route){for(let i=0;i<=80;i++){const p={x:from.x+(to.x-from.x)*i/80,z:from.z+(to.z-from.z)*i/80};if(Math.abs(p.x)<l.gap/2)assert.ok(supportsPoint(l,items,p.x,p.z),`route leaves actual floor at ${JSON.stringify(p)}`);}from=to;}
 assert.deepEqual(route.at(-1),end,'working route reaches requested destination');
}

test('screen-relative movement rotates with camera and avoids diagonal speed boost',()=>{
 for(const angle of [0,.55,Math.PI/2,Math.PI,3*Math.PI/2]){
  const right=screenDirection(1,0,angle),down=screenDirection(0,1,angle),diagonal=screenDirection(1,1,angle);
  assert.ok(Math.abs(Math.hypot(right.x,right.z)-1)<1e-8);assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-1)<1e-8);
  assert.ok(Math.abs(right.x*down.x+right.z*down.z)<1e-8);
  assert.ok(Math.abs(right.x-Math.cos(angle))<1e-8);assert.ok(Math.abs(right.z+Math.sin(angle))<1e-8);
 }
 assert.deepEqual(screenDirection(0,0,.55),{x:0,z:0});
});

test('current action starts with creation rather than an unavailable travel button',()=>{
 assert.equal(nextAction(level('g7-crossing'),[]).kind,'create');
 assert.equal(nextAction(level('g7-rain'),[]).kind,'create');
});

test('supported alternative solutions share a contextual try action',()=>{
 const l=level('g7-crossing');for(const phrase of ['a plank','a ladder','a rope'])assert.equal(nextAction(l,[makeItem(phrase)]).kind,'travel',phrase);
});

test('wrong length offers revision; one protected parcel offers a second cover',()=>{
 const short=makeItem('a short plank','created-short');assert.equal(nextAction(level('g8-length'),[short],short.id).kind,'revise');
 const rain=level('g7-rain'),cover=at(rain,'an umbrella');const n=nextAction(rain,[cover],cover.id);assert.equal(n.kind,'create');assert.match(n.label,/נותרו/);
});

test('referent tasks ask for inspection, then property revision without revealing target ID',()=>{
 const l=level('g8-history');const seeds=l.seeds!.map(s=>makeItem(s.phrase,s.id,s.x,s.z,s.origin));
 assert.equal(nextAction(l,seeds).kind,'select');
 for(const candidate of seeds)assert.equal(nextAction(l,seeds,candidate.id).kind,'revise');
});

test('two-condition transfer shows the remaining task after valid cargo',()=>{
 const l=level('g9-storm'),cargo=at(l,'a large wooden crate');
 const seeds=l.seeds!.map(s=>makeItem(s.phrase,s.id,s.x,s.z,s.origin));
 assert.equal(nextAction(l,[cargo,...seeds]).kind,'select');
 assert.equal(nextAction(l,[cargo]).kind,'recover');
 const fan=at(l,'a powerful fan','tree-fan',1);assert.equal(nextAction(l,[cargo,fan],fan.id).kind,'travel');
 assert.equal(nextAction(l,[fan],fan.id).kind,'create');
});

test('fan revision depends on force even when an irrelevant mass adjective is present',()=>{
 const l=level('g9-power'),fan=makeItem('a heavy powerless fan','fan-a',-6,-1.5);
 assert.equal(nextAction(l,[fan],fan.id).kind,'revise');
});

test('click route stops on reachable shore while crossing is physically unsolved',()=>{
 const l=level('g8-length'),from={x:-3.7,z:0},to={x:6.7,z:.5};
 const route=walkingRoute(l,[makeItem('a short plank')],from,to);
 assert.ok(route.length>0);assert.ok(route.every(p=>p.x<=-l.gap/2));
});

test('click route follows actual support for centered plank and narrow rope',()=>{
 const l=level('g7-crossing');for(const phrase of ['a plank','a rope'])assertRouteHasFloor(l,[makeItem(phrase)],{x:-3.7,z:0},{x:6.7,z:.5});
});

test('valid off-center bridge remains usable through the primary click route',()=>{
 const l=level('g7-crossing'),bridge=makeItem('a plank','created-offset',0,.7);assert.ok(evaluatePlacement(l,[bridge]).traversable);
 assertRouteHasFloor(l,[bridge],{x:-3.7,z:0},{x:6.7,z:.5});
});

test('valid rotated bridge remains usable through the primary click route',()=>{
 const l=level('g8-length'),bridge=makeItem('a long plank','created-diagonal');bridge.rot=.3;assert.ok(evaluatePlacement(l,[bridge]).traversable);
 assertRouteHasFloor(l,[bridge],{x:-3.7,z:0},{x:6.7,z:.5});
});
