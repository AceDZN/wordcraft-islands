import {chromium} from 'playwright';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
const dir=path.dirname(new URL(import.meta.url).pathname);await fs.mkdir(path.join(dir,'raw'),{recursive:true});
const browser=await chromium.launch({headless:false});
const context=await browser.newContext({viewport:{width:1280,height:800},recordVideo:{dir:path.join(dir,'raw'),size:{width:1280,height:800}}});
const videoStart=Date.now(),page=await context.newPage(),events=[],errors=[];let start=Date.now();
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const mark=async name=>{const value={second:(Date.now()-start)/1000,name,state:await state()};events.push(value);console.log(name,value.second,value.state.mode);};
const until=async sec=>{const ms=sec*1000-(Date.now()-start);if(ms>0)await page.waitForTimeout(ms);};
try{
 await page.goto('http://localhost:5263');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).models.loaded.length===5);await page.evaluate(()=>document.fonts.ready);await page.bringToFront();start=Date.now();await mark('clear-welcome');
 await until(2);await page.click('#start');await page.waitForSelector('#notebook',{state:'visible'});await page.screenshot({path:path.join(dir,'01-guided-notebook.png')});await mark('one-guided-next-step');
 await until(4);await page.locator('#phrase').pressSequentially('a plank',{delay:90});await page.click('#create');await page.waitForSelector('#placement',{state:'visible'});const preview=(await state()).preview;await page.mouse.move(600,600);await page.mouse.move(400,400);assert.deepEqual((await state()).preview,preview);await page.screenshot({path:path.join(dir,'02-stable-placement.png')});await mark('preview-does-not-follow-cursor');
 await until(8);await page.click('#place');await page.screenshot({path:path.join(dir,'03-one-current-action.png')});await mark('supported-bridge-opens-try');
 await until(10);await page.click('#use-btn');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='complete',null,{timeout:15000});await mark('real-time-walk-and-reward');
 await until(19);await page.keyboard.press('Enter');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).level==='g7-rain');await page.click('#use-btn');await page.waitForSelector('#notebook',{state:'visible'});await page.locator('#phrase').pressSequentially('two umbrellas',{delay:75});await page.click('#create');await mark('next-problem-same-simple-loop');
 await until(25);await page.click('#place');await until(27);await page.click('#place');await page.screenshot({path:path.join(dir,'04-rain-ready.png')});await mark('two-deliberate-cover-placements');
 await until(29);await page.click('#use-btn');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='complete',null,{timeout:15000});await mark('second-real-time-completion');await until(38);assert.deepEqual(errors,[]);
}finally{
 await fs.writeFile(path.join(dir,'record-states.json'),JSON.stringify({method:'Real-time headed browser; normal pointer/typing and Enter Next. No advanceTime or win injection. Silent Playwright video; audio separately verified.',offsetSeconds:(start-videoStart)/1000,events,errors},null,2));const video=page.video();await context.close();await video.saveAs(path.join(dir,'revised-flow.webm'));await browser.close();console.log('recording-saved');
}
