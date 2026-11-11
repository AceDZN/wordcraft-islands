/** All actions use the actual notebook/buttons. Inspection never mutates game state.
 * Fixture witnesses supply varied solutions. Travel uses the public simulation clock
 * except six representative real-time voyages; no save/ready/win injection. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {levels,solutionActions} from '../src/campaign-levels';
const origin=process.env.GAME_URL??'http://127.0.0.1:4263';
const out='work/dynamic/browser';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:false});
const context=await browser.newContext({viewport:{width:1360,height:900},hasTouch:true});const page=await context.newPage();page.setDefaultTimeout(15000);
const prior=process.env.DYNAMIC_TOUCH_ONLY?JSON.parse(await fs.readFile(`${out}/results.json`,'utf8')):undefined;
if(prior)assert.equal(prior.rows.length,50,'touch-only rerun requires completed50 UI evidence');
const errors:string[]=[],rows:any[]=prior?.rows??[],checks:string[]=prior?.checks??[];let number=0;
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
async function enter(n:number){await page.goto(`${origin}/?level=${n}`,{waitUntil:'commit'});await page.waitForFunction(()=>typeof window.render_game_to_text==='function'&&JSON.parse(window.render_game_to_text()).models.loaded.length===8,null,{polling:100,timeout:60000});assert.equal((await state()).campaign.number,n);}
async function close(){if(await page.locator('#inspect').isVisible())await page.locator('#close-inspect').click();if(await page.locator('#notebook').isVisible())await page.locator('#close-book').click();}
async function create(phrase:string,modifyId?:string){await close();if(modifyId){await page.locator('#inspect-btn').click();await page.locator(`[data-item-id="${modifyId}"]`).click();await page.locator('#modify').click();}else await page.locator('#book-btn').click();
 assert.equal(await page.locator('#guided-example').isVisible(),false);await page.fill('#phrase',phrase);await page.locator('#create').click();assert.equal((await state()).mode,'placement',`${phrase}: ${await page.locator('#phrase-feedback').textContent()}`);}
async function place(zone:number){await page.locator('#target-choices button').nth(zone).click();await page.locator('#place').click();}
async function finish(realTime=false){await page.locator('#use-btn').click();if(realTime)await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='complete',null,{polling:100,timeout:25000});else{for(let i=0;i<90&&(await state()).mode!=='complete';i++)await page.evaluate(()=>window.advanceTime(200));}assert.equal((await state()).mode,'complete');}
try{
 for(const level of (prior?[]:levels)){number=level.number;await enter(number);assert.equal((await state()).learning.assisted,false);assert.equal((await state()).mode,'explore');
  if([2,12,25,38,50].includes(number)){
   await create('a ladder');await place(0);assert.equal((await state()).world.ready,false);
   await page.locator('#undo-btn').click();assert.equal((await state()).items.filter((o:any)=>o.id.startsWith('created')).length,0);checks.push(`wrong-item/Undo ${number}`);
  }
  for(const action of solutionActions[level.id]){await create(action.phrase,action.modifyId);for(const zone of action.zones)await place(zone);}
  const ready=await state();assert.equal(ready.world.ready,true,`${number}: ${ready.world.reason}`);assert.equal(ready.learning.assisted,false);
  if([2,3,5,11,17,25,29,32,35,37,38,44,48,50].includes(number))await page.screenshot({path:`${out}/level-${String(number).padStart(2,'0')}-ready.png`});
  const real=[1,2,6,17,37,50].includes(number);await finish(real);rows.push({number,title:level.title,phrases:ready.items.map((o:any)=>o.phrase),assisted:ready.learning.assisted,realTime:real,completed:(await state()).completed.length});console.log(`WIN ${number}/50`);
  if(number===1){await page.locator('#next').click();assert.equal((await state()).campaign.number,2);checks.push('earned Next1→2');}
  if(number===50){await page.screenshot({path:`${out}/final-complete.png`});await page.locator('#next').click();assert.equal((await state()).mode,'map');checks.push('final Next opens map');}
 }
 // Same situations, different actual objects and travel modes.
 if(!prior){for(const [n,phrase] of [[1,'a bridge'],[1,'a canoe'],[2,'a tarp'],[2,'a tent'],[2,'a raincoat'],[6,'a raft'],[17,'a candle']] as const){await enter(n);await create(phrase);await place(0);assert.equal((await state()).world.ready,true,phrase);await finish();checks.push(`alternative ${n}: ${phrase}`);}
 // Spelling is hidden until requested; unsupported words do not reveal an answer.
 await enter(2);await page.locator('#book-btn').click();await page.fill('#phrase','a plang');await page.locator('#create').click();assert.equal((await state()).learning.assisted,false);assert.equal(await page.locator('#suggestion').innerText(),'עזרה באיות');await page.locator('#suggestion').click();assert.equal((await state()).learning.assisted,true);await page.locator('#suggestion').click();assert.equal(await page.locator('#phrase').inputValue(),'a plank');checks.push('opt-in spelling reveal');}
 // Phone + short landscape controls, notebook, alternative, replacement, Undo.
 for(const viewport of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(viewport);await enter(2);await page.locator('#book-btn').tap();assert.equal(await page.locator('#phrase').inputValue(),'');await page.screenshot({path:`${out}/notebook-${viewport.width}.png`});await page.fill('#phrase','a ladder');await page.locator('#create').tap();await page.locator('#place').tap();await page.locator('#edit-selected').tap();await page.fill('#phrase','a tarp');await page.locator('#create').tap();await page.locator('#place').tap();assert.equal((await state()).world.ready,true);await page.screenshot({path:`${out}/tarp-${viewport.width}.png`});await page.locator('#undo-btn').tap();assert.equal((await state()).world.ready,false);checks.push(`touch replace/Undo ${viewport.width}`);}
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/results.json`,JSON.stringify({passed:true,campaignFromPriorUiRun:!!prior,rows,checks,errors},null,2));
}catch(e){await page.screenshot({path:`${out}/failure-${number}.png`}).catch(()=>{});await fs.writeFile(`${out}/results.json`,JSON.stringify({passed:false,number,rows,checks,errors,error:String(e)},null,2));console.error(e);process.exitCode=1;}finally{await browser.close();}
