'use strict';

const SUPABASE_URL = 'https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
const STUDENT_ACCESS_FUNCTION =
  `${SUPABASE_URL}/functions/v1/student-access`;

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);

const publicView = $('publicView');
const loginView = $('loginView');
const portalView = $('portalView');
const idStep = $('idStep');
const otpStep = $('otpStep');
const emailLinkStep = $('emailLinkStep');

const openLoginButton = $('openLoginButton');
const backToPublic = $('backToPublic');
const requestCodeForm = $('requestCodeForm');
const verifyCodeForm = $('verifyCodeForm');
const requestCodeButton = $('requestCodeButton');
const verifyCodeButton = $('verifyCodeButton');
const resendCodeButton = $('resendCodeButton');
const sendAgainButton = $('sendAgainButton');
const requestMessage = $('requestMessage');
const verifyMessage = $('verifyMessage');
const emailLinkMessage = $('emailLinkMessage');
const signOutButton = $('signOutButton');
const refreshButton = $('refreshButton');

const recordsLoading = $('recordsLoading');
const recordsEmpty = $('recordsEmpty');
const recordsTableWrap = $('recordsTableWrap');
const recordsTableBody = $('recordsTableBody');
const courseSelector = $('courseSelector');
const courseSelectorSection = $('courseSelectorSection');

const discussionDialog = $('discussionDialog');
const closeDiscussionDialog = $('closeDiscussionDialog');
const excuseDialog = $('excuseDialog');
const excuseForm = $('excuseForm');
const closeExcuseDialog = $('closeExcuseDialog');
const submitExcuseButton = $('submitExcuseButton');
const excuseMessage = $('excuseMessage');

let currentProfile = null;
let currentCourses = [];
let currentExcuseStatus = 'None';
let loginChallengeId = '';
let submittedUniversityId = '';

function show(el){ el?.classList.remove('is-hidden'); }
function hide(el){ el?.classList.add('is-hidden'); }

function setMessage(el,message='',type=''){
  if(!el)return;
  el.textContent=message;
  el.className=`student-message ${type}`.trim();
}

function setLoading(button,loading){
  if(!button)return;
  button.disabled=loading;
  button.classList.toggle('is-loading',loading);
}

function showPublic(){
  show(publicView);
  hide(loginView);
  hide(portalView);
}

function showLogin(){
  hide(publicView);
  show(loginView);
  hide(portalView);
  show(idStep);
  hide(otpStep);
  hide(emailLinkStep);
  setMessage(requestMessage);
  setMessage(verifyMessage);
  $('universityId')?.focus();
}

function showEmailLink(maskedEmail){
  hide(idStep);
  hide(otpStep);
  show(emailLinkStep);
  $('emailLinkText').textContent =
    `إذا كان الرقم مرتبطًا بحساب نشط فسيصل رابط دخول آمن إلى ${
      maskedEmail || 'البريد المسجل'
    }. افتح الرابط للانتقال مباشرة إلى سجلك.`;
  setMessage(emailLinkMessage);
  sendAgainButton?.focus();
}

function showOtp(maskedEmail){
  hide(idStep);
  hide(emailLinkStep);
  show(otpStep);
  $('maskedEmailText').textContent =
    `أرسلنا رمز التحقق إلى ${maskedEmail || 'البريد المسجل'}.`;
  $('otpCode').value = '';
  $('otpCode').focus();
}

function showPortal(){
  hide(publicView);
  hide(loginView);
  show(portalView);
  show(signOutButton);
}

function formatDate(value){
  if(!value)return '—';
  return new Intl.DateTimeFormat('ar-SA',{
    year:'numeric',month:'long',day:'numeric',
    timeZone:'Asia/Riyadh'
  }).format(new Date(value));
}

function modeArabic(mode){
  return {InPerson:'حضوري',Online:'أونلاين',Hybrid:'هجين'}[mode]||mode||'—';
}

function actualArabic(status){
  return {Present:'حاضر',Late:'متأخر',Absent:'غائب'}[status]||status||'—';
}

function excuseArabic(status){
  return {
    None:'لا يوجد',Pending:'قيد المراجعة',Accepted:'مقبول',
    Rejected:'مرفوض',MoreInfo:'يحتاج توضيحًا',DiscussionRequested:'مطلوب مناقشة'
  }[status]||status||'—';
}

async function rpc(name,params={}){
  const {data,error}=await db.rpc(name,params);
  if(error)throw new Error(error.message||'تعذر تنفيذ العملية.');
  return data;
}

async function accessFunction(payload){
  const response = await fetch(STUDENT_ACCESS_FUNCTION,{
    method:'POST',
    headers:{
      apikey:SUPABASE_PUBLISHABLE_KEY,
      Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type':'application/json'
    },
    body:JSON.stringify(payload)
  });

  const data = await response.json().catch(()=>null);

  if(!response.ok || data?.success===false){
    throw new Error(data?.message || 'تعذر تنفيذ طلب الدخول.');
  }

  return data;
}

async function verifyExistingSession(){
  const {data:{session}}=await db.auth.getSession();
  if(!session)return false;

  try{
    const profile=await rpc('get_my_student_profile');
    if(!profile?.success)throw new Error(profile?.message||'الحساب غير مرتبط بطالب نشط.');

    currentProfile=profile;
    $('studentIdentity').textContent=
      `${profile.student_name} — ${profile.university_id}`;
    showPortal();
    return true;
  }catch(error){
    await db.auth.signOut();
    return false;
  }
}

function renderSummary(summary){
  $('countedSessions').textContent=String(summary.counted_sessions||0);
  $('presentCount').textContent=String(summary.present_count||0);
  $('lateCount').textContent=String(summary.late_count||0);
  $('absentCount').textContent=String(summary.absent_count||0);
  $('absencePoints').textContent=String(summary.absence_points||0);
  $('attendancePercentage').textContent=
    `${Number(summary.attendance_percentage||0).toFixed(2)}%`;
  $('absencePercentage').textContent=
    `${Number(summary.absence_percentage||0).toFixed(2)}%`;

  const denied=summary.is_denied===true;
  $('denialStatus').textContent=denied?'متجاوز 25%':'سليم';
  $('denialStatus').className=denied?'denied':'safe';
}

function statusBadge(text,className){
  const span=document.createElement('span');
  span.className=`record-badge ${className}`;
  span.textContent=text;
  return span;
}

function formatDiscussionDate(value){
  if(!value)return 'لم يُحدد';
  return new Intl.DateTimeFormat('ar-SA',{
    year:'numeric',month:'long',day:'numeric',
    hour:'2-digit',minute:'2-digit',
    hour12:true,timeZone:'Asia/Riyadh'
  }).format(new Date(value));
}

function discussionMethodArabic(value){
  return {
    InPerson:'حضوري',
    Online:'أونلاين',
    Office:'مكتب المعلم'
  }[value]||value||'—';
}

function openDiscussion(record){
  $('discussionDialogTitle').textContent=
    `${record.course_code} — مناقشة العذر`;

  $('discussionDate').textContent=
    formatDiscussionDate(record.discussion_scheduled_at);

  $('discussionMethod').textContent=
    discussionMethodArabic(record.discussion_method);

  $('discussionLocation').textContent=
    record.discussion_location||'سيتم إشعارك بالمكان';

  $('discussionMessage').textContent=
    record.discussion_message||'يرجى الحضور لمناقشة العذر والمستند المرفق.';

  discussionDialog.showModal();
}

function renderRecords(records){
  recordsTableBody.innerHTML='';
  $('recordsBadge').textContent=`${records.length} سجل`;

  if(!records.length){
    hide(recordsTableWrap);
    show(recordsEmpty);
    return;
  }

  hide(recordsEmpty);
  show(recordsTableWrap);

  records.forEach(record=>{
    const tr=document.createElement('tr');

    const course=document.createElement('td');
    course.textContent=record.course_code||'—';

    const date=document.createElement('td');
    date.textContent=formatDate(record.start_time);

    const mode=document.createElement('td');
    mode.textContent=modeArabic(record.delivery_mode);

    const actual=document.createElement('td');
    const actualClass=
      record.actual_status==='Present'?'present':
      record.actual_status==='Late'?'late':'absent';
    actual.appendChild(
      statusBadge(actualArabic(record.actual_status),actualClass)
    );

    const excuse=document.createElement('td');
    const excuseClass=
      record.excuse_status==='Accepted'?'excused':
      record.excuse_status==='Pending'?'pending':
      record.excuse_status==='DiscussionRequested'?'discussion':'';
    excuse.appendChild(
      statusBadge(excuseArabic(record.excuse_status),excuseClass)
    );

    const counted=document.createElement('td');
    counted.textContent=String(record.counted_points??0);

    const action=document.createElement('td');
    const button=document.createElement('button');
    button.type='button';
    button.className='excuse-button';

    if(record.excuse_status==='DiscussionRequested'){
      button.textContent='عرض موعد المناقشة';
      button.disabled=false;
      button.addEventListener('click',()=>openDiscussion(record));
    }else{
      button.textContent=
        record.excuse_status==='Pending'?'العذر قيد المراجعة':
        record.excuse_status==='Accepted'?'العذر مقبول':
        record.excuse_status==='Rejected'?'العذر مرفوض':
        record.excuse_status==='MoreInfo'?'رفع التوضيح المطلوب':
        record.actual_status==='Absent'?'رفع عذر':'—';

      button.disabled=
        record.actual_status!=='Absent' ||
        !window.ExcuseWorkflow.canStudentSubmit(record.excuse_status);

      button.addEventListener('click',()=>openExcuse(record));
    }

    action.appendChild(button);
    tr.append(course,date,mode,actual,excuse,counted,action);
    recordsTableBody.appendChild(tr);
  });
}

function renderSelectedCourse(courseIndex){
  const course=currentCourses[Number(courseIndex)];

  if(!course){
    renderSummary({});
    renderRecords([]);
    return;
  }

  renderSummary(course.summary);
  renderRecords(course.records);
}

function renderCourses(records){
  currentCourses=window.AttendanceCalculations.groupRecordsByCourse(records);
  courseSelector.innerHTML='';

  if(!currentCourses.length){
    hide(courseSelectorSection);
    renderSummary({});
    renderRecords([]);
    return;
  }

  currentCourses.forEach((course,index)=>{
    const option=document.createElement('option');
    option.value=String(index);
    option.textContent=course.course_code;
    courseSelector.appendChild(option);
  });

  show(courseSelectorSection);
  renderSelectedCourse(0);
}

async function loadPortal(){
  show(recordsLoading);
  hide(recordsEmpty);
  hide(recordsTableWrap);

  try{
    const records=await rpc('get_my_attendance_records');
    const safeRecords=Array.isArray(records)?records:[];
    hide(recordsLoading);
    renderCourses(safeRecords);
  }catch(error){
    hide(recordsLoading);
    show(recordsEmpty);
    recordsEmpty.textContent=error.message;
  }
}

courseSelector?.addEventListener(
  'change',
  ()=>renderSelectedCourse(courseSelector.value)
);

function openExcuse(record){
  currentExcuseStatus=record.excuse_status||'None';
  const reviewNote=
    record.decision_note||record.review_note||record.admin_note||'';
  $('excuseSessionId').value=record.session_id;
  $('excuseDialogTitle').textContent=
    currentExcuseStatus==='MoreInfo'
      ? `استكمال عذر ${record.course_code}`
      : `${record.course_code} — ${formatDate(record.start_time)}`;
  $('excuseReviewNote').textContent=reviewNote
    ? `توضيح المعلم: ${reviewNote}`
    : 'أرفق التوضيح المطلوب مع وصف محدّث.';
  $('excuseReviewNote').classList.toggle(
    'is-hidden',
    currentExcuseStatus!=='MoreInfo'
  );
  $('excuseDescription').value='';
  $('excuseFile').value='';
  setMessage(excuseMessage);
  excuseDialog.showModal();
}

openLoginButton?.addEventListener('click',showLogin);
backToPublic?.addEventListener('click',showPublic);

requestCodeForm?.addEventListener('submit',async event=>{
  event.preventDefault();

  const universityId=$('universityId').value.trim();

  if(!/^[0-9A-Za-z-]{5,20}$/.test(universityId)){
    setMessage(requestMessage,'راجع صيغة الرقم الجامعي.','error');
    return;
  }

  setLoading(requestCodeButton,true);
  setMessage(requestMessage);

  try{
    const data=await accessFunction({
      action:'request',
      university_id:universityId
    });

    submittedUniversityId=universityId;
    if(data.delivery_method==='otp'){
      loginChallengeId=data.challenge_id;
      showOtp(data.masked_email);
    }else{
      showEmailLink(data.masked_email);
    }
  }catch(error){
    setMessage(requestMessage,error.message,'error');
  }finally{
    setLoading(requestCodeButton,false);
  }
});

sendAgainButton?.addEventListener('click',async()=>{
  if(!submittedUniversityId)return;

  setLoading(sendAgainButton,true);
  setMessage(emailLinkMessage);
  try{
    const data=await accessFunction({
      action:'request',
      university_id:submittedUniversityId
    });
    if(data.delivery_method==='otp'){
      loginChallengeId=data.challenge_id;
      showOtp(data.masked_email);
      setMessage(verifyMessage,'تم إرسال رمز التحقق.','success');
    }else{
      setMessage(
        emailLinkMessage,
        'إذا كان الحساب نشطًا فقد أرسلنا رابطًا جديدًا.',
        'success'
      );
    }
  }catch(error){
    setMessage(emailLinkMessage,error.message,'error');
  }finally{
    setLoading(sendAgainButton,false);
  }
});

verifyCodeForm?.addEventListener('submit',async event=>{
  event.preventDefault();

  const token=$('otpCode').value.trim();

  if(!/^[0-9]{6,8}$/.test(token)){
    setMessage(verifyMessage,'أدخل رمز التحقق الصحيح.','error');
    return;
  }

  setLoading(verifyCodeButton,true);
  setMessage(verifyMessage);

  try{
    const data=await accessFunction({
      action:'verify',
      challenge_id:loginChallengeId,
      token
    });

    const {error}=await db.auth.setSession({
      access_token:data.access_token,
      refresh_token:data.refresh_token
    });

    if(error)throw error;

    if(await verifyExistingSession()){
      await loadPortal();
    }else{
      throw new Error('تعذر فتح سجل الطالب.');
    }
  }catch(error){
    setMessage(verifyMessage,error.message,'error');
  }finally{
    setLoading(verifyCodeButton,false);
  }
});

resendCodeButton?.addEventListener('click',async()=>{
  if(!submittedUniversityId)return;

  setLoading(resendCodeButton,true);
  setMessage(verifyMessage);

  try{
    const data=await accessFunction({
      action:'request',
      university_id:submittedUniversityId
    });

    loginChallengeId=data.challenge_id;
    $('maskedEmailText').textContent=
      `أرسلنا رمزًا جديدًا إلى ${data.masked_email}.`;
    setMessage(verifyMessage,'تم إرسال رمز جديد.','success');
  }catch(error){
    setMessage(verifyMessage,error.message,'error');
  }finally{
    setLoading(resendCodeButton,false);
  }
});

excuseForm?.addEventListener('submit',async event=>{
  event.preventDefault();

  const file=$('excuseFile').files[0];
  const description=$('excuseDescription').value.trim();
  const sessionId=$('excuseSessionId').value;
  const fileError=window.ExcuseWorkflow.validateFile(file);

  if(!description){
    setMessage(excuseMessage,'اكتب وصفًا مختصرًا للعذر.','error');
    return;
  }

  if(fileError){
    setMessage(excuseMessage,fileError,'error');
    return;
  }

  setLoading(submitExcuseButton,true);
  setMessage(excuseMessage);

  try{
    const {data:{session}}=await db.auth.getSession();
    if(!session?.user)throw new Error('انتهت جلسة الدخول. سجّل الدخول مجددًا.');
    const extension=window.ExcuseWorkflow.fileExtension(file.name);
    const safeName=`${crypto.randomUUID()}.${extension}`;
    const path=`${session.user.id}/${sessionId}/${safeName}`;

    const {error:uploadError}=await db.storage
      .from('attendance-excuses')
      .upload(path,file,{
        cacheControl:'3600',
        upsert:false,
        contentType:file.type
      });

    if(uploadError)throw uploadError;

    try{
      await rpc('submit_my_excuse',{
        p_session_id:sessionId,
        p_excuse_type:$('excuseType').value,
        p_description:description,
        p_file_path:path,
        p_file_name:file.name,
        p_mime_type:file.type,
        p_file_size:file.size
      });
    }catch(error){
      await db.storage.from('attendance-excuses').remove([path]);
      throw error;
    }

    setMessage(
      excuseMessage,
      currentExcuseStatus==='MoreInfo'
        ? 'تم إرسال التوضيح وإعادة العذر للمراجعة.'
        : 'تم إرسال العذر للمراجعة.',
      'success'
    );

    setTimeout(async()=>{
      excuseDialog.close();
      await loadPortal();
    },700);
  }catch(error){
    setMessage(excuseMessage,error.message,'error');
  }finally{
    setLoading(submitExcuseButton,false);
  }
});

closeDiscussionDialog?.addEventListener(
  'click',
  ()=>discussionDialog.close()
);
closeExcuseDialog?.addEventListener('click',()=>excuseDialog.close());
refreshButton?.addEventListener('click',loadPortal);
signOutButton?.addEventListener('click',async()=>{
  await db.auth.signOut();
  hide(signOutButton);
  showPublic();
});

(async function init(){
  if(await verifyExistingSession()){
    await loadPortal();
  }else{
    showPublic();
  }
})();
