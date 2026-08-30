'use strict';

const SUPABASE_URL='https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY=
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
const EXCUSE_REVIEW_ROLES=[
  window.RoleAccess.ROLES.ADMINISTRATOR,
  window.RoleAccess.ROLES.INSTRUCTOR
];

const db=window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $=(id)=>document.getElementById(id);

const discussionDialog=$('discussionAdminDialog');
const decisionDialog=$('decisionDialog');

async function rpc(name,params={}){
  const {data,error}=await db.rpc(name,params);
  if(error)throw new Error(error.message||'تعذر تنفيذ العملية.');
  return data;
}

function formatDate(value){
  if(!value)return '—';
  return new Intl.DateTimeFormat('ar-SA',{
    year:'numeric',
    month:'long',
    day:'numeric',
    hour:'2-digit',
    minute:'2-digit',
    hour12:true,
    timeZone:'Asia/Riyadh'
  }).format(new Date(value));
}

function statusArabic(status){
  return {
    Pending:'قيد المراجعة',
    DiscussionRequested:'مطلوب مناقشة',
    Accepted:'مقبول',
    Rejected:'مرفوض',
    MoreInfo:'يحتاج توضيحًا'
  }[status]||status||'—';
}

function setMessage(id,message='',type=''){
  const element=$(id);
  if(!element)return;
  element.textContent=message;
  element.className=`admin-message ${type}`.trim();
}

async function verifyAdmin(){
  return Boolean(await window.RoleAccess.requireRole(
    db,
    EXCUSE_REVIEW_ROLES,
    './'
  ));
}

async function openFile(path){
  setMessage('excusesPageMessage');
  try{
    const {data,error}=await db.storage
      .from('attendance-excuses')
      .createSignedUrl(path,120);

    if(error)throw error;
    window.open(data.signedUrl,'_blank','noopener');
  }catch(error){
    setMessage(
      'excusesPageMessage',
      error.message||'تعذر فتح المرفق.',
      'error'
    );
  }
}

function openDiscussion(item){
  $('discussionExcuseId').value=item.excuse_id;
  $('discussionStudentTitle').textContent=
    `${item.student_name} — ${item.university_id}`;
  $('discussionScheduledAt').value='';
  $('discussionMethodAdmin').value='Office';
  $('discussionLocationAdmin').value='';
  $('discussionMessageAdmin').value=
    'يرجى الحضور لمناقشة العذر والمستند المرفق قبل إصدار القرار النهائي.';
  setMessage('discussionAdminMessage');
  discussionDialog.showModal();
}

function openDecision(item,decision){
  const labels={
    Accepted:['قبول','اعتماد قبول العذر','ملاحظة القبول (اختيارية)'],
    Rejected:['رفض','اعتماد رفض العذر','سبب الرفض (مطلوب)'],
    MoreInfo:['طلب توضيح','إرسال طلب التوضيح','التوضيح المطلوب من الطالب']
  };
  const [title,buttonText,placeholder]=labels[decision]||labels.Rejected;
  $('decisionExcuseId').value=item.excuse_id;
  $('decisionValue').value=decision;
  $('decisionStudentTitle').textContent=
    `${title} لعذر ${item.student_name}`;
  $('decisionNote').value='';
  $('decisionNote').placeholder=placeholder;
  $('decisionNote').required=
    window.ExcuseWorkflow.decisionNeedsNote(decision);
  $('submitDecisionButton').textContent=
    buttonText;
  setMessage('decisionMessage');
  decisionDialog.showModal();
}

function render(rows){
  const list=$('excusesList');
  list.innerHTML='';

  $('pendingCount').textContent=
    String(rows.filter(x=>x.status==='Pending').length);
  $('discussionCount').textContent=
    String(rows.filter(x=>x.status==='DiscussionRequested').length);
  $('acceptedCount').textContent=
    String(rows.filter(x=>x.status==='Accepted').length);
  $('rejectedCount').textContent=
    String(rows.filter(x=>x.status==='Rejected').length);

  $('excusesLoading').classList.add('is-hidden');

  if(!rows.length){
    $('excusesEmpty').classList.remove('is-hidden');
    list.classList.add('is-hidden');
    return;
  }

  $('excusesEmpty').classList.add('is-hidden');
  list.classList.remove('is-hidden');

  rows.forEach(item=>{
    const article=document.createElement('article');
    article.className='excuse-item';

    const info=document.createElement('div');

    const title=document.createElement('h3');
    title.textContent=`${item.student_name} — ${item.university_id}`;

    const course=document.createElement('p');
    course.textContent=
      `${item.course_code} — ${formatDate(item.session_start)}`;

    const description=document.createElement('p');
    description.textContent=item.description;

    const meta=document.createElement('div');
    meta.className='excuse-meta';

    [item.excuse_type,statusArabic(item.status),item.file_name]
      .forEach((value,index)=>{
        const span=document.createElement('span');
        span.className=
          `excuse-pill ${item.status==='DiscussionRequested'&&index===1?'discussion':''}`;
        span.textContent=value||'—';
        meta.appendChild(span);
      });

    info.append(title,course,description,meta);

    if(item.status==='DiscussionRequested'){
      const discussionInfo=document.createElement('div');
      discussionInfo.className='discussion-info';
      discussionInfo.textContent=
        `موعد المناقشة: ${formatDate(item.discussion_scheduled_at)}
         — ${item.discussion_method||'—'}
         — ${item.discussion_location||'لم يحدد المكان'}`;
      info.appendChild(discussionInfo);
    }

    const actions=document.createElement('div');
    actions.className='excuse-actions';

    const view=document.createElement('button');
    view.className='view-file';
    view.textContent='عرض المرفق';
    view.addEventListener('click',()=>openFile(item.file_path));
    actions.appendChild(view);

    if(item.status==='Pending'){
      const discuss=document.createElement('button');
      discuss.className='discussion';
      discuss.textContent='استدعاء للمناقشة';
      discuss.addEventListener('click',()=>openDiscussion(item));

      const accept=document.createElement('button');
      accept.className='accept';
      accept.textContent='قبول مباشر';
      accept.addEventListener('click',()=>openDecision(item,'Accepted'));

      const reject=document.createElement('button');
      reject.className='reject';
      reject.textContent='رفض مباشر';
      reject.addEventListener('click',()=>openDecision(item,'Rejected'));

      const moreInfo=document.createElement('button');
      moreInfo.className='discussion';
      moreInfo.textContent='طلب توضيح';
      moreInfo.addEventListener('click',()=>openDecision(item,'MoreInfo'));

      actions.append(discuss,accept,reject,moreInfo);
    }

    if(item.status==='DiscussionRequested'){
      const acceptFinal=document.createElement('button');
      acceptFinal.className='final-accept';
      acceptFinal.textContent='قبول بعد المناقشة';
      acceptFinal.addEventListener(
        'click',
        ()=>openDecision(item,'Accepted')
      );

      const rejectFinal=document.createElement('button');
      rejectFinal.className='final-reject';
      rejectFinal.textContent='رفض بعد المناقشة';
      rejectFinal.addEventListener(
        'click',
        ()=>openDecision(item,'Rejected')
      );

      const reschedule=document.createElement('button');
      reschedule.className='discussion';
      reschedule.textContent='تعديل موعد المناقشة';
      reschedule.addEventListener('click',()=>openDiscussion(item));

      actions.append(acceptFinal,rejectFinal,reschedule);
    }

    article.append(info,actions);
    list.appendChild(article);
  });
}

async function loadExcuses(){
  $('excusesLoading').classList.remove('is-hidden');
  $('excusesLoading').textContent='جارٍ تحميل الأعذار...';

  try{
    const rows=await rpc('admin_list_excuses');
    render(Array.isArray(rows)?rows:[]);
  }catch(error){
    $('excusesLoading').textContent=error.message;
  }
}

$('discussionAdminForm')?.addEventListener('submit',async event=>{
  event.preventDefault();

  const scheduledAt=$('discussionScheduledAt').value;
  const location=$('discussionLocationAdmin').value.trim();

  if(!scheduledAt||!location){
    setMessage(
      'discussionAdminMessage',
      'حدد الموعد والمكان أو الرابط.',
      'error'
    );
    return;
  }

  $('submitDiscussionButton').disabled=true;

  try{
    await rpc('admin_process_excuse',{
      p_excuse_id:$('discussionExcuseId').value,
      p_action:'DiscussionRequested',
      p_note:null,
      p_discussion_at:new Date(scheduledAt).toISOString(),
      p_discussion_method:$('discussionMethodAdmin').value,
      p_discussion_location:location,
      p_discussion_message:$('discussionMessageAdmin').value.trim()
    });

    setMessage(
      'discussionAdminMessage',
      'تم إرسال استدعاء المناقشة للطالب.',
      'success'
    );

    setTimeout(async()=>{
      discussionDialog.close();
      await loadExcuses();
    },600);
  }catch(error){
    setMessage('discussionAdminMessage',error.message,'error');
  }finally{
    $('submitDiscussionButton').disabled=false;
  }
});

$('decisionForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const action=$('decisionValue').value;
  const note=$('decisionNote').value.trim();

  if(window.ExcuseWorkflow.decisionNeedsNote(action)&&!note){
    setMessage(
      'decisionMessage',
      action==='Rejected'?'اكتب سبب رفض العذر.':'اكتب التوضيح المطلوب من الطالب.',
      'error'
    );
    return;
  }

  $('submitDecisionButton').disabled=true;

  try{
    await rpc('admin_process_excuse',{
      p_excuse_id:$('decisionExcuseId').value,
      p_action:action,
      p_note:note||null,
      p_discussion_at:null,
      p_discussion_method:null,
      p_discussion_location:null,
      p_discussion_message:null
    });

    setMessage(
      'decisionMessage',
      'تم حفظ القرار النهائي.',
      'success'
    );

    setTimeout(async()=>{
      decisionDialog.close();
      await loadExcuses();
    },600);
  }catch(error){
    setMessage('decisionMessage',error.message,'error');
  }finally{
    $('submitDecisionButton').disabled=false;
  }
});

$('closeDiscussionAdminDialog')?.addEventListener(
  'click',
  ()=>discussionDialog.close()
);
$('closeDecisionDialog')?.addEventListener(
  'click',
  ()=>decisionDialog.close()
);
$('refreshExcuses')?.addEventListener('click',loadExcuses);

(async function init(){
  if(await verifyAdmin())await loadExcuses();
})();
