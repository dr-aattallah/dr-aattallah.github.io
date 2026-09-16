import '../../course-header.js';
import { LabState } from './lab-state.js';

export class LabEngine {
  constructor(root, mission) {
    this.root = root;
    this.mission = mission;
    this.stageIndex = 0;
    this.results = new Map();
    this.stageLocked = false;
    this.activeStageIds = mission.stages.map(stage => stage.id);
    this.state = new LabState(mission.id);
    this.restoreState();
  }

  restoreState() {
    const saved = this.state.load();
    if (!saved) return;
    const stageById = new Map(this.mission.stages.map(stage => [stage.id, stage]));
    const fullStageIds = this.mission.stages.map(stage => stage.id);
    const restoredIds = Array.isArray(saved.activeStageIds)
      ? [...new Set(saved.activeStageIds)].filter(id => stageById.has(id)) : [];
    const restoredResults = new Map();
    if (Array.isArray(saved.results)) {
      saved.results.forEach(entry => {
        if (!Array.isArray(entry) || entry.length !== 2) return;
        const [id, result] = entry;
        const stage = stageById.get(id);
        if (!stage || !result || typeof result.correct !== 'boolean') return;
        restoredResults.set(id, { correct: result.correct, skill: stage.skill, lesson: stage.lesson, title: stage.title });
      });
    }
    this.activeStageIds = restoredIds.length ? restoredIds : fullStageIds;
    this.results = restoredResults;
    this.stageIndex = Number.isInteger(saved.stageIndex)
      ? Math.max(0, Math.min(saved.stageIndex, this.activeStageIds.length)) : 0;
    while (this.stageIndex < this.activeStageIds.length && this.results.has(this.activeStageIds[this.stageIndex])) this.stageIndex += 1;
    this.saveState();
  }

  saveState() {
    this.state.save({ stageIndex: this.stageIndex, results: this.results, activeStageIds: this.activeStageIds });
  }

  currentStage() {
    const id = this.activeStageIds[this.stageIndex];
    return this.mission.stages.find(stage => stage.id === id);
  }

  start() { this.renderStage(); }

  renderStage() {
    const stage = this.currentStage();
    if (!stage) return this.renderSummary();
    this.stageLocked = false;
    const total = this.activeStageIds.length;
    const progress = Math.round((this.stageIndex / total) * 100);
    const context = stage.context ? `<aside class="lab-context"><span>Project update</span><p>${stage.context}</p></aside>` : '';
    this.root.innerHTML = `<section class="lab-stage" aria-labelledby="lab-stage-title">
      <div class="lab-progress" aria-label="Mission progress"><div class="lab-progress-text"><span>Stage ${this.stageIndex + 1} of ${total}</span><span>${progress}% complete</span></div><div class="lab-progress-track" aria-hidden="true"><span style="width:${progress}%"></span></div></div>
      <div class="lab-stage-meta"><span>${stage.level}</span><span>${stage.skill}</span></div><h2 id="lab-stage-title">${stage.title}</h2>${context}<p class="lab-prompt">${stage.prompt}</p>`;
    this.renderInteraction(stage);
  }

  renderInteraction(stage) {
    const wrap = document.createElement('div');
    wrap.className = 'lab-interaction';
    if (stage.type === 'choice') wrap.innerHTML = this.choiceMarkup(stage);
    else if (stage.type === 'matching' || stage.type === 'classification') wrap.innerHTML = this.matchingMarkup(stage);
    else if (stage.type === 'multiselect') wrap.innerHTML = this.multiselectMarkup(stage);
    else if (stage.type === 'sequence') wrap.innerHTML = this.sequenceMarkup(stage);
    else wrap.innerHTML = `<div class="lab-error">Unsupported activity type.</div>`;
    this.root.querySelector('.lab-stage').append(wrap);
    this.bindInteraction(stage, wrap);
  }

  choiceMarkup(stage) { return `<div class="lab-options">${stage.options.map((o,i)=>`<button class="lab-option" type="button" data-index="${i}">${o}</button>`).join('')}</div>`; }
  matchingMarkup(stage) { return `<div class="lab-matching">${stage.items.map((item,i)=>`<label class="lab-row"><span>${item.label}</span><select data-index="${i}"><option value="">Choose…</option>${stage.categories.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></label>`).join('')}<button class="lab-check-action" type="button">Check answer</button></div>`; }
  multiselectMarkup(stage) { return `<fieldset class="lab-multiselect"><legend>Select all that apply.</legend>${stage.options.map((o,i)=>`<label class="lab-check-option"><input type="checkbox" value="${i}"><span>${o}</span></label>`).join('')}<button class="lab-check-action" type="button">Check answer</button></fieldset>`; }
  sequenceMarkup(stage) { return `<ol class="lab-sequence-builder">${stage.positions.map((_,i)=>`<li><label><span class="lab-position">${i+1}</span><select data-index="${i}"><option value="">Choose step…</option>${stage.options.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label></li>`).join('')}</ol><button class="lab-check-action" type="button">Check answer</button>`; }

  bindInteraction(stage, wrap) {
    if (stage.type === 'choice') wrap.querySelectorAll('.lab-option').forEach(btn=>btn.addEventListener('click',()=>this.evaluate(stage, Number(btn.dataset.index), wrap)));
    else wrap.querySelector('.lab-check-action')?.addEventListener('click',()=>{
      let answer;
      if (stage.type === 'matching' || stage.type === 'classification' || stage.type === 'sequence') answer=[...wrap.querySelectorAll('select')].map(s=>s.value);
      else answer=[...wrap.querySelectorAll('input:checked')].map(i=>Number(i.value));
      this.evaluate(stage, answer, wrap);
    });
  }

  evaluate(stage, answer, wrap) {
    if (this.stageLocked) return;
    const correct = stage.check(answer);
    this.stageLocked = true;
    this.results.set(stage.id, { correct, skill: stage.skill, lesson: stage.lesson, title: stage.title });
    this.saveState();
    wrap.querySelectorAll('button,select,input').forEach(el=>el.disabled=true);
    const feedback=document.createElement('div');feedback.className=`lab-feedback ${correct?'is-correct':'is-review'}`;feedback.tabIndex=-1;feedback.innerHTML=`<strong>${correct?'Good engineering judgment.':'Review this decision.'}</strong><p>${correct?stage.feedback.correct:stage.feedback.incorrect}</p>`;wrap.append(feedback);
    const actions=document.createElement('div');actions.className='lab-actions';actions.innerHTML=`<a class="lab-review-link" href="${stage.lesson}"><span class="lab-btn-icon" aria-hidden="true">↗</span>Review lesson</a><button class="lab-next" type="button"><span class="lab-btn-icon" aria-hidden="true">→</span>${this.stageIndex+1>=this.activeStageIds.length?'View mission summary':'Continue mission'}</button>`;wrap.append(actions);
    actions.querySelector('.lab-next').addEventListener('click',()=>{this.stageIndex+=1;this.saveState();this.renderStage();window.scrollTo({top:0,behavior:'smooth'});});feedback.focus();
  }

  renderSummary() {
    const total=this.results.size, correct=[...this.results.values()].filter(r=>r.correct).length, pct=total?Math.round(correct/total*100):0;
    const weak=[...this.results.entries()].filter(([,r])=>!r.correct);
    this.root.innerHTML=`<section class="lab-summary"><p class="lab-kicker">Mission complete</p><h2>${this.mission.title}</h2><div class="lab-readiness"><strong>${pct}% readiness</strong><span>${correct} of ${total} decisions demonstrated strong understanding.</span></div><div class="lab-skill-list">${[...this.results.values()].map(r=>`<div><span>${r.skill}<small>${r.title}</small></span><strong class="${r.correct?'is-mastered':'is-review-text'}">${r.correct?'Ready':'Review'}</strong></div>`).join('')}</div>${weak.length?`<div class="lab-recommendation"><span>Recommended next step</span><p>Retry the decisions that need review, then return to the related lesson if you still need support.</p></div>`:`<div class="lab-recommendation is-ready"><span>Recommended next step</span><p>You are ready to carry these decisions into your project work and later topics.</p></div>`}<div class="lab-actions lab-summary-actions">${weak.length?'<button class="lab-weak-action" type="button"><span class="lab-btn-icon" aria-hidden="true">↻</span>Retry weak areas</button>':''}<button class="lab-restart-action" type="button"><span class="lab-restart-icon" aria-hidden="true">↻</span><span>Restart full mission</span></button><a class="lab-topic-action" href="${this.mission.topicUrl}"><span class="lab-btn-icon" aria-hidden="true">←</span>Back to topic</a></div><p class="lab-summary-note">Your progress is stored only in this browser. This Practice module does not change course grades or Blackboard records.</p></section>`;
    this.root.querySelector('.lab-weak-action')?.addEventListener('click',()=>{this.activeStageIds=weak.map(([id])=>id);this.results=new Map();this.stageIndex=0;this.saveState();this.renderStage();window.scrollTo({top:0,behavior:'smooth'});});
    this.root.querySelector('.lab-restart-action').addEventListener('click',()=>{this.state.clear();this.activeStageIds=this.mission.stages.map(s=>s.id);this.results=new Map();this.stageIndex=0;this.renderStage();window.scrollTo({top:0,behavior:'smooth'});});
  }
}
