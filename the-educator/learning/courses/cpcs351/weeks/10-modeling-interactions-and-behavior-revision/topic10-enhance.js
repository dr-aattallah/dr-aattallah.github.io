(()=>{
  const article=document.querySelector('article.content');
  if(!article)return;
  document.querySelectorAll('iframe').forEach(el=>el.remove());
  [...article.querySelectorAll('section,div')].forEach(el=>{
    const text=(el.textContent||'').trim();
    if(/External UML Reference/i.test(text)||/Activity diagram notation/i.test(text)){
      if(el.closest('.hero,.t10-story,.model-banner'))return;
      el.remove();
    }
  });
  const page=Number(document.body.dataset.page||1);
  if(page===1&&!article.querySelector('.t10-overview-figure')){
    const story=article.querySelector('.t10-story');
    if(story){
      const fig=document.createElement('figure');
      fig.className='t10-overview-figure';
      fig.innerHTML='<img src="assets/behavioral-modeling-overview.svg?v=20260906c" alt="Smart Parcel Locker Pickup scenario viewed through Use Case, Sequence, State, and Activity UML diagrams"><figcaption><b>Visual map:</b> one detailed scenario becomes four complementary UML views: actors and goals, message collaboration, lifecycle, and workflow.</figcaption>';
      story.insertAdjacentElement('afterend',fig);
    }
  }
})();