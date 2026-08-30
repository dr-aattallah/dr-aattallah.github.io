#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.join(process.cwd(), 'the-educator');
const runtime = ['learning','attendance','classroom','practice'];
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
const report={files:files.length,systems:{},compatibilityMirrors:[],naming:[],rootRuntimeFiles:[],legacyNamedActiveFiles:[],emptyFiles:[]};
for(const s of runtime){
  const prefix=s+'/';
  const fsys=files.filter(f=>rel(f).startsWith(prefix));
  report.systems[s]={files:fsys.length,bytes:fsys.reduce((n,f)=>n+fs.statSync(f).size,0)};
}
for(const f of files){
  const r=rel(f), b=path.basename(f), size=fs.statSync(f).size;
  if(size<=1) report.emptyFiles.push(r);
  if(/(?:PATCH|patch|FIX|fix|backup|old|copy|temp|tmp)/.test(b)) report.legacyNamedActiveFiles.push(r);
  if(!r.includes('/') && !['index.html','README.md','login.html','help.html','reset-password.html'].includes(r)) report.rootRuntimeFiles.push(r);
}
const weeksRoot=path.join(root,'learning','courses','cpcs351','weeks');
if(fs.existsSync(weeksRoot)){
  for(const e of fs.readdirSync(weeksRoot,{withFileTypes:true})){
    if(e.isDirectory() && /[A-Z ]/.test(e.name)) report.naming.push(`learning/courses/cpcs351/weeks/${e.name}/`);
  }
}
const rootAssets=files.filter(f=>rel(f).startsWith('assets/'));
const classroomAssets=files.filter(f=>rel(f).startsWith('classroom/assets/'));
const rootHash=new Map(rootAssets.map(f=>[sha(f),rel(f)]));
for(const f of classroomAssets){ const h=sha(f); if(rootHash.has(h)) report.compatibilityMirrors.push([rel(f),rootHash.get(h)]); }
console.log(JSON.stringify(report,null,2));
console.log('\nARCHITECTURE SUMMARY');
console.log(`Total files: ${report.files}`);
for(const [k,v] of Object.entries(report.systems)) console.log(`${k}: ${v.files} files, ${v.bytes} bytes`);
console.log(`Compatibility asset mirrors: ${report.compatibilityMirrors.length}`);
console.log(`Learning directory names needing normalization: ${report.naming.length}`);
console.log(`Legacy-named active files: ${report.legacyNamedActiveFiles.length}`);
console.log(`Unexpected files at The Educator root: ${report.rootRuntimeFiles.length}`);
console.log(`Empty placeholder files: ${report.emptyFiles.length}`);
if(report.naming.length || report.rootRuntimeFiles.length || report.emptyFiles.length){
  console.error('Architecture audit failed: structural cleanup is still required.');
  process.exit(1);
}
