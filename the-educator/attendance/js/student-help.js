'use strict';

const SUPABASE_URL='https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY=
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';

const db=window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $=(id)=>document.getElementById(id);
const supportForm=$('supportForm');
const supportType=$('supportType');
const newEmailField=$('newEmailField');
const supportSubmitButton=$('supportSubmitButton');
const supportMessage=$('supportMessage');

function setMessage(message='',type=''){
  supportMessage.textContent=message;
  supportMessage.className=`student-message ${type}`.trim();
}

function setLoading(loading){
  supportSubmitButton.disabled=loading;
  supportSubmitButton.classList.toggle('is-loading',loading);
}

supportType?.addEventListener('change',()=>{
  newEmailField.classList.toggle(
    'is-hidden',
    supportType.value!=='ChangeEmail'
  );
});

supportForm?.addEventListener('submit',async event=>{
  event.preventDefault();

  const universityId=$('supportUniversityId').value.trim();
  const name=$('supportName').value.trim();
  const requestType=supportType.value;
  const newEmail=$('supportNewEmail').value.trim().toLowerCase();
  const description=$('supportDescription').value.trim();
  const file=$('supportFile').files[0]||null;

  if(!universityId||!name||!description){
    setMessage('أكمل البيانات المطلوبة.','error');
    return;
  }

  if(requestType==='ChangeEmail'&&!newEmail){
    setMessage('أدخل البريد الجامعي الجديد.','error');
    return;
  }

  if(file&&file.size>10*1024*1024){
    setMessage('حجم الملف يتجاوز 10 ميجابايت.','error');
    return;
  }

  setLoading(true);
  setMessage();

  let filePath=null;

  try{
    if(file){
      const extension=file.name.split('.').pop().toLowerCase();
      filePath=`public/${universityId}/${crypto.randomUUID()}.${extension}`;

      const {error:uploadError}=await db.storage
        .from('student-access-support')
        .upload(filePath,file,{
          cacheControl:'3600',
          upsert:false,
          contentType:file.type
        });

      if(uploadError)throw uploadError;
    }

    const {data,error}=await db.rpc('submit_student_access_support',{
      p_university_id:universityId,
      p_student_name:name,
      p_request_type:requestType,
      p_new_email:newEmail||null,
      p_description:description,
      p_file_path:filePath,
      p_file_name:file?.name||null
    });

    if(error)throw error;
    if(data?.success===false)throw new Error(data.message);

    supportForm.reset();
    newEmailField.classList.remove('is-hidden');
    setMessage(
      `تم إرسال الطلب. رقم المتابعة: ${data.request_number}`,
      'success'
    );
  }catch(error){
    if(filePath){
      await db.storage.from('student-access-support').remove([filePath]);
    }
    setMessage(error.message||'تعذر إرسال الطلب.','error');
  }finally{
    setLoading(false);
  }
});
