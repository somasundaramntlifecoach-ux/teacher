// ===== Positive Discipline Parenting course — shared app logic =====

// !!! IMPORTANT: paste your deployed Google Apps Script Web App URL below !!!
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxizm94pZxkRDRPEG33n0INE1A2HxlFkkI-2oFi_i4682kvMR8t2HFj9u9qF9eVqSE-Qg/exec";

const WHATSAPP_NUMBER = "919843702244"; // +91 98437 02244

// ---------- Language toggle ----------
function setLang(lang){
  localStorage.setItem('pd_parents_lang', lang);
  applyLang();
}
function applyLang(){
  const lang = localStorage.getItem('pd_parents_lang') || 'en';
  document.querySelectorAll('.i18n').forEach(el=>{
    const txt = el.getAttribute('data-' + lang);
    if(txt){ el.textContent = txt; el.toggleAttribute('lang-ta', lang==='ta'); }
  });
  document.querySelectorAll('.lang-toggle button').forEach(b=>{
    b.classList.toggle('active', b.getAttribute('data-setlang') === lang);
  });
  document.documentElement.setAttribute('lang', lang === 'ta' ? 'ta' : 'en');
}
document.addEventListener('DOMContentLoaded', applyLang);

// ---------- Parent registration (name + WhatsApp), stored once ----------
function saveRegistration(){
  const name = document.getElementById('regName')?.value.trim();
  const phone = document.getElementById('regPhone')?.value.trim();
  if(name) localStorage.setItem('pd_parents_name', name);
  if(phone) localStorage.setItem('pd_parents_phone', phone);
  const box = document.getElementById('regSaved');
  if(box){ box.style.display = 'block'; setTimeout(()=>box.style.display='none', 2500); }
}

// ---------- Progress tracking (per module, via localStorage) ----------
function markModuleComplete(slug, score, total){
  const key = 'pd_parents_progress';
  let progress = {};
  try{ progress = JSON.parse(localStorage.getItem(key) || '{}'); }catch(e){ progress = {}; }
  progress[slug] = { score, total, ts: Date.now() };
  localStorage.setItem(key, JSON.stringify(progress));
}
function getProgress(){
  try{ return JSON.parse(localStorage.getItem('pd_parents_progress') || '{}'); }catch(e){ return {}; }
}
// Called on index.html to paint checkmarks + progress bar
function renderProgressOnLanding(totalModules){
  const progress = getProgress();
  const done = Object.keys(progress).length;
  document.querySelectorAll('.mcard').forEach(card=>{
    const slug = card.getAttribute('data-slug');
    if(progress[slug]) card.classList.add('done');
  });
  const bar = document.getElementById('progressBar');
  const label = document.getElementById('progressLabel');
  if(bar) bar.style.width = Math.round((done/totalModules)*100) + '%';
  if(label) label.textContent = done + ' / ' + totalModules;
}

// ---------- Quiz grading + logging ----------
function gradeQuiz(slug, numQuestions, answers){
  let score = 0;
  const results = [];
  for(let i=0;i<numQuestions;i++){
    const chosen = document.querySelector(`input[name="q${i}"]:checked`);
    const card = document.getElementById(`qcard${i}`);
    if(!chosen){
      card.classList.add('incorrect');
      results.push(false);
      continue;
    }
    const val = parseInt(chosen.value,10);
    const isCorrect = val === answers[i];
    card.classList.toggle('correct', isCorrect);
    card.classList.toggle('incorrect', !isCorrect);
    const fb = card.querySelector('.feedback');
    if(fb){
      fb.textContent = isCorrect ? '✓ Correct' : '✗ Not quite';
      fb.className = 'feedback ' + (isCorrect ? 'ok' : 'no');
    }
    if(isCorrect) score++;
    results.push(isCorrect);
  }
  const scoreBox = document.getElementById('scoreBox');
  const scoreNum = document.getElementById('scoreNum');
  if(scoreNum) scoreNum.textContent = score + ' / ' + numQuestions;
  if(scoreBox) scoreBox.style.display = 'block';

  markModuleComplete(slug, score, numQuestions);
  logToSheet(slug, score, numQuestions);

  const submitBtn = document.getElementById('submitQuizBtn');
  if(submitBtn) submitBtn.disabled = true;

  scoreBox?.scrollIntoView({behavior:'smooth', block:'center'});
}

function logToSheet(slug, score, total){
  if(!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('PASTE_YOUR') === 0){
    console.warn('Apps Script URL not set yet — quiz result not logged to Sheet.');
    return;
  }
  const name = encodeURIComponent(localStorage.getItem('pd_parents_name') || '');
  const phone = encodeURIComponent(localStorage.getItem('pd_parents_phone') || '');
  const params = `course=positive_discipline_parents&module=${encodeURIComponent(slug)}&score=${score}&total=${total}&name=${name}&phone=${phone}&ts=${Date.now()}`;
  const img = new Image();
  img.src = `${APPS_SCRIPT_URL}?${params}`;
}

// ---------- WhatsApp share ----------
function whatsappShare(moduleTitle){
  const msg = encodeURIComponent(`I just completed "${moduleTitle}" in the Positive Discipline Parenting course by N T Somasundaram (God is always with u). 🌱`);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}
