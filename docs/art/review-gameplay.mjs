// Reproducible art check. Uses real UI; no win-state injection.
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5263');await page.click('#start');
await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).models.loaded.length===5);
await page.waitForTimeout(1000);await page.screenshot({path:'docs/art/gameplay-courier.png'});
await page.keyboard.down('ArrowRight');await page.waitForTimeout(180);await page.screenshot({path:'docs/art/gameplay-run-a.png'});
await page.waitForTimeout(180);await page.screenshot({path:'docs/art/gameplay-run-b.png'});await page.keyboard.up('ArrowRight');
async function summon(phrase,x,z){await page.click('#book-btn');await page.fill('#phrase',phrase);await page.click('#create');await page.waitForSelector('#placement:not([hidden])');for(let i=0;i<Math.round(Math.abs(x)/.2);i++)await page.keyboard.press(x<0?'ArrowLeft':'ArrowRight');for(let i=0;i<Math.round(Math.abs(z)/.2);i++)await page.keyboard.press(z<0?'ArrowUp':'ArrowDown');await page.click('#place');}
await summon('a crate',-4,-2);await summon('a lamp',-6,-2);await summon('a balloon',-7,2);await summon('a boat',0,2);
await page.waitForTimeout(500);await page.screenshot({path:'docs/art/gameplay-catalog.png'});
await page.click('#book-btn');await page.fill('#phrase','a long wooden plank');await page.click('#create');await page.waitForSelector('#placement:not([hidden])');await page.screenshot({path:'docs/art/gameplay-placement.png'});
await page.click('#place');await page.waitForTimeout(500);await page.screenshot({path:'docs/art/gameplay-bridge.png'});
const state=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
console.log(JSON.stringify({errors,state},null,2));await browser.close();
