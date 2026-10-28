/** Human-authored UI playbook, from the displayed missions; no fixture solver imports.
 * State inspection is read-only. Every object, placement and win uses normal UI.
 * Travel uses real requestAnimationFrame time; no advanceTime calls or storage seeds.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='work/full-campaign';
await fs.mkdir(out,{recursive:true});
const playbook=[
 [['a plank','crossing']],
 [['an umbrella','parcel-1']],
 [['two umbrellas','parcel-n','parcel-s']],
 [['a rope','crossing']],
 [['three umbrellas','parcel-1','parcel-2','parcel-3']],
 [['a boat','ferry']],
 [['a crate','plate']],
 [['a sponge','spill']],
 [['a key','chest']],
 [['a key','chest'],['a boat','ferry']],
 [['a long plank','crossing']],
 [['a large umbrella','parcel-1']],
 [['a light crate','plate',{story:'The dock keeper placed this crate here.'}]],
 [['a heavy bucket','plate']],
 [['a large crate','cargo']],
 [['a wooden boat','cargo']],
 [['a bright lamp','cave']],
 [['a small boat','ferry']],
 [['a small boat','cargo']],
 [['two umbrellas','parcel-1','parcel-2'],['a bright lamp','cave']],
 [['a large crate','plate']],
 [['two crates','plate','plate-b']],
 [['a long rope','crossing']],
 [['a large plank','crossing']],
 [['a fan','wind']],
 [['a crate','plate',{story:'gardener'}]],
 [['a heavy crate','plate',{story:'helper'}]],
 [['a boat','cargo']],
 [['two fans','wind','wind-b']],
 [['two fans','wind','wind-b'],['a small boat','cargo']],
 [['a large wooden crate','cargo']],
 [['a large wooden boat','cargo']],
 [['a long rope','crossing']],
 [['a light wooden boat','cargo']],
 [['a powerful fan','wind']],
 [['a powerful fan','wind',{story:'Fan A'}]],
 [['a powerless fan','wind',{story:'Nest fan'}]],
 [['three sponges','spill','spill-b','spill-c']],
 [['two sponges','spill','spill-b'],['a key','chest']],
 [['a light wooden boat','cargo'],['a powerless fan','wind',{story:'clock'}]],
 [['a light balloon','ferry']],
 [['a large wooden boat','cargo',{story:'The helper borrowed'}]],
 [['two light fans','wind','wind-b']],
 [['a large metal bucket','plate']],
 [['a large wooden crate','cargo'],['a powerful fan','wind',{story:'tree'}]],
 [['two large sponges','spill','spill-b'],['a bright lamp','cave']],
 [['a large light wooden boat','cargo'],['two fans','wind','wind-b']],
 [['a long rope','crossing',{story:'helper'}]],
 [['a key','chest'],['a bright lamp','cave'],['a large wooden boat','cargo']],
 [['a large light wooden boat','cargo'],['a powerful fan','wind',{story:'keeper lent'}],['a key','chest'],['a bright lamp','cave']]
];
const resume=process.argv.includes('--resume-earned');
const prior=resume?JSON.parse(await fs.readFile(`${out}/results.json`,'utf8')):undefined;
const browser=await chromium.launch({headless:false});
const context=await browser.newContext({viewport:{width:1280,height:826},...(resume?{storageState:`${out}/earned-profile.json`}:{})});
const page=await context.newPage();page.setDefaultTimeout(20000);
const rows=prior?.rows??[],checks=prior?.checks??[],errors=[];let current=0;
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const stable=s=>s.items.map(({screen,visualX,visualZ,...item})=>item).sort((a,b)=>a.id.localeCompare(b.id));
const check=(name,detail={})=>{checks.push({number:current,name,...detail});};
async function screenshot(name){await new Promise(r=>setTimeout(r,480));await page.screenshot({path:`${out}/${String(current).padStart(2,'0')}-${name}.png`});}
async function report(error){await fs.writeFile(`${out}/results.json`,JSON.stringify({fresh:true,resumedEarnedProfile:resume,noStateInjection:true,realTimeTravel:true,rows,checks,errors,error:error?String(error):null},null,2));await context.storageState({path:`${out}/earned-profile.json`});}
async function closePanels(){if(await page.locator('#notebook').isVisible())await page.locator('#close-book').click();if(await page.locator('#inspect').isVisible())await page.locator('#close-inspect').click();if(await page.locator('#help-details').getAttribute('open')!==null)await page.locator('#help-details summary').click();}
async function book(phrase,edit=false){
 await closePanels();await page.locator(edit?'#edit-selected':'#book-btn').click();await page.fill('#phrase',phrase);await page.locator('#create').click();
 assert.equal((await state()).mode,'placement',`${phrase}: ${await page.locator('#phrase-feedback').textContent()}`);
}
async function placeZones(zones){
 for(const zone of zones){const s=await state(),index=s.zones.findIndex(z=>z.id===zone);assert.ok(index>=0,`visible zone not found: ${zone}`);await page.locator('#target-choices button').nth(index).click();await page.locator('#place').click();}
 assert.equal((await state()).preview,null,'batch still has pending items');
}
async function chooseStory(text){
 await closePanels();await page.locator('#inspect-btn').click();const choice=page.locator('.object-choice').filter({hasText:new RegExp(text,'i')});assert.equal(await choice.count(),1,`ambiguous visible history: ${text}`);await choice.click();await page.locator('#modify').click();
}
async function step(action,edit=false){
 const [phrase,...tail]=action,story=tail.find(x=>typeof x==='object'),zones=tail.filter(x=>typeof x==='string');
 if(story){await chooseStory(story.story);await page.fill('#phrase',phrase);await page.locator('#create').click();assert.equal((await state()).mode,'placement');}
 else await book(phrase,edit);
 await placeZones(zones);
}
async function auditStory(action){
 const [phrase,...tail]=action,story=tail.find(x=>typeof x==='object'),zones=tail.filter(x=>typeof x==='string');
 await chooseStory(story.story);let before=await state();const seedId=before.selected,seedState=stable(before);
 await page.fill('#phrase','an umbrella');await page.locator('#create').click();assert.equal((await state()).mode,'notebook');assert.ok(await page.locator('#phrase-feedback').innerText());assert.deepEqual(stable(await state()),seedState);check('story noun substitution rejected without damage');
 const plural=phrase.replace(/^(a|an) /,'two ')+'s';await page.fill('#phrase',plural);await page.locator('#create').click();assert.equal((await state()).mode,'notebook');assert.deepEqual(stable(await state()),seedState);check('story quantity substitution rejected without damage');
 await page.locator('#close-book').click();await page.locator('#remove-selected').click();assert.equal((await state()).nextAction.kind,'recover');
 // A later action must not bury the only recovery route to a deleted original.
 await book('a short plank');await page.locator('#place').click();await page.locator('#use-btn').click();assert.equal((await state()).mode,'inspect');assert.ok((await state()).items.some(item=>item.id===seedId));await page.locator('#close-inspect').click();await page.locator('#undo-btn').click();assert.ok(!(await state()).items.some(item=>item.id===seedId));await page.locator('#undo-btn').click();await page.locator('#undo-btn').click();assert.deepEqual(stable(await state()),seedState);check('missing original can be recovered after another action and recovery itself is undoable');
 const others=before.items.filter(item=>!item.id.startsWith('created-')&&item.id!==seedId&&item.phrase.split(' ').at(-1)===before.items.find(item=>item.id===seedId).phrase.split(' ').at(-1));
 if(others.length){await page.locator('#inspect-btn').click();await page.locator(`.object-choice[data-item-id="${others[0].id}"]`).click();await page.locator('#modify').click();await page.fill('#phrase',phrase);await page.locator('#create').click();await placeZones(zones);assert.equal((await state()).world.primaryReady,false,'wrong original identity passed');await page.locator('#undo-btn').click();assert.deepEqual(stable(await state()),seedState);check('wrong referent property edit fails and Undo restores both originals');}
 await chooseStory(story.story);await page.locator('#close-book').click();
}
async function wrongAndRecovery(){
 await book('an unlit lamp');await page.locator('#place').click();let s=await state();assert.equal(s.world.ready,false,'wrong lamp solved level');const initial=stable(s),wrongId=s.selected;
 await screenshot('wrong');
 await book('a short plank',true);await page.locator('#cancel-place').click();assert.deepEqual(stable(await state()),initial,'cancel changed original');check('cancel replacement retains original');
 await book('a short plank',true);await page.locator('#place').click();s=await state();assert.equal(s.world.ready,false,'short plank unexpectedly solved task');assert.equal(s.selected,wrongId);assert.match(s.items.find(i=>i.id===wrongId).phrase,/short plank/);
 // Native keyboard undo during exploration.
 await page.locator('#world').focus();await page.keyboard.press('Control+z');assert.deepEqual(stable(await state()),initial,'confirmed replacement Undo changed original');check('wrong noun replacement + Undo restores exact object');
 await page.locator('#remove-selected').click();assert.ok(!(await state()).items.some(i=>i.id===wrongId));await page.locator('#undo-btn').click();assert.deepEqual(stable(await state()),initial,'remove Undo did not restore object');check('remove + Undo restores exact object');
 await page.locator('#move-selected').click();await page.locator('#cancel-place').click();assert.deepEqual(stable(await state()),initial,'move cancellation changed original');check('move cancel retains exact object');
 // Keyboard Undo must also work while the replacement is only a preview.
 await book('a short plank',true);await page.locator('#world').focus();await page.keyboard.press('Control+z');assert.equal((await state()).preview,null);assert.deepEqual(stable(await state()),initial);check('keyboard Undo cancels replacement preview');
 return initial;
}
try{
 await page.goto(process.env.FULL_URL??'http://127.0.0.1:5263/?full-player-audit=1',{waitUntil:'commit'});await page.waitForFunction(()=>typeof window.render_game_to_text==='function',null,{polling:100,timeout:60000});
 assert.equal((await state()).completed.length,rows.length);await page.locator('#start').click();if(!resume)await page.locator('#notebook').waitFor({state:'visible'});
 for(current=rows.length+1;current<=50;current++){
  let s=await state();assert.equal(s.campaign.number,current);assert.equal(s.completed.length,current-1);await closePanels();const objective=await page.locator('#mission').innerText(),title=await page.locator('#title').innerText();console.log(`PLAY ${current}/50 ${title}: ${objective}`);
  await closePanels();if(current===1){await page.locator('#levels-btn').click();assert.equal(await page.locator('.campaign-map__node').count(),50);assert.equal(await page.locator('.campaign-map__node:not(:disabled)').count(),1);await page.keyboard.press('Escape');check('fresh map locks later islands');}
  const original=await wrongAndRecovery(),actions=playbook[current-1],firstStory=actions[0].some(x=>typeof x==='object');
  if(firstStory){
   // Created lookalike does not replace the referenced story object.
   const [phrase,...tail]=actions[0];await book(phrase,true);await placeZones(tail.filter(x=>typeof x==='string'));assert.equal((await state()).world.ready,false,'created lookalike replaced story identity');await page.locator('#undo-btn').click();assert.deepEqual(stable(await state()),original);await page.locator('#remove-selected').click();
   await auditStory(actions[0]);const seedState=stable(await state());
   await step(actions[0]);await page.locator('#undo-btn').click();assert.deepEqual(stable(await state()),seedState);check('story property edit Undo restores identity, history and position');await step(actions[0]);
  }else{
   await step(actions[0],true);await page.locator('#undo-btn').click();assert.deepEqual(stable(await state()),original,'correct replacement/batch Undo did not restore wrong object');check('useful replacement/batch Undo restores original before retry');await step(actions[0],true);
  }
  for(const action of actions.slice(1)){if(action.some(x=>typeof x==='object'))await auditStory(action);await step(action);}
  s=await state();assert.equal(s.world.ready,true,`${current}: ${s.world.reason}`);assert.ok(s.items.every(i=>Math.abs(i.x)<=8.3&&Math.abs(i.z)<=3.5));await screenshot('ready');
  // Keep the task readable inside the notebook on later multi-condition puzzles.
  if([30,45,50].includes(current)){await page.locator('#book-btn').click();await page.locator('#notebook .task-reference summary').click();assert.equal(await page.locator('#notebook .task-reference p').innerText(),objective);await screenshot('task-in-editor');await page.locator('#close-book').click();check('task remains readable in editor');}
  const started=Date.now();await page.locator('#use-btn').click();let samples=[];
  while((await state()).mode!=='complete'){
   const t=await state();samples.push({x:t.player.x,z:t.player.z,carried:t.motion.carried,onVessel:t.motion.onVessel,clip:t.motion.clip});assert.ok(Date.now()-started<25000,`travel timed out on${current}`);await new Promise(r=>setTimeout(r,180));
   if(samples.length===5&&[1,6,33,50].includes(current))await screenshot('travelling');
  }
  s=await state();assert.equal(s.completed.length,current);assert.equal(s.campaign.unlockedThrough,Math.min(50,current+1));assert.equal(s.audio.loops,3);assert.equal(s.audio.loaded,17);assert.equal(s.models.errors.length,0);assert.ok(samples.length>2,'no physical movement observed');
  rows.push({number:current,title,objective,actions,checks:checks.filter(c=>c.number===current).length,travelMs:Date.now()-started,samples,world:s.world,completed:s.completed.length,renderStats:s.renderStats});await screenshot('complete');await report();console.log(`PASS ${current}/50; recovery checks ${checks.filter(c=>c.number===current).length}; real travel ${rows.at(-1).travelMs}ms`);
  if(current<50){await page.locator('#next').click();await page.waitForFunction(n=>JSON.parse(window.render_game_to_text()).campaign.number===n,current+1,{polling:100});await new Promise(r=>setTimeout(r,400));}
 }
 await page.locator('#next').click();assert.equal((await state()).mode,'map');assert.equal((await state()).campaign.finished,true);assert.equal(await page.locator('.campaign-map__node:not(:disabled)').count(),50);await screenshot('all-earned-map');check('final Next opens all50 earned map without wrapping');assert.deepEqual(errors,[]);await report();console.log('FULL FRESH 50 RECOVERY PLAYTHROUGH PASSED');
}catch(error){await screenshot('failure').catch(()=>{});await report(error);console.error(error);process.exitCode=1;}
finally{await browser.close();}
