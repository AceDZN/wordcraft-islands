import './style.css';
import { World } from './world';
import { levels, chapters } from './campaign-levels';
import { createProgress, unlockedThrough, canPlay, enterLevel, completeLevel, resumeLevel, campaignFinished } from './campaign';
import { mountCampaignMap } from './campaign-map';
import { catalog, parsePhrase, makeItem, evaluatePlacement, supportsPoint, modeledPhrase, type Item, type Spec, type Evidence } from './rules';
import { nextAction, screenDirection, walkingRoute, placementPoint, objectiveStatus, type Point } from './flow';
import { audio } from './audio';
import { prepareObjectEdit } from './editing';

declare global { interface Window { render_game_to_text:()=>string; advanceTime:(ms:number)=>void; } }
const $ = <T extends HTMLElement=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
$('#app').innerHTML = `
<canvas id="world" aria-label="הקישו על הקרקע כדי ללכת, או על חפץ כדי לשנות אותו" tabindex="0"></canvas>
<header><div class="brand"><span class="brand-mark">W</span><div>WORDCRAFT<small>איים של מילים</small></div></div><nav>
<button id="levels-btn" aria-label="מפת 50 האיים"><span id="level-badge" dir="rtl">שלב 1 מתוך 50</span> ◉</button>
<button id="settings-btn" aria-label="הגדרות ושמע">♫</button><button id="pause-btn" aria-label="השהיה">Ⅱ</button></nav></header>
<section id="objective"><div class="eyebrow"><span id="stage"></span><span id="counter"></span></div><h1 id="title" dir="ltr"></h1><p id="mission" dir="ltr"></p><div id="world-status" dir="rtl" role="status" aria-live="polite"></div><div id="next-instruction" dir="rtl"></div><div class="step-track" aria-label="שלבי הפתרון"><span data-step="write">1 · כותבים</span><i></i><span data-step="place">2 · מניחים</span><i></i><span data-step="try">3 · מנסים</span></div><details id="help-details"><summary>עזרה והמשימה בעברית</summary><p id="mission-he" dir="rtl"></p><div class="row"><button id="teach-btn">הסבר קצר</button><button id="hint-btn">רמז לרעיון</button><button id="read-btn">Read aloud</button></div><p id="teaching" dir="rtl" hidden></p></details></section>
<div id="feedback" role="status" aria-live="polite" hidden></div>
<aside id="inspect" hidden><button id="close-inspect" class="close" aria-label="חזרה לאי">×</button><span class="eyebrow">בחרו חפץ וקראו את הסיפור שלו</span><div id="object-choices"></div><select id="object-list" aria-label="בחירת חפץ" hidden></select><div id="object-info" dir="rtl"></div><div class="row"><button id="modify" class="primary">✎ שינוי מילים</button><button id="carry">העברה למקום אחר</button><button id="remove-object">הסרת החפץ</button></div><p class="panel-note">לחיצה על הקרקע חוזרת לטיול באי.</p></aside>
<aside id="notebook" hidden><button id="close-book" class="close" aria-label="סגירת המחברת">×</button><span class="eyebrow">מחברת היצירה</span><h2 id="book-title">מה ניצור?</h2><p id="book-mode" dir="rtl"></p><div id="guided-example" hidden></div><form id="create-form"><label for="phrase">כתבו באנגלית</label><input id="phrase" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your idea…" maxlength="85"><div id="phrase-feedback" role="alert" dir="rtl"></div><button id="suggestion" type="button" hidden></button><button id="create" type="submit" class="primary">צרו את החפץ ✦</button></form><button id="book-new" type="button" hidden>יצירה חדשה במקום עריכת החפץ</button><details id="dictionary"><summary>מילון הסדנה · 12 חפצים ותכונות</summary><p>בסדנה יש 12 שמות עצם ותכונות מסוימות. מילים אחרות אינן בהכרח שגויות.</p><div id="words"></div><p class="property-words" dir="ltr">long / short · large / small · heavy / light<br>wooden / metal · bright / unlit<br>powerful / powerless</p></details></aside>
<section id="placement" hidden><div class="eyebrow">בחרו מקום לחפץ</div><h2 id="preview-label" dir="ltr"></h2><p id="placement-help" dir="rtl"></p><div id="target-choices" class="target-choices"></div><button id="place" class="primary">הניחו כאן ↓</button><div class="placement-secondary"><button id="cancel-place">ביטול</button><details id="placement-tools"><summary>סיבוב ומיקום חופשי</summary><div class="row"><button id="rotate">↻ סיבוב</button><button id="free-place">מיקום חופשי</button></div><small>אפשר גם להזיז בחצים. Enter מניח, Esc מבטל.</small></details></div><button id="target-prev" hidden>מצוף קודם</button><button id="target-next" hidden>מצוף הבא</button></section>
<footer><div class="primary-dock"><section id="object-actions" dir="rtl" hidden><span>החפץ שנבחר</span><strong id="selected-phrase" dir="ltr"></strong><div class="row"><button id="edit-selected">עריכה / החלפה</button><button id="move-selected">הזזה</button><button id="remove-selected">הסרה</button></div></section><button id="use-btn" class="primary"></button><span id="walk-help">הקישו על הקרקע כדי ללכת · אפשר גם בחצים</span></div><div class="tools"><button id="book-btn" aria-label="פתיחת מחברת">▤ <span>מחברת</span></button><button id="inspect-btn">⌕ <span>חפצים</span></button><button id="undo-btn">↶ <span>ביטול פעולה</span></button><button id="controls-btn">? <span>תנועה</span></button></div></footer>
<div id="touch"><div class="touch-pad"><button data-key="arrowup" aria-label="למעלה">↑</button><div><button data-key="arrowleft" aria-label="שמאלה">←</button><button data-key="arrowdown" aria-label="למטה">↓</button><button data-key="arrowright" aria-label="ימינה">→</button></div></div></div>
<div id="overlay" class="veil"><section id="welcome" class="modal"><span class="eyebrow">איים של מילים</span><h2>דרך חדשה מתחילה במילה.</h2><p>בכל אי יש בעיה אחרת לפתור.<br>יוצרים חפץ, בודקים מה הוא עושה, ומשנים את הרעיון אם צריך.<br><span class="campaign-intro">50 איים. מתחילים בקטן, ומגלים רעיונות גדולים יותר.</span></p><button id="start" class="primary">בואו ניצור דרך →</button><small>לחצו על הקרקע כדי ללכת. לחצו על חפץ כדי לערוך, להחליף או להסיר אותו.</small></section>
<section id="pause" class="modal" hidden><span class="eyebrow">הפסקה קטנה</span><h2>האי מחכה לכם.</h2><button id="resume" class="primary">חזרה למשחק</button><button id="restart">התחלת האי מחדש</button><button id="pause-map">מפת האיים</button><button id="pause-close" hidden>סגירה</button></section>
<section id="settings" class="modal" hidden><button id="settings-close" class="close" aria-label="סגירת הגדרות">×</button><h2>צלילי האי</h2><div id="gains"></div><a href="./audio/mixed-preview.wav" target="_blank">האזנה לדוגמה ↗</a></section>
<section id="controls" class="modal" hidden><button id="controls-close" class="close" aria-label="סגירת עזרה">×</button><h2>בוחרים דרך.</h2><p>לחצו או הקישו על הקרקע כדי ללכת.<br>חצים או WASD מזיזים לפי הכיוון על המסך.</p><p>לחצו על חפץ כדי לשנות או להעביר אותו.<br>במחברת כותבים; בתצוגה המקדימה בוחרים מקום ומניחים.</p><p class="panel-note">N מחברת · E פעולה נוכחית · Space קפיצה<br>F מסך מלא · Esc חזרה</p><div class="row"><button id="jump-btn">קפיצה ↟</button><button id="orbit-left">סיבוב מצלמה ↶</button><button id="orbit-right">↷ סיבוב מצלמה</button></div></section>
<section id="complete" class="modal" hidden><span class="eyebrow" id="completion-number">עוד דרך גיליתם</span><div class="win-star">✦</div><h2 id="win-title">הרעיון שלכם עבד!</h2><p id="win-story"></p><button id="next" class="primary">לאי הבא →</button><button id="replay">לנסות רעיון אחר</button><details id="learning-details"><summary>מה תרגלנו?</summary><p id="complete-detail"></p><div id="evidence"></div></details></section></div><div id="campaign-host" hidden></div>`;

const world = new World($('#world'));
const keys = new Set<string>();
const player = { x:-3.7, z:0, jump:0, vx:0, vz:0, facing:Math.PI/2 };
function readSaved(key:string):unknown{try{return JSON.parse(localStorage.getItem(key)??'null');}catch{return undefined;}}
let progress=createProgress(levels,readSaved('wordcraft-campaign-v2'),readSaved('wordcraft-completed'));
let index=levels.findIndex(l=>l.id===resumeLevel(levels,progress).id), level=levels[index], items:Item[]=[], selected='';
let campaignMapOpen=false;
function saveProgress(){try{localStorage.setItem('wordcraft-campaign-v2',JSON.stringify(progress));}catch{/* optional local persistence */}}
let started=false, paused=false, book=false, edit=false, won=false, completionArmed=false;
let assisted=false, attempts=0, hints=0, retries=0, rejectedPhrases=0;
let pending:Spec|undefined, pendingCount=0, pendingId='', zoneIndex=0, freePlacement=false;
let placement={x:0,z:0,rot:0}, ferry=0, clock=0, jumpT=0, serial=0, layoutVariant=0;
let route:Point[]=[], travelAfterApproach=false, activeTravel=false, moving=false, blockedAtEdge=false;
let lastReady=false, feedbackUntil=0, uiSignature='';
let motionDt=0,vesselX=0,ferryOriginX=0,carrierDeckY=-.34;let onVessel=false;
type Event={type:string;level:string;at:number;detail:unknown};
const events:Event[]=[];
let history:{items:Item[];selected:string}[]=[];
const visits=new Map<string,number>(), guidedShown=new Set<string>();
let completions=new Set(progress.completedIds);
const clone=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
const event=(type:string,detail:unknown)=>events.push({type,level:level.id,at:Math.round(clock*10)/10,detail});
function stopMotion(){completionArmed=false;keys.clear();route=[];player.vx=player.vz=0;moving=false;activeTravel=false;travelAfterApproach=false;world.clearDestination();}
function feedback(text:string,tone='',seconds=5){$('#feedback').textContent=text;$('#feedback').dataset.tone=tone;$('#feedback').hidden=false;feedbackUntil=clock+seconds;}
function modalOpen(){return campaignMapOpen||!$('#overlay').hidden;}
function isBlocked(){return !started||paused||book||won||modalOpen()||!$('#inspect').hidden||$<HTMLDetailsElement>('#help-details').open||document.hidden;}
function snapshot(){history.push({items:clone(items),selected});if(history.length>35)history.shift();}
function levelMenu(){
 $('#level-badge').textContent=`שלב ${level.number} מתוך ${levels.length}`;
 $('#levels-btn').setAttribute('aria-label',`מפת האיים. אי ${level.number} מתוך ${levels.length}. ${completions.size} הושלמו`);
}
function closeCampaign(){campaignMapOpen=false;$('#campaign-host').hidden=true;$('#campaign-host').replaceChildren();if(started)audio.pause(paused||!$('#overlay').hidden&&!won);$('#levels-btn').focus();}
function openCampaign(){
 if(!started)return;
 stopMotion();if(book)closeBook();hideInspector();campaignMapOpen=true;$('#campaign-host').hidden=false;audio.pause(true);
 mountCampaignMap($('#campaign-host'),{levels:levels.map(l=>({...l,chapter:chapters[l.chapter-1]})),completed:completions,currentId:progress.currentId,unlockedThrough:unlockedThrough(levels,progress),
  onChoose:id=>{if(!canPlay(levels,progress,id))return;closeCampaign();loadLevel(levels.findIndex(l=>l.id===id));},onClose:closeCampaign});
}
function showOverlay(id:string){stopMotion();$('#overlay').hidden=false;for(const el of document.querySelectorAll<HTMLElement>('#overlay > section'))el.hidden=el.id!==id;if(id!=='complete')audio.pause(true);}
function hideOverlay(){ $('#overlay').hidden=true;for(const el of document.querySelectorAll<HTMLElement>('#overlay > section'))el.hidden=true;if(started&&!paused)audio.pause(false); }
function loadLevel(i:number){
 if(!levels[i]||!canPlay(levels,progress,levels[i].id))return;
 index=i;level={...levels[i],zones:[...levels[i].zones]};
 if(level.goals?.unlock&&!level.zones.some(z=>z.id==='chest'))level.zones.push({id:'chest',x:4.5,z:2.6,label:'Treasure lock'});
 if(level.goals?.illuminate&&!level.zones.some(z=>z.id==='cave'))level.zones.push({id:'cave',x:7,z:2.5,label:'Dark marker'});
 progress=enterLevel(levels,progress,level.id);if(started)saveProgress();
 const visit=visits.get(level.id)??0;layoutVariant=visit%2;if(started)visits.set(level.id,visit+1);
 items=(level.seeds??[]).map(s=>makeItem(s.phrase,s.id,s.x,s.z*(layoutVariant?-1:1),s.origin));
 selected='';pending=undefined;pendingCount=0;history=[];won=false;completionArmed=false;paused=false;book=false;edit=false;
 assisted=false;attempts=0;hints=0;retries=0;rejectedPhrases=0;ferry=0;onVessel=false;jumpT=0;zoneIndex=0;lastReady=false;uiSignature='';
 stopMotion();player.x=-Math.max(3.7,level.gap/2+1.2);player.z=0;player.jump=0;player.facing=Math.PI/2;
 world.build(level,layoutVariant);world.setItems(items);world.setPreview();world.showBridge(false);audio.setSolved(false);
 $('#title').textContent=level.title;$('#mission').textContent=level.mission;$('#mission-he').textContent=level.he;
 $('#stage').textContent=`פרק ${level.chapter} · ${chapters[level.chapter-1]}`;
 $('#counter').textContent=`${level.number} / ${levels.length}`;
 $('#teaching').textContent=level.teach;$('#teaching').hidden=true;
 $<HTMLDetailsElement>('#help-details').open=false;
 $<HTMLDetailsElement>('#dictionary').open=false;
 $('#notebook').hidden=$('#placement').hidden=$('#inspect').hidden=true;$('#feedback').hidden=true;
 hideOverlay();levelMenu();$('#world').focus();event('level-start',{layoutVariant});updateFlow();
 if(started&&level.guide&&!completions.has(level.id)&&!guidedShown.has(level.id)){
  guidedShown.add(level.id);const id=level.id;
  setTimeout(()=>{if(level.id===id&&!modalOpen()&&!won&&!book&&!pending){if(level.targetId)showInventory();else openBook(false,true);};},350);
 }
}
function guidePhrase(){return level.guide??'';}
function openBook(modify=false,guided=false){
 if(!started||won||paused)return;
 if(modify&&level.guide&&!completions.has(level.id))guided=true;
 if(pending)cancelPlacement();
 stopMotion();$('#feedback').hidden=true;$('#inspect').hidden=true;$<HTMLDetailsElement>('#help-details').open=false;$('#teaching').hidden=true;book=true;edit=modify&&!!selected;
 const old=items.find(o=>o.id===selected);
 $('#book-title').textContent=edit&&old?.id.startsWith('created-')?'ערכו או החליפו את החפץ':edit?'שנו את תכונות החפץ':'מה ניצור?';
 $('#book-mode').textContent=edit?old?.id.startsWith('created-')?'אפשר לשנות תכונות או לכתוב חפץ אחר במקומו. המקור נשמר עד שמאשרים הנחה.':'זה חפץ מתוך הסיפור. שנו את תכונותיו או בחרו יצירה חדשה.':level.stage==='transfer'?'איזה חפץ יתאים כאן? נסו רעיון מהזיכרון.':'כתבו חפץ שיעזור לפתור את הבעיה באי.';
 $('#guided-example').hidden=!guided;
 if(guided){assisted=true;event('guided-model-shown',{phrase:guidePhrase()});$('#guided-example').innerHTML=`<span>${level.teach}</span><code dir="ltr">${guidePhrase()}</code>`;}
 $('#phrase-feedback').textContent='';$('#suggestion').hidden=true;
 const input=$<HTMLInputElement>('#phrase');input.value=edit&&old?modeledPhrase({...old.spec,count:1}):'';
 $('#book-new').hidden=!edit;
 $('#create').textContent=edit?'הציגו את השינוי ✦':'צרו את החפץ ✦';
 $('#notebook').hidden=false;audio.cue('notebook');updateFlow();
 setTimeout(()=>{input.focus();if(edit)input.select();},30);
}
function closeBook(){book=false;$('#notebook').hidden=true;keys.clear();$('#world').focus();updateFlow();}
const nounIcon:Record<string,string>={plank:'▰',ladder:'▥',crate:'▣',umbrella:'☂',fan:'✺',boat:'⛵',balloon:'♧',lamp:'☀',rope:'〰',bucket:'♜',sponge:'▧',key:'⚿'};
function renderInventory(){
 const list=layoutVariant?[...items].reverse():items;
 $('#object-list').innerHTML='<option value="">בחרו חפץ</option>'+list.map(o=>`<option value="${o.id}">${o.spec.phrase}</option>`).join('');
 $<HTMLSelectElement>('#object-list').value=selected;
 const choices=$('#object-choices');choices.innerHTML='';
 for(const item of list){const button=document.createElement('button');button.className='object-choice';button.dataset.selected=String(item.id===selected);button.dataset.itemId=item.id;
  const icon=document.createElement('span');icon.className='object-icon';icon.textContent=nounIcon[item.spec.noun];
  const name=document.createElement('span');name.dir='ltr';name.textContent=item.spec.phrase;
  button.append(icon,name);if(item.origin){const origin=document.createElement('small');origin.dir='ltr';origin.textContent=item.origin;button.append(origin);}button.onclick=()=>select(item.id);choices.append(button);
 }
 const item=items.find(o=>o.id===selected);
 if(!item){$('#object-info').innerHTML='<p>בחרו חפץ כדי לשנות אותו. קראו את הסיפור כדי לדעת איזה מהם מתאים למשימה.</p>';}
 else {
  const properties=[`משקל ${item.spec.mass.toFixed(1)} ק״ג`,`רוחב ${item.spec.width.toFixed(2)} מ׳`];
  if(item.spec.span)properties.push(`אורך ${item.spec.length.toFixed(1)} מ׳`);
  if(item.spec.capacity>0)properties.push(`מקום ל־${item.spec.capacity} חבילות`,item.spec.float?'צף':'לא צף');
  if(item.spec.noun==='fan')properties.push(`כוח ${item.spec.force} N`);
  if(item.spec.noun==='lamp')properties.push(item.spec.light>0?'מאיר':'כבוי');
  if(item.spec.absorb>0)properties.push(`סופג ${item.spec.absorb} יחידות מים`);
  if(item.spec.rain>0)properties.push(`טווח כיסוי ${item.spec.rain.toFixed(1)} מ׳`);
  const stat=properties.join(' · ');
  $('#object-info').innerHTML=`<h3 dir="ltr">${item.spec.phrase}</h3><p class="object-stat">${stat}</p><p dir="ltr">${item.origin??'Created in your notebook.'}</p>`;
 }
 $('#modify').toggleAttribute('disabled',!item);$('#carry').toggleAttribute('disabled',!item);$('#remove-object').toggleAttribute('disabled',!item);
}
function select(id:string){if(pending||book||!items.some(o=>o.id===id))return;stopMotion();selected=id;$('#inspect').hidden=false;renderInventory();event('inspect',{id});updateFlow();}
function showInventory(){if(book)closeBook();if(pending)cancelPlacement();stopMotion();$('#feedback').hidden=true;$('#inspect').hidden=false;renderInventory();updateFlow();}
function hideInspector(){$('#inspect').hidden=true;keys.clear();$('#world').focus();updateFlow();}
function zoneName(i:number){const zone=level.zones[i];return zone.id==='chest'?'ליד המנעול':zone.id==='cave'?'ליד הסמן החשוך':['spill','puddle'].includes(zone.id)?'על השלולית':zone.label;}
function updatePreview(){if(pending){world.setPreview(pending,placement.x,placement.z,placement.rot);renderTargets();}}
function renderTargets(){
 const choices=$('#target-choices');choices.innerHTML='';
 level.zones.forEach((z,i)=>{const b=document.createElement('button');b.textContent=zoneName(i);b.dataset.active=String(i===zoneIndex&&!freePlacement);b.onclick=()=>setTarget(i);choices.append(b);});
 $('#free-place').textContent=freePlacement?'חזרה להצמדה למצוף':'מיקום חופשי';
 $('#placement-help').textContent=freePlacement?'הקישו בעולם למיקום, או גררו את התצוגה המקדימה.':'התצוגה נשארת במקום שבחרתם. לחצו ״הניחו כאן״ כדי לאשר.';
}
function previewLabel(spec:Spec){return spec.phrase+(spec.evidence.shorthand?` · דוגמה מלאה: ${modeledPhrase(spec)}`:'');}
function recommendedZone(spec:Spec){
 const placementItems=items.filter(item=>item.id!==pendingId);
 const special=spec.noun==='key'?'chest':spec.noun==='lamp'?'cave':spec.noun==='fan'?'wind':spec.noun==='sponge'&&level.goals?.minAbsorb!==undefined?'spill':level.kind==='weight'?level.zones[0].id:'';
 const candidates=level.zones.map((z,i)=>({z,i})).filter(({z})=>z.id===special||z.id.startsWith(special+'-')||(special==='spill'&&z.id==='puddle'));
 const index=(candidates.find(({z})=>!placementItems.some(o=>o.spec.noun===spec.noun&&Math.hypot(o.x-z.x,o.z-z.z)<.5))??candidates[0])?.i??-1;
 if(index>=0)return index;
 if(level.kind==='shelter'){const firstUncovered=level.zones.findIndex(z=>!['chest','cave'].includes(z.id)&&!placementItems.some(o=>o.spec.rain>0&&Math.hypot(o.x-z.x,o.z-z.z)<o.spec.rain));if(firstUncovered>=0)return firstUncovered;}
 return 0;
}
function beginPlacement(spec:Spec,count:number,id=''){
 stopMotion();$('#inspect').hidden=true;pending=spec;pendingCount=count;pendingId=id;freePlacement=false;
 zoneIndex=recommendedZone(spec);placement=placementPoint(level,items.filter(item=>item.id!==pendingId),zoneIndex,spec);
 $('#preview-label').textContent=previewLabel(spec);$('#placement').hidden=false;
 $<HTMLDetailsElement>('#placement-tools').open=false;
 if(spec.evidence.shorthand){assisted=true;event('shorthand-model-shown',{model:modeledPhrase(spec),articleEvidence:false});}
 $('#feedback').hidden=true;updatePreview();updateFlow();
}
function create(){
 const raw=$<HTMLInputElement>('#phrase').value;assisted ||= $<HTMLDetailsElement>('#help-details').open||$<HTMLDetailsElement>('#dictionary').open;attempts++;const result=parsePhrase(raw,assisted);
 event('phrase-attempt',{raw,number:attempts,unaided:!assisted,result:result.ok?'accepted':'unsupported-or-form',assisted});
 if(!result.ok){
  rejectedPhrases++;if(/^(a\/an|two|power)/.test(result.message)){assisted=true;event('form-help',{feedback:result.message});audio.cue('mistake');}else audio.cue('page');
  $('#phrase-feedback').textContent=result.message;
  if(result.suggestion){assisted=true;event('spelling-help-shown',{suggestion:result.suggestion});const b=$('#suggestion');b.hidden=false;b.textContent=`אולי התכוונתם ל־${result.suggestion}?`;b.onclick=()=>{event('spelling-help',{from:raw,to:result.suggestion});$<HTMLInputElement>('#phrase').value=result.suggestion!;b.hidden=true;$<HTMLInputElement>('#phrase').focus();};}return;
 }
 const old=items.find(o=>o.id===selected);
 if(edit&&old){const change=prepareObjectEdit(old,result.spec);if(!change.ok){$('#phrase-feedback').textContent=change.message;audio.cue('page');return;}result.spec=change.spec;}
 if(items.length+result.spec.count-(edit&&old?1:0)>18){$('#phrase-feedback').textContent='האי מלא. אפשר לבטל פעולה או להתחיל את האי מחדש.';return;}
 snapshot();
 closeBook();audio.cue('create');beginPlacement(result.spec,result.spec.count,edit?selected:'');world.setItems(items);
 if(result.warning){assisted=true;event('order-help-shown',{feedback:result.warning});feedback(result.warning,'',9);}
}
function place(){
 if(!pending||paused||modalOpen())return;
 const old=history.at(-1)?.items.find(o=>o.id===pendingId),id=pendingId||`created-${++serial}`;
 const spec=clone(pending);spec.count=1;
 if(pendingId)items=items.filter(item=>item.id!==pendingId);
 const item:Item={id,spec,x:placement.x,z:placement.z,rot:placement.rot,placed:true,origin:old?.origin};items.push(item);selected=id;
 event(pendingId?'modify-place':'create-place',{id,phrase:spec.phrase,x:item.x,z:item.z,rot:item.rot,evidence:spec.evidence});
 world.setItems(items);world.popItem(id);audio.cue(spec.noun==='umbrella'?'umbrella':spec.noun==='fan'?'fan':spec.material==='metal'?'metal':'wood');
 pendingCount--;
 if(pendingCount>0){pendingId='';zoneIndex=recommendedZone(pending);placement=placementPoint(level,items.filter(item=>item.id!==pendingId),zoneIndex,pending);$('#preview-label').textContent=`${pending.phrase} · עוד ${pendingCount} להנחה`;updatePreview();}
 else{pending=undefined;pendingId='';world.setPreview();$('#placement').hidden=true;}
 const outcome=updateOutcome(true);recoverUnsupported();
 if(!outcome.ready&&!pending){world.reactToPlacement(item);if(level.kind==='bridge'&&spec.span)feedback(`האורך ${spec.length.toFixed(1)} מ׳ לא נתמך בשני הקצוות. אפשר לשנות את המילים ולנסות שוב.`,'try');else if(spec.material==='metal'&&['cargo','ferry','storm'].includes(level.kind))audio.cue('splash');}
 renderInventory();updateFlow();$('#world').focus();
}
function cancelPlacement(){
 if(pending){const previous=history.pop();if(previous){items=previous.items;selected=previous.selected;world.setItems(items);}}
 pending=undefined;pendingId='';pendingCount=0;world.setPreview();$('#placement').hidden=true;updateOutcome();recoverUnsupported();updateFlow();
}
function undo(){
 if(book)closeBook();stopMotion();hideInspector();
 if(pending)cancelPlacement();else{const previous=history.pop();if(!previous){feedback('עוד אין פעולה לביטול.');return;}items=previous.items;selected=previous.selected;world.setItems(items);}
 retries++;won=false;event('undo',{});audio.cue('undo');updateOutcome(true);recoverUnsupported();updateFlow();
}
function removeSelected(){
 const item=items.find(object=>object.id===selected);if(!item||pending||book||won)return;
 snapshot();stopMotion();items=items.filter(object=>object.id!==item.id);selected='';hideInspector();world.setItems(items);completionArmed=false;
 event('remove-object',{id:item.id,phrase:item.spec.phrase});audio.cue('undo');updateOutcome();recoverUnsupported();feedback('החפץ הוסר. אפשר ליצור רעיון אחר או לבטל את ההסרה.');updateFlow();
}
function moveSelected(){const item=items.find(object=>object.id===selected);if(!item||pending||book||won)return;snapshot();beginPlacement({...item.spec,count:1},1,item.id);}
function recoverUnsupported(){
 const state=evaluatePlacement(level,items);
 if(ferry>0&&!state.ready){ferry=0;onVessel=false;player.jump=0;world.resetVoyage();}
 if(level.gap>0&&ferry===0&&Math.abs(player.x)<level.gap/2&&!(state.traversable&&supportsPoint(level,items,player.x,player.z))){
  const from={x:player.x,z:player.z};stopMotion();completionArmed=false;player.x=(player.x>0?1:-1)*(level.gap/2+.6);player.z=0;player.jump=0;jumpT=0;
  world.burst(from.x,-.2,from.z,0x9bdfd7,16);audio.cue('splash');feedback('הדרך השתנתה — חזרתם לגדה. אפשר להמשיך לערוך את הרעיון.');event('support-lost-recovery',{from,to:{x:player.x,z:player.z}});
 }
}
function setTarget(i:number){if(!pending)return;zoneIndex=(i+level.zones.length)%level.zones.length;freePlacement=false;placement=placementPoint(level,items.filter(item=>item.id!==pendingId),zoneIndex,pending);updatePreview();}
function rotate(){if(pending){placement.rot=(placement.rot+Math.PI/2)%(Math.PI*2);updatePreview();audio.cue('rotate');}}
function updateOutcome(announce=false){
 const state=evaluatePlacement(level,items);if(level.kind==='weight')world.showBridge(state.traversable);
 if(announce)feedback(state.reason,state.ready?'good':'try');
 if(state.ready&&!lastReady){audio.setSolved(true);audio.cue('confirm');world.goalReady(true);feedback('הרעיון עובד! עכשיו אפשר לנסות את הדרך למגדלור.','good');event('world-solved',{kind:level.kind});}
 if(!state.ready&&lastReady){audio.setSolved(false);world.goalReady(false);}lastReady=state.ready;return state;
}
function updateFlow(){
 const state=evaluatePlacement(level,items),action=nextAction(level,items,selected);
 const phase=pending?'place':state.ready?'try':'write',readyAtGoal=state.ready&&Math.hypot(player.x-6.7,player.z-.5)<.85;
 document.body.dataset.mode=!started?'welcome':won?'complete':book?'notebook':pending?'placement':!$('#inspect').hidden?'inspect':'explore';
 const signature=`${readyAtGoal}/${state.reason}/${phase}/${action.kind}/${action.label}/${items.length}/${selected}/${pendingCount}/${book}/${won}/${$('#inspect').hidden}/${activeTravel}/${ferry>0}`;
 if(signature===uiSignature)return;uiSignature=signature;
 $('#world-status').textContent=objectiveStatus(level,items);
 const chosen=items.find(item=>item.id===selected);$('#object-actions').hidden=!chosen||!!pending||book||won;$('#selected-phrase').textContent=chosen?.spec.phrase??'';
 $('#edit-selected').textContent=chosen?.id.startsWith('created-')?'עריכה / החלפה':'עריכת תכונות';
 $('#next-instruction').textContent=pending?pendingCount>1?`עוד ${pendingCount} חפצים להנחה. בחרו מקום והניחו.`:'המקום מוכן. הניחו את החפץ.':readyAtGoal?'הפתרון עובד. לחצו כדי להשלים את האי.':action.instruction;
 $('#use-btn').textContent=(activeTravel||ferry>0)?(ferry>0?'מפליגים למגדלור…':'הדוור בדרך למגדלור…'):readyAtGoal?'השלימו את האי →':action.label;$('#use-btn').toggleAttribute('disabled',activeTravel||ferry>0);$('#use-btn').dataset.action=action.kind;
 for(const step of document.querySelectorAll<HTMLElement>('[data-step]'))step.dataset.active=String(step.dataset.step===phase);
 $('#inspect-btn').hidden=items.length===0;$('#undo-btn').hidden=history.length===0&&!pending;
 $('#walk-help').textContent=activeTravel?'הדוור בדרך… לחצו על הקרקע או על חץ כדי לשנות כיוון.':'הקישו על הקרקע כדי ללכת · אפשר גם בחצים';
}
function prepareMovement(){
 if(!started||paused||book||won||modalOpen()||pending)return false;
 if(!$('#inspect').hidden)hideInspector();$<HTMLDetailsElement>('#help-details').open=false;$('#teaching').hidden=true;keys.clear();return true;
}
function walkTo(to:Point,tryGoal=false){
 if(!prepareMovement())return;
 const state=evaluatePlacement(level,items);travelAfterApproach=false;activeTravel=tryGoal&&state.ready;completionArmed=tryGoal&&state.ready;
 if(tryGoal&&!state.ready)feedback('אפשר להגיע לכאן, אבל המשימה עוד לא הושלמה. '+state.reason,'try',8);
 if(tryGoal&&state.ready&&!state.traversable&&['ferry','cargo','wind','storm'].includes(level.kind)&&player.x<0){route=[{x:-level.gap/2-.65,z:0}];travelAfterApproach=true;}
 else route=walkingRoute(level,items,player,to);
 if(!state.ready&&level.gap>0&&player.x*to.x<0)feedback('הדרך עוד לא פתוחה. איזה חפץ יוכל לעזור?');
 world.markDestination(route.at(-1)!);event('walk-request',{to,tryGoal});updateFlow();
}
function trySolution(){
 const state=evaluatePlacement(level,items);
 if(!state.ready){feedback(state.reason,'try');return;}
 if(Math.hypot(player.x-6.7,player.z-.5)<.85){win();return;}
 if(!state.traversable&&level.gap>0){const carrier=items.find(o=>state.contributors.includes(o.id)&&o.spec.float&&o.spec.capacity>=1);carrierDeckY=world.beginVoyage(carrier);}
 hideInspector();walkTo({x:6.7,z:.5},true);feedback(level.kind==='shelter'?'החבילות מוגנות! הדוור ממשיך למגדלור.':state.traversable?'בואו נבדוק את הדרך שיצרתם.':'הדוור ייגש לרציף ויעלה למעבורת.','good');
}
function use(){
 if(!started||paused||won||book||pending||modalOpen()||activeTravel||ferry>0)return;
 const action=nextAction(level,items,selected);
 event('context-action',{kind:action.kind});
 if(action.kind==='travel')trySolution();else if(action.kind==='select')showInventory();else if((action.kind==='revise'||action.kind==='replace'))openBook(true);else if(action.kind==='move')$('#carry').click();else openBook();
}
function startFerry(){ferry=3;ferryOriginX=player.x;vesselX=-level.gap/2+.35;player.jump=0;player.z=0;player.vx=player.vz=0;route=[];travelAfterApproach=false;audio.cue('splash');feedback('צפים אל הגדה השנייה.','good');event('board-ferry',{});}
function win(){
 if(won)return;won=true;stopMotion();world.celebrate();progress=completeLevel(levels,progress,level.id);completions=new Set(progress.completedIds);saveProgress();
 audio.cue('success');
 const contributors=evaluatePlacement(level,items).contributors;
 const relevant=items.filter(o=>contributors.includes(o.id)&&(o.id.startsWith('created')||events.some(e=>e.level===level.id&&e.type==='modify-place'&&(e.detail as {id:string}).id===o.id)));
 const evidence={article:false,count:false,spelling:false,modifiers:false,order:false,family:false} as Omit<Evidence,'assisted'|'shorthand'>;
 for(const item of relevant)for(const key of Object.keys(evidence) as (keyof typeof evidence)[])evidence[key] ||= item.spec.evidence[key];
 const unaidedSolution=hints===0&&!assisted;
 event('completion',{evidence,unaidedSolution,singlePhraseFirstAttemptUnaided:attempts===1&&unaidedSolution&&retries===0&&rejectedPhrases===0,assisted,hints,retries,attempts,rejectedPhrases});
 $('#win-title').textContent=level.kind==='shelter'?'הדואר נשאר יבש!':level.goals?.minForce===0&&level.goals?.maxForce===0?'התחנה מוכנה ליציאה!':level.kind==='wind'||level.kind==='storm'?'המילים נתנו כוח לרוח!':'פתחתם דרך חדשה!';
 $('#win-story').textContent=level.kind==='shelter'?'הדואר מוגן מהגשם, והדוור הגיע למגדלור.':'החפץ שיצרתם שינה את האי. הדוור הגיע למגדלור.';
 $('#complete-detail').textContent=`${attempts} צירופים · ${hints} רמזים · ${retries} ביטולי פעולה · ${rejectedPhrases} ניסיונות עורך שלא התקבלו. ${unaidedSolution?'ללא עזרה גלויה.':'נעשה שימוש בעזרה.'}`;
 $('#evidence').textContent=Object.entries(evidence).filter(([,v])=>v).map(([k])=>({article:'תווית שנכתבה',count:'מספר פריטים',spelling:'איות ללא תיקון',modifiers:'שתי תכונות',order:'סדר תארים',family:'משפחת power'}[k])).join(' · ')||'פתרון פיזי תקף. אין עדות להפקה עצמאית של הכלל.';
 $('#completion-number').textContent=`אי ${level.number} מתוך ${levels.length} הושלם`;
 const finished=campaignFinished(levels,progress);
 if(finished){$('#win-title').textContent='כל 50 האיים פתוחים!';$('#win-story').textContent='השלמתם את מסע האיים. אפשר לחזור למפה ולנסות רעיונות חדשים בכל אי.';}
 $('#next').textContent=finished?'למפת האיים →':index===levels.length-1?'להמשך המסע →':`לאי ${level.number+1} →`;
 $<HTMLDetailsElement>('#learning-details').open=false;showOverlay('complete');levelMenu();updateFlow();
}

// UI actions: one current action, with secondary tools available on demand.
$('#words').innerHTML=catalog.map(c=>`<div class="dictionary-entry"><span class="word-icon">${nounIcon[c.noun]}</span><strong dir="ltr">${c.noun}</strong><span>${c.he}</span><small dir="ltr">${c.use}</small></div>`).join('');
function assistanceDetails(selector:string,type:string){const details=$<HTMLDetailsElement>(selector);let captured=false;const record=()=>{assisted=true;event(type,{});if(type==='translation-help')stopMotion();};details.querySelector('summary')!.addEventListener('click',()=>{if(!details.open){captured=true;record();}});details.addEventListener('toggle',()=>{if(details.open&&!captured)record();captured=false;});}
assistanceDetails('#help-details','translation-help');assistanceDetails('#dictionary','dictionary-help');
$('#start').onclick=()=>{if(started)return;started=true;void audio.start().then(()=>audio.pause(paused||modalOpen()));hideOverlay();loadLevel(index);};
$('#book-btn').onclick=()=>book?closeBook():openBook();$('#close-book').onclick=closeBook;
$('#create-form').onsubmit=e=>{e.preventDefault();create();};
$('#levels-btn').onclick=openCampaign;$('#pause-map').onclick=openCampaign;
$('#hint-btn').onclick=()=>{hints++;assisted=true;event('hint',{});feedback(level.hint,'',10);audio.cue('page');};
$('#teach-btn').onclick=()=>{const el=$('#teaching');el.hidden=!el.hidden;if(!el.hidden){assisted=true;event('teaching-help',{});}stopMotion();};
$('#read-btn').onclick=()=>{assisted=true;event('voice-help',{});audio.speak?.(level.mission);};
$('#close-inspect').onclick=hideInspector;$('#inspect-btn').onclick=()=>$('#inspect').hidden?showInventory():hideInspector();
$('#object-list').onchange=()=>select($<HTMLSelectElement>('#object-list').value);
$('#modify').onclick=()=>openBook(true);$('#edit-selected').onclick=()=>openBook(true);$('#move-selected').onclick=moveSelected;$('#remove-selected').onclick=removeSelected;$('#remove-object').onclick=removeSelected;$('#book-new').onclick=()=>openBook();
$('#carry').onclick=moveSelected;
$('#place').onclick=place;$('#cancel-place').onclick=cancelPlacement;
$('#target-prev').onclick=()=>setTarget(zoneIndex-1);$('#target-next').onclick=()=>setTarget(zoneIndex+1);
$('#rotate').onclick=rotate;$('#free-place').onclick=()=>{freePlacement=!freePlacement;renderTargets();};
$('#undo-btn').onclick=undo;$('#use-btn').onclick=use;
function pauseGame(){if(!started||won)return;paused=true;showOverlay('pause');event('pause',{});}function resume(){paused=false;hideOverlay();event('resume',{});updateFlow();}
$('#pause-btn').onclick=pauseGame;$('#resume').onclick=resume;$('#pause-close').onclick=resume;
$('#restart').onclick=()=>{event('restart',{});loadLevel(index);};$('#next').onclick=()=>{if(campaignFinished(levels,progress)){openCampaign();return;}const next=levels[index+1];loadLevel(next&&canPlay(levels,progress,next.id)?index+1:levels.findIndex(l=>l.id===progress.currentId));};$('#replay').onclick=()=>loadLevel(index);
$('#settings-btn').onclick=()=>{if(started)showOverlay('settings');};$('#settings-close').onclick=hideOverlay;
$('#controls-btn').onclick=()=>{if(started)showOverlay('controls');};$('#controls-close').onclick=hideOverlay;
$('#jump-btn').onclick=()=>{hideOverlay();keys.add(' ');$('#world').focus();};
$('#orbit-left').onclick=()=>world.orbit(-.2);$('#orbit-right').onclick=()=>world.orbit(.2);
for(const [channel,label] of [['master','ראשי'],['music','מוזיקה ואווירה'],['sfx','צלילי פעולה'],['voice','קריאה בקול']] as const){
 const wrap=document.createElement('label');wrap.className='gain';wrap.innerHTML=`<span>${label}</span><input id="gain-${channel}" aria-label="${label}" type="range" min="0" max="1" step=".01" value="${audio.getState().gains[channel]}"><output></output>`;$('#gains').append(wrap);
 const input=wrap.querySelector('input')!,output=wrap.querySelector('output')!;output.textContent=`${Math.round(Number(input.value)*100)}%`;
 input.oninput=()=>{audio.setGain(channel,Number(input.value));output.textContent=`${Math.round(Number(input.value)*100)}%`;};
}

const canvas=$<HTMLCanvasElement>('#world');
let down:{x:number;y:number;dragging:boolean}|undefined;
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;down={x:e.clientX,y:e.clientY,dragging:false};if(pending&&freePlacement)canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
 if(!down||!pending||!freePlacement||book||paused)return;
 down.dragging ||= Math.hypot(e.clientX-down.x,e.clientY-down.y)>8;
 const p=world.groundPoint(e.clientX,e.clientY);placement.x=Math.max(-8.3,Math.min(8.3,p.x));placement.z=Math.max(-3.5,Math.min(3.5,p.z));world.setPreview(pending,placement.x,placement.z,placement.rot);
});
canvas.addEventListener('pointerup',e=>{
 const gesture=down;down=undefined;if(!gesture||!started||paused||won||book||modalOpen())return;
 if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>12){return;}
 const point=world.groundPoint(e.clientX,e.clientY);
 if(pending){
  if(freePlacement){placement.x=Math.max(-8.3,Math.min(8.3,point.x));placement.z=Math.max(-3.5,Math.min(3.5,point.z));updatePreview();}
  else {const nearest=level.zones.map((z,i)=>({i,d:Math.hypot(z.x-point.x,z.z-point.z)})).sort((a,b)=>a.d-b.d)[0];if(nearest.d<2)setTarget(nearest.i);}
  return;
 }
 const id=world.pick(e.clientX,e.clientY,e.pointerType==='touch'?24:14);if(id)select(id);else walkTo({x:Math.max(-8.2,Math.min(8.2,point.x)),z:Math.max(-3.3,Math.min(3.3,point.z))},point.x>5.3&&Math.abs(point.z)<1.6);
});
canvas.addEventListener('pointercancel',()=>{down=undefined;});
const physicalKeys:Record<string,string>={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyN:'n',KeyE:'e',KeyR:'r',KeyF:'f',KeyZ:'z',Space:' '};
function typing(){return document.activeElement instanceof HTMLInputElement||document.activeElement instanceof HTMLTextAreaElement||document.activeElement instanceof HTMLSelectElement;}
document.addEventListener('keydown',e=>{
 let key=e.key.toLowerCase();
 // Let focused controls activate normally; Space must not turn an object-button click into a jump.
 if((key==='enter'||key===' ')&&e.target instanceof Element&&e.target.closest('button,a,summary,[role=button]'))return;
 if(key==='escape'&&document.fullscreenElement){e.preventDefault();void document.exitFullscreen();return;}
 if(key==='escape'&&modalOpen()&&started&&!won){e.preventDefault();resume();return;}
 if(!started&&(key==='enter'||key===' ')){e.preventDefault();$('#start').click();return;}
 if(won&&key==='enter'&&!$('#complete').hidden){e.preventDefault();$('#next').click();return;}
 if(typing()){if(key==='escape'&&book){e.preventDefault();closeBook();}return;}
 key=physicalKeys[e.code]??key;
 if(key==='escape'){if(book)closeBook();else if(pending)cancelPlacement();else if(!$('#inspect').hidden)hideInspector();else if(route.length)stopMotion();else pauseGame();return;}
 if(!started||paused||won||modalOpen())return;
 if(pending){
  if(['arrowleft','arrowright','arrowup','arrowdown'].includes(key)){e.preventDefault();freePlacement=true;const right=Number(key==='arrowright')-Number(key==='arrowleft'),down=Number(key==='arrowdown')-Number(key==='arrowup');const delta=screenDirection(right,down,world.angle);placement.x+=delta.x*.2;placement.z+=delta.z*.2;updatePreview();}
  if(key==='enter')place();if(key==='r')rotate();return;
 }
 if(key==='n'){e.preventDefault();openBook();}
 else if(key==='delete'||key==='backspace'){e.preventDefault();removeSelected();}
 else if(key==='e'){e.preventDefault();use();}
 else if(key==='f'){void document.documentElement.requestFullscreen?.();}
 else if(key==='z'&&(e.ctrlKey||e.metaKey)){e.preventDefault();undo();}
 else if(['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown',' '].includes(key)){
  e.preventDefault();if(!$('#inspect').hidden)hideInspector();$<HTMLDetailsElement>('#help-details').open=false;$('#teaching').hidden=true;
  route=[];activeTravel=false;completionArmed=false;travelAfterApproach=false;world.clearDestination();keys.add(key);
 }
});
document.addEventListener('keyup',e=>keys.delete(physicalKeys[e.code]??e.key.toLowerCase()));
for(const button of document.querySelectorAll<HTMLElement>('[data-key]')){
 button.addEventListener('pointerdown',e=>{e.preventDefault();if(!prepareMovement())return;route=[];activeTravel=false;travelAfterApproach=false;button.setPointerCapture(e.pointerId);keys.add(button.dataset.key!);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>keys.delete(button.dataset.key!));
}
window.addEventListener('blur',()=>{stopMotion();audio.pause(true);});
window.addEventListener('focus',()=>{if(started&&!paused&&!modalOpen())audio.pause(false);});
document.addEventListener('visibilitychange',()=>{stopMotion();audio.pause(document.hidden||paused||modalOpen());});

function simulate(dt:number){
 clock+=dt;motionDt+=dt;
 const state=updateOutcome();const blocked=isBlocked();const wasAtGoal=Math.hypot(player.x-6.7,player.z-.5)<.85;moving=false;blockedAtEdge=false;
 if(!blocked&&!pending){
  recoverUnsupported();
  if(ferry>0){
   const before=ferry;ferry=Math.max(0,ferry-dt);const elapsed=3-ferry,left=-level.gap/2+.35,right=level.gap/2-.35;onVessel=elapsed>=.3&&elapsed<=2.7;vesselX=left+(right-left)*Math.max(0,Math.min(1,(elapsed-.3)/2.4));player.x=elapsed<.3?ferryOriginX+(left-ferryOriginX)*(elapsed/.3):elapsed>2.7?right+(level.gap/2+.65-right)*((elapsed-2.7)/.3):vesselX;player.jump=elapsed<.3?carrierDeckY*elapsed/.3:elapsed>2.7?carrierDeckY*(1-(elapsed-2.7)/.3):carrierDeckY;player.z=0;player.vx=player.vz=0;player.facing=Math.PI/2;
   if(before>0&&ferry===0){onVessel=false;player.jump=0;route=[{x:6.7,z:.5}];world.markDestination(route[0]);} // stand still aboard; walk after disembarking
  }else{
   let right=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
   let down=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
   let desired=screenDirection(right,down,world.angle),speed=2.9;
   if(!right&&!down&&route.length){const point=route[0],dx=point.x-player.x,dz=point.z-player.z,distance=Math.hypot(dx,dz);
    if(distance<.12){player.x=point.x;player.z=point.z;route.shift();if(!route.length){player.vx=player.vz=0;if(travelAfterApproach){startFerry();}else{activeTravel=false;world.clearDestination();}}}
    if(route.length){const aim=route[0],dx=aim.x-player.x,dz=aim.z-player.z,d=Math.hypot(dx,dz)||1;desired={x:dx/d,z:dz/d};speed=Math.min(2.9,Math.max(.7,d*8));}else desired={x:0,z:0};
   }
   if(ferry===0){
    const damping=1-Math.exp(-dt*(right||down||route.length?18:24));
    player.vx+=(desired.x*speed-player.vx)*damping;player.vz+=(desired.z*speed-player.vz)*damping;
    if(Math.hypot(player.vx,player.vz)<.025)player.vx=player.vz=0;
    let nx=Math.max(-8.3,Math.min(8.3,player.x+player.vx*dt)),nz=Math.max(-3.4,Math.min(3.4,player.z+player.vz*dt));
    if(level.gap>0&&Math.abs(nx)<level.gap/2&&!(state.traversable&&supportsPoint(level,items,nx,nz))){nx=player.x;blockedAtEdge=true;}
    const dx=nx-player.x,dz=nz-player.z;player.x=nx;player.z=nz;
    player.vx=dt>0?dx/dt:0;player.vz=dt>0?dz/dt:0;
    moving=Math.hypot(dx,dz)>dt*.08;
    if(moving)player.facing=Math.atan2(player.vx,player.vz);
    if(blockedAtEdge&&route.length){route=[];activeTravel=false;travelAfterApproach=false;world.clearDestination();feedback('כאן חסרה דרך. פתחו את המחברת וצרו פתרון.');}
    if(keys.has(' ')&&jumpT<=0){jumpT=.65;keys.delete(' ');audio.cue('bounce');}
    if(jumpT>0){jumpT=Math.max(0,jumpT-dt);player.jump=Math.sin((.65-jumpT)/.65*Math.PI)*.65;}else player.jump=0;
   }
  }
  const atGoal=Math.hypot(player.x-6.7,player.z-.5)<.85;
  if(atGoal&&!wasAtGoal&&!state.ready)feedback('כאן מסיימים אחרי שפותרים את המשימה. '+state.reason,'try',8);
  if(state.ready&&atGoal&&(completionArmed||!wasAtGoal))win();
 }
 if(blocked||pending){player.vx=player.vz=0;moving=false;}
 if(!$('#feedback').hidden&&clock>feedbackUntil)$('#feedback').hidden=true;
 updateFlow();
}
function draw(){const dt=motionDt;motionDt=0;const state=evaluatePlacement(level,items);world.setSelected(won?'':selected);world.setExtras({...state.extras,absorbed:state.absorbed});world.setNavigating(activeTravel||ferry>0,pending?zoneIndex:undefined);world.sailProgress(ferry>0?vesselX:undefined,lastReady);world.render(dt,player,moving,lastReady,isBlocked()&&!won,ferry>0);}
let last=performance.now();
function frame(now:number){const dt=Math.min(.25,(now-last)/1000);last=now;const steps=Math.max(1,Math.ceil(dt/(1/60)));for(let i=0;i<steps;i++)simulate(dt/steps);draw();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.advanceTime=(ms:number)=>{const steps=Math.max(1,Math.round(ms/16.667));for(let i=0;i<steps;i++)simulate(ms/1000/steps);draw();};
window.render_game_to_text=()=>JSON.stringify({
 mode:campaignMapOpen?'map':!started?'welcome':won?'complete':paused?'paused':book?'notebook':pending?'placement':!$('#inspect').hidden?'inspect':'explore',
 coordinateSystem:'x east, z south, y up; keyboard directions relative to camera screen. Click ground to walk.',
 level:level.id,campaign:{number:level.number,total:levels.length,chapter:level.chapter,unlockedThrough:unlockedThrough(levels,progress),currentId:progress.currentId,finished:campaignFinished(levels,progress),mapOpen:campaignMapOpen},stage:level.stage,layoutVariant,objective:level.mission,nextAction:nextAction(level,items,selected),player,
 motion:{moving,blockedAtEdge,carried:ferry>0,onVessel,vesselX,transport:world.transport,route,activeTravel,clip:world.anim,facing:world.player.rotation.y,speed:Math.hypot(player.vx,player.vz)},
 world:evaluatePlacement(level,items),zones:level.zones,selected,
 items:items.map(o=>({id:o.id,screen:world.itemScreenBounds(o.id),phrase:o.spec.phrase,x:o.x,z:o.z,visualX:world.transport?.id===o.id?world.transport.x:o.x,visualZ:world.transport?.id===o.id?(o.spec.noun==='boat'||o.spec.noun==='balloon'?world.transport.z:-1.05):o.z,rot:o.rot,origin:o.origin,mass:o.spec.mass,length:o.spec.length,capacity:o.spec.capacity,float:o.spec.float,force:o.spec.force,width:o.spec.width,material:o.spec.material,light:o.spec.light,absorb:o.spec.absorb,rain:o.spec.rain,evidence:o.spec.evidence})),
 preview:pending?{phrase:pending.phrase,...placement,remaining:pendingCount,snapped:!freePlacement,zoneIndex}:null,
 learning:{attempts,hints,retries,rejectedPhrases,assisted,events:events.filter(e=>e.level===level.id).slice(-14)},
 completed:[...completions],audio:audio.getState(),models:{loaded:world.loaded,errors:world.errors},renderStats:{calls:world.renderer.info.render.calls,triangles:world.renderer.info.render.triangles,geometries:world.renderer.info.memory.geometries}
});
loadLevel(index);$('#start').textContent=progress.completedIds.length||index>0?`ממשיכים לאי ${level.number} →`:'מתחילים באי 1 →';showOverlay('welcome');
