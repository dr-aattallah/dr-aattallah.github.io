
const form = document.getElementById('checkinForm');
const input = document.getElementById('studentId');
const button = document.getElementById('submitButton');
const box = document.getElementById('messageBox');
const tagDisplay = document.getElementById('tagDisplay');
const sessionDisplay = document.getElementById('sessionDisplay');
const params = new URLSearchParams(location.search);
const tag = params.get('tag') || params.get('card') || '';
const names = { '1':'Card 1 · Front zone','2':'Card 2 · Middle zone','3':'Card 3 · Back zone','NFC-FRONT':'Card 1 · Front zone','NFC-MIDDLE':'Card 2 · Middle zone','NFC-BACK':'Card 3 · Back zone' };
tagDisplay.textContent = names[tag] || (tag || 'Not detected');
sessionDisplay.textContent = 'Prototype mode';
function show(text,type){ box.textContent=text; box.className=`message-box show ${type}`; }
form.addEventListener('submit', async e => { e.preventDefault(); const id=input.value.trim(); if(!/^[A-Za-z0-9-]{5,20}$/.test(id)){ show('Enter a valid university ID.','error'); input.focus(); return; } button.classList.add('is-loading'); button.disabled=true; box.className='message-box'; await new Promise(r=>setTimeout(r,900)); show(`Prototype ready. Student ${id} would be recorded using ${tagDisplay.textContent}.`,'success'); form.reset(); button.classList.remove('is-loading'); button.disabled=false; });
