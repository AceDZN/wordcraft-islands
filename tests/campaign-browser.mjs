/** Independent sequential UI playtest. Run: npx tsx tests/campaign-browser.mjs */
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {levels} from '../src/campaign-levels.ts';
import {parsePhrase} from '../src/rules.ts';
const URL=process.env.CAMPAIGN_QA_URL||'http://localhost:5263';
const REPORT='docs/CAMPAIGN_PLAYTEST.md';
const OLD_IDS=['g7-crossing','g7-rain','g7-inlet','g8-length','g8-weight','g8-history','g9-cargo','g9-power','g9-storm'];
const rows=[],checks=[],errors=[];let currentPage,currentLevel,passed=false;
const checkpoint=process.env.CAMPAIGN_QA_RESUME==='1'?JSON.parse(await fs.readFile(process.env.CAMPAIGN_QA_CHECKPOINT||'work/campaign/earned-resume.json','utf8')):null;
const controlsOnly=checkpoint?.rows.length===50;
if(checkpoint){assertCheckpoint(checkpoint);rows.push(...checkpoint.rows);checks.push(...checkpoint.checks);checks.push({name:'Continuation restored exact previously earned UI save; no new completion IDs added',completed:checkpoint.save.completedIds.length,reason:checkpoint.reason});}
function assertCheckpoint(value){if(value.save.completedIds.length!==value.rows.length||value.rows.some((row,i)=>row.id!==levels[i].id||value.save.completedIds[i]!==row.id))throw new Error('Checkpoint is not an exact sequential earned-prefix record.');}
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const esc=value=>String(value??'').replaceAll('|','\\|').replaceAll('\n',' ');
const state=p=>p.evaluate(()=>({...JSON.parse(window.render_game_to_text()),pageFocus:{hidden:document.hidden,focused:document.hasFocus()},save:JSON.parse(localStorage.getItem('wordcraft-campaign-v2')||'null')}));
const mark=(name,data={})=>{checks.push({name,...data});console.log(name);};
async function report(error){
 let last;if(currentPage&&!currentPage.isClosed()){try{last=await state(currentPage);}catch{}}
 const lines=['# Campaign progression and browser QA','',`Status: **${passed?'PASSED':rows.length===50?'GAMEPLAY VERIFIED; additional controls incomplete':'INCOMPLETE'}** — ${rows.length}/50 sequential level completions verified.`, '',`Command: \`${checkpoint?'CAMPAIGN_QA_RESUME=1 ':''}npx tsx tests/campaign-browser.mjs\` at ${URL}.`, '', 'This campaign uses real notebook creation/modification, placement, contextual travel and ordinary progression. Travel advances through 160 ms calls to the same simulation hook; no player position or win state is injected. Map/migration/mobile fixtures are separate and never count as played levels. Source grades are internal metadata, not access gates.','', '## Sequential campaign', '', '| # | Level | Kind | Objects used | Route samples | Completed / frontier | Audio loops / geometries |','|---|---|---|---|---|---|---|',...rows.map(r=>`| ${r.number} | ${esc(r.id)} | ${r.kind} | ${esc(r.phrases.join('; '))} | ${r.samples} | ${r.completed} / ${r.frontier} | ${r.loops} / ${r.geometries} |`),'','## Controls, saves and audio', '',...checks.map(c=>`- ${c.name}${Object.keys(c).length>1?`: ${JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k])=>k!=='name')))}`:''}`),'','## Limits','','This is a mechanical solvability/progression and browser playback check. It does not establish retained English mastery, spontaneous learner comprehension, subjective engagement, or human musical audition. Travel uses deterministic time steps; audio tail/mute checks use real elapsed time. Native tab-hide and platform speech limitations remain in AUDIO.md. No new music, assets, runtime files, debug unlocks, or production wins are added by this harness.'];
 if(error)lines.push('','## Blocking result','',String(error),'','```json',JSON.stringify({currentLevel:currentLevel?.id,errors,last},null,2),'```');
 else lines.push('','Browser errors: '+JSON.stringify(errors));
 await fs.writeFile(REPORT,lines.join('\n')+'\n');
}
// Independent plan selection uses public noun properties + declared numeric goals,
// never an authored answer string or evaluatePlacement as an answer oracle.
const optionGroups=noun=>[
 ['', 'small','large'],
 ...(['plank','ladder','rope'].includes(noun)?[['','short','long']]:[]),
 ['','light','heavy'],
 ...(noun==='fan'?[['','powerless','powerful']]:[]),
 ...(noun==='lamp'?[['','unlit','bright']]:[]),
 ...(['plank','ladder','crate','boat','bucket','fan','lamp','key'].includes(noun)?[['','wooden','metal']]:[])
];
function combinations(groups){return groups.reduce((rows,group)=>rows.flatMap(row=>group.map(x=>[...row,x])),[[]]);}
const nouns=['plank','ladder','rope','umbrella','bucket','sponge','boat','crate','balloon','fan','key','lamp'];
const candidates=nouns.flatMap(noun=>combinations(optionGroups(noun)).flatMap(parts=>{
 const words=[...parts.filter(Boolean),noun],phrase=`${/^[aeiou]/.test(words[0])?'an':'a'} ${words.join(' ')}`,parsed=parsePhrase(phrase);
 return parsed.ok?[{phrase,spec:parsed.spec,cost:words.length}]:[];
})).sort((a,b)=>a.cost-b.cost||a.phrase.length-b.phrase.length);
const within=(n,min,max)=>n>=(min??-Infinity)-1e-8&&n<=(max??Infinity)+1e-8;
const fits=(s,g={})=>within(s.width,g.minWidth,g.maxWidth)&&within(s.mass,g.minMass,g.maxMass)&&(!g.requiredMaterial||s.material===g.requiredMaterial);
function pick(level,nounList,predicate,g=level.goals||{}){
 const hints=level.mission.toLowerCase();
 const choices=candidates.filter(c=>nounList.includes(c.spec.noun)&&fits(c.spec,g)&&predicate(c.spec));
 choices.sort((a,b)=>a.cost-b.cost||Number(!hints.includes(a.spec.noun))-Number(!hints.includes(b.spec.noun))||nounList.indexOf(a.spec.noun)-nounList.indexOf(b.spec.noun));
 assert(choices.length,`No independent supported plan for ${level.id}: ${JSON.stringify({nounList,goals:g})}`);return choices[0];
}
function planFor(level){
 const g=level.goals||{},zone=level.zones[0],plan=[],targetSeed=level.seeds?.find(s=>s.id===level.targetId),targetNoun=targetSeed?parsePhrase(targetSeed.phrase).spec.noun:null;
 const add=(candidate,zoneId,seedId,role='primary')=>plan.push({phrase:candidate.phrase,zoneId,seedId,role});
 if(level.kind==='bridge')add(pick(level,targetNoun?[targetNoun]:['plank','ladder','rope'],s=>s.span&&s.length/2>=level.gap/2+.3+Math.abs(zone.x)-1e-8&&Math.abs(zone.z)<.8),zone.id,targetSeed?.id);
 if(level.kind==='shelter')for(const z of level.zones.filter(z=>!['chest','cave','puddle'].includes(z.id)))add(pick(level,['umbrella','bucket','sponge'],s=>s.rain>0),z.id);
 if(['ferry','cargo','storm'].includes(level.kind))add(pick(level,targetNoun&&targetNoun!=='fan'?[targetNoun]:['boat','crate','balloon'],s=>s.float&&within(s.capacity,g.minCapacity??(['cargo','storm'].includes(level.kind)?8:1),g.maxCapacity)),zone.id,targetNoun&&targetNoun!=='fan'?targetSeed.id:undefined);
 if(level.kind==='weight'){
  const seed=level.seeds?.find(s=>s.id===level.targetId),noun=seed?parsePhrase(seed.phrase).spec.noun:null;
  const choices=candidates.filter(c=>(noun?[noun]:['crate','bucket','boat']).includes(c.spec.noun)&&fits(c.spec,g));
  let choice=choices.find(c=>c.spec.mass>(level.reference??6));
  if(choice)add(choice,zone.id,seed?.id);else{assert(!seed,`Targeted load cannot reach threshold: ${level.id}`);choice=[...choices].sort((a,b)=>b.spec.mass-a.spec.mass)[0];assert(choice,'no permitted load');const n=Math.floor((level.reference??6)/choice.spec.mass)+1;assert(n<15,'too many test loads');for(let i=0;i<n;i++)add(choice,zone.id);}
 }
 if(['wind','storm'].includes(level.kind)){
  const seed=level.targetId?level.seeds?.find(s=>s.id===level.targetId):undefined;assert(!level.targetId||seed,`Missing target seed: ${level.id}`);
  const fg=level.kind==='storm'?{}:g, fanZone=level.kind==='storm'?level.zones[1]:zone;
  const available=candidates.filter(c=>c.spec.noun==='fan'&&fits(c.spec,fg));
  let fans=available.filter(c=>within(c.spec.force,g.minForce??8,g.maxForce)).slice(0,1);
  if(!fans.length&&!seed){
   const unique=[];for(const candidate of available)if(!unique.some(c=>c.spec.force===candidate.spec.force))unique.push(candidate);
   for(let count=2;count<=4&&!fans.length;count++){
    const tuples=Array.from({length:count}).reduce(rows=>rows.flatMap(row=>unique.map(c=>[...row,c])),[[]]);
    fans=tuples.find(tuple=>within(tuple.reduce((n,c)=>n+c.spec.force,0),g.minForce??8,g.maxForce))??[];
   }
  }
  assert(fans.length,`No supported fan aggregate for ${level.id}`);
  fans.forEach((fan,i)=>{const extra=level.zones.find(z=>z.id==='wind-b'&&Math.hypot(z.x-fanZone.x,z.z-fanZone.z)<1.25);add(fan,i>0&&extra?extra.id:fanZone.id,seed?.id);});
 }
 if(g.unlock)add(pick(level,['key'],()=>true,level.kind==='workshop'?g:{}),'chest',undefined,'unlock');
 if(g.illuminate)add(pick(level,['lamp'],s=>s.light>0,level.kind==='workshop'?g:{}),'cave',undefined,'illuminate');
 if(g.minAbsorb!==undefined){const sponge=candidates.filter(c=>c.spec.noun==='sponge'&&fits(c.spec,g)&&c.spec.absorb>0).sort((a,b)=>b.spec.absorb-a.spec.absorb)[0];assert(sponge,`No absorbent matches bounds: ${level.id}`);const n=Math.ceil(g.minAbsorb/sponge.spec.absorb);assert(n+plan.length<=18,`Object cap prevents absorption: ${level.id}`);const base=level.zones.find(z=>['puddle','spill'].includes(z.id))??zone,spots=level.zones.filter(z=>/spill|puddle/.test(z.id)&&Math.hypot(z.x-base.x,z.z-base.z)<1.25);for(let i=0;i<n;i++)add(sponge,(spots[i%spots.length]??base).id,undefined,'absorb');}
 return plan;
}
async function closeBook(p){if(await p.locator('#notebook').isVisible())await p.locator('#close-book').click({force:true});}
async function createAndPlace(p,step){
 if(step.seedId){await closeBook(p);if(!(await p.locator('#inspect').isVisible()))await p.locator('#inspect-btn').click({force:true});await p.locator(`[data-item-id="${step.seedId}"]`).click({force:true});await p.locator('#modify').click({force:true});}
 else{if(await p.locator('#notebook').isVisible()&&((await p.locator('#create').textContent())||'').includes('שנו'))await closeBook(p);if(!(await p.locator('#notebook').isVisible()))await p.locator('#book-btn').click({force:true});}
 await p.locator('#phrase').fill(step.phrase);await p.locator('#create').click({force:true});await p.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='placement',{},{polling:100,timeout:60000});
 const s=await state(p),zi=s.zones.findIndex(z=>z.id===step.zoneId);assert(zi>=0,`UI has no target ${step.zoneId} in ${s.level}`);
 await p.locator('#target-choices > button').nth(zi).click({force:true});await p.locator('#place').click({force:true});
}
async function batchAtZones(p,phrase,zoneIds){
 await closeBook(p);await p.locator('#book-btn').click({force:true});await p.locator('#phrase').fill(phrase);await p.locator('#create').click({force:true});await p.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='placement',{},{polling:100,timeout:60000});const samples=[];
 for(let i=0;i<zoneIds.length;i++){let s=await state(p);assert(s.preview.remaining===zoneIds.length-i,'batch count/placement state mismatch');const zi=s.zones.findIndex(z=>z.id===zoneIds[i]);assert(zi>=0,'missing batch anchor');await p.locator('#target-choices > button').nth(zi).click({force:true});await p.locator('#place').click({force:true});s=await state(p);samples.push({remaining:s.preview?.remaining??0,force:s.world.force,absorbed:s.world.absorbed,ready:s.world.ready,positions:s.items.map(o=>({id:o.id,x:o.x,z:o.z}))});if(i<zoneIds.length-1)assert(!s.world.ready,'aggregate puzzle rewarded too early');}
 const final=await state(p);assert(final.world.ready,'plural batch did not satisfy physical aggregate');mark('Actual plural batch creation and placement',{number:currentLevel.number,phrase,samples});return final;
}
async function start(p){
 await p.goto(URL,{waitUntil:'networkidle'});await p.waitForFunction(()=>typeof window.render_game_to_text==='function',{},{polling:100,timeout:90000});
 assert((await p.locator('#grade').count())===0,'grade selector remains visible');
 await p.locator('#start').click({force:true});await p.waitForFunction(()=>JSON.parse(window.render_game_to_text()).audio.loaded===17,{},{polling:100,timeout:90000});
 await delay(420);const s=await state(p);assert(s.audio.state==='running'&&s.audio.loops===3&&!s.audio.loadError,'initial audio assets/loops');return s;
}
async function openMap(p){if(await p.locator('.campaign-map').isVisible())return;await closeBook(p);if(await p.locator('#complete').isVisible())await p.locator('#next').click({force:true});else if(await p.locator('#pause').isVisible())await p.locator('#pause-map').click({force:true});else await p.locator('#levels-btn').click({force:true});await p.locator('.campaign-map').waitFor({state:'visible'});await delay(220);}
async function chooseMap(p,number){await openMap(p);const node=p.locator(`.campaign-map__node[data-number="${number}"]`);assert(!(await node.isDisabled()),'earned map node is disabled');await node.click({force:true});await p.locator('.campaign-map').waitFor({state:'hidden'});await delay(420);}
async function travel(p){
 await p.locator('#use-btn').click({force:true});const samples=[];let s;
 for(let i=0;i<180;i++){await p.evaluate(()=>window.advanceTime(160));s=await state(p);samples.push({x:s.player.x,z:s.player.z,carried:s.motion.carried,mode:s.mode});if(s.mode==='complete')break;await delay(18);}
 assert(s.mode==='complete',`Route failed: ${s.level} ${JSON.stringify({player:s.player,motion:s.motion,world:s.world,focus:s.pageFocus})}`);
 assert(samples.length>=3,'goal route had no intermediate physics samples');return {s,samples};
}
function wireErrors(p){p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(`${m.text()} @ ${JSON.stringify(m.location())}`);});}
async function gain(p,channel,value){await p.locator(`#gain-${channel}`).evaluate((el,n)=>{el.value=String(n);el.dispatchEvent(new Event('input',{bubbles:true}));},value);}
let browser;
try{
 assert(levels.length===50,`Expected50 authored levels, found${levels.length}`);
 assert(new Set(levels.map(l=>l.id)).size===50,'duplicate campaign IDs');
 await fs.mkdir('work/campaign',{recursive:true});
 const plans=levels.map(planFor);assert(plans.every(plan=>plan.length),'empty/vacuous level plan');
 browser=await chromium.launch({headless:process.env.CAMPAIGN_HEADED!=='1',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const storageState=checkpoint?{cookies:[],origins:[{origin:new globalThis.URL(URL).origin,localStorage:[{name:'wordcraft-campaign-v2',value:JSON.stringify(checkpoint.save)}]}]}:undefined;
 const context=await browser.newContext({viewport:{width:1280,height:800},storageState});const p=currentPage=await context.newPage();wireErrors(p);let s=await start(p);
 if(!checkpoint){assert(s.campaign.total===50&&s.campaign.number===1&&s.campaign.unlockedThrough===1,'fresh campaign state');
 await openMap(p);assert(await p.locator('.campaign-map__node').count()===50,'map must show50 nodes');assert(await p.locator('.campaign-map__node:not(:disabled)').count()===1,'fresh map has later unlocked nodes');
 const locked=p.locator('.campaign-map__node[data-number="50"]');await locked.scrollIntoViewIfNeeded();const box=await locked.boundingBox();await p.mouse.click(box.x+box.width/2,box.y+box.height/2);assert((await state(p)).level===levels[0].id,'pointer entered locked later level');
 await p.screenshot({path:'work/campaign/map-locked.png'});await p.locator('.campaign-map__close').click({force:true});mark('Fresh map shows50 nodes, only level1 playable; locked level50 pointer cannot enter');}else{assert(s.save.completedIds.length===rows.length&&s.level===levels[Math.min(rows.length,49)].id,'earned Resume changed completed prefix or next level');mark(controlsOnly?'Completed campaign resumed its saved final island':'UI resumed the exact next incomplete island after saved checkpoint',{number:s.campaign.number,completed:s.save.completedIds.length});}
 const touchCheckpoint=controlsOnly?JSON.parse(await fs.readFile('work/campaign/earned-resume.json','utf8')):null;if(touchCheckpoint)assertCheckpoint(touchCheckpoint);
 let mobileSave=touchCheckpoint?{cookies:[],origins:[{origin:new globalThis.URL(URL).origin,localStorage:[{name:'wordcraft-campaign-v2',value:JSON.stringify(touchCheckpoint.save)}]}]}:checkpoint?await context.storageState():undefined,lateIdentityMistake=checkpoint?checks.some(c=>c.name.includes('identified-object mistake')):false,lateNumericMistake=checkpoint?checks.some(c=>c.name.includes('numeric misconception')):false;const geometrySamples=[];
 mark('Initial renderer resource sample',{stats:s.renderStats});
 for(let i=rows.length;i<levels.length;i++){
  const level=currentLevel=levels[i],plan=plans[i];s=await state(p);assert(s.level===level.id,`Next loaded ${s.level}; expected${level.id}`);assert(!s.world.ready,`Level begins already solved: ${level.id}`);
  if(i>=24&&(!lateIdentityMistake||['wc-42-harbour-boat','wc-48-original-rope'].includes(level.id))&&level.targetId&&level.seeds?.length>1){
   const targetStep=plan.find(x=>x.seedId===level.targetId),wrong=level.seeds.find(x=>x.id!==level.targetId&&parsePhrase(x.phrase).spec.noun===parsePhrase(targetStep.phrase).spec.noun);
   if(wrong){await createAndPlace(p,{...targetStep,seedId:wrong.id});s=await state(p);assert(!(s.world.primaryReady??s.world.ready),'wrong identified object passed primary condition');assert((await p.locator('#feedback').textContent()).trim(),'wrong identity has no feedback');await p.locator('#undo-btn').click({force:true});lateIdentityMistake=true;mark('Later identified-object mistake and undo recovery',{number:i+1,id:level.id,wrong:wrong.id,required:level.targetId});}
  }
  if(i>=24&&!lateNumericMistake){
   let wrong,note;
   if(['cargo','ferry','storm'].includes(level.kind)&&(level.goals?.minCapacity??0)>10){wrong={phrase:'a large wooden crate',zoneId:level.zones[0].id};note='10-place container below declared larger capacity';}
   else if(level.kind==='bridge'&&level.gap+.6>3.3){wrong={phrase:'a plank',zoneId:level.zones[0].id};note='3.3m plank cannot span declared gap plus supports';}
   else if(['wind','storm'].includes(level.kind)&&(level.goals?.maxForce??Infinity)<12){const fanStep=plan.find(x=>parsePhrase(x.phrase).spec.noun==='fan');wrong={...fanStep,phrase:'a powerful fan'};note='12N exceeds declared force maximum';}
   if(wrong){await createAndPlace(p,wrong);s=await state(p);assert(!(s.world.primaryReady??s.world.ready),'wrong numeric property passed primary condition');await p.locator('#undo-btn').click({force:true});lateNumericMistake=true;mark('Later numeric misconception and undo recovery',{number:i+1,id:level.id,note});}
  }
  if(level.number===29){await batchAtZones(p,'two fans',['wind','wind-b']);await p.screenshot({path:'work/campaign/two-fans-ready.png'});}else if(level.number===38){await batchAtZones(p,'three sponges',['spill','spill-b','spill-c']);await p.screenshot({path:'work/campaign/three-sponges-ready.png'});}else for(const step of plan)await createAndPlace(p,step);
  s=await state(p);assert(s.world.ready,`Declared physical plan not ready: ${level.id}: ${s.world.reason}`);const before=s.audio.cueTotal;
  if(i===39||i===49)await p.screenshot({path:`work/campaign/level-${i+1}-ready.png`});
  const voyage=await travel(p);s=voyage.s;assert(s.audio.lastCue==='success'&&s.audio.state==='running','goal cue missing or suspended');
  assert(s.save.completedIds.length===i+1,`Fresh sequential completion count wrong at${i+1}`);assert(s.campaign.unlockedThrough===Math.min(50,i+2),'Next frontier did not unlock exactly one');assert(s.audio.loops===3&&s.audio.loaded===17,'audio sources duplicated or lost during campaign');
  if(i===49)await p.screenshot({path:'work/campaign/level-50-complete.png'});
  assert(typeof s.renderStats?.geometries==='number','renderer memory sample missing');geometrySamples.push({number:i+1,...s.renderStats});
  rows.push({geometries:s.renderStats.geometries,calls:s.renderStats.calls,triangles:s.renderStats.triangles,number:i+1,id:level.id,kind:level.kind,phrases:level.number===29?['two fans @wind,wind-b']:level.number===38?['three sponges @spill,spill-b,spill-c']:plan.map(x=>`${x.seedId?'modify '+x.seedId+': ':''}${x.phrase} @${x.zoneId}`),samples:voyage.samples.length,completed:s.save.completedIds.length,frontier:s.campaign.unlockedThrough,loops:s.audio.loops});console.log(`Solved ${i+1}/50 ${level.id}`);await report();
  if([0,24,49].includes(i)){const cues=s.audio.cueTotal;await delay(2200);s=await state(p);assert(s.audio.oneShots===0&&s.audio.cueTotal===cues&&s.audio.state==='running','flourish did not end naturally or repeated');mark('Natural single completion flourish',{number:i+1,loops:s.audio.loops});}
  if(i===1)mobileSave=await context.storageState();
  if(i===9){
   await p.locator('#next').click({force:true});await delay(420);const desired=await state(p);await chooseMap(p,1);s=await state(p);mark('Renderer level1 empty replay after ten wins',{stats:s.renderStats});assert(s.campaign.unlockedThrough===11&&s.save.completedIds.length===10,'replay altered frontier/wins');
   await p.reload({waitUntil:'networkidle'});await p.locator('#start').click({force:true});await delay(420);s=await state(p);assert(s.level===levels[0].id&&s.save.completedIds.length===10,'reload did not resume allowed replay');
   await chooseMap(p,11);s=await state(p);assert(s.level===desired.level,'map could not return to earned frontier');mark('Completed map replay and reload Resume preserve ten earned wins/frontier11');continue;
  }
  if(i<49){await p.locator('#next').click({force:true});await delay(420);}
 }
 assert(lateIdentityMistake,'no later identity recovery was exercised');assert(lateNumericMistake,'no later capacity recovery was exercised');
 if(!controlsOnly){s=await state(p);assert(s.campaign.finished&&s.save.currentId===levels.at(-1).id,'final campaign status/currentId');const finalId=s.level;await p.locator('#next').click({force:true});await delay(300);s=await state(p);assert(s.level===finalId&&s.campaign.finished,'final Next silently wrapped');await p.screenshot({path:'work/campaign/campaign-finished.png'});mark('All50 genuine sequential wins; final Next does not wrap to level1');
 mark('Renderer resources sampled throughout50',{samples:geometrySamples});}else mark('Remaining controls use exact earned50 profile; actual final goal/no-wrap already verified in preceding run');
 // Save/controls tests use the earned profile, never fabricated campaign wins.
 await chooseMap(p,1);await closeBook(p);const steadyGeometry=[];for(let n=0;n<3;n++){await p.locator('#pause-btn').click({force:true});await p.locator('#restart').click({force:true});await delay(120);await p.evaluate(()=>window.advanceTime(16));steadyGeometry.push((await state(p)).renderStats.geometries);}assert(Math.max(...steadyGeometry)-Math.min(...steadyGeometry)<=3,'same-scene geometry count grows on repeated restart');mark('Post50 identical-scene geometry is stable across three restarts',{geometries:steadyGeometry});
 await chooseMap(p,25);await closeBook(p);await p.locator('#pause-btn').click({force:true});await delay(160);assert((await state(p)).audio.state==='suspended','pause did not suspend');await p.locator('#resume').click({force:true});await delay(150);
 await p.locator('#pause-btn').click({force:true});await p.locator('#restart').click({force:true});await delay(200);s=await state(p);assert(s.audio.loops===3&&s.save.completedIds.length===50,'restart duplicated loops or erased campaign wins');
 await closeBook(p);await p.locator('#settings-btn').click({force:true});await gain(p,'music',0);await gain(p,'sfx',0);await gain(p,'voice',.29);await gain(p,'master',.62);await p.locator('#settings-close').click({force:true});await delay(500);s=await state(p);assert(s.audio.rms<.00001&&s.audio.gains.voice===.29&&s.audio.gains.master===.62,'independent gains/mute failed');
 await p.locator('#settings-btn').click({force:true});await gain(p,'music',.48);await gain(p,'sfx',.58);await gain(p,'voice',.85);await gain(p,'master',.75);await p.locator('#settings-close').click({force:true});mark('Earned campaign survives pause/restart; audio3 loops and independent gains remain valid');
 await chooseMap(p,38);await closeBook(p);const absorption=plans[37].find(step=>step.role==='absorb');await createAndPlace(p,absorption);s=await state(p);await p.screenshot({path:'work/campaign/absorption-partial.png'});mark('Earned island38 replay exposes actual partial puddle absorption',{absorbed:s.world.absorbed,required:levels[37].goals.minAbsorb,ready:s.world.ready});
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,storageState:mobileSave});const mp=await mobile.newPage();wireErrors(mp);await start(mp);await closeBook(mp);await mp.locator('#levels-btn').tap({force:true});await mp.locator('.campaign-map').waitFor();
 await mp.screenshot({path:'work/campaign/map-touch.png'});const first=mp.locator('.campaign-map__node[data-number="1"]');await first.scrollIntoViewIfNeeded();const hit=await first.boundingBox();assert(hit.width>=40&&hit.height>=40,'touch map target too small');await first.tap({force:true});await delay(420);assert((await state(mp)).level===levels[0].id,'touch replay did not enter earned level');
 await closeBook(mp);await mp.locator('#levels-btn').tap({force:true});const later=mp.locator('.campaign-map__node[data-number="50"]');await later.scrollIntoViewIfNeeded();const lb=await later.boundingBox();await mp.touchscreen.tap(lb.x+lb.width/2,lb.y+lb.height/2);assert((await state(mp)).level===levels[0].id,'touch entered locked later level');await mp.locator('.campaign-map__close').tap({force:true});mark('390×844 touch map replays an earned level, retains locked later levels, and closes');await mobile.close();
 const legacy=await browser.newContext({viewport:{width:1100,height:760}});await legacy.addInitScript(ids=>localStorage.setItem('wordcraft-completed',JSON.stringify(ids)),[...OLD_IDS,'foreign-unknown']);const lp=await legacy.newPage();wireErrors(lp);s=await start(lp);
 assert(s.save.version===2&&s.save.completedIds.length===9&&OLD_IDS.every(id=>s.save.completedIds.includes(id)),'old nine-ID migration lost recognised wins or invented extras');assert(!s.campaign.finished,'nine old wins falsely finish50');mark('Separate old-nine-ID migration preserves exactly nine recognised wins, excludes foreign ID, and remains unfinished');await legacy.close();
 assert(errors.length===0,`Browser errors: ${errors.join('; ')}`);passed=true;await report();console.log('CAMPAIGN QA PASSED:50 sequential real-object wins plus controls/progress/migration.');
}catch(error){await report(error);console.error(error);process.exitCode=1;}finally{if(browser)await browser.close();}
