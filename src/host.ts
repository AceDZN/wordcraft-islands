/** Workbook iframe protocol. Standalone play never sends host messages. */
export type HostMessage =
 | {type:'ready'}
 | {type:'level-start';level:number}
 | {type:'level-complete';level:number;durationMs:number}
 | {type:'error';message:string};
export function allowedParentOrigin(origin:string,ownOrigin=''):string|null {
 try{
  const url=new URL(origin);if(url.origin!==origin||url.username||url.password)return null;
  const workbook=url.protocol==='https:'&&!url.port&&/^(?:[a-z0-9-]+\.)*workbook\.co\.il$/.test(url.hostname);
  const local=url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname);
  const preview=origin===ownOrigin&&url.protocol==='https:'&&!url.port&&/^[a-z0-9-]+\.vercel\.app$/.test(url.hostname);
  return workbook||local||preview?origin:null;
 }catch{return null;}
}
/** Only one canonical 1-based ?level=N overrides the saved campaign opening. */
export function parseLevelParam(search:string,count:number):number|null {
 const values=new URLSearchParams(search).getAll('level');
 if(!Number.isSafeInteger(count)||count<1||values.length!==1||! /^[1-9]\d*$/.test(values[0]))return null;
 const n=Number(values[0]);return Number.isSafeInteger(n)&&n<=count?n-1:null;
}
let target:string|null=null,slug='',errorWindow:Window|undefined;
const reportError=()=>postToHost({type:'error',message:'Wordcraft Islands could not continue. Reload the game to try again.'});
export function initHost(gameSlug:string){
 errorWindow?.removeEventListener('error',reportError);errorWindow?.removeEventListener('unhandledrejection',reportError);errorWindow=undefined;target=null;slug=gameSlug;
 if(typeof window==='undefined'||window.parent===window)return;
 let origin=window.location.ancestorOrigins?.[0]??'';
 if(!origin&&document.referrer){try{origin=new URL(document.referrer).origin;}catch{return;}}
 target=allowedParentOrigin(origin,window.location.origin);if(!target)return;
 errorWindow=window;window.addEventListener('error',reportError);window.addEventListener('unhandledrejection',reportError);
}
export function postToHost(message:HostMessage){if(target)window.parent.postMessage({source:'workbook-game',version:1,slug,...message},target);}
/** Actual island entries/completions, ordered after one rendered-ready event. */
export class WorkbookSession {
 private ready=false;private active:number|null=null;private complete=false;private pending:HostMessage[]=[];
 constructor(private send:(message:HostMessage)=>void,private count:number){}
 private emit(message:HostMessage){if(this.ready)this.send(message);else this.pending.push(message);}
 markReady(){if(this.ready)return;this.ready=true;this.send({type:'ready'});for(const message of this.pending)this.send(message);this.pending=[];}
 startLevel(level:number){if(!Number.isInteger(level)||level<1||level>this.count||this.active===level)return;this.active=level;this.complete=false;this.emit({type:'level-start',level});}
 completeLevel(level:number,durationMs:number){if(this.active!==level||this.complete||!Number.isFinite(durationMs)||durationMs<0)return;this.complete=true;this.emit({type:'level-complete',level,durationMs:Math.round(durationMs)});}
 restart(){this.active=null;this.complete=false;}
}
