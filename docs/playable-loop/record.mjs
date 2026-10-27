import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.dirname(new URL(import.meta.url).pathname);
await fs.mkdir(path.join(root,'raw'),{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:path.join(root,'raw'),size:{width:1280,height:720}}});
const videoStarted=Date.now();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const states=[];let start=Date.now();
const mark=async(name)=>{const v={second:(Date.now()-start)/1000,name,state:await page.evaluate(()=>JSON.parse(window.render_game_to_text()))};states.push(v);console.log(name,v.second,v.state.mode);};
const until=async(sec)=>{const ms=sec*1000-(Date.now()-start);if(ms>0)await page.waitForTimeout(ms);};
const create=async(text)=>{await page.click('#book-btn');await page.locator('#phrase').pressSequentially(text,{delay:65});await page.press('#phrase','Enter');};
try{
await page.goto('http://localhost:5263');await page.waitForFunction(()=>typeof window.render_game_to_text==='function');await page.bringToFront();await page.keyboard.press('Enter');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).models.loaded.length===5);start=Date.now();await mark('explore-and-inspect-problem');
await until(5);await create('a short plank');await mark('short-object-preview');await until(12);await page.keyboard.press('Enter');await mark('unsupported-short-span-sinks');await page.screenshot({path:path.join(root,'01-short-span.png'),timeout:15000});
await until(18);await page.click('#undo-btn');await create('a ladder');await mark('retrieve-alternative-ladder');await until(26);await page.keyboard.press('Enter');await mark('both-ends-supported');await page.screenshot({path:path.join(root,'02-supported-alternative.png'),timeout:15000});
await until(32);await page.locator('#world').focus();await page.keyboard.down('d');await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='complete',null,{timeout:12000});await page.keyboard.up('d');await mark('explorer-physically-crosses');await until(39);
if((await page.evaluate(()=>JSON.parse(window.render_game_to_text()))).mode!=='complete'){await page.keyboard.down('d');await page.evaluate(()=>window.advanceTime(400));await page.keyboard.up('d');}
await mark('star-and-completion-evidence');await until(45);await page.selectOption('#grade','8');await page.selectOption('#mission-select','g8-length');await mark('new-measured-gap');
await until(49);await create('a long wooden plank');await mark('modifier-changes-geometry');await until(56);await page.keyboard.press('Enter');await mark('longer-span-succeeds');await page.screenshot({path:path.join(root,'03-property-consequence.png'),timeout:15000});await until(62);
}finally{await fs.writeFile(path.join(root,'state-sequence.json'),JSON.stringify({captured:'actual UI, no state injection; video silent, audio preview separate',startOffsetSeconds:(start-videoStarted)/1000,states,errors},null,2));const video=page.video();await context.close();await video.saveAs(path.join(root,'source-loop.webm'));await browser.close();console.log(JSON.stringify({steps:states.map(s=>({second:s.second,name:s.name,mode:s.state.mode})),errors}));}
