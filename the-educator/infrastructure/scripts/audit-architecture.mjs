#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.join(process.cwd(), 'the-educator');
const runtime = ['learning','attendance','classroom','practice'];
const textExt = new Set(['.html','.css','.js','.mjs','.json','.md','.yml','.yaml','.sql','.cs','.csproj']);
const files=[];
function walk(dir){
  if(!fs.existsSync(dir)) return;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory()) walk(p); else files.push(p);
  }
}
walk(root);
const rel=p=>path.relative(root,p).replaceAll(path.sep,'/');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const report={files:files.length,systems:{},duplicateGroups:[],naming:[],rootRuntimeFiles:[],patchArtifacts:[],emptyFiles:[],sharedDuplicateFiles:[]};
for(const s of runtime){
  const prefix=s+'/';
  const fsys=files.filter(f=>rel(f).startsWith(prefix));
  report.systems[s]={files:fsys.length,bytes:fsys.reduce((n,f)=>n+fs.statSync(f).size,0)};
}
for(const f of files){
  const r=rel(f), b=path.basename(f), size=fs.statSync(f).size;
  if(size<=1) report.emptyFiles.push(r);
  if(/(?:PATCH|patch|FIX|fix|backup|old|copy|temp|tmp)/.test(b)) report.patchArtifacts.push(r);
  if(/[A-Z ]/.test(r) && r.startsWith('learning/courses/')) report.naming.push(r);
  if(!r.includes('/') && !['index.html','README.md','login.html','help.html','reset-password.html'].includes(r)) report.rootRuntimeFiles.push(r);
}
const byHash=new Map();
for(const f of files){
  if(fs.statSync(f).size===0) continue;
  const h=sha(f); if(!byHash.has(h)) byHash.set(h,[]); byHash.get(h).push(rel(f));
}
for(const group of byHash.values()){
  if(group.length<2) continue;
  const systems=new Set(group.map(x=>x.split('/')[0]));
  if(systems.size>1 || group.some(x=>x.startsWith('assets/'))) report.duplicateGroups.push(group);
}
const rootAssets=files.filter(f=>rel(f).startsWith('assets/'));
const classroomAssets=files.filter(f=>rel(f).startsWith('classroom/assets/'));
const rootHash=new Map(rootAssets.map(f=>[sha(f),rel(f)]));
for(const f of classroomAssets){ const h=sha(f); if(rootHash.has(h)) report.sharedDuplicateFiles.push([rel(f),rootHash.get(h)]); }
console.log(JSON.stringify(report,null,2));
console.log('\nARCHITECTURE SUMMARY');
console.log(`Total files: ${report.files}`);
for(const [k,v] of Object.entries(report.systems)) console.log(`${k}: ${v.files} files, ${v.bytes} bytes`);
console.log(`Cross-area duplicate groups: ${report.duplicateGroups.length}`);
console.log(`Classroom assets duplicated in shared assets: ${report.sharedDuplicateFiles.length}`);
console.log(`Learning paths needing naming normalization: ${report.naming.length}`);
console.log(`Patch/temporary-looking artifacts: ${report.patchArtifacts.length}`);
console.log(`Unexpected files at The Educator root: ${report.rootRuntimeFiles.length}`);
