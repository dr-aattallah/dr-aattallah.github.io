'use strict';

const SUPABASE_URL = 'https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
const ADMIN_EMAIL = 'aattallah@kau.edu.sa';

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);
const loginView = $('loginView');
const dashboardView = $('dashboardView');
const loginForm = $('loginForm');
const loginButton = $('loginButton');
const loginMessage = $('loginMessage');
const logoutButton = $('logoutButton');
const refreshButton = $('refreshButton');
const sessionForm = $('sessionForm');
const createSessionButton = $('createSessionButton');
const sessionFormMessage = $('sessionFormMessage');
const sessionsTableBody = $('sessionsTableBody');
const sessionsLoading = $('sessionsLoading');
const sessionsEmpty = $('sessionsEmpty');
const sessionsTableWrap = $('sessionsTableWrap');
const closeActiveSessionButton = $('closeActiveSessionButton');

let currentActiveSession = null;

function show(el){ el?.classList.remove('is-hidden'); }
function hide(el){ el?.classList.add('is-hidden'); }

function setMessage(el, message = '', type = ''){
  if (!el) return;
  el.textContent = message;
  el.className = `admin-message ${type}`.trim();
}

function setLoading(button, value){
  if (!button) return;
  button.disabled = value;
  button.classList.toggle('is-loading', value);
}

function formatDateTime(value){
  if (!value) return '—';
  return new Intl.DateTimeFormat('ar-SA',{
    year:'numeric',month:'short',day:'numeric',
    hour:'2-digit',minute:'2-digit',hour12:true,
    timeZone:'Asia/Riyadh'
  }).format(new Date(value));
}

function toIso(value){
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function makeSessionId(courseCode, localStart){
  const code = courseCode.toUpperCase().replace(/[^A-Z0-9]/g,'');
  const d = new Date(localStart);
  const stamp = [
    d.getFullYear(),
    String(d.getMonth()+1).padStart(2,'0'),
    String(d.getDate()).padStart(2,'0'),
    String(d.getHours()).padStart(2,'0'),
    String(d.getMinutes()).padStart(2,'0')
  ].join('');
  return `${code}-${stamp}`;
}

async function rpc(name, params = {}){
  const { data, error } = await db.rpc(name, params);
  if (error) throw new Error(error.message || 'تعذر تنفيذ العملية.');
  return data;
}

async function verifyAdmin(){
  const { data:{ session } } = await db.auth.getSession();
  const email = session?.user?.email?.toLowerCase();

  if (!session || email !== ADMIN_EMAIL.toLowerCase()){
    await db.auth.signOut();
    show(loginView); hide(dashboardView); hide(logoutButton);
    return false;
  }

  hide(loginView); show(dashboardView); show(logoutButton);
  return true;
}

function renderActive(session){
  currentActiveSession = session || null;

  if (!session){
    show($('activeSessionEmpty'));
    hide($('activeSessionPanel'));
    $('activeStatusBadge').textContent = 'لا توجد جلسة';
    $('activeStatusBadge').className = 'admin-badge';
    return;
  }

  hide($('activeSessionEmpty'));
  show($('activeSessionPanel'));
  $('activeStatusBadge').textContent = 'نشطة الآن';
  $('activeStatusBadge').className = 'admin-badge active';
  $('activeCourseCode').textContent = session.course_code || '—';
  $('activeRoom').textContent = session.room || '—';
  $('activeStart').textContent = formatDateTime(session.start_time);
  $('activeEnd').textContent = formatDateTime(session.end_time);
  $('activeLateAfter').textContent = formatDateTime(session.late_after);
}

function renderSessions(rows){
  hide(sessionsLoading);
  sessionsTableBody.innerHTML = '';
  $('sessionCountBadge').textContent = `${rows.length} جلسة`;

  if (!rows.length){
    show(sessionsEmpty); hide(sessionsTableWrap); return;
  }

  hide(sessionsEmpty); show(sessionsTableWrap);

  rows.forEach(session => {
    const tr = document.createElement('tr');
    const state = session.is_active
      ? ['نشطة','active']
      : (new Date(session.start_time) > new Date()
          ? ['قادمة','future']
          : ['مغلقة','closed']);

    const values = [
      session.course_code || '—',
      session.room || '—',
      formatDateTime(session.start_time),
      formatDateTime(session.end_time)
    ];

    values.forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });

    const statusTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `admin-badge ${state[1]}`;
    badge.textContent = state[0];
    statusTd.appendChild(badge);
    tr.appendChild(statusTd);

    const actionTd = document.createElement('td');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = session.is_active ? 'row-button danger' : 'row-button';
    button.textContent = session.is_active ? 'إغلاق' : 'تفعيل';
    button.addEventListener('click', () =>
      session.is_active
        ? closeSession(session.session_id)
        : activateSession(session.session_id)
    );
    actionTd.appendChild(button);
    tr.appendChild(actionTd);

    sessionsTableBody.appendChild(tr);
  });
}

async function loadDashboard(){
  show(sessionsLoading); hide(sessionsEmpty); hide(sessionsTableWrap);

  try{
    const rows = await rpc('admin_list_sessions');
    const sessions = Array.isArray(rows) ? rows : [];
    renderSessions(sessions);

    const active = sessions.find(x => x.is_active) || null;
    renderActive(active);

    $('totalSessionCount').textContent = String(sessions.length);
    $('activeSessionCount').textContent = active ? '1' : '0';

    if (active){
      const count = await rpc('admin_count_session_attendance',{
        p_session_id: active.session_id
      });
      $('activeAttendanceCount').textContent = String(count ?? 0);
    }else{
      $('activeAttendanceCount').textContent = '0';
    }
  }catch(error){
    hide(sessionsLoading); show(sessionsEmpty);
    sessionsEmpty.textContent = error.message || 'تعذر تحميل الجلسات.';
  }
}

async function activateSession(id){
  if (!confirm('سيتم إغلاق أي جلسة نشطة أخرى. متابعة؟')) return;
  try{
    await rpc('admin_activate_session',{p_session_id:id});
    await loadDashboard();
  }catch(error){ alert(error.message); }
}

async function closeSession(id){
  if (!confirm('هل تريد إغلاق هذه الجلسة؟')) return;
  try{
    await rpc('admin_close_session',{p_session_id:id});
    await loadDashboard();
  }catch(error){ alert(error.message); }
}

loginForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const email = $('email').value.trim();
  const password = $('password').value;

  if (!email || !password){
    setMessage(loginMessage,'أدخل البريد وكلمة المرور.','error');
    return;
  }

  setLoading(loginButton,true);
  setMessage(loginMessage);

  try{
    const { data, error } = await db.auth.signInWithPassword({email,password});
    if (error) throw error;

    if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()){
      await db.auth.signOut();
      throw new Error('هذا الحساب غير مصرح له.');
    }

    await verifyAdmin();
    await loadDashboard();
  }catch(error){
    setMessage(loginMessage,error.message || 'تعذر تسجيل الدخول.','error');
  }finally{
    setLoading(loginButton,false);
  }
});

sessionForm?.addEventListener('submit', async event => {
  event.preventDefault();

  const courseCode = $('courseCode').value.trim().toUpperCase();
  const room = $('room').value.trim();
  const startLocal = $('startTime').value;
  const endLocal = $('endTime').value;
  const lateLocal = $('lateAfter').value;
  const tagNumber = Number($('tagNumber').value);
  const activate = $('activateImmediately').checked;

  const startIso = toIso(startLocal);
  const endIso = toIso(endLocal);
  const lateIso = toIso(lateLocal);

  if (!courseCode || !room || !startIso || !endIso || !lateIso){
    setMessage(sessionFormMessage,'أكمل جميع البيانات.','error');
    return;
  }

  if (new Date(endIso) <= new Date(startIso)){
    setMessage(sessionFormMessage,'وقت النهاية يجب أن يكون بعد البداية.','error');
    return;
  }

  if (new Date(lateIso) < new Date(startIso) || new Date(lateIso) > new Date(endIso)){
    setMessage(sessionFormMessage,'وقت التأخير يجب أن يكون بين البداية والنهاية.','error');
    return;
  }

  setLoading(createSessionButton,true);
  setMessage(sessionFormMessage);

  try{
    await rpc('admin_create_session',{
      p_session_id: makeSessionId(courseCode,startLocal),
      p_course_code: courseCode,
      p_room: room,
      p_start_time: startIso,
      p_end_time: endIso,
      p_late_after: lateIso,
      p_tag_number: tagNumber,
      p_activate: activate
    });

    setMessage(sessionFormMessage,'تم إنشاء الجلسة بنجاح.','success');
    sessionForm.reset();
    $('activateImmediately').checked = true;
    await loadDashboard();
  }catch(error){
    setMessage(sessionFormMessage,error.message || 'تعذر إنشاء الجلسة.','error');
  }finally{
    setLoading(createSessionButton,false);
  }
});

logoutButton?.addEventListener('click', async () => {
  await db.auth.signOut();
  location.reload();
});

refreshButton?.addEventListener('click', loadDashboard);

closeActiveSessionButton?.addEventListener('click', () => {
  if (currentActiveSession) closeSession(currentActiveSession.session_id);
});

(async function init(){
  if (await verifyAdmin()) await loadDashboard();
})();
