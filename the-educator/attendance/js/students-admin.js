'use strict';
const SUPABASE_URL='https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_KEY='sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
let coursePlans=[],students=[];
const statusAr={Active:'نشط',Pending:'معلق',Dropped:'منسحب',Completed:'مكتمل'};
async function rpc(name,params={}){const {data,error}=await db.rpc(name,params);if(error)throw new Error(error.message);return data}
function message(el,text='',type=''){el.textContent=text;el.className=`form-message ${type}`.trim()}
function selectedPlanId(){return $('courseSelector').value||null}
function selectedPlan(){return coursePlans.find(plan=>plan.id===selectedPlanId())||null}
function today(){return new Date().toISOString().slice(0,10)}
function setDateDefaults(force=false){
  const plan=selectedPlan(),initial=plan?.term_start||today();
  if(force||!$('effectiveFrom').value)$('effectiveFrom').value=today();
  if(force||!$('importEffectiveFrom').value)$('importEffectiveFrom').value=initial;
}
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
    const effectiveTd=document.createElement('td'),effective=document.createElement('input');
    effective.type='date';effective.value=row.effective_from||today();effectiveTd.append(effective);tr.append(effectiveTd);
    const statusTd=document.createElement('td'),status=document.createElement('select');
    window.RosterUtils.STATUSES.forEach(value=>status.add(new Option(statusAr[value],value,value===row.enrollment_status,value===row.enrollment_status)));
    statusTd.append(status);tr.append(statusTd);
    const action=document.createElement('td'),button=document.createElement('button');button.type='button';button.className='row-save';button.textContent='حفظ';
    button.addEventListener('click',async()=>{
      button.disabled=true;
      try{
        await rpc('admin_upsert_attendance_student',{
          p_course_plan_id:row.course_plan_id,p_university_id:row.university_id,p_student_name:row.name,
          p_effective_from:effective.value,p_status:status.value
        });
        await load(false);
      }catch(error){alert(error.message)}finally{button.disabled=false}
    });
    action.append(button);tr.append(action);$('rosterBody').append(tr);
  });
}
function syncCourseOptions(){
  const current=selectedPlanId();$('courseSelector').innerHTML='';
  coursePlans.forEach(plan=>{
    const label=`${plan.course_code} — شعبة ${plan.section_code} — ${plan.term_code} (${plan.session_count} جلسة)`;
    $('courseSelector').add(new Option(label,plan.id));
  });
  if(current&&coursePlans.some(plan=>plan.id===current))$('courseSelector').value=current;
}
async function load(refreshOptions=true){
  let result=await rpc('admin_list_attendance_roster',{p_course_plan_id:selectedPlanId()});
  coursePlans=result.course_plans||[];
  if(refreshOptions)syncCourseOptions();
  if(!selectedPlanId()){students=[];updateStats(students);render();return}
  if(!result.selected_course_plan_id||result.selected_course_plan_id!==selectedPlanId()){
    result=await rpc('admin_list_attendance_roster',{p_course_plan_id:selectedPlanId()});
  }
  students=result.students||[];updateStats(students);render();setDateDefaults(refreshOptions);
}
async function start(){
  try{
    const access=await window.RoleAccess.requireRole(db,[window.RoleAccess.ROLES.ADMINISTRATOR,window.RoleAccess.ROLES.INSTRUCTOR],null);
    if(!access)throw new Error('سجل الدخول بحساب المعلم أو مسؤول النظام.');
    await load();$('pageMessage').classList.add('is-hidden');$('rosterView').classList.remove('is-hidden');
  }catch(error){$('pageMessage').textContent=error.message;$('pageMessage').classList.add('error')}
}
$('courseSelector').addEventListener('change',()=>{setDateDefaults(true);load(false)});
$('studentSearch').addEventListener('input',render);
$('statusFilter').addEventListener('change',render);
$('refreshButton').addEventListener('click',()=>load(true));
$('csvFile').addEventListener('change',()=>{
  const file=$('csvFile').files[0];$('fileName').textContent=file?file.name:'لم يتم اختيار ملف';
});
$('addStudentForm').addEventListener('submit',async event=>{
  event.preventDefault();message($('formMessage'));
  if(!selectedPlanId()){message($('formMessage'),'لا توجد شعبة ذات جلسات للاختيار.','error');return}
  try{
    await rpc('admin_upsert_attendance_student',{
      p_course_plan_id:selectedPlanId(),p_university_id:$('universityId').value.trim(),
      p_student_name:$('studentName').value.trim(),p_effective_from:$('effectiveFrom').value,
      p_status:$('studentStatus').value
    });
    message($('formMessage'),'تم تسجيل الطالب، ولن تُحسب الجلسات السابقة لتاريخ البدء.','success');
    event.target.reset();setDateDefaults(true);await load(false);
  }catch(error){message($('formMessage'),error.message,'error')}
});
$('importForm').addEventListener('submit',async event=>{
  event.preventDefault();message($('importMessage'));
  if(!selectedPlanId()){message($('importMessage'),'اختر شعبة ذات جلسات أولاً.','error');return}
  try{
    const file=$('csvFile').files[0];if(!file)throw new Error('اختر ملف CSV أولاً.');
    const parsed=window.RosterUtils.parseRosterCsv(await file.text());
    if(!parsed.students.length)throw new Error('لم أجد طلاباً صالحين في الملف.');
    const effectiveFrom=$('importEffectiveFrom').value;
    const rows=parsed.students.map(row=>({...row,effective_from:effectiveFrom}));
    const result=await rpc('admin_bulk_enroll_attendance_students',{p_course_plan_id:selectedPlanId(),p_rows:rows});
    const details=result.failed?` أول خطأ: ${result.errors?.[0]?.message||'تعذر إدخال بعض السجلات'}`:'';
    message($('importMessage'),`تمت إضافة ${result.succeeded} طالب، وتعذر ${result.failed}.${details}`,result.failed?'error':'success');
    await load(false);
  }catch(error){message($('importMessage'),error.message,'error')}
});
start();
