/** A single ordered campaign. Curriculum metadata never controls access. */
export type CampaignProgress = {version:2;completedIds:string[];currentId:string};
type Entry = {id:string};
export function unlockedThrough(levels:readonly Entry[],progress:CampaignProgress):number {
 const completed=new Set(progress.completedIds);
 const first=levels.findIndex(level=>!completed.has(level.id));
 return first<0?levels.length:first+1;
}
export function canPlay(levels:readonly Entry[],progress:CampaignProgress,id:string):boolean {
 const index=levels.findIndex(level=>level.id===id);
 return index>=0&&(index<unlockedThrough(levels,progress)||progress.completedIds.includes(id));
}
export function campaignFinished(levels:readonly Entry[],progress:CampaignProgress):boolean {
 return levels.length>0&&levels.every(level=>progress.completedIds.includes(level.id));
}
export function createProgress(levels:readonly Entry[],raw?:unknown,legacyIds?:unknown):CampaignProgress {
 if(!levels.length)throw new Error('A campaign needs levels.');
 const saved=raw&&typeof raw==='object'?raw as Record<string,unknown>:undefined;
 const validSaved=saved?.version===2&&Array.isArray(saved.completedIds);
 const ids=validSaved?saved.completedIds:Array.isArray(legacyIds)?legacyIds:[];
 const completedIds=levels.filter(level=>(ids as unknown[]).includes(level.id)).map(level=>level.id);
 const progress:CampaignProgress={version:2,completedIds,currentId:levels[0].id};
 const fallback=levels.find(level=>!completedIds.includes(level.id))??levels.at(-1)!;
 progress.currentId=typeof saved?.currentId==='string'&&canPlay(levels,progress,saved.currentId)?saved.currentId:fallback.id;
 return progress;
}
export function enterLevel(levels:readonly Entry[],progress:CampaignProgress,id:string):CampaignProgress {
 return canPlay(levels,progress,id)?{...progress,completedIds:[...progress.completedIds],currentId:id}:progress;
}
export function completeLevel(levels:readonly Entry[],progress:CampaignProgress,id:string):CampaignProgress {
 if(!canPlay(levels,progress,id))return progress;
 const completed=new Set([...progress.completedIds,id]);
 const completedIds=levels.filter(level=>completed.has(level.id)).map(level=>level.id);
 const next=levels.find(level=>!completed.has(level.id))??levels.at(-1)!;
 return {version:2,completedIds,currentId:next.id};
}
export function resumeLevel<T extends Entry>(levels:readonly T[],progress:CampaignProgress):T {
 return levels.find(level=>level.id===progress.currentId&&canPlay(levels,progress,level.id))??levels[unlockedThrough(levels,progress)-1];
}
