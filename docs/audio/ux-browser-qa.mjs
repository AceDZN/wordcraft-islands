import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const baseUrl=process.env.AUDIO_QA_URL||'http://localhost:5263';
const browser=await chromium.launch({headless:process.env.AUDIO_HEADED!=='1',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const deterministicTravel=process.env.AUDIO_REALTIME_TRAVEL!=='1';
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();const records=[],errors=[];let startAutomationRoundTripMs=0;
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(`${m.text()} @ ${JSON.stringify(m.location())}`);});
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const check=(value,message)=>{if(!value)throw new Error(message);};
const get=()=>page.evaluate(()=>({...JSON.parse(window.render_game_to_text()),pageFocus:{focused:document.hasFocus(),hidden:document.hidden}}));
async function snap(label){
 const s=await get();records.push({label,pageFocus:s.pageFocus,mode:s.mode,level:s.level,player:s.player,motion:s.motion,world:{ready:s.world.ready,reason:s.world.reason,traversable:s.world.traversable,force:s.world.force},preview:s.preview,audio:s.audio,primaryAction:await page.locator('#use-btn').textContent(),instruction:await page.locator('#next-instruction').textContent(),feedback:await page.locator('#feedback').textContent(),phraseFeedback:await page.locator('#phrase-feedback').textContent()});return s;
}
const waitAudio=()=>page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).audio.loaded===17,{},{timeout:60000});
async function gain(channel,value){await page.locator(`#gain-${channel}`).evaluate((el,n)=>{el.value=String(n);el.dispatchEvent(new Event('input',{bubbles:true}));},value);}
async function create(phrase){await page.locator('#phrase').fill(phrase);await page.locator('#create').click();await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='placement');}
async function changeGrade(grade){await page.locator('#grade').selectOption(String(grade));await page.locator('#notebook').waitFor({state:'visible'});await delay(80);}
async function mission(id){if(await page.locator('#notebook').isVisible())await page.locator('#close-book').click();await page.locator('#islands-menu > summary').click();await page.locator('#mission-select').selectOption(id);await delay(100);}
async function travel(label){
 const before=await get();const start=performance.now();await page.locator('#use-btn').click();await delay(80);let s=await snap(`${label}: movement begins`);
 check(s.mode!=='complete'&&s.player.x<5,`${label}: contextual Try must start a real route, not jump to goal`);
 const positions=[];let sawCarried=false;
 while(performance.now()-start<30000){if(deterministicTravel)await page.evaluate(()=>window.advanceTime(160));s=await get();positions.push({atMs:Math.round(performance.now()-start),x:s.player.x,z:s.player.z,mode:s.mode,carried:s.motion.carried,route:s.motion.route,pageFocus:s.pageFocus,audioState:s.audio.state});sawCarried ||= s.motion.carried;if(s.mode==='complete')break;await delay(deterministicTravel?45:180);}
 records.push({label:`${label}: physical route samples`,deterministicTravel,positions,sawCarried,finalMode:s.mode});
 check(s.mode==='complete',`${label}: route should reach real goal`);
 check(positions.length>=5,`${label}: physical route needs intermediate positions`);
 s=await snap(`${label}: completion flourish`);
 const expected=before.audio.cueTotal+1+(sawCarried?1:0);
 check(s.audio.cueTotal===expected,`${label}: expected one goal flourish${sawCarried?' and one boarding splash':''}, got ${s.audio.cueTotal-before.audio.cueTotal}`);
 check(s.audio.lastCue==='success'&&s.audio.state==='running'&&s.audio.solved&&s.audio.oneShots>0,`${label}: success source must play with the hopeful layer`);
 if(label==='first crossing')await page.screenshot({path:'docs/audio/ux-complete.png'});
 const total=s.audio.cueTotal;await delay(2250);s=await snap(`${label}: flourish ends naturally`);
 check(s.audio.oneShots===0&&s.audio.state==='running'&&s.audio.cueTotal===total,`${label}: no repeated/cut/stuck flourish`);
 return {total,sawCarried};
}
try {
 await page.goto(baseUrl,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof window.render_game_to_text==='function');
 check((await snap('before Start')).audio.state==='locked','no playback before gesture');
 await page.evaluate(()=>{const button=document.querySelector('#start');button.addEventListener('click',()=>{window.__startEventAt=performance.now();},{capture:true,once:true});button.addEventListener('click',()=>{queueMicrotask(()=>{const s=JSON.parse(window.render_game_to_text());window.__startObservation={eventTurnMs:performance.now()-window.__startEventAt,overlayHidden:document.querySelector('#overlay').hidden,mode:s.mode,loaded:s.audio.loaded};});},{once:true});});
 const start=performance.now();await page.locator('#start').click();await page.waitForFunction(()=>document.querySelector('#overlay').hidden);
 startAutomationRoundTripMs=Math.round(performance.now()-start);const immediate=await snap('Start returns before audio assets finish');
 const observation=await page.evaluate(()=>window.__startObservation);records.push({label:'Start click-event microtask observation',...observation,automationRoundTripMs:startAutomationRoundTripMs});
 check(observation.overlayHidden&&['explore','notebook'].includes(observation.mode)&&observation.loaded<17,'Start must expose gameplay in its event turn, before audio loading completes');
 await page.locator('#notebook').waitFor({state:'visible'});await waitAudio();await delay(200);
 let s=await snap('first guide opens the creation notebook');
 check(s.audio.state==='running'&&s.audio.loops===3&&s.audio.loaded===17&&!s.audio.loadError,'17 buffers, three running loops');
 check(s.audio.rms>.00001,'first decoded loop playback must produce non-silent browser output');
 check(s.mode==='notebook'&&await page.locator('#phrase').isVisible(),'first interaction is a usable notebook');
 const initialX=s.player.x,initialZ=s.player.z;
 await page.locator('#phrase').fill('a plank');await page.locator('#phrase').press('ArrowRight');await delay(120);
 s=await get();check(s.player.x===initialX&&s.player.z===initialZ,'typing/editing cannot move courier');
 const beforeCreate=s.audio.cueTotal;await page.locator('#create').click();await delay(80);s=await snap('creation produces tangible preview');
 check(s.mode==='placement'&&!s.world.ready&&s.audio.lastCue==='create'&&s.audio.cueTotal===beforeCreate+1,'creation acknowledges preview, not puzzle completion');
 const beforePlace=s.audio.cueTotal;await page.locator('#place').click();await delay(160);s=await snap('placed plank opens physical route');
 check(s.world.ready&&s.audio.solved&&s.audio.lastCue==='confirm'&&s.audio.cueTotal===beforePlace+2,'one wood contact and one physical-ready confirmation');
 check(s.nextAction.kind==='travel','ready state provides contextual Try action');await page.screenshot({path:'docs/audio/ux-ready.png'});const readyPlayer={...s.player};const readyTotal=s.audio.cueTotal;
 await delay(600);s=await snap('ready waits for learner to Try');check(s.player.x===readyPlayer.x&&s.audio.cueTotal===readyTotal,'no automatic travel or repeated ready chime');
 const first=await travel('first crossing');await page.locator('#next').click();await delay(250);s=await snap('Continue resets lift without reward replay');
 check(s.level==='g7-rain'&&!s.audio.solved&&s.audio.loops===3&&s.audio.cueTotal===first.total,'Continue clears hopeful layer without duplicate reward');

 await changeGrade(8);s=await snap('grade 8 guide');
 let before=s.audio.cueTotal;await page.locator('#phrase').fill('a violin');await page.locator('#create').click();await delay(90);s=await snap('unsupported real noun uses neutral paper cue');
 check(s.mode==='notebook'&&s.audio.lastCue==='page'&&s.audio.cueTotal===before+1&&!s.world.ready,'catalogue miss must remain neutral');
 check(s.learning.rejectedPhrases>0,'catalogue limitation remains recorded honestly');
 before=s.audio.cueTotal;await page.locator('#phrase').fill('an plank');await page.locator('#create').click();await delay(90);s=await snap('article sound conflict has specific form feedback');
 check(s.audio.lastCue==='mistake'&&s.audio.cueTotal===before+1&&s.mode==='notebook','precise form conflict has one brief cue');
 await delay(450);check((await get()).audio.cueTotal===s.audio.cueTotal,'form error does not repeat while editing');
 await create('a short plank');before=(await get()).audio.cueTotal;await page.locator('#place').click();await delay(150);s=await snap('short span produces a recoverable physical consequence');
 check(!s.world.ready&&!s.audio.solved&&s.audio.lastCue==='wood'&&s.audio.cueTotal===before+1,'insufficient span is not rewarded');
 check((await page.locator('#feedback').textContent()).includes('1.8'),'failure text gives actual short length');
 before=s.audio.cueTotal;await delay(500);check((await get()).audio.cueTotal===before,'invalid placement cannot repeat cues each render');
 await page.locator('#use-btn').click();check(await page.locator('#notebook').isVisible(),'context action opens revision directly');
 await create('a long plank');before=(await get()).audio.cueTotal;await page.locator('#place').click();await delay(120);s=await snap('revision opens longer crossing');
 check(s.world.ready&&s.audio.solved&&s.audio.cueTotal===before+2&&s.audio.lastCue==='confirm','revision produces one new ready transition');
 await page.locator('#undo-btn').click();await delay(120);s=await snap('undo clears readiness without a false reward');
 check(!s.world.ready&&!s.audio.solved&&s.audio.lastCue==='undo','undo restores insufficient plank and removes hopeful layer');
 const afterUndo=s.audio.cueTotal;await delay(500);check((await get()).audio.cueTotal===afterUndo,'no stale queued confirmation after undo');

 await page.locator('#pause-btn').click();await delay(180);check((await snap('pause suspends')).audio.state==='suspended','pause suspends');
 await page.locator('#resume').click();await delay(220);check((await snap('resume plays same loops')).audio.state==='running','resume running');
 for(let i=0;i<3;i++){await page.locator('#pause-btn').click();await page.locator('#restart').click();await delay(150);s=await snap(`restart ${i+1}`);check(s.audio.loops===3&&s.audio.state==='running'&&!s.audio.solved,'restart reuses loop set and resets hopeful state');}
 await page.locator('#settings-btn').click();await delay(180);check((await get()).audio.state==='suspended','settings pause playback');
 await gain('music',0);await gain('sfx',0);await gain('voice',.23);await gain('master',.61);s=await snap('independent gain controls');
 check(s.audio.gains.music===0&&s.audio.gains.sfx===0&&s.audio.gains.voice===.23&&s.audio.gains.master===.61,'all UI gains independent');
 await page.locator('#settings-close').click();await delay(600);s=await snap('music and effects muted');check(s.audio.state==='running'&&s.audio.rms<.00001,'music/SFX mute is silent');
 await page.locator('#settings-btn').click();await gain('music',.48);await gain('sfx',.58);await gain('voice',.85);await gain('master',0);await page.locator('#settings-close').click();await delay(500);check((await snap('master mute')).audio.rms<.00001,'master mute is silent');
 await page.locator('#settings-btn').click();await gain('master',.75);await page.locator('#settings-close').click();await delay(200);

 await changeGrade(9);await mission('g9-power');s=await snap('identified fan context');
 await page.locator('#use-btn').click();await page.locator('[data-item-id="fan-a"]').click();await page.locator('#modify').click();await create('a powerful fan');
 before=(await get()).audio.cueTotal;await page.locator('#place').click();await delay(140);s=await snap('fan force opens sail route');
 check(s.world.ready&&s.audio.solved&&s.audio.cueTotal===before+2&&s.audio.lastCue==='confirm','fan start and physical readiness each occur once');
 const fan=await travel('identified-fan sail');check(fan.sawCarried,'fan route includes actual vessel travel');
 await page.locator('#next').click();await delay(200);s=await snap('next complex island resets hopeful layer');check(s.audio.cueTotal===fan.total&&s.audio.loops===3&&!s.audio.solved,'next island has no duplicate reward');

 await page.locator('#settings-btn').click();await gain('music',.37);await page.reload({waitUntil:'networkidle'});s=await snap('revised-flow settings survive reload');
 check(s.audio.state==='locked'&&s.audio.gains.music===.37,'persistence does not autoplay');
 await page.locator('#start').click();await waitAudio();await page.locator('#notebook').waitFor({state:'visible'});await delay(100);s=await snap('fresh Start still has three loops');
 check(s.audio.state==='running'&&s.audio.loaded===17&&s.audio.loops===3,'fresh Start reopens exactly three loops');
 await page.locator('#close-book').click();await page.locator('#settings-btn').click();await gain('music',.48);await page.locator('#settings-close').click();
 check(errors.length===0,`page/console errors: ${errors.join('; ')}`);
 const result={passed:true,deterministicTravel,browser:await browser.version(),headed:process.env.AUDIO_HEADED==='1',startAutomationRoundTripMs,errors,limitations:['Travel uses160ms deterministic game-time steps; audio flourish ends using real elapsed time. No win or position state is injected.','No human audition or subjective engagement claim.','No native OS/tab-hide claim; previous harness limitation remains.','Platform speech pronunciation and real utterance ducking not auditioned.','Material impact and short ready confirmation remain synchronous in current integration.'],records};
 await fs.writeFile('docs/audio/ux-browser-qa.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:true,startAutomationRoundTripMs,records:records.length,errors}));
} catch(error){await fs.writeFile('docs/audio/ux-browser-qa.json',JSON.stringify({passed:false,error:String(error),startAutomationRoundTripMs,errors,records},null,2)+'\n');throw error;}finally{await browser.close();}
