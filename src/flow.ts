import { catalog, evaluatePlacement, type Item, type Level, type Spec } from './rules';
export type Point = {x:number;z:number};
export type NextAction = {kind:'create'|'select'|'revise'|'move'|'travel';label:string;instruction:string};
/** Project keyboard intent onto the camera's ground plane. */
export function screenDirection(right:number,down:number,angle:number):Point {
 const length=Math.hypot(right,down)||1;
 return {x:(right*Math.cos(angle)+down*Math.sin(angle))/length,z:(-right*Math.sin(angle)+down*Math.cos(angle))/length};
}
export function nextAction(level:Level,items:Item[],selected=''):NextAction {
 const state=evaluatePlacement(level,items);
 if(state.ready)return {kind:'travel',label:state.traversable||level.kind==='shelter'?'לכו למגדלור →':'עלו למעבורת →',instruction:'הפתרון עובד! לחצו כדי לנסות אותו ולהגיע למגדלור.'};
 const chosen=items.find(o=>o.id===selected);
 if(state.primaryReady&&state.checks.some(check=>!check.ready)){
  const remaining=state.checks.find(check=>!check.ready)!;
  return {kind:'create',label:remaining.id==='unlock'?'השלימו את תחנת המנעול':remaining.id==='illuminate'?'השלימו את תחנת האור':'השלימו את הספיגה',instruction:remaining.reason+' פתחו את המחברת כדי להוסיף את החלק החסר.'};
 }
 if(level.kind==='wind'&&!level.targetId&&state.force>0&&state.force<(level.goals?.minForce??8)&&(level.goals?.maxForce??Infinity)<12)
  return {kind:'create',label:'הוסיפו כוח לרוח',instruction:state.reason+' אפשר לשלב כמה חפצים בלי לעבור את הגבול העליון.'};
 if(level.kind==='weight'&&!level.targetId&&state.mass>0&&state.mass<=(level.reference??6)&&(level.goals?.maxMass??Infinity)<12)
  return {kind:'create',label:'השלימו את המשקל על הלוח',instruction:state.reason+' אפשר לצרף כמה חפצים ולשמור על גבול המשקל.'};
 const hasCargo=state.capacity>0;
 if(level.targetId&&(level.kind!=='storm'||hasCargo)) {
  const targetNoun=items.find(item=>item.id===level.targetId)?.spec.noun;
  if(chosen&&chosen.spec.noun===targetNoun){
   const spec=chosen.spec,g=level.goals??{};
   const boundWrong=level.kind!=='storm'&&(spec.mass>(g.maxMass??Infinity)||spec.width<(g.minWidth??0)||spec.width>(g.maxWidth??Infinity)||!!g.requiredMaterial&&spec.material!==g.requiredMaterial);
   const needsRevision=boundWrong||(level.kind==='weight'?spec.mass<=(level.reference??6):level.kind==='bridge'?spec.length<level.gap+.6:['cargo','ferry'].includes(level.kind)?!spec.float||spec.capacity<(g.minCapacity??(level.kind==='ferry'?1:8))||spec.capacity>(g.maxCapacity??Infinity):spec.force<(g.minForce??8)||spec.force>(g.maxForce??Infinity));
   if(needsRevision)return {kind:'revise',label:'שנו את החפץ שנבחר',instruction:'החפץ נבחר. שנו את המילים במחברת כדי לשנות את תכונותיו.'};
   if(chosen.id===level.targetId)return {kind:'move',label:'העבירו את החפץ למקום המתאים',instruction:'התכונות מתאימות. בחרו מקום והניחו את החפץ הקיים.'};
  }
  const noun=catalog.find(entry=>entry.noun===targetNoun)?.he??'חפץ';
  return {kind:'select',label:`בחרו ${noun} לבדיקה`,instruction:'הקישו על חפץ כדי לקרוא את הסיפור שלו ולבחור איזה מהם לשנות.'};
 }
 if(level.kind==='shelter'&&state.covered>0)return {kind:'create',label:'הגנו גם על החבילות שנותרו',instruction:`${state.covered} חבילות מוגנות. השלימו את הכיסוי לחבילות הנותרות.`};
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

/** Space instances on one pad without pushing objects off neighbouring pads. */
export function placementPoint(level:Level,items:Item[],index:number,spec:Spec){
 const zone=level.zones[index];
 const spaced=!spec.span&&['fan','sponge','crate','bucket'].includes(spec.noun);
 const offset=spaced?([0,.7,-.7].find(delta=>!items.some(item=>item.spec.noun===spec.noun&&Math.hypot(item.x-zone.x,item.z-zone.z-delta)<.4))??0):0;
 return {x:zone.x,z:zone.z+offset,rot:0};
}
