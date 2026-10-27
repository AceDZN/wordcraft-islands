import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgress, unlockedThrough, canPlay, enterLevel, completeLevel, resumeLevel, campaignFinished, type CampaignProgress} from '../src/campaign';

// Deliberately independent small fixture: access follows sequence, not curriculum grade.
const entries=[{id:'one',sourceGrade:9},{id:'two',sourceGrade:7},{id:'three',sourceGrade:8},{id:'four',sourceGrade:9},{id:'five',sourceGrade:7},{id:'six',sourceGrade:8}];

test('fresh campaign opens only the first ordered entry',()=>{
 const p=createProgress(entries);
 assert.deepEqual(p,{version:2,completedIds:[],currentId:'one'});
 assert.equal(unlockedThrough(entries,p),1);
 assert.deepEqual(entries.map(e=>canPlay(entries,p,e.id)),[true,false,false,false,false,false]);
 assert.equal(canPlay(entries,p,'foreign'),false);
 assert.equal(resumeLevel(entries,p).id,'one');
 assert.equal(campaignFinished(entries,p),false);
});

test('entering or completing locked and unknown entries cannot advance progress',()=>{
 const p=createProgress(entries);
 for(const id of ['six','three','foreign']){
  assert.deepEqual(enterLevel(entries,p,id),p);
  assert.deepEqual(completeLevel(entries,p,id),p);
 }
 assert.deepEqual(p.completedIds,[]);
});

test('actual completion opens exactly the next entry and never follows sourceGrade',()=>{
 let p=createProgress(entries);
 p=completeLevel(entries,p,'one');
 assert.deepEqual(p.completedIds,['one']);assert.equal(p.currentId,'two');assert.equal(unlockedThrough(entries,p),2);
 assert.equal(canPlay(entries,p,'two'),true);assert.equal(canPlay(entries,p,'three'),false);
 p=completeLevel(entries,p,'two');
 assert.deepEqual(p.completedIds,['one','two']);assert.equal(p.currentId,'three');assert.equal(unlockedThrough(entries,p),3);
});

test('replaying a completed entry preserves frontier and completion is idempotent',()=>{
 let p=createProgress(entries);
 for(const id of ['one','two','three'])p=completeLevel(entries,p,id);
 p=enterLevel(entries,p,'one');
 assert.equal(resumeLevel(entries,p).id,'one');assert.equal(unlockedThrough(entries,p),4);
 const replayed=completeLevel(entries,p,'one');
 assert.deepEqual(replayed.completedIds,['one','two','three']);assert.equal(replayed.currentId,'four');assert.equal(unlockedThrough(entries,replayed),4);
});

test('sanitization removes foreign IDs and duplicates and repairs locked currentId',()=>{
 const p=createProgress(entries,{version:2,completedIds:['four','foreign','one','one',4],currentId:'six'});
 assert.deepEqual(p.completedIds,['one','four']);assert.equal(p.currentId,'two');assert.equal(unlockedThrough(entries,p),2);
 assert.equal(canPlay(entries,p,'four'),true,'recognised historical win can be replayed');
 assert.equal(canPlay(entries,p,'three'),false,'historical later win does not fabricate the missing prefix');
 assert.equal(canPlay(entries,p,'five'),false);
});

test('legacy wins migrate without inventing intermediate completion',()=>{
 const p=createProgress(entries,undefined,['four','one','foreign','four']);
 assert.deepEqual(p,{version:2,completedIds:['one','four'],currentId:'two'});
 assert.equal(unlockedThrough(entries,p),2);
 assert.equal(canPlay(entries,p,'four'),true);assert.equal(canPlay(entries,p,'three'),false);
});

test('a valid v2 save wins over stale legacy progress, including a deliberate empty save',()=>{
 const p=createProgress(entries,{version:2,completedIds:[],currentId:'one'},['one','two','three']);
 assert.deepEqual(p.completedIds,[]);assert.equal(p.currentId,'one');assert.equal(unlockedThrough(entries,p),1);
});

test('malformed save inputs safely fall back to recognised legacy IDs',()=>{
 for(const raw of [null,undefined,'{broken json',44,[],{version:2,completedIds:'not-an-array'},{version:99,completedIds:['six']}]){
  const p=createProgress(entries,raw,['one']);
  assert.deepEqual(p.completedIds,['one']);assert.equal(p.currentId,'two');
 }
});

test('JSON persistence retains an allowed replay position and its earned frontier',()=>{
 const original:CampaignProgress={version:2,completedIds:['one','two','three'],currentId:'one'};
 const p=createProgress(entries,JSON.parse(JSON.stringify(original)));
 assert.deepEqual(p,original);assert.equal(resumeLevel(entries,p).id,'one');assert.equal(unlockedThrough(entries,p),4);
 const repaired=createProgress(entries,{...original,currentId:'missing'});
 assert.equal(resumeLevel(entries,repaired).id,'four');
});

test('progress transitions do not mutate their input arrays',()=>{
 const input:CampaignProgress={version:2,completedIds:['one'],currentId:'two'};
 const before=structuredClone(input);
 const entered=enterLevel(entries,input,'one'),completed=completeLevel(entries,input,'two');
 assert.deepEqual(input,before);assert.notEqual(entered.completedIds,input.completedIds);assert.notEqual(completed.completedIds,input.completedIds);
});

test('last completion finishes campaign and remains last instead of wrapping',()=>{
 let p=createProgress(entries);
 for(const entry of entries)p=completeLevel(entries,p,entry.id);
 assert.equal(campaignFinished(entries,p),true);assert.equal(unlockedThrough(entries,p),6);
 assert.equal(p.currentId,'six');assert.equal(resumeLevel(entries,p).id,'six');assert.equal(p.completedIds.length,6);
 const again=completeLevel(entries,p,'six');assert.deepEqual(again,p);
 assert.equal(enterLevel(entries,p,'one').currentId,'one','replay is still an explicit permitted action');
});

test('empty campaigns are rejected explicitly',()=>assert.throws(()=>createProgress([]),/needs levels/));

test('the authored campaign has exactly50 unique sequential stops in five chapters',async()=>{
 const {levels,chapters}=await import('../src/campaign-levels');
 assert.equal(levels.length,50);assert.equal(new Set(levels.map(l=>l.id)).size,50);
 assert.deepEqual(levels.map(l=>l.number),Array.from({length:50},(_,i)=>i+1));assert.equal(chapters.length,5);
 assert.deepEqual(levels.map(l=>l.chapter),Array.from({length:50},(_,i)=>Math.floor(i/10)+1));
 assert(levels.every(l=>l.mission.trim()&&l.concept.trim()&&l.zones.length));
});

test('all nine historical IDs are preserved as recognised sparse wins in the50-level campaign',async()=>{
 const {levels}=await import('../src/campaign-levels');
 const old=['g7-crossing','g7-rain','g7-inlet','g8-length','g8-weight','g8-history','g9-cargo','g9-power','g9-storm'];
 assert(old.every(id=>levels.some(l=>l.id===id)),'missing historical level ID');
 const p=createProgress(levels,undefined,[...old,'foreign','g9-storm']);
 assert.equal(p.completedIds.length,9);assert.deepEqual(new Set(p.completedIds),new Set(old));assert.equal(campaignFinished(levels,p),false);
 const firstMissing=levels.find(l=>!old.includes(l.id))!;assert.equal(p.currentId,firstMissing.id);assert.equal(unlockedThrough(levels,p),firstMissing.number);
 const locked=levels.find(l=>l.number>firstMissing.number&&!old.includes(l.id))!;assert.equal(canPlay(levels,p,locked.id),false);
});

test('sequential pure transitions finish all50 without wrapping, duplicating or fabricating extra IDs',async()=>{
 const {levels}=await import('../src/campaign-levels');let p=createProgress(levels);
 for(let i=0;i<50;i++){
  p=completeLevel(levels,p,levels[i].id);assert.equal(p.completedIds.length,i+1);assert.equal(unlockedThrough(levels,p),Math.min(50,i+2));
 }
 assert.equal(campaignFinished(levels,p),true);assert.equal(p.currentId,levels[49].id);assert.equal(resumeLevel(levels,p).id,levels[49].id);
 assert.deepEqual(completeLevel(levels,p,levels[49].id),p);
});
