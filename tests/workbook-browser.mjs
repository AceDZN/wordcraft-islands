/** Real iframe inputs against a versioned local mount, then the released host.
 * Parent fixture stages only an iframe/message recorder; no game state writes.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const origin=process.env.WORKBOOK_ORIGIN??'http://127.0.0.1:4263';
const mount=process.env.WORKBOOK_MOUNT??'/play/wordcraft-islands/test/';
const released=process.env.WORKBOOK_RELEASED==='1';
const out='work/workbook';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:false});const rows=[],checks=[],errors=[];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.glb':'model/gltf-binary','.ttf':'font/ttf','.wav':'audio/wav','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
async function fixture(search,storageState){
 const context=await browser.newContext({viewport:{width:1280,height:826},storageState});const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 if(!released)await page.route(`${origin}${mount}**`,async route=>{const name=decodeURIComponent(new URL(route.request().url()).pathname.slice(mount.length))||'index.html';try{const file=path.resolve('dist',name);assert.ok(file.startsWith(path.resolve('dist')+path.sep));await route.fulfill({body:await fs.readFile(file),contentType:mime[path.extname(file)]??'application/octet-stream'});}catch{await route.fulfill({status:404,body:'not found'});}});
 await page.route(`${origin}/__wordcraft_host__**`,route=>route.fulfill({contentType:'text/html',body:`<!doctype html><style>html,body{margin:0;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%}</style><iframe id="game" title="Wordcraft Islands" src="${mount}index.html${search}"></iframe><script>window.received=[];addEventListener('message',e=>{if(e.source===document.querySelector('iframe').contentWindow&&e.origin===location.origin)received.push(e.data)})</script>`}));
 await page.goto(`${origin}/__wordcraft_host__`,{waitUntil:'commit'});const handle=await page.locator('#game').elementHandle();const f=await handle.contentFrame();await f.waitForFunction(()=>typeof window.render_game_to_text==='function',null,{polling:100,timeout:60000});return{context,page,f};
}
const state=f=>f.evaluate(()=>JSON.parse(window.render_game_to_text()));
const messages=p=>p.evaluate(()=>window.received);
async function ready(a){await a.page.waitForFunction(()=>window.received.some(m=>m.type==='ready'),null,{polling:100,timeout:60000});}
async function book(f,phrase,edit=false){if(await f.locator('#inspect').isVisible())await f.locator('#close-inspect').click();if(!(await f.locator('#notebook').isVisible()))await f.locator(edit?'#edit-selected':'#book-btn').click();await f.fill('#phrase',phrase);await f.locator('#create').click();}
async function place(f,zone){if(zone){const s=await state(f),i=s.zones.findIndex(z=>z.id===zone);assert.ok(i>=0,zone);await f.locator('#target-choices button').nth(i).click();}await f.locator('#place').click();}
async function complete(a){await a.f.locator('#use-btn').click();await a.f.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='complete',null,{polling:100,timeout:20000});}
try{
 // Every public island can be opened from a fresh profile without prefix wins.
 for(let n=1;n<=50;n++){
  const a=await fixture(`?level=${n}`);await ready(a);const s=await state(a.f),events=await messages(a.page);
  assert.equal(s.campaign.number,n);assert.equal(s.completed.length,0);assert.equal(s.campaign.unlockedThrough,1);assert.equal(s.models.loaded.length,5);assert.equal(s.models.errors.length,0);assert.notEqual(s.mode,'welcome');
  assert.deepEqual(events.map(m=>m.type),['ready','level-start']);assert.equal(events[1].level,n);assert.ok(events.every(m=>m.source==='workbook-game'&&m.version===1&&m.slug==='wordcraft-islands'));
  if([1,11,27,38,50].includes(n))await a.page.screenshot({path:`${out}/deep-link-${n}.png`});
  rows.push({number:n,completed:s.completed.length,frontier:s.campaign.unlockedThrough,models:s.models.loaded.length,events});console.log(`LINK ${n}/50 PASS`);await a.context.close();
 }
 const a=await fixture('?level=1');await ready(a);await book(a.f,'an unlit lamp');await place(a.f);assert.equal((await state(a.f)).world.ready,false);assert.equal((await messages(a.page)).filter(m=>m.type==='level-complete').length,0);await book(a.f,'a plank',true);await place(a.f);await a.f.locator('#undo-btn').click();assert.equal((await state(a.f)).world.ready,false);await book(a.f,'a plank',true);await place(a.f);assert.equal((await messages(a.page)).filter(m=>m.type==='level-complete').length,0);await complete(a);
 let events=await messages(a.page);assert.deepEqual(events.map(m=>m.type),['ready','level-start','level-complete']);assert.equal(events[2].level,1);assert.ok(events[2].durationMs>0);assert.equal((await state(a.f)).completed.length,1);
 await a.f.locator('#replay').click();await book(a.f,'a ladder');await place(a.f);await complete(a);events=await messages(a.page);assert.deepEqual(events.map(m=>m.type),['ready','level-start','level-complete','level-start','level-complete']);await a.f.locator('#next').click();assert.equal((await state(a.f)).campaign.number,2);assert.equal((await messages(a.page)).at(-1).type,'level-start');assert.equal((await messages(a.page)).at(-1).level,2);checks.push('actual wrong/replacement/Undo/real crossing; restart+Next event ordering without duplicate ready');
 const earned=await a.context.storageState();await a.context.close();
 const late=await fixture('?level=50',earned);await ready(late);assert.equal((await state(late.f)).campaign.number,50);assert.deepEqual((await state(late.f)).completed,['g7-crossing']);
 await late.f.locator('#levels-btn').click();assert.equal(await late.f.locator('.campaign-map__node:not(:disabled)').count(),3);await late.f.locator('.campaign-map__close').click();
 await book(late.f,'a large light wooden boat');await place(late.f,'cargo');await late.f.locator('#inspect-btn').click();await late.f.locator('.object-choice').filter({hasText:'The keeper lent this fan to the helper.'}).click();await late.f.locator('#modify').click();const reading=(await state(late.f)).workbook.activeSeconds;await new Promise(r=>setTimeout(r,650));assert.equal((await state(late.f)).workbook.activeSeconds,reading);await late.f.fill('#phrase','a powerful fan');await late.f.locator('#create').click();await place(late.f,'wind');await book(late.f,'a key');await place(late.f,'chest');await book(late.f,'a bright lamp');await place(late.f,'cave');await complete(late);const ls=await state(late.f);events=await messages(late.page);assert.equal(ls.completed.length,2);assert.equal(ls.campaign.finished,false);assert.equal(ls.campaign.unlockedThrough,2);assert.deepEqual(events.map(m=>m.type),['ready','level-start','level-complete']);assert.equal(events[2].level,50);assert.ok(!('score'in events[2])&&!('stars'in events[2]));await late.page.screenshot({path:`${out}/linked-50-complete.png`});checks.push('saved-progress override, no invented predecessor wins, actual linked50 success and excluded editor time');await late.context.close();
 const invalid=await fixture('?level=50&level=1',earned);await ready(invalid);assert.equal((await state(invalid.f)).mode,'welcome');assert.equal((await state(invalid.f)).campaign.number,2);assert.deepEqual((await messages(invalid.page)).map(m=>m.type),['ready']);await invalid.context.close();checks.push('ambiguous link preserves earned resume and does not invent a start');
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/bridge-results.json`,JSON.stringify({released,rows,checks,errors,passed:true},null,2));console.log('WORKBOOK BRIDGE UI PASSED');
}catch(error){await fs.writeFile(`${out}/bridge-results.json`,JSON.stringify({released,rows,checks,errors,error:String(error),passed:false},null,2));console.error(error);process.exitCode=1;}finally{await browser.close();}
