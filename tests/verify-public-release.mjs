/** Byte-for-byte check of the immutable Workbook release. */
import {readdir,readFile,stat,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
const version=process.argv[2];assert.match(version??'',/^\d{4}-\d{2}-\d{2}(?:-\d+)?$/);
const poster=process.argv[3]??'docs/art/dynamic-poster.png';
const base=`https://assets.acedzn.xyz/games/wordcraft-islands/${version}/`;
async function list(dir){return(await Promise.all((await readdir(dir)).map(async n=>{const p=path.join(dir,n);return(await stat(p)).isDirectory()?list(p):[p];}))).flat();}
const files=(await list('dist')).filter(f=>!f.endsWith('.md')&&!f.endsWith('.DS_Store')).map(file=>({file,key:path.relative('dist',file)}));files.push({file:poster,key:'poster.png'});
const results=[];for(const {file,key} of files){const local=await readFile(file),response=await fetch(base+key,{signal:AbortSignal.timeout(30000)});assert.equal(response.status,200,key);const remote=Buffer.from(await response.arrayBuffer()),hash=b=>createHash('sha256').update(b).digest('hex');assert.equal(hash(remote),hash(local),key);assert.match(response.headers.get('cache-control')??'',/immutable/,key);if(key.endsWith('.glb'))assert.match(response.headers.get('content-type')??'',/model\/gltf-binary/);results.push({key,bytes:local.length,sha256:hash(local),status:response.status,contentType:response.headers.get('content-type'),cacheControl:response.headers.get('cache-control')});}
await mkdir('work/dynamic',{recursive:true});await writeFile('work/dynamic/public-release.json',JSON.stringify({version,base,bytes:results.reduce((n,r)=>n+r.bytes,0),files:results,passed:true},null,2));console.log(`${results.length} immutable release files match the tested build`);
