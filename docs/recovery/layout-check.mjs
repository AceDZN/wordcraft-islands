import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:false});const errors=[],checks=[];
const state=page=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const wait=page=>page.waitForFunction(()=>typeof window.render_game_to_text==='function',null,{polling:100,timeout:60000});
async function click(page,selector,touch=false){if(touch)await page.locator(selector).tap();else await page.locator(selector).click();}
async function earnSecond(page,touch){
 await page.goto('http://127.0.0.1:5263/?recovery=3',{waitUntil:'commit'});await wait(page);await click(page,'#start',touch);await page.locator('#notebook').waitFor({state:'visible'});await page.fill('#phrase','a plank');await click(page,'#create',touch);await click(page,'#place',touch);await click(page,'#use-btn',touch);await page.evaluate(()=>window.advanceTime(7000));assert.equal((await state(page)).mode,'complete');await click(page,'#next',touch);await page.locator('#notebook').waitFor({state:'visible'});await page.fill('#phrase','a ladder');await click(page,'#create',touch);await click(page,'#place',touch);assert.equal((await state(page)).nextAction.kind,'replace');
}
async function reachable(page,selector){const rect=await page.locator(selector).boundingBox();assert.ok(rect,selector);const top=await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('button')?.id,{x:rect.x+rect.width/2,y:rect.y+rect.height/2});assert.equal(top,selector.slice(1),`${selector} covered`);return rect;}
try{
 for(const touch of [false,true]){
  const context=await browser.newContext({viewport:touch?{width:390,height:844}:{width:1200,height:826},isMobile:touch,hasTouch:touch});const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await earnSecond(page,touch);for(const selector of ['#edit-selected','#move-selected','#remove-selected','#use-btn','#book-btn','#levels-btn','#settings-btn','#pause-btn'])await reachable(page,selector);
  if(!touch){
   await click(page,'#edit-selected');await click(page,'#inspect-btn');assert.equal(await page.locator('#notebook').isVisible(),false);assert.equal(await page.locator('#inspect').isVisible(),true);await click(page,'#close-inspect');await click(page,'#edit-selected');await page.fill('#phrase','an umbrella');await click(page,'#create');await page.screenshot({path:'work/recovery/editor-preview-clean.png'});assert.equal((await state(page)).items[0].phrase,'a ladder');await click(page,'#cancel-place');checks.push('Inventory switches out of the open editor; replacement cancel keeps ladder');
  }else{
   await click(page,'#edit-selected',true);assert.equal(await page.locator('#feedback').isVisible(),false);await reachable(page,'#create');await page.screenshot({path:'work/recovery/phone-editor.png'});await click(page,'#close-book',true);await page.setViewportSize({width:844,height:390});await page.evaluate(()=>window.advanceTime(16));await page.screenshot({path:'work/recovery/landscape-tools.png'});for(const selector of ['#edit-selected','#move-selected','#remove-selected','#use-btn','#book-btn','#levels-btn','#settings-btn','#pause-btn'])await reachable(page,selector);const objective=await page.locator('#objective').boundingBox(),use=await page.locator('#use-btn').boundingBox();assert.ok(objective.y+objective.height<=use.y,'objective overlaps primary action');checks.push('Portrait touch editor and landscape object controls remain reachable without overlap');
   await click(page,'#edit-selected',true);await page.fill('#phrase','an umbrella');await click(page,'#create',true);await click(page,'#place',true);assert.equal((await state(page)).world.covered,1);await click(page,'#use-btn',true);await page.evaluate(()=>window.advanceTime(7000));assert.equal((await state(page)).mode,'complete');checks.push('Touch ladder replacement and completion pass');
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);await fs.writeFile('work/recovery/layout-results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors}));
}finally{await browser.close();}
