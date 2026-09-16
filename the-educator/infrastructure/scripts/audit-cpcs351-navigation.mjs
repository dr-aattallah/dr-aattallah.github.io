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
const walk=(dir,out=[])=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p,out);else if(e.name.endsWith('.html'))out.push(p)}return out};

const homePath=path.join(courseRoot,'index.html');
const navShimPath=path.join(courseRoot,'navigation-system.js');
const navCssPath=path.join(courseRoot,'navigation-system.css');
const studyPath=path.join(courseRoot,'study.js');
const courseHeaderPath=path.join(courseRoot,'course-header.js');
if(!exists(homePath))errors.push('Course Home index.html is missing.');
if(!exists(navShimPath))errors.push('navigation-system.js is missing.');
if(!exists(navCssPath))errors.push('navigation-system.css is missing.');
if(!exists(studyPath))errors.push('study.js shared navigation controller is missing.');
if(!exists(courseHeaderPath))errors.push('course-header.js shared course header is missing.');

const dashboard=fs.readFileSync(path.join(courseRoot,'course-dashboard.js'),'utf8');
const unified=[navShimPath,studyPath,courseHeaderPath].filter(exists).map(p=>fs.readFileSync(p,'utf8')).join('\n');

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

// Whole-course coverage: every ordinary CPCS 351 HTML page must load one of the shared navigation controllers.
const allHtml=walk(courseRoot),specialPurpose=new Set(['access.html']);
let sharedNavPages=0,deepPages=0;
for(const file of allHtml){
 const rel=path.relative(courseRoot,file).replaceAll('\\','/');
 if(specialPurpose.has(rel))continue;
 const text=fs.readFileSync(file,'utf8');
 const isPresentation=/presentation\.html$/i.test(rel);
 const hasShared=/course-header\.js|study\.js|navigation-system\.js|course-dashboard\.js/.test(text);
 // Presentation mode is intentionally full-screen and keeps its own presentation navigation.
 if(!isPresentation&&!hasShared)errors.push(`${rel}: missing shared CPCS 351 navigation controller.`); else sharedNavPages++;
 const parts=rel.split('/');
 const deep=parts.length>=3 && rel!=='index.html';
 if(deep&&!isPresentation){
   deepPages++;
   const topicPage=/^weeks\/\d{2}-(?!lab-learning-path)/.test(rel);
   const hasRecovery=topicPage?(/study\.js|navigation-system\.js/.test(text)):/course-header\.js/.test(text);
   if(!hasRecovery)errors.push(`${rel}: third-level page is missing shared parent/back recovery navigation.`);
 }
}
if(!unified.includes('Back to Labs')||!unified.includes('Back to Resources')||!unified.includes('Back to Topic'))errors.push('course-header.js is missing contextual Back navigation for deep course pages.');

console.log(`Navigation audit checked ${topics.length} topics, ${lessonPages} lesson HTML pages, ${allHtml.length} total course HTML pages, ${sharedNavPages} shared-navigation pages, ${deepPages} deep pages, and ${generatedLinks} generated/explicit local references.`);
if(errors.length){
 console.error(`Found ${errors.length} navigation issue(s):`);
 errors.forEach(e=>console.error(`- ${e}`));
 process.exit(1);
}
console.log('CPCS 351 unified course navigation, contextual Back recovery, topic maps, breadcrumbs, and Previous/Next targets are internally consistent.');
