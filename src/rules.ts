export type Noun = 'plank'|'crate'|'ladder'|'rope'|'boat'|'balloon'|'umbrella'|'fan'|'key'|'lamp'|'bucket'|'sponge';
export type Evidence = {article:boolean;count:boolean;spelling:boolean;modifiers:boolean;order:boolean;family:boolean;assisted:boolean;shorthand:boolean};
export type Spec = {noun:Noun;count:number;adjectives:string[];phrase:string;length:number;width:number;mass:number;capacity:number;float:boolean;span:boolean;rain:number;force:number;light:number;absorb:number;material:string;evidence:Evidence};
export type Item = {id:string;spec:Spec;x:number;z:number;rot:number;placed:boolean;origin?:string};
export type Zone = {id:string;x:number;z:number;label:string};
export type Goals={minMass?:number;maxMass?:number;minForce?:number;maxForce?:number;minCapacity?:number;maxCapacity?:number;minWidth?:number;maxWidth?:number;requiredMaterial?:'wooden'|'metal'|'woven'|'cloth'|'soft';unlock?:boolean;illuminate?:boolean;minAbsorb?:number};
export type Level = {id:string;grade:7|8|9;stage:'guided'|'independent'|'transfer';title:string;mission:string;he:string;teach:string;hint:string;kind:'bridge'|'shelter'|'ferry'|'weight'|'cargo'|'wind'|'storm'|'workshop';gap:number;zones:Zone[];reference?:number;targetId?:string;goals?:Goals;number?:number;chapter?:1|2|3|4|5;difficulty?:1|2|3|4|5;concept?:string;guide?:string;seeds?:{id:string;phrase:string;x:number;z:number;origin:string}[]};
export type CampaignLevel=Level&{number:number;chapter:1|2|3|4|5;difficulty:1|2|3|4|5;concept:string};
export const catalog: {noun:Noun;he:string;use:string}[] = [
 {noun:'plank',he:'קרש',use:'A rigid crossing. long increases its span.'},{noun:'crate',he:'ארגז',use:'Carries parcels or holds a pressure plate. Wooden crates float.'},{noun:'ladder',he:'סולם',use:'A rigid crossing with rungs; can bridge the same supports.'},{noun:'rope',he:'חבל',use:'A taut crossing between the two dock anchors.'},{noun:'boat',he:'סירה',use:'Floats and carries an explorer or cargo.'},{noun:'balloon',he:'בלון',use:'A balloon lifts a passenger across the inlet in this toy world.'},{noun:'umbrella',he:'מטרייה',use:'Keeps a circular patch dry.'},{noun:'fan',he:'מאוורר',use:'Pushes a sail. powerful = 12 N; powerless = 0 N.'},{noun:'key',he:'מפתח',use:'Unlocks a chest: place at its lock.'},{noun:'lamp',he:'מנורה',use:'bright lights a dark marker.'},{noun:'bucket',he:'דלי',use:'Catches rain over one parcel; metal adds mass.'},{noun:'sponge',he:'ספוג',use:'Absorbs 4 units; large absorbs 10. Can also protect a parcel in this toy world.'}];
const defaults: Record<Noun,Partial<Spec>> = {
 plank:{length:3.3,width:1.2,mass:3,span:true,material:'wooden'},ladder:{length:3.8,width:1.25,mass:4,span:true,material:'wooden'},rope:{length:3.5,width:.55,mass:1,span:true,material:'woven'},crate:{length:1.2,width:1.2,mass:4,capacity:4,float:true,material:'wooden'},boat:{length:3,width:1.8,mass:5,capacity:12,float:true,material:'wooden'},balloon:{length:1.3,width:1.3,mass:.2,capacity:3,float:true,material:'cloth'},umbrella:{length:2,width:2,mass:1,rain:1.35,material:'cloth'},fan:{length:1.2,width:1,mass:4,force:4,material:'metal'},key:{length:.7,width:.35,mass:.2,material:'metal'},lamp:{length:1,width:.7,mass:1,light:0,material:'metal'},bucket:{length:1,width:1,mass:2,rain:.8,material:'wooden'},sponge:{length:1,width:1,mass:.4,rain:.9,absorb:4,material:'soft'}};
const adj = ['long','short','large','big','small','heavy','light','wooden','metal','bright','unlit','powerful','powerless'];
const plural:Record<string,Noun> = {}; for(const {noun} of catalog){plural[noun]=noun;plural[noun+'s']=noun;} plural.box='crate';plural.boxes='crate';plural.lantern='lamp';plural.lanterns='lamp';
const propertyKey=(s:string)=>['large','big','small'].includes(s)?'size':['long','short'].includes(s)?'length':['heavy','light'].includes(s)?'mass':['wooden','metal'].includes(s)?'material':['powerful','powerless'].includes(s)?'force':'illumination';
const rank=(s:string)=>['large','big','small','long','short'].includes(s)?1:['heavy','light','powerful','powerless','bright','unlit'].includes(s)?2:3;
export type ParseResult = {ok:true;spec:Spec;warning?:string}|{ok:false;message:string;suggestion?:string};
export function parsePhrase(input:string,assisted=false):ParseResult {
 const phrase=input.trim().toLowerCase().replace(/\s+/g,' '); const tokens=phrase.split(' ');
 if(!phrase) return {ok:false,message:'כתבו צירוף באנגלית במחברת.'};
 let determiner=''; let count=1;
 if(['a','an','the','one','two','three','1','2','3'].includes(tokens[0])) {determiner=tokens.shift()!;count=({two:2,three:3,'2':2,'3':3} as Record<string,number>)[determiner]??1;}
 const nounWord=tokens.pop()!; const noun=plural[nounWord];
 if(!noun){let match=catalog.find(c=>distance(c.noun,nounWord)<=2);return {ok:false,message:'המילה אינה בסדנה המצומצמת עדיין. זה לא אומר שהיא אנגלית שגויה. פתחו מילון ל־12 השמות הנתמכים.',suggestion:match?[determiner,...tokens,match.noun].filter(Boolean).join(' '):undefined};}
 const isPlural=nounWord.endsWith('s')&&!['sponge'].includes(nounWord);
 if((count>1&&!isPlural)||(['a','an','one','1'].includes(determiner)&&isPlural)) return {ok:false,message:'two מציין שני פריטים: כתבו two crates; a מתאים לפריט אחד.'};
 if((!determiner||determiner==='the')&&isPlural) count=2;
 for(const a of tokens) if(!adj.includes(a)) return {ok:false,message:a==='power'?'power הוא שם עצם. לתיאור הכוח בסדנה השתמשו ב־powerful או powerless.':'התיאור “'+a+'” אינו נתמך בעורך הזה. זו מגבלת הקטלוג, לא שיפוט של כל האנגלית.'};
 const next=tokens[0]??nounWord; const needsAn=/^[aeiou]/.test(next);
 if((determiner==='a'&&needsAn)||(determiner==='an'&&!needsAn)) return {ok:false,message:'a/an נקבעות לפי הצליל של המילה הבאה: an umbrella, אבל a large umbrella.'};
 const coherent:Record<string,Noun[]>={long:['plank','ladder','rope'],short:['plank','ladder','rope'],wooden:['plank','crate','ladder','boat','bucket'],metal:['plank','crate','ladder','bucket','fan','key','lamp'],powerful:['fan'],powerless:['fan'],bright:['lamp'],unlit:['lamp']};
 for(const a of tokens) if(coherent[a]&&!coherent[a].includes(noun))return {ok:false,message:'הצירוף אפשרי לדמיון, אבל אין לו אפקט מוגדר בסדנה הזאת. בדקו את השימוש במילון.'};
 for(const pair of [['long','short'],['large','small'],['big','small'],['heavy','light'],['wooden','metal'],['bright','unlit'],['powerful','powerless']]) if(pair.every(x=>tokens.includes(x)))return {ok:false,message:'בחרו תכונה אחת מכל זוג כדי שהדגם יקבל ערך ברור.'};
 const order=tokens.every((a,i)=>i===0||rank(a)>=rank(tokens[i-1]));
 const s:Spec={noun,count,adjectives:tokens,phrase,length:1,width:1,mass:1,capacity:0,float:false,span:false,rain:0,force:0,light:0,absorb:0,material:'wooden',...defaults[noun],evidence:{article:['a','an'].includes(determiner)&&!assisted,count:count>1&&['two','three','2','3'].includes(determiner)&&!assisted,spelling:!assisted,modifiers:tokens.length>=2&&new Set(tokens).size===tokens.length&&new Set(tokens.map(propertyKey)).size>=2&&!assisted,order:tokens.length>=2&&new Set(tokens).size===tokens.length&&new Set(tokens.map(rank)).size>=2&&order&&!assisted,family:tokens.some(a=>['powerful','powerless'].includes(a))&&!assisted,assisted,shorthand:!determiner}};
 if(tokens.includes('long'))s.length+=3;
 if(tokens.includes('short'))s.length=1.8;
 if(tokens.includes('large')||tokens.includes('big')){s.width*=1.6;s.capacity*=2.5;s.absorb*=2.5;s.rain*=1.5;if(!s.span)s.length*=1.6;s.mass*=1.3;}
 if(tokens.includes('small')){s.width*=.65;s.length*=.65;s.capacity*=.4;s.absorb*=.4;s.rain*=.65;}
 if(tokens.includes('metal')){s.material='metal';s.mass*=3;s.float=false;}
 if(tokens.includes('wooden')){s.material='wooden';if(['crate','boat'].includes(noun))s.float=true;}
 if(tokens.includes('heavy'))s.mass=12;
 if(tokens.includes('light'))s.mass=Math.min(s.mass,1);
 if(tokens.includes('powerful'))s.force=12;
 if(tokens.includes('powerless'))s.force=0;
 if(tokens.includes('bright'))s.light=5;
 return {ok:true,spec:s,warning:!order?'בצירוף שנלמד כאן הגודל קודם לחומר: a large wooden crate. החפץ ייווצר, אבל סדר התארים לא נספר כהפקה בדגם שנלמד.':undefined};
}
function distance(a:string,b:string){const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+Number(a[i-1]!==b[j-1]));return d[a.length][b.length];}
export function at(o:Item,z:Zone,r=1.25){return o.placed&&Math.hypot(o.x-z.x,o.z-z.z)<r;}
/** Physical constraints apply to the actual solution, never a word-password. */
export function evaluatePlacement(level:Level,objects:Item[]){
 const placed=objects.filter(o=>o.placed),goals=level.goals??{},zone=level.zones[0];
 const within=(value:number,min?:number,max?:number)=>value>=(min??-Infinity)-1e-8&&value<=(max??Infinity)+1e-8;
 const shape=(o:Item)=>within(o.spec.width,goals.minWidth,goals.maxWidth)&&(!goals.requiredMaterial||o.spec.material===goals.requiredMaterial);
 const loadBounds=(o:Item)=>shape(o)&&within(o.spec.mass,goals.minMass,goals.maxMass);
 const span=placed.find(o=>supportsBothBanks(level,o)&&loadBounds(o)&&(!level.targetId||level.kind!=='bridge'||o.id===level.targetId));
 const minCapacity=goals.minCapacity??(['cargo','storm'].includes(level.kind)?8:1);
 const allowAlternateBridge=!level.targetId&&goals.minCapacity===undefined&&goals.maxCapacity===undefined&&goals.minMass===undefined&&goals.maxMass===undefined&&goals.minWidth===undefined&&goals.maxWidth===undefined&&goals.requiredMaterial===undefined;
 const vessels=placed.filter(o=>(!level.targetId||!['cargo','ferry'].includes(level.kind)||o.id===level.targetId)&&o.spec.float&&at(o,zone,1.3)&&loadBounds(o)&&within(o.spec.capacity,minCapacity,goals.maxCapacity));
 const vessel=vessels[0];
 const loads=placed.filter(o=>at(o,zone));
 const mass=loads.reduce((n,o)=>n+o.spec.mass,0);
 const correctLoad=!level.targetId||loads.some(o=>o.id===level.targetId&&o.spec.mass>(level.reference??6)&&loadBounds(o));
 const fanZone=level.kind==='storm'?level.zones[1]:zone;
 const windItems=placed.filter(o=>o.spec.noun==='fan'&&at(o,fanZone)&&((o.spec.force===0&&goals.minForce===0&&goals.maxForce===0)||Math.cos(o.rot)>.7)&&(level.kind==='storm'||loadBounds(o))&&(!level.targetId||o.id===level.targetId));
 const force=windItems.reduce((n,o)=>n+o.spec.force,0);
 const windReady=windItems.length>0&&within(force,goals.minForce??8,goals.maxForce);
 const covers=placed.filter(o=>o.spec.rain>0&&loadBounds(o));
 // Overlay landmarks are not rain parcels.
 const rainZones=level.zones.filter(z=>!['chest','cave','puddle','spill'].includes(z.id));
 const covered=rainZones.filter(z=>covers.some(o=>Math.hypot(o.x-z.x,o.z-z.z)<o.spec.rain)).length;
 const contributors:string[]=[];let ready=false,reason='';
 const range=(min?:number,max?:number,unit='')=>max===undefined?`לפחות ${min??0}${unit}`:min===undefined?`לכל היותר ${max}${unit}`:`${min}–${max}${unit}`;
 const material=goals.requiredMaterial?` חומר נדרש: ${{wooden:'עץ',metal:'מתכת',woven:'אריג',cloth:'בד',soft:'חומר רך'}[goals.requiredMaterial]}.`:'';
 const limits=`${goals.minMass!==undefined||goals.maxMass!==undefined?` משקל: ${range(goals.minMass,goals.maxMass,' ק״ג')}.`:''}${goals.minWidth!==undefined||goals.maxWidth!==undefined?` רוחב: ${range(goals.minWidth,goals.maxWidth,' מ׳')}.`:''}${material}`;
 if(level.kind==='bridge'){
  ready=!!span;if(span)contributors.push(span.id);
  const supported=placed.find(o=>supportsBothBanks(level,o));
  reason=ready?'שני הקצוות נתמכים. אפשר לחצות.':supported?`הקצוות נתמכים, אך צריך לבדוק את התכונות${level.targetId?' ואת זהות חפץ הסיפור':''}.${limits}`:`צריך לכסות ${level.gap} מ׳ ועוד 0.3 מ׳ בכל קצה. סובבו לאורך המעבר.${limits}`;
 }
 if(level.kind==='shelter'){
  ready=covered===rainZones.length;contributors.push(...covers.filter(o=>rainZones.some(z=>Math.hypot(o.x-z.x,o.z-z.z)<o.spec.rain)).map(o=>o.id));
  reason=`${covered}/${rainZones.length} חבילות נשארות יבשות. לכל חפץ אזור כיסוי אמיתי.`;
 }
 if(level.kind==='ferry'){
  // A real bridge remains a valid alternate route when no cargo limit was stated.
  ready=!!vessel||(allowAlternateBridge&&!!span);contributors.push(...(span&&allowAlternateBridge?[span.id]:vessel?[vessel.id]:[]));
  reason=ready?'הדרך מוכנה — אפשר להגיע לגדה השנייה.':`צריך חפץ צף ליד המצוף, עם ${range(minCapacity,goals.maxCapacity)} מקומות.${limits}`;
 }
 if(level.kind==='weight'){
  ready=mass>(level.reference??6)&&within(mass,goals.minMass,goals.maxMass)&&correctLoad&&loads.length>0&&loads.every(shape);
  contributors.push(...loads.map(o=>o.id));
  reason=`משקל על הלוח: ${mass.toFixed(1)} ק״ג. נדרש יותר מ־${level.reference??6} ק״ג.${limits}${level.targetId&&!correctLoad?' צריך את חפץ הסיפור המזוהה. קראו את ההיסטוריה שלו.':''}${loads.some(o=>!shape(o))?' על הלוח יש חפץ שאינו עומד בדרישות החומר או הרוחב.':''}`;
 }
 if(level.kind==='cargo'||level.kind==='storm'){
  ready=!!vessel;if(vessel)contributors.push(vessel.id);
  reason=ready?'המטען צף בכלי מתאים.':`צריך כלי צף עם ${range(minCapacity,goals.maxCapacity)} מקומות.${limits} בדקו גודל, חומר ומשקל.`;
 }
 if(level.kind==='wind'||level.kind==='storm'){
  ready=level.kind==='storm'?ready&&windReady:windReady;contributors.push(...windItems.map(o=>o.id));
  const windReason=`כוח בכיוון החץ: ${force} N. צריך ${range(goals.minForce??8,goals.maxForce,' N')}${level.targetId?' מהמאוורר המזוהה':''}.`;
  reason=level.kind==='storm'?`${reason} ${windReason}`:`${windReason}${limits}`;
 }
 if(level.kind==='workshop'){ready=true;reason='בדקו את תחנות העבודה המתוארות.';}
 const primaryReady=ready;const extras=evaluateExtras(placed);
 const checks:{id:string;ready:boolean;reason:string}[]=[];
 if(goals.unlock){
  const key=placed.find(o=>o.spec.noun==='key'&&Math.hypot(o.x-4.5,o.z-2.6)<1&&(level.kind!=='workshop'||loadBounds(o)));
  extras.unlocked=!!key;checks.push({id:'unlock',ready:!!key,reason:key?'התיבה פתוחה.':'המנעול עוד סגור. הניחו מפתח מתאים ליד התיבה.'});if(key)contributors.push(key.id);
 }
 if(goals.illuminate){
  const lamp=placed.find(o=>o.spec.light>0&&Math.hypot(o.x-7,o.z-2.5)<2&&(level.kind!=='workshop'||loadBounds(o)));
  extras.illuminated=!!lamp;checks.push({id:'illuminate',ready:!!lamp,reason:lamp?'הסמן מואר.':'הסמן עדיין חשוך. צריך מקור אור פעיל לידו.'});if(lamp)contributors.push(lamp.id);
 }
 let absorbed=0;
 if(goals.minAbsorb!==undefined){
  const puddle=level.zones.find(z=>['puddle','spill'].includes(z.id))??zone;
  const sponges=placed.filter(o=>o.spec.absorb>0&&at(o,puddle)&&(level.kind!=='workshop'||loadBounds(o)));absorbed=sponges.reduce((n,o)=>n+o.spec.absorb,0);
  checks.push({id:'absorb',ready:absorbed>=goals.minAbsorb,reason:`נספגו ${absorbed.toFixed(1)} מתוך ${goals.minAbsorb} ליטרים.`});contributors.push(...sponges.map(o=>o.id));
 }
 if(checks.length){ready=ready&&checks.every(check=>check.ready);reason=[reason,...checks.map(check=>check.reason)].join(' ');}
 if(level.kind==='workshop'&&!checks.length)ready=false;
 return {ready,primaryReady,contributors:[...new Set(contributors)],traversable:level.gap===0||level.kind==='bridge'?!!span||level.gap===0:level.kind==='ferry'?!!span&&allowAlternateBridge:level.kind==='weight'?ready:false,mass,covered,capacity:vessel?.spec.capacity??0,force,absorbed,checks,extras,reason};
}
export function makeItem(phrase:string,id='item',x=0,z=0,origin?:string):Item {const r=parsePhrase(phrase);if(!r.ok)throw Error(r.message);return {id,spec:r.spec,x,z,rot:0,placed:true,origin};}

export function evaluateExtras(items:Item[]){return {unlocked:items.some(o=>o.spec.noun==='key'&&o.placed&&Math.hypot(o.x-4.5,o.z-2.6)<1),illuminated:items.some(o=>o.spec.light>0&&o.placed&&Math.hypot(o.x-7,o.z-2.5)<2)};}

export function supportsBothBanks(level:Level,o:Item){const reach=Math.abs(Math.cos(o.rot))*o.spec.length/2;return o.placed&&o.spec.span&&Math.abs(o.z)<.8&&o.x-reach<=-level.gap/2-.3+1e-8&&o.x+reach>=level.gap/2+.3-1e-8;}
export function supportsPoint(level:Level,items:Item[],x:number,z:number){if(level.kind==='weight')return evaluatePlacement(level,items).ready&&Math.abs(z)<.6;return items.some(o=>{if(!supportsBothBanks(level,o))return false;const dx=x-o.x,dz=z-o.z;const localX=dx*Math.cos(o.rot)-dz*Math.sin(o.rot),localZ=dx*Math.sin(o.rot)+dz*Math.cos(o.rot);return Math.abs(localX)<=o.spec.length/2&&Math.abs(localZ)<=Math.max(.12,o.spec.width/2-.08);});}
export function modeledPhrase(s:Spec){const words=[...s.adjectives,s.noun+(s.count>1?'s':'')];return `${s.count>1?(['zero','one','two','three'][s.count]??s.count):/^[aeiou]/.test(words[0])?'an':'a'} ${words.join(' ')}`;}
