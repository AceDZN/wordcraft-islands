import test from 'node:test';
import assert from 'node:assert/strict';
import {allowedParentOrigin,parseLevelParam,WorkbookSession,initHost,postToHost,type HostMessage} from '../src/host';
import {levels} from '../src/campaign-levels';
import {createProgress,completeLevel,unlockedThrough,campaignFinished} from '../src/campaign';

test('every authored island has a strict level link; malformed links preserve saved entry',()=>{
 for(let n=1;n<=50;n++)assert.equal(parseLevelParam(`?level=${n}`,50),n-1);
 for(const search of ['','?level=0','?level=51','?level=-1','?level=1.5','?level=01','?level=1e1','?level=2%20','?level=2&level=3','?level=2&level=2'])assert.equal(parseLevelParam(search,50),null,search);
});
test('only exact intended Workbook/local/same-preview parent origins are trusted',()=>{
 for(const origin of ['https://workbook.co.il','https://english-games.workbook.co.il','http://localhost:4017','http://127.0.0.1:4017'])assert.equal(allowedParentOrigin(origin),origin);
 const preview='https://english-games-example.vercel.app';assert.equal(allowedParentOrigin(preview,preview),preview);assert.equal(allowedParentOrigin(preview,'https://another.vercel.app'),null);
 for(const origin of ['*','null','https://workbook.co.il.evil.test','https://evil-workbook.co.il','https://workbook.co.il/path','https://workbook.co.il:444','http://workbook.co.il','http://localhost.evil.test','https://evil.test'])assert.equal(allowedParentOrigin(origin),null,origin);
});
test('ready precedes queued actual entries; completions and ready are not duplicated',()=>{
 const messages:HostMessage[]=[],session=new WorkbookSession(m=>messages.push(m),50);
 session.startLevel(50);session.completeLevel(50,1234.5);assert.deepEqual(messages,[]);session.markReady();session.markReady();session.completeLevel(50,5000);
 assert.deepEqual(messages,[{type:'ready'},{type:'level-start',level:50},{type:'level-complete',level:50,durationMs:1235}]);
 session.restart();session.startLevel(50);session.completeLevel(49,200);session.completeLevel(50,-1);session.completeLevel(50,400);
 assert.deepEqual(messages.slice(-2),[{type:'level-start',level:50},{type:'level-complete',level:50,durationMs:400}]);
});
test('invalid host events do not consume the valid attempt',()=>{
 const messages:HostMessage[]=[],session=new WorkbookSession(m=>messages.push(m),50);session.markReady();
 for(const n of [0,51,-1,1.5,NaN])session.startLevel(n);session.completeLevel(1,1);session.startLevel(1);session.completeLevel(1,NaN);session.completeLevel(1,Infinity);session.completeLevel(1,10);
 assert.deepEqual(messages,[{type:'ready'},{type:'level-start',level:1},{type:'level-complete',level:1,durationMs:10}]);
});
test('a genuinely won linked island earns only itself, never its locked predecessors',()=>{
 const fresh=createProgress(levels),id=levels[49].id;
 assert.deepEqual(completeLevel(levels,fresh,id),fresh);
 const won=completeLevel(levels,fresh,id,id);assert.deepEqual(won.completedIds,[id]);assert.equal(unlockedThrough(levels,won),1);assert.equal(campaignFinished(levels,won),false);assert.equal(won.currentId,levels[0].id);
 assert.deepEqual(completeLevel(levels,fresh,'foreign','foreign'),fresh);
 assert.deepEqual(fresh.completedIds,[]);
});

function browserFixture(t:{after:(fn:()=>void)=>void},origin:string,standalone=false){
 const oldWindow=Object.getOwnPropertyDescriptor(globalThis,'window'),oldDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
 const posts:unknown[][]=[],listeners=new Map<string,()=>void>();
 const fake={location:{origin:'http://localhost:4263',ancestorOrigins:[origin]},parent:{} as unknown,addEventListener:(type:string,fn:()=>void)=>listeners.set(type,fn),removeEventListener:(type:string)=>listeners.delete(type)};
 fake.parent=standalone?fake:{postMessage:(...args:unknown[])=>posts.push(args)};
 Object.defineProperty(globalThis,'window',{value:fake,configurable:true});Object.defineProperty(globalThis,'document',{value:{referrer:''},configurable:true});
 t.after(()=>{initHost('');if(oldWindow)Object.defineProperty(globalThis,'window',oldWindow);else Reflect.deleteProperty(globalThis,'window');if(oldDocument)Object.defineProperty(globalThis,'document',oldDocument);else Reflect.deleteProperty(globalThis,'document');});
 return {posts,listeners};
}
test('browser adapter is silent standalone and sends versioned events only to the exact parent',t=>{
 const fixture=browserFixture(t,'http://localhost:4017');initHost('wordcraft-islands');postToHost({type:'ready'});
 assert.deepEqual(fixture.posts,[[{source:'workbook-game',version:1,slug:'wordcraft-islands',type:'ready'},'http://localhost:4017']]);
 fixture.listeners.get('error')?.();assert.match((fixture.posts[1][0] as {message:string}).message,/Reload/);
 const fake=globalThis.window;Object.defineProperty(fake,'parent',{value:fake,configurable:true});initHost('wordcraft-islands');postToHost({type:'ready'});assert.equal(fixture.posts.length,2);
});
test('browser adapter refuses a deceptive iframe parent without registering error reporting',t=>{
 const fixture=browserFixture(t,'https://workbook.co.il.evil.test');initHost('wordcraft-islands');postToHost({type:'level-start',level:1});assert.deepEqual(fixture.posts,[]);assert.equal(fixture.listeners.size,0);
});
