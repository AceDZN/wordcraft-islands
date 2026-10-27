import { evaluatePlacement, type Item, type Level } from './rules';
export type Point = {x:number;z:number};
export type NextAction = {kind:'create'|'select'|'revise'|'travel';label:string;instruction:string};
/** Project keyboard intent onto the camera's ground plane. */
export function screenDirection(right:number,down:number,angle:number):Point {
 const length=Math.hypot(right,down)||1;
 return {x:(right*Math.cos(angle)+down*Math.sin(angle))/length,z:(-right*Math.sin(angle)+down*Math.cos(angle))/length};
}
export function nextAction(level:Level,items:Item[],selected=''):NextAction {
 const state=evaluatePlacement(level,items);
 if(state.ready)return {kind:'travel',label:state.traversable||level.kind==='shelter'?'לכו למגדלור →':'עלו למעבורת →',instruction:'הפתרון עובד! לחצו כדי לנסות אותו ולהגיע למגדלור.'};
 const chosen=items.find(o=>o.id===selected);
 const hasCargo=state.capacity>=8;
 if(level.targetId&&(level.kind!=='storm'||hasCargo)) {
  if(chosen&&chosen.spec.noun===(level.kind==='weight'?'crate':'fan')&&(level.kind==='weight'?chosen.spec.mass<=(level.reference??6):chosen.spec.force<8))
   return {kind:'revise',label:'שנו את החפץ שנבחר',instruction:'החפץ נבחר. שנו את המילים במחברת כדי לשנות את תכונותיו.'};
  return {kind:'select',label:level.kind==='weight'?'בחרו ארגז לבדיקה':'בחרו מאוורר לבדיקה',instruction:'הקישו על חפץ כדי לקרוא את הסיפור שלו ולבחור איזה מהם לשנות.'};
 }
 if(level.kind==='shelter'&&state.covered>0)return {kind:'create',label:'צרו כיסוי לחבילה השנייה',instruction:'חבילה אחת מוגנת. צריך להגן גם על השנייה.'};
 if(chosen&&chosen.id.startsWith('created')&&!(level.kind==='storm'&&hasCargo))return {kind:'revise',label:'שנו את המילים ונסו שוב',instruction:'עוד לא הסתדר? שנו תכונה בחפץ, או צרו רעיון אחר במחברת.'};
 return {kind:'create',label:'פתחו מחברת וצרו פתרון',instruction:level.kind==='storm'?'התחילו בכלי שיישא את המטען. אחר כך בחרו מאוורר.':'איזה חפץ יעזור כאן? כתבו אותו במחברת.'};
}
/** Navigation only uses a crossing after its physical/semantic predicate passes. */
export function walkingRoute(level:Level,items:Item[],from:Point,to:Point):Point[] {
 if(level.gap>0&&from.x*to.x<0){
  if(!evaluatePlacement(level,items).traversable)return [{x:Math.sign(from.x)*(level.gap/2+.65),z:0}];
  const state=evaluatePlacement(level,items);const span=items.find(o=>state.contributors.includes(o.id)&&o.spec.span);
  const lineZ=(x:number)=>span?span.z-(x-span.x)*Math.tan(span.rot):0;
  const entryX=Math.sign(from.x)*(level.gap/2+.32),exitX=Math.sign(to.x)*(level.gap/2+.32);
  return [{x:entryX,z:lineZ(entryX)},{x:exitX,z:lineZ(exitX)},to];
 }
 return [to];
}
