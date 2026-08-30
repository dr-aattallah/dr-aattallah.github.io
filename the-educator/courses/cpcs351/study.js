(()=>{
  if(sessionStorage.getItem('cpcs351_access')!=='granted'){window.location.href='../../access.html';return;}
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const pageKey=()=>`cpcs351:${location.pathname.replace(/\/$/,'')}`;
  const topicKey=()=>`cpcs351-topic-${document.body.dataset.topic||'x'}`;
  const safeText=s=>(s||'').replace(/\s+/g,' ').trim();

  function a11y(){
    if(!$('#skip-link')){const a=document.createElement('a');a.id='skip-link';a.className='skip-link';a.href='#main-study-content';a.textContent='Skip to learning content';document.body.prepend(a);}
    const main=$('main'); if(main){main.id='main-study-content';main.tabIndex=-1;}
    $$('iframe').forEach((f,i)=>{if(!f.title)f.title=`External learning reference ${i+1}`;f.loading='lazy';});
    $$('img').forEach(img=>{if(!img.hasAttribute('alt'))img.alt='';img.loading='lazy';img.decoding='async';});
    $$('a[href]').forEach(a=>{const h=a.getAttribute('href');if(h&&/^https?:/i.test(h)){a.target='_blank';a.rel='noopener noreferrer';}});
  }

  function progress(){
    const hero=$('.hero'); if(!hero)return;
    const topic=document.body.dataset.topic||'';
    const page=Number(document.body.dataset.page||1);
    const navLinks=$$('.side-link, .side-nav a');
    const total=Math.max(navLinks.length,Number(($('.hero-progress small')?.textContent.match(/of\s+(\d+)/i)||[])[1]||1));
    const store=JSON.parse(localStorage.getItem(topicKey())||'{}');
    const completed=new Set(store.completed||[]);
    const bar=document.createElement('section');bar.className='learning-progress';bar.setAttribute('aria-label','Learning progress');
    bar.innerHTML=`<div class="progress-copy"><strong>Topic progress</strong><span>${completed.size} of ${total} pages completed</span></div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completed.size}"><i style="width:${Math.min(100,completed.size/total*100)}%"></i></div><button class="complete-btn" type="button">${completed.has(page)?'✓ Completed':'Mark page complete'}</button>`;
    hero.insertAdjacentElement('afterend',bar);
    $('.complete-btn',bar).addEventListener('click',()=>{completed.has(page)?completed.delete(page):completed.add(page);localStorage.setItem(topicKey(),JSON.stringify({completed:[...completed]}));location.reload();});
    navLinks.forEach((a,i)=>{if(completed.has(i+1)){a.classList.add('is-complete');a.setAttribute('aria-label',`${safeText(a.textContent)} completed`);}});
  }

  function hook(){
    const hero=$('.hero'), h1=$('.hero h1'); if(!hero||!h1||$('.learning-hook'))return;
    const lead=safeText($('.lead')?.textContent);
    const box=document.createElement('aside');box.className='learning-hook';
    box.innerHTML=`<span class="hook-label">Before you start</span><strong>What problem does “${safeText(h1.textContent)}” help a software engineer solve?</strong>${lead?`<p>Keep your answer in mind while studying this page. Revise it at the end.</p>`:''}`;
    hero.insertAdjacentElement('afterend',box);
  }

  function activeRecall(){
    const content=$('.content'); if(!content||$('.active-recall'))return;
    const h1=safeText($('.hero h1')?.textContent||document.title);
    const headings=$$('.section h2').map(x=>safeText(x.textContent)).filter(Boolean).slice(0,3);
    const box=document.createElement('section');box.className='section active-recall';
    box.innerHTML=`<div class="kicker">Active recall · 2 minutes</div><h2>Check your understanding before moving on</h2><div class="recall-grid">
      <details><summary>1 · Explain it without looking</summary><p>In your own words, explain <b>${h1}</b>. Then compare your answer with the page's learning focus and key sections.</p></details>
      <details><summary>2 · Connect the ideas</summary><p>${headings.length?`Explain how <b>${headings.join('</b>, <b>')}</b> fit together.`:'Identify the main idea, one example, and one decision this page helps you make.'}</p></details>
      <details><summary>3 · Apply it</summary><p>Create a different software-system example. If your example changes only the names but not the reasoning, make it more specific.</p></details>
    </div><div class="feedback-note"><b>Self-feedback:</b> A strong answer uses the concept correctly, explains <i>why</i>, and can transfer it to a new scenario. Re-read the relevant section if you can only repeat a definition.</div>`;
    const nav=$('.lesson-nav'); nav?nav.insertAdjacentElement('beforebegin',box):content.append(box);
  }

  function misconceptions(){
    if($('.misconception-auto')||!$('.content'))return;
    const box=document.createElement('section');box.className='misconception-auto';
    box.innerHTML='<strong>Common learning trap</strong><p>Recognizing a term is not the same as being able to use it. Before continuing, try to explain the concept, choose when it applies, and justify one example without copying the page wording.</p>';
    const recall=$('.active-recall'); recall?.insertAdjacentElement('beforebegin',box);
  }

  function tools(){
    if($('#study-tools'))return;
    const panel=document.createElement('div');panel.id='study-tools';panel.className='study-tools';panel.innerHTML=`<button type="button" data-action="search" aria-label="Find on this page">⌕ <span>Find</span></button><button type="button" data-action="top" aria-label="Back to top">↑ <span>Top</span></button>`;document.body.append(panel);
    panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.action==='top')scrollTo({top:0,behavior:'smooth'});if(b.dataset.action==='search'){const q=prompt('Find text on this page:');if(q){const t=window.find?.(q,false,false,true,false,true,false);if(!t)alert('No matching text was found on this page.');}}});
  }

  function keyboard(){document.addEventListener('keydown',e=>{if(e.altKey&&e.key==='ArrowLeft'){$('#prev-link:not([hidden])')?.click();}if(e.altKey&&e.key==='ArrowRight'){$('#next-link:not([hidden])')?.click();}});}
  function states(){document.body.classList.add('enhanced-study');$$('button,a,summary').forEach(el=>el.addEventListener('pointerdown',()=>el.classList.add('pressed'),{once:true}));}

  window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{a11y();hook();progress();activeRecall();misconceptions();tools();keyboard();states();const current=$('.mobile-topic .active');current?.scrollIntoView({inline:'center',block:'nearest'});},0));
})();