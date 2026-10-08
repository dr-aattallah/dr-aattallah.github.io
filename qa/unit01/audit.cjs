/* Run against local HTTP server or BASE_URL=https://dr-aattallah.github.io.
 * CHROME_PATH selects installed Chromium; otherwise Playwright's browser is used.
 * OUTPUT_DIR selects evidence directory; AXE_PATH optionally selects axe.min.js.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium, firefox, webkit } = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8765';
const route = '/the-educator/learning/courses/new-cpcs351/';
const url = base + route + 'units/01/';
const out = process.env.OUTPUT_DIR || path.join(__dirname, 'results');
fs.mkdirSync(out, {recursive:true});
const checks = [], errors = [], network = [];
const save = (name, data) => fs.writeFileSync(path.join(out,name), JSON.stringify(data,null,2));
async function check(name, fn) { try { await fn(); checks.push({name,passed:true}); } catch(e) { checks.push({name,passed:false,error:e.message}); } }
(async () => {
 const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH}: {})});
 const page = await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(/google|unit01|site.css|navigation.js/.test(r.url()))network.push({url:r.url(),status:r.status(),type:r.headers()['content-type']});});
 page.on('requestfailed',r=>network.push({url:r.url(),failure:r.failure()}));
 await page.goto(url); await page.waitForLoadState('networkidle');
 const axePath=process.env.AXE_PATH || require.resolve('axe-core/axe.min.js');
 async function axeScan(name) {
  await page.addScriptTag({path:axePath});
  const result=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
  save(`axe-${name}.json`,result);
  await check(`axe ${name}: no violations`,()=>assert.equal(result.violations.length,0,JSON.stringify(result.violations.map(v=>({id:v.id,count:v.nodes.length})))));
 }
 await axeScan('desktop');
 await check('skip link is first keyboard stop and focuses main',async()=>{
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'skip');
  await page.keyboard.press('Enter');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
 });
 await check('semantic heading sequence',async()=>{
  const levels=await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll(es=>es.map(e=>+e.tagName[1]));
  assert.equal(levels.filter(l=>l===1).length,1);for(let i=1;i<levels.length;i++)assert.ok(levels[i]<=levels[i-1]+1);
 });

 const viewports=[];
 for (const [width,height] of [[320,568],[375,812],[390,844],[430,932],[768,1024],[1024,768],[1280,800],[1440,900],[1920,1080],[844,390]]) {
  await page.setViewportSize({width,height});
  const size=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));viewports.push(size);
  await check(`no horizontal overflow ${width}x${height}`,()=>assert.ok(size.scrollWidth<=width,JSON.stringify(size)));
  await page.screenshot({path:path.join(out,`full-${width}x${height}.png`),fullPage:true});
 }
 save('viewports.json',viewports);
 for(const width of [390,1440]) {
  await page.setViewportSize({width,height:900});
  for (const sel of ['.unit-hero','.learning-focus','.u01-teaching-map','.study-route','.story-thread','.u01-storyline','#puzzle','#professional','#engineering','#quality','#process','#diversity','#systems','#challenges','#ethics','#studio','#check','.remember','.sources','.unit-next']) {
   const loc=page.locator(sel);await loc.scrollIntoViewIfNeeded();
   await loc.screenshot({path:path.join(out,`section-${width}-${sel.replace(/[^a-z0-9-]/gi,'')}.png`)});
  }
 }
 await page.setViewportSize({width:390,height:844});await axeScan('mobile');
 await check('failed-image fallback contains meaningful accessible descriptions',async()=>{
  for(const f of await page.locator('.story-visual').all()) {
   const img=f.locator('img'); await f.scrollIntoViewIfNeeded();await page.waitForTimeout(800);
   const loaded=await img.evaluate(e=>e.naturalWidth>0);
   if(!loaded){assert.ok(await f.locator('.image-fallback').isVisible());assert.ok((await f.locator('.image-fallback').innerText()).length>150);assert.equal(await f.locator('.image-fallback').getAttribute('role'),'note');}
  }
 });
 const images=await page.locator('img').evaluateAll(es=>es.map(e=>({src:e.src,alt:e.alt,complete:e.complete,width:e.naturalWidth,height:e.naturalHeight})));
 save('images.json',images);
 await check('required original images render — release gate',()=>assert.ok(images.length===2 && images.every(i=>i.width>0 && i.alt.trim()),JSON.stringify(images))); 
 const qs=page.locator('.quiz-q');
 await check('five practice questions',async()=>assert.equal(await qs.count(),5));
 await check('initial summary',async()=>assert.match(await page.locator('#u01-quiz-summary').innerText(),/0 of 5 practiced/));
 for(let i=0;i<5;i++) {
  const q=qs.nth(i), answer=await q.getAttribute('data-answer');
  await check(`Q${i+1} correct, lock, reset, incorrect, keyboard and live feedback`,async()=>{
   const correct=q.locator(`[data-choice="${answer}"]`),wrong=q.locator(`[data-choice]:not([data-choice="${answer}"])`).first();
   await correct.focus();await page.keyboard.press(i%2?'Space':'Enter');
   assert.match(await q.locator('.u01-attempt-note').innerText(),/Correct first attempt/);
   assert.equal(await q.getAttribute('data-correct'),'true');
   if(i===0)assert.match(await page.locator('#u01-quiz-summary').innerText(),/1 of 5 practiced; 1 correct/);
   await wrong.evaluate(e=>e.click());assert.equal(await q.getAttribute('data-correct'),'true');
   assert.equal(await q.locator('.u01-attempt-note').getAttribute('role'),'status');
   assert.ok(await q.locator('.quiz-feedback').isVisible());
   const reset=q.locator('.u01-reset');await reset.focus();await page.keyboard.press('Enter');
   assert.equal(await q.getAttribute('data-attempted'),'false');assert.ok(!(await q.locator('.quiz-feedback').isVisible()));
   assert.equal(await q.locator('[aria-disabled="true"]').count(),0);
   assert.ok(await q.locator('[data-choice]').first().evaluate(e=>e===document.activeElement));
   if(i===0)assert.match(await page.locator('#u01-quiz-summary').innerText(),/0 of 5 practiced; 0 correct/);
   await wrong.focus();await page.keyboard.press('Enter');
   const text=await q.locator('.u01-attempt-note').innerText();assert.match(text,/Not correct/);assert.ok(text.includes(await correct.innerText()));
   await correct.evaluate(e=>e.click());assert.equal(await q.getAttribute('data-correct'),'false');
   await reset.click();await correct.click();
  });
 }
 await check('all practiced and correct summary',async()=>assert.match(await page.locator('#u01-quiz-summary').innerText(),/5 of 5 practiced; 5 correct/));
 fs.writeFileSync(path.join(out,'quiz-accessibility-tree.txt'),await page.locator('[data-quiz]').ariaSnapshot());
 await axeScan('answered');
 await qs.first().locator('.u01-reset').click();
 await check('reset decrements summary',async()=>assert.match(await page.locator('#u01-quiz-summary').innerText(),/4 of 5 practiced; 4 correct/));
 const details=page.locator('details:not([hidden])');const detailCount=await details.count();
 await check(`all ${detailCount} student disclosures keyboard-expand and collapse`,async()=>{
  for(let i=0;i<detailCount;i++){const d=details.nth(i);await d.locator('summary').focus();await page.keyboard.press('Enter');assert.ok(await d.evaluate(e=>e.open));await page.keyboard.press('Space');assert.ok(!(await d.evaluate(e=>e.open)));}
 });
 await check('student notes hidden',async()=>assert.equal(await page.locator('[data-instructor-only]:not([hidden])').count(),0));
 const anchors=await page.locator('a[href^="#"]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
 await check('every section anchor resolves',async()=>{for(const a of anchors)assert.equal(await page.locator(a).count(),1,a);});
 const links=[...new Set(await page.locator('.site-nav a[href],.brand[href],.unit-next a[href]').evaluateAll(es=>es.map(e=>e.href).filter(h=>!h.startsWith('mailto:'))))];
 const linkResults=[];
 for(const href of links){if(new URL(href).origin!==new URL(base).origin)continue;const r=await page.request.get(href);linkResults.push({href,status:r.status()});}
 save('links.json',linkResults);
 await check('browser navigation reaches course and unit destinations with valid fragments',async()=>{for(const {href} of linkResults){await page.goto(href);assert.equal(new URL(page.url()).pathname,new URL(href).pathname);const hash=new URL(href).hash;if(hash)assert.equal(await page.locator(hash).count(),1,href);}});await check('course and next-unit HTTP links',()=>assert.ok(linkResults.every(r=>r.status===200)));
 for(const file of ['index.html','syllabus.html','project.html','units/02/','instructor-guide.html']){await page.goto(base+route+file);assert.ok(await page.locator('h1').count());}
 await page.goto(url+'?instructor=1');
 await check('both instructor notes visible and keyboard-expand',async()=>{const ns=page.locator('[data-instructor-only]');assert.equal(await ns.count(),2);for(let i=0;i<2;i++){const n=ns.nth(i);assert.ok(await n.isVisible());await n.locator('summary').focus();await page.keyboard.press('Enter');assert.ok(await n.evaluate(e=>e.open));}});
 await page.screenshot({path:path.join(out,'instructor-mobile.png'),fullPage:true});await axeScan('instructor');
 await page.goto(url);await page.emulateMedia({reducedMotion:'reduce'});
 await check('reduced motion',async()=>assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto'));
 await page.setViewportSize({width:1280,height:800});
 // Viewport equivalents exercise reflow; these do not certify native browser zoom.
 for(const factor of [2,4]) {
  await page.setViewportSize({width:1280/factor,height:800});
  await check(`${factor*100}% zoom-equivalent reflow`,async()=>{const s=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(s.scroll<=s.client,JSON.stringify(s));});
  await page.screenshot({path:path.join(out,`reflow-${factor*100}.png`)});
 }
 const failedImages=await browser.newPage({viewport:{width:390,height:844}});
 await failedImages.route('**/drive.google.com/**',route=>route.abort());await failedImages.goto(url);
 await check('both failed images show descriptions and hide broken-image controls',async()=>{for(const f of await failedImages.locator('.story-visual').all()){await f.scrollIntoViewIfNeeded();await failedImages.waitForTimeout(150);assert.ok(await f.locator('.image-fallback').isVisible());assert.ok(await f.locator('.image-status').isVisible());assert.ok(!(await f.locator('img').isVisible()));}});
 await failedImages.locator('.story-visual').first().screenshot({path:path.join(out,'image-fallback.png')});await failedImages.close();
 await page.setViewportSize({width:320,height:568});await page.goto(url);
 await check('visible interactive targets at least 24 CSS px',async()=>{const small=await page.locator('a,button,summary').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent.slice(0,60),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(r=>r.w<24||r.h<24));assert.deepEqual(small,[]);});
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(url);
 await check('no-JS reading and navigation',async()=>{assert.ok(await nojs.locator('h1').isVisible());assert.ok(await nojs.locator('noscript nav').isVisible());assert.equal(await nojs.locator('.quiz-feedback:visible').count(),5);assert.equal(await nojs.locator('[data-instructor-only]:visible').count(),0);});
 await nojs.screenshot({path:path.join(out,'no-js-mobile.png'),fullPage:true});await nojs.close();
 await check('no uncaught JavaScript errors',()=>assert.equal(errors.length,0,errors.join('\n')));
 const browsers={chromium:browser.version()};await browser.close();
 for(const [name,engine] of [['firefox',firefox],['webkit',webkit]]){try{const b=await engine.launch();browsers[name]=b.version();await b.close();}catch(e){browsers[name]={available:false,reason:e.message.split('\n')[0]};}}
 save('network.json',network);save('results.json',{url,date:new Date().toISOString(),browsers,checks,errors});
 console.log(JSON.stringify({browsers,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed)},null,2));
 process.exitCode=checks.some(c=>!c.passed)?1:0;
})();
