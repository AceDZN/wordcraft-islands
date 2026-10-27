export type Noun = 'plank'|'crate'|'ladder'|'rope'|'boat'|'balloon'|'umbrella'|'fan'|'key'|'lamp'|'bucket'|'sponge';
export type Evidence = {article:boolean;count:boolean;spelling:boolean;modifiers:boolean;order:boolean;family:boolean;assisted:boolean;shorthand:boolean};
export type Spec = {noun:Noun;count:number;adjectives:string[];phrase:string;length:number;width:number;mass:number;capacity:number;float:boolean;span:boolean;rain:number;force:number;light:number;material:string;evidence:Evidence};
export type Item = {id:string;spec:Spec;x:number;z:number;rot:number;placed:boolean;origin?:string};
export type Zone = {id:string;x:number;z:number;label:string};
export type Level = {id:string;grade:7|8|9;stage:'guided'|'independent'|'transfer';title:string;mission:string;he:string;teach:string;hint:string;kind:'bridge'|'shelter'|'ferry'|'weight'|'cargo'|'wind'|'storm';gap:number;zones:Zone[];reference?:number;targetId?:string;seeds?:{id:string;phrase:string;x:number;z:number;origin:string}[]};
export const catalog: {noun:Noun;he:string;use:string}[] = [
 {noun:'plank',he:'קרש',use:'A rigid crossing. long increases its span.'},{noun:'crate',he:'ארגז',use:'Carries parcels or holds a pressure plate. Wooden crates float.'},{noun:'ladder',he:'סולם',use:'A rigid crossing with rungs; can bridge the same supports.'},{noun:'rope',he:'חבל',use:'A taut crossing between the two dock anchors.'},{noun:'boat',he:'סירה',use:'Floats and carries an explorer or cargo.'},{noun:'balloon',he:'בלון',use:'A balloon lifts a passenger across the inlet in this toy world.'},{noun:'umbrella',he:'מטרייה',use:'Keeps a circular patch dry.'},{noun:'fan',he:'מאוורר',use:'Pushes a sail. powerful = 12 N; powerless = 0 N.'},{noun:'key',he:'מפתח',use:'Unlocks the optional treasure chest: place at the chest.'},{noun:'lamp',he:'מנורה',use:'bright lights the optional cave marker.'},{noun:'bucket',he:'דלי',use:'Catches rain over one parcel; metal adds mass.'},{noun:'sponge',he:'ספוג',use:'Absorbs rain over one parcel in this bounded toy model.'}];
const defaults: Record<Noun,Partial<Spec>> = {
 plank:{length:3.3,width:1.2,mass:3,span:true,material:'wooden'},ladder:{length:3.8,width:1.25,mass:4,span:true,material:'wooden'},rope:{length:3.5,width:.55,mass:1,span:true,material:'woven'},crate:{length:1.2,width:1.2,mass:4,capacity:4,float:true,material:'wooden'},boat:{length:3,width:1.8,mass:5,capacity:12,float:true,material:'wooden'},balloon:{length:1.3,width:1.3,mass:.2,capacity:3,float:true,material:'cloth'},umbrella:{length:2,width:2,mass:1,rain:1.35,material:'cloth'},fan:{length:1.2,width:1,mass:4,force:4,material:'metal'},key:{length:.7,width:.35,mass:.2,material:'metal'},lamp:{length:1,width:.7,mass:1,light:0,material:'metal'},bucket:{length:1,width:1,mass:2,rain:.8,material:'wooden'},sponge:{length:1,width:1,mass:.4,rain:.9,material:'soft'}};
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
 const s:Spec={noun,count,adjectives:tokens,phrase,length:1,width:1,mass:1,capacity:0,float:false,span:false,rain:0,force:0,light:0,material:'wooden',...defaults[noun],evidence:{article:['a','an'].includes(determiner)&&!assisted,count:count>1&&['two','three','2','3'].includes(determiner)&&!assisted,spelling:!assisted,modifiers:tokens.length>=2&&new Set(tokens).size===tokens.length&&new Set(tokens.map(propertyKey)).size>=2&&!assisted,order:tokens.length>=2&&new Set(tokens).size===tokens.length&&new Set(tokens.map(rank)).size>=2&&order&&!assisted,family:tokens.some(a=>['powerful','powerless'].includes(a))&&!assisted,assisted,shorthand:!determiner}};
 if(tokens.includes('long'))s.length+=3;
 if(tokens.includes('short'))s.length=1.8;
 if(tokens.includes('large')||tokens.includes('big')){s.width*=1.6;s.capacity*=2.5;s.rain*=1.5;if(!s.span)s.length*=1.6;s.mass*=1.3;}
 if(tokens.includes('small')){s.width*=.65;s.length*=.65;s.capacity*=.4;s.rain*=.65;}
 if(tokens.includes('metal')){s.material='metal';s.mass*=3;s.float=false;}
 if(tokens.includes('wooden')){s.material='wooden';if(['crate','boat'].includes(noun))s.float=true;}
 if(tokens.includes('heavy'))s.mass=12;
 if(tokens.includes('light'))s.mass=1;
 if(tokens.includes('powerful'))s.force=12;
 if(tokens.includes('powerless'))s.force=0;
 if(tokens.includes('bright'))s.light=5;
 return {ok:true,spec:s,warning:!order?'בצירוף שנלמד כאן הגודל קודם לחומר: a large wooden crate. החפץ ייווצר, אבל סדר התארים לא נספר כהפקה בדגם שנלמד.':undefined};
}
function distance(a:string,b:string){const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+Number(a[i-1]!==b[j-1]));return d[a.length][b.length];}
export function at(o:Item,z:Zone,r=1.25){return o.placed&&Math.hypot(o.x-z.x,o.z-z.z)<r;}
export function evaluatePlacement(level:Level,objects:Item[]){
 const placed=objects.filter(o=>o.placed);const zone=level.zones[0]; const span=placed.find(o=>supportsBothBanks(level,o));
 const afloat=placed.find(o=>o.spec.float&&o.spec.capacity>=1&&at(o,zone,1.3));
 const cargo=placed.find(o=>o.spec.float&&o.spec.capacity>=8&&at(o,zone,1.3));
 const loads=placed.filter(o=>at(o,zone)); const mass=loads.reduce((n,o)=>n+o.spec.mass,0);
 const correctLoad=level.targetId?loads.some(o=>o.id===level.targetId&&o.spec.mass>(level.reference??6)):true;
 const fanZone=level.kind==='storm'?level.zones[1]:zone;
 const windItems=placed.filter(o=>at(o,fanZone)&&o.spec.force>=8&&Math.cos(o.rot)>.7);
 const correctFan=windItems.some(o=>!level.targetId||o.id===level.targetId);
 const covered=level.zones.filter(z=>placed.some(o=>o.spec.rain>0&&Math.hypot(o.x-z.x,o.z-z.z)<o.spec.rain)).length;
 let ready=false,reason='';
 if(level.kind==='bridge'){ready=!!span;reason=ready?'שני הקצוות נתמכים. אפשר לחצות.':'צריך לכסות את המרווח ועוד 0.3 מ׳ בכל קצה. סובבו את החפץ לאורך ציר המעבר.';}
 if(level.kind==='shelter'){ready=covered===level.zones.length;reason=`${covered}/${level.zones.length} חבילות נשארות יבשות. לכל חפץ אזור כיסוי אמיתי.`;}
 if(level.kind==='ferry'){ready=!!afloat||!!span;reason=ready?'המעבורת צפה — E ליד הרציף, או חצו על הגשר.':'חפץ צף עם מקום לנוסע ליד מצוף הרציף, או גשר ארוך מספיק.';}
 if(level.kind==='weight'){ready=mass>(level.reference??6)&&correctLoad;reason=!correctLoad&&mass>6?'הגשר עלה, אבל זו לא חבילת התרופות שתוארה. ההיסטוריה מזהה את הארגז הדרוש.':`משקל על הלוח: ${mass.toFixed(1)} ק״ג. נדרש יותר מ־${level.reference??6}, וגם הארגז המזוהה כשיש תיאור.`;}
 if(level.kind==='cargo'){ready=!!cargo;reason=ready?'המטען צף בכלי שמכיל לפחות 8 חבילות. E להפלגה.':'צריך כושר ציפה ומקום ל־8 חבילות. ארגז מתכת שוקע בדגם הזה; קטן מדי מכיל רק 4.';}
 if(level.kind==='wind'){ready=correctFan;reason=ready?'12 N מניעים את המפרש. E להפלגה.':windItems.length?'המאוורר עובד, אבל צריך לשקם את Fan A שכבר זוהה בשם.':'המפרש צריך לפחות 8 N בכיוון החץ. powerful דוחף; powerless לא.';}
 if(level.kind==='storm'){ready=!!cargo&&correctFan;reason=`מטען צף: ${cargo?'כן':'לא'}. המאוורר המתואר דוחף: ${correctFan?'כן':'לא'}. שני התנאים נחוצים.`;}
 const contributors=level.kind==='bridge'?span?[span.id]:[]:level.kind==='shelter'?placed.filter(o=>o.spec.rain>0&&level.zones.some(z=>Math.hypot(o.x-z.x,o.z-z.z)<o.spec.rain)).map(o=>o.id):level.kind==='ferry'?span?[span.id]:afloat?[afloat.id]:[]:level.kind==='weight'?loads.map(o=>o.id):level.kind==='cargo'?cargo?[cargo.id]:[]:level.kind==='wind'?windItems.filter(o=>!level.targetId||o.id===level.targetId).map(o=>o.id):[...(cargo?[cargo.id]:[]),...windItems.filter(o=>o.id===level.targetId).map(o=>o.id)];
 return {ready,contributors,traversable:level.kind==='bridge'?!!span:level.kind==='ferry'?!!span:level.kind==='weight'?ready:false,mass,covered,capacity:cargo?.spec.capacity??afloat?.spec.capacity??0,force:windItems.reduce((n,o)=>n+o.spec.force,0),reason};
}
export function makeItem(phrase:string,id='item',x=0,z=0,origin?:string):Item {const r=parsePhrase(phrase);if(!r.ok)throw Error(r.message);return {id,spec:r.spec,x,z,rot:0,placed:true,origin};}

export function evaluateExtras(items:Item[]){return {unlocked:items.some(o=>o.spec.noun==='key'&&o.placed&&Math.hypot(o.x-4.5,o.z-2.6)<1),illuminated:items.some(o=>o.spec.light>0&&o.placed&&Math.hypot(o.x-7,o.z-2.5)<2)};}

export function supportsBothBanks(level:Level,o:Item){const reach=Math.abs(Math.cos(o.rot))*o.spec.length/2;return o.placed&&o.spec.span&&Math.abs(o.z)<.8&&o.x-reach<=-level.gap/2-.3+1e-8&&o.x+reach>=level.gap/2+.3-1e-8;}
export function supportsPoint(level:Level,items:Item[],x:number,z:number){if(level.kind==='weight')return evaluatePlacement(level,items).ready&&Math.abs(z)<.6;return items.some(o=>{if(!supportsBothBanks(level,o))return false;const dx=x-o.x,dz=z-o.z;const localX=dx*Math.cos(o.rot)-dz*Math.sin(o.rot),localZ=dx*Math.sin(o.rot)+dz*Math.cos(o.rot);return Math.abs(localX)<=o.spec.length/2&&Math.abs(localZ)<=Math.max(.12,o.spec.width/2-.08);});}
export function modeledPhrase(s:Spec){const words=[...s.adjectives,s.noun+(s.count>1?'s':'')];return `${s.count>1?(['zero','one','two','three'][s.count]??s.count):/^[aeiou]/.test(words[0])?'an':'a'} ${words.join(' ')}`;}
