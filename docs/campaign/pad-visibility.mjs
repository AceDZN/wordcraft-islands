import {chromium} from 'playwright';
import {levels} from '../src/campaign-levels.ts';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:false});
const context=await browser.newContext({viewport:{width:1280,height:800}});
const saved={version:2,completedIds:levels.map(level=>level.id),currentId:levels[28].id};
// A fresh isolated visual fixture restored after the full campaign check; never a played-win claim.
await context.addInitScript(value=>localStorage.setItem('wordcraft-campaign-v2',JSON.stringify(value)),saved);
const page=await context.newPage(),errors=[],samples=[];
page.on('pageerror',error=>errors.push(String(error)));
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const shot=async name=>{await page.evaluate(()=>window.advanceTime(16));samples.push({name,...await state()});await page.screenshot({path:`docs/campaign/${name}.png`});};
const create=async phrase=>{await page.click('#book-btn',{force:true});await page.fill('#phrase',phrase);await page.click('#create',{force:true});};
try{
 await page.goto('http://127.0.0.1:4263',{waitUntil:'commit',timeout:60000});await page.waitForFunction(()=>typeof window.render_game_to_text==='function',null,{polling:100,timeout:60000});await page.bringToFront();await page.click('#start',{force:true});await page.waitForTimeout(600);
 await create('two fans');await shot('fan-target-selected');await page.click('#place',{force:true});await page.click('#place',{force:true});
 let s=await state();if(!s.world.ready||s.world.force!==8)throw Error('two fans not ready');await shot('two-fans-visible');
 await page.click('#levels-btn',{force:true});await page.locator('.campaign-map__node[data-number="38"]').click({force:true});await page.waitForTimeout(100);
 await create('three sponges');await page.click('#place',{force:true});await shot('partial-absorption');
 await page.click('#place',{force:true});await page.click('#place',{force:true});s=await state();if(!s.world.ready||s.world.absorbed!==12)throw Error('three sponges not ready');await shot('three-sponges-visible');
 if(errors.length)throw Error(errors.join('\n'));
 await fs.writeFile('docs/campaign/pad-visibility.json',JSON.stringify({scope:'Restored earned-50 visual/control fixture after genuine campaign completion. No new played-win claim.',samples,errors},null,2));console.log('Pad visibility: two fans8N, three sponges12 units, no errors.');
}finally{await context.close();await browser.close();}
