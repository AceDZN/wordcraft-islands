import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const root='work/campaign-record',errors=[],states=[];
const browser=await chromium.launch({headless:false,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1024},recordVideo:{dir:root,size:{width:1280,height:910}}});
const page=await context.newPage();
page.on('pageerror',error=>errors.push(String(error)));
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const save=async(name)=>{states.push({name,...await state()});await page.screenshot({path:`${root}/${name}.png`});};
try{
 await page.goto('http://localhost:5263',{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof window.render_game_to_text==='function');
 await page.click('#start');await page.waitForTimeout(900);await save('01-first-guide');
 await page.locator('#phrase').pressSequentially('a plank',{delay:110});await page.waitForTimeout(700);await page.click('#create');await page.waitForTimeout(600);await save('02-placing');
 await page.click('#place');await page.waitForTimeout(650);await page.click('#use-btn');await page.waitForTimeout(1300);await save('03-crossing');
 await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='complete',{},{timeout:15000});await page.waitForTimeout(600);await save('04-first-win');
 await page.click('#next');await page.waitForTimeout(850);await page.locator('#phrase').pressSequentially('an umbrella',{delay:100});await page.click('#create');await page.waitForTimeout(500);await page.click('#place');await page.waitForTimeout(650);await page.click('#use-btn');
 await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='complete',{},{timeout:15000});await page.waitForTimeout(600);await page.click('#next');await page.waitForTimeout(900);
 if(await page.locator('#notebook').isVisible())await page.click('#close-book');await page.click('#levels-btn');await page.waitForTimeout(800);await save('05-campaign-map');
 if(await page.locator('.campaign-map__node').count()!==50)throw Error('not50');
 await page.waitForTimeout(2500);await page.keyboard.press('Escape');await page.waitForTimeout(500);await save('06-resume');
 await fs.writeFile(`${root}/states.json`,JSON.stringify({states,errors},null,2));
 console.log(JSON.stringify({played:states.filter(s=>s.mode==='complete').length,completed:(await state()).completed,errors}));
}finally{await context.close();await browser.close();}
