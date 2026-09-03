#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot=process.cwd();
const courseRoot=path.join(repoRoot,'the-educator/learning/courses/cpcs351');
const weeksRoot=path.join(courseRoot,'weeks');
const topics=[
 ['01','01-introduction'],['02','02-software-quality'],['03','03-system-engineering'],['04','04-process-and-methodology'],
 ['05','05-software-requirements-elicitation'],['06','06-architectural-design-and-software-design-principles'],
 ['07','07-domain-modeling-and-uml-class-diagram'],['08','08-object-interaction-modeling'],['09','09-activity-modeling'],
 ['10','10-modeling-interactions-and-behavior-revision'],['11','11-responsibility-assignment-patterns'],['12','12-software-testing']
];
const errors=[]; let generatedLinks=0; let lessonPages=0;
const exists=p=>fs.existsSync(p)&&fs.statSync(p).isFile();
const decodeRef=ref=>{try{return decodeURIComponent(ref)}catch{return ref}};

if(!exists(path.join(courseRoot,'index.html')))errors.push('Course Home index.html is missing.');
if(!exists(path.join(courseRoot,'navigation-system.js')))errors.push('navigation-system.js is missing.');
if(!exists(path.join(courseRoot,'navigation-system.css')))errors.push('navigation-system.css is missing.');

const dashboard=fs.readFileSync(path.join(courseRoot,'course-dashboard.js'),'utf8');
const unified=fs.readFileSync(path.join(courseRoot,'navigation-system.js'),'utf8');

for(const [num,slug] of topics){
 const dir=path.join(weeksRoot,slug);
 const index=path.join(dir,'index.html');
 if(!exists(index))errors.push(`Topic ${num}: missing ${slug}/index.html`);
 if(!dashboard.includes(`weeks/${slug}/`))errors.push(`Course dashboard is missing Topic ${num} route: ${slug}`);
 if(!unified.includes(`'${num}','`)||!unified.includes(`'${slug}'`))errors.push(`Unified navigation map is missing Topic ${num}: ${slug}`);
 if(!fs.existsSync(dir))continue;
 const htmlFiles=fs.readdirSync(dir).filter(n=>n.endsWith('.html'));
 lessonPages+=htmlFiles.length;
 const jsFile=fs.readdirSync(dir).find(n=>/^topic\d+\.js$/i.test(n));
 if(jsFile){
   const js=fs.readFileSync(path.join(dir,jsFile),'utf8');
   const refs=[...js.matchAll(/["']([^"']+\.html)["']/g)].map(m=>decodeRef(m[1]));
   for(const ref of new Set(refs)){
     if(ref.includes('/')||ref.startsWith('http'))continue;
     generatedLinks++;
     if(!exists(path.join(dir,ref)))errors.push(`Topic ${num} ${jsFile}: generated navigation target does not exist: ${ref}`);
   }
 }
 for(const file of htmlFiles){
   const text=fs.readFileSync(path.join(dir,file),'utf8');
   for(const m of text.matchAll(/href=["']([^"']+)["']/gi)){
     let ref=m[1].split('#')[0].split('?')[0];
     if(!ref||ref.startsWith('#')||/^(https?:|mailto:|tel:|javascript:|\/)/i.test(ref))continue;
     ref=decodeRef(ref);
     const target=path.resolve(dir,ref);
     generatedLinks++;
     if(!fs.existsSync(target)&&!exists(target+'.html'))errors.push(`Topic ${num} ${file}: local navigation/reference target missing: ${ref}`);
   }
 }
}

for(const token of ['Previous Lesson','Next Lesson','Previous Topic','Next Topic','Topic Home','Course Home']){
 if(!unified.includes(token))errors.push(`Unified navigation is missing recovery/path label: ${token}`);
}
for(const token of ['aria-current','Breadcrumb','aria-label','Escape','focus']){
 if(!unified.toLowerCase().includes(token.toLowerCase()))errors.push(`Unified navigation accessibility/wayfinding signal missing: ${token}`);
}

console.log(`Navigation audit checked ${topics.length} topics, ${lessonPages} lesson HTML pages, and ${generatedLinks} generated/explicit local navigation references.`);
if(errors.length){
 console.error(`Found ${errors.length} navigation issue(s):`);
 errors.forEach(e=>console.error(`- ${e}`));
 process.exit(1);
}
console.log('CPCS 351 global, local, breadcrumb, topic-map, and Previous/Next navigation targets are internally consistent.');
