#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const siteRoot = path.join(repoRoot, 'the-educator');
const textExts = new Set(['.html', '.css', '.js', '.mjs', '.json', '.md']);
const ignoredPrefixes = ['http://','https://','mailto:','tel:','data:','javascript:','#','//','{','${'];
const legacyPrefixes = ['/the-educator/courses/','/the-educator/systems/'];
const errors = [];
let checkedRefs = 0;
let scannedFiles = 0;

function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}

function stripQueryHash(ref){
  return ref.split('#')[0].split('?')[0];
}

function shouldIgnore(ref){
  const t=ref.trim();
  return !t || ignoredPrefixes.some(p=>t.startsWith(p)) || /^(about:|blob:)/i.test(t);
}

function resolveLocal(fromFile, ref){
  const clean=decodeURIComponent(stripQueryHash(ref.trim()));
  if(!clean) return null;
  let target;
  if(clean.startsWith('/the-educator/')){
    target=path.join(siteRoot,clean.slice('/the-educator/'.length));
  }else if(clean==='/the-educator' || clean==='/the-educator/'){
    target=siteRoot;
  }else if(clean.startsWith('/')){
    return null;
  }else{
    target=path.resolve(path.dirname(fromFile),clean);
  }
  return target;
}

function existsTarget(target){
  if(!target) return true;
  if(fs.existsSync(target)){
    if(fs.statSync(target).isDirectory()) return fs.existsSync(path.join(target,'index.html'));
    return true;
  }
  if(!path.extname(target) && fs.existsSync(`${target}.html`)) return true;
  return false;
}

function extractRefs(file, text){
  const refs=[];
  const ext=path.extname(file).toLowerCase();
  if(ext==='.html'){
    for(const m of text.matchAll(/\b(?:href|src|action|poster)\s*=\s*["']([^"']+)["']/gi)) refs.push(m[1]);
    for(const m of text.matchAll(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*?url=([^"']+)["']/gi)) refs.push(m[1].trim());
  }
  if(ext==='.css'){
    for(const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.push(m[1]);
  }
  return refs;
}

if(!fs.existsSync(siteRoot)){
  console.error('the-educator directory not found');
  process.exit(2);
}

for(const file of walk(siteRoot)){
  const ext=path.extname(file).toLowerCase();
  if(!textExts.has(ext)) continue;
  scannedFiles++;
  const text=fs.readFileSync(file,'utf8');
  const rel=path.relative(repoRoot,file).replaceAll(path.sep,'/');

  const isDocumentation = rel.startsWith('the-educator/docs/') || rel.endsWith('/README.md');
  if(!isDocumentation && !rel.endsWith('/audit-static-links.mjs')){
    for(const legacy of legacyPrefixes){
      if(text.includes(legacy)) errors.push(`${rel}: legacy path remains: ${legacy}`);
    }
  }

  if(rel.startsWith('the-educator/classroom/') && /href=["']\.\.\/["'][^>]*>\s*Portfolio\s*</i.test(text)){
    errors.push(`${rel}: Portfolio link still uses ../ after Classroom moved one level deeper`);
  }

  for(const ref of extractRefs(file,text)){
    if(shouldIgnore(ref)) continue;
    const target=resolveLocal(file,ref);
    if(!target) continue;
    checkedRefs++;
    if(!existsTarget(target)){
      errors.push(`${rel}: broken local reference "${ref}" -> ${path.relative(repoRoot,target).replaceAll(path.sep,'/')}`);
    }
  }
}

console.log(`Scanned ${scannedFiles} text files and checked ${checkedRefs} local references.`);
if(errors.length){
  console.error(`\nFound ${errors.length} issue(s):`);
  errors.forEach(x=>console.error(`- ${x}`));
  process.exit(1);
}
console.log('No broken local references or legacy subsystem paths detected.');
