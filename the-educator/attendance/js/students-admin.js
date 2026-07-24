'use strict';
const SUPABASE_URL='https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_KEY='sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
let courses=[],students=[];
const statusAr={Active:'نشط',Pending:'معلق',Dropped:'منسحب',Completed:'مكتمل'};
async function rpc(name,params={}){const {data,error}=await db.rpc(name,params);if(error)throw new Error(error.message);return data}
function message(el,text='',type=''){el.textContent=text;el.className=`form-message ${type}`.trim()}
function selectedCourse(){return $('courseSelector').value||null}
function updateStats(rows){
  $('totalStudents').textContent=rows.length;
  $('activeStudents').textContent=rows.filter(x=>x.enrollment_status==='Active').length;
  $('pendingStudents').textContent=rows.filter(x=>x.enrollment_status==='Pending').length;
  $('droppedStudents').textContent=rows.filter(x=>x.enrollment_status==='Dropped').length;
}
function filteredRows(){
  const term=$('studentSearch').value.trim().toLowerCase(),status=$('statusFilter').value;
  return students.filter(x=>(!term||`${x.name} ${x.university_id}`.toLowerCase().includes(term))&&(!status||x.enrollment_status===status));
}
function render(){
  const rows=filteredRows();$('rosterBody').innerHTML='';$('visibleCount').textContent=rows.length;
  $('rosterEmpty').classList.toggle('is-hidden',rows.length>0);
  rows.forEach(row=>{
    const tr=document.createElement('tr');
    const name=document.createElement('td');name.textContent=row.name||'—';tr.append(name);
    const id=document.createElement('td');id.textContent=row.university_id||'—';tr.append(id);
    const sectionTd=document.createElement('td'),section=document.createElement('input');section.value=row.section||'';section.maxLength=100;sectionTd.append(section);tr.append(sectionTd);
    const statusTd=document.createElement('td'),status=document.createElement('select');
    window.RosterUtils.STATUSES.forEach(value=>{const option=new Option(statusAr[value],value,value===row.enrollment_status,value===row.enrollment_status);status.add(option)});
    statusTd.append(status);tr.append(statusTd);
    const action=document.createElement('td'),button=document.createElement('button');button.type='button';button.className='row-save';button.textContent='حفظ';
    button.addEventListener('click',async()=>{button.disabled=true;try{await rpc('admin_upsert_student_enrollment',{p_course_id:row.course_id,p_university_id:row.university_id,p_section:section.value,p_status:status.value});await load()}catch(e){alert(e.message)}finally{button.disabled=false}});
    action.append(button);tr.append(action);$('rosterBody').append(tr);
  });
}
async function load(){
  const result=await rpc('admin_list_student_roster',{p_course_id:selectedCourse()});
  courses=result.courses||[];students=result.students||[];
  if(!$('courseSelector').options.length){
    courses.forEach(c=>$('courseSelector').add(new Option(`${c.course_code} — ${c.section||'بدون شعبة'} — ${c.semester}`,c.id)));
    if(courses.length){const refreshed=await rpc('admin_list_student_roster',{p_course_id:selectedCourse()});students=refreshed.students||[]}
  }
  updateStats(students);render();
}
async function start(){
  try{
    const access=await window.RoleAccess.requireRole(db,[window.RoleAccess.ROLES.ADMINISTRATOR,window.RoleAccess.ROLES.INSTRUCTOR],null);
    if(!access)throw new Error('سجل الدخول بحساب المعلم أو مسؤول النظام.');
    await load();$('pageMessage').classList.add('is-hidden');$('rosterView').classList.remove('is-hidden');
  }catch(e){$('pageMessage').textContent=e.message;$('pageMessage').classList.add('error')}
}
$('courseSelector').addEventListener('change',load);$('studentSearch').addEventListener('input',render);$('statusFilter').addEventListener('change',render);$('refreshButton').addEventListener('click',load);
$('addStudentForm').addEventListener('submit',async event=>{event.preventDefault();message($('formMessage'));try{await rpc('admin_upsert_student_enrollment',{p_course_id:selectedCourse(),p_university_id:$('universityId').value.trim(),p_section:$('studentSection').value.trim(),p_status:$('studentStatus').value});message($('formMessage'),'تم حفظ التسجيل.','success');event.target.reset();await load()}catch(e){message($('formMessage'),e.message,'error')}});
$('importForm').addEventListener('submit',async event=>{event.preventDefault();message($('importMessage'));try{const file=$('csvFile').files[0];const rows=window.RosterUtils.parseCsv(await file.text());const result=await rpc('admin_bulk_enroll_students',{p_course_id:selectedCourse(),p_rows:rows});message($('importMessage'),`تم: ${result.succeeded}، تعذر: ${result.failed}.`,result.failed?'error':'success');await load()}catch(e){message($('importMessage'),e.message,'error')}});
start();
