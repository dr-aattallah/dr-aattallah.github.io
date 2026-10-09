/* Follow-up checks of the current multipage Unit 01, with real fonts and TLS. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const course='/the-educator/learning/courses/new-cpcs351/',root=course+'units/01/';
const repo=path.resolve(__dirname,'../..'),unit=path.join(repo,root);
const routes=JSON.parse(fs.readFileSync(path.join(unit,'unit01-routes.json'))).pages;
const base=process.env.BASE_URL||'http://127.0.0.1:8766',out=process.env.OUTPUT_DIR||path.join(__dirname,'verification-results');
fs.mkdirSync(out,{recursive:true});const checks=[],errors=[],images=[],fonts=[];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const save=(name,data)=>fs.writeFileSync(path.join(out,name),JSON.stringify(data,null,2));
async function check(name,f){try{await f();checks.push({name,passed:true})}catch(e){checks.push({name,passed:false,error:e.message})}}
(async()=>{
 const browser=await chromium.launch({...process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}});
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(/fonts\.(googleapis|gstatic)\.com/.test(r.url()))fonts.push({url:r.url(),status:r.status()})});
 for(const file of [...routes,'unit01.js','unit01.css'])await check('served bytes match checkout: '+file,async()=>{const r=await page.request.get(base+root+file);assert.equal(r.status(),200);assert.equal(hash(await r.body()),hash(fs.readFileSync(path.join(unit,file))))});
 for(const [file,sha,size] of [
  ['u01-roomnow-quality-boundary.png','c48e56a6528862cc01d819b0d6560b01e8b0332f6bc826aa03e72d7e63e67e5b',2295148],
  ['u01-campuscare-judgment.png','ee854bee23979ff02d5b77e8cea0a10acf322e4ad06cf9a55d3ddeded98e73fc',2486511]
 ])await check('anonymous original PNG integrity: '+file,async()=>{const r=await page.request.get(base+course+'assets/images/'+file),bytes=await r.body(),row={file,status:r.status(),mime:r.headers()['content-type'],bytes:bytes.length,sha256:hash(bytes)};images.push(row);assert.equal(row.status,200);assert.match(row.mime,/image\/png/);assert.equal(row.bytes,size);assert.equal(row.sha256,sha)});
 for(const file of routes){
  await page.goto(base+root+file,{waitUntil:'networkidle'});await page.addScriptTag({path:process.env.AXE_PATH||require.resolve('axe-core/axe.min.js')});
  const axe=await page.evaluate(async()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));save(file+'-mobile-axe.json',axe);
  await check('mobile axe '+file,()=>assert.equal(axe.violations.length,0,JSON.stringify(axe.violations.map(x=>({id:x.id,targets:x.nodes.map(n=>n.target)})))));
  for(const [width,height] of [[320,568],[375,812],[390,844],[430,932],[768,1024],[1024,768],[1280,800],[1440,900],[1920,1080],[844,390]]){
   await page.setViewportSize({width,height});await check(`${file} viewport ${width}x${height}`,async()=>{const d=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(d.scroll<=d.width,JSON.stringify(d))});
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(out,file+'-initial-mobile.png')});
  if(await page.locator('.story-visual img').count()){
   const img=page.locator('.story-visual img').first();await img.evaluate(i=>i.loading='eager');await page.waitForFunction(()=>[...document.querySelectorAll('.story-visual img')].every(i=>i.complete&&i.naturalWidth>0));
   await img.evaluate(i=>i.decode());
   await check('image dimensions, ratio and alt '+file,async()=>{const d=await img.evaluate(i=>({w:i.naturalWidth,h:i.naturalHeight,src:i.src,alt:i.alt,rect:i.getBoundingClientRect().toJSON()}));assert.equal(d.w,1536);assert.equal(d.h,1024);assert.ok(d.alt.length>30);assert.ok(Math.abs(d.rect.width/d.rect.height-1.5)<0.01);assert.ok(!d.src.includes('drive.google'));assert.ok(!(await page.locator('.image-fallback').first().isVisible()))});
   await page.locator('.story-visual').first().screenshot({path:path.join(out,file+'-original-mobile.png')});
  }
 }
 await page.goto(base+root+'practice.html');await check('initial summary',async()=>assert.match(await page.locator('#u01-quiz-summary').innerText(),/0 of 5 practiced; 0 correct/));
 for(let i=0;i<5;i++){
  const q=page.locator('.quiz-q').nth(i),a=await q.getAttribute('data-answer');
  await check(`Q${i+1}: correct, incorrect, locking, reset, keyboard and live feedback`,async()=>{
   const good=q.locator(`[data-choice="${a}"]`),bad=q.locator(`[data-choice]:not([data-choice="${a}"])`).first(),reset=q.locator('.u01-reset');
   await good.focus();await page.keyboard.press(i%2?'Space':'Enter');assert.equal(await q.getAttribute('data-correct'),'true');assert.match(await q.locator('.u01-attempt-note').innerText(),/Correct first attempt/);assert.equal(await q.locator('[aria-disabled="true"]').count(),4);
   await bad.evaluate(e=>e.click());assert.equal(await q.getAttribute('data-correct'),'true');await reset.focus();await page.keyboard.press('Enter');assert.equal(await q.getAttribute('data-attempted'),'false');assert.ok(!(await q.locator('.quiz-feedback').isVisible()));assert.equal(await q.locator('[aria-disabled="true"]').count(),0);assert.ok(await q.locator('[data-choice]').first().evaluate(e=>e===document.activeElement));
   await bad.focus();await page.keyboard.press('Enter');const t=await q.locator('.u01-attempt-note').innerText();assert.match(t,/Not correct/);assert.ok(t.includes(await good.innerText()));assert.ok(t.includes(await bad.getAttribute('data-explanation')));assert.equal(await q.locator('.u01-attempt-note').getAttribute('role'),'status');assert.equal(await q.locator('.u01-attempt-note').getAttribute('aria-atomic'),'true');await good.evaluate(e=>e.click());assert.equal(await q.getAttribute('data-correct'),'false');await reset.click();await good.click();
  });
  await check('summary after Q'+(i+1),async()=>assert.match(await page.locator('#u01-quiz-summary').innerText(),new RegExp(`${i+1} of 5 practiced; ${i+1} correct`)));
 }
 await page.locator('.quiz-q').first().locator('.u01-reset').click();await check('reset summary',async()=>assert.match(await page.locator('#u01-quiz-summary').innerText(),/4 of 5 practiced; 4 correct/));
 fs.writeFileSync(path.join(out,'answered-accessibility-tree.txt'),await page.locator('[data-quiz]').ariaSnapshot());await page.locator('.quiz-q').nth(1).screenshot({path:path.join(out,'answered-question.png')});
 const broken=await browser.newPage({viewport:{width:390,height:844}});await broken.route('**/assets/images/u01-*.png',r=>r.abort());
 for(const file of ['quality.html','responsibility.html']){await broken.goto(base+root+file);await broken.locator('.story-visual img').first().evaluate(i=>i.loading='eager');await check('image fallback '+file,async()=>{await broken.locator('.image-status').first().waitFor({state:'visible'});assert.ok(await broken.locator('.image-fallback').first().isVisible());assert.ok(!(await broken.locator('.story-visual img').first().isVisible()));assert.ok((await broken.locator('.image-fallback').first().innerText()).length>150)});}
 await broken.close();await check('instructor compatibility redirect',async()=>{await page.goto(base+root+'?instructor=1');await page.waitForURL('**/instructor.html');assert.equal(await page.locator('.instructor-note').count(),2)});
 for(const file of ['index.html','syllabus.html','project.html','units/02/','instructor-guide.html'])await check('integration '+file,async()=>{const r=await page.goto(base+course+file);assert.equal(r.status(),200);assert.ok(await page.locator('h1').count())});
 await check('actual Google Fonts HTTP loading',()=>{assert.ok(fonts.length>0);assert.ok(fonts.every(r=>r.status===200))});await page.goto(base+root);await page.emulateMedia({reducedMotion:'reduce'});await check('reduced motion',async()=>assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto'));await check('uncaught errors',()=>assert.deepEqual(errors,[]));
 save('image-integrity.json',images);save('fonts.json',fonts);save('results.json',{base,date:new Date().toISOString(),browser:browser.version(),tlsValidation:true,fontsBlocked:false,checks,errors});await browser.close();console.log(JSON.stringify({passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed)},null,2));process.exitCode=checks.some(x=>!x.passed)?1:0;
})().catch(e=>{save('run-error.json',{error:e.message});console.error(e.message);process.exitCode=1});
