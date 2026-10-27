import type {Item,Spec} from './rules';
export type ObjectEdit = {ok:true;spec:Spec;replacingType:boolean}|{ok:false;message:string};
/** Player creations are replaceable; story objects retain their referent. */
export function prepareObjectEdit(item:Item,next:Spec):ObjectEdit {
 const created=item.id.startsWith('created-');
 if(!created&&(item.spec.noun!==next.noun||next.count!==1))return {ok:false,message:'זה חפץ מסוים מתוך הסיפור. אפשר לשנות את תכונותיו; לחפץ אחר לחצו ״יצירה חדשה״.'};
 const spec:Spec={...next,adjectives:[...next.adjectives],evidence:{...next.evidence,article:false,spelling:false}};
 if(next.adjectives.join(' ')===item.spec.adjectives.join(' ')){spec.evidence.modifiers=false;spec.evidence.order=false;}
 const family=(s:Spec)=>s.adjectives.find(a=>a==='powerful'||a==='powerless');
 if(family(next)===family(item.spec))spec.evidence.family=false;
 return {ok:true,spec,replacingType:item.spec.noun!==next.noun};
}
