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
      <div class="lab-stage-meta"><span>${stage.level}</span><span>${stage.skill}</span></div><h2 id="lab-stage-title">${stage.title}</h2>${context}<p class="lab-prompt">${stage.prompt}</p>
      <div class="lab-interaction" data-interaction></div><div class="lab-feedback" data-feedback tabindex="-1" hidden></div>
      <div class="lab-actions"><a class="lab-review-link" href="${stage.lesson}"><span class="lab-btn-icon" aria-hidden="true">📘</span>Review lesson</a><button class="lab-next" type="button" data-next hidden>Next stage <span class="lab-btn-icon" aria-hidden="true">➜</span></button></div></section>`;
    const host = this.root.querySelector('[data-interaction]');
    const renderer = {
      choice: () => this.renderChoice(host, stage),
      classification: () => this.renderClassification(host, stage),
      sequence: () => this.renderSequence(host, stage),
      matching: () => this.renderMatching(host, stage),
      multiselect: () => this.renderMultiSelect(host, stage)
    }[stage.type];
    renderer ? renderer() : this.renderUnsupported(host, stage);
    this.root.querySelector('[data-next]').addEventListener('click', () => {
      this.stageIndex += 1;
      this.saveState();
      this.renderStage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  renderChoice(host, stage) {
    host.innerHTML = `<div class="lab-options">${stage.options.map((option, i) => `<button type="button" class="lab-option" data-choice="${i}">${option}</button>`).join('')}</div>`;
    host.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
      if (this.stageLocked) return;
      const selected = Number(button.dataset.choice);
      button.classList.add('is-selected');
      this.finishStage(stage, selected === stage.answer, stage.feedback);
    }));
  }

  renderClassification(host, stage) {
    host.innerHTML = stage.items.map((item, i) => `<label class="lab-row"><span>${item.text}</span><select data-classify="${i}"><option value="">Choose…</option>${stage.categories.map(c => `<option value="${c}">${c}</option>`).join('')}</select></label>`).join('') + `<button class="lab-check-action" type="button" data-check><span class="lab-btn-icon" aria-hidden="true">✓</span>${stage.checkLabel || 'Check classification'}</button>`;
    host.querySelector('[data-check]').addEventListener('click', () => {
      if (this.stageLocked) return;
      const answers = [...host.querySelectorAll('[data-classify]')].map(x => x.value);
      const correct = answers.every((value, i) => value === stage.items[i].answer);
      this.finishStage(stage, correct, stage.feedback || { why: 'Review the categories used in this activity.', consequence: 'Correct classification supports engineering reasoning.' });
    });
  }

  renderSequence(host, stage) {
    const presented = [...stage.answer].reverse();
    host.innerHTML = `<ol class="lab-sequence-builder">${stage.answer.map((_, pos) => `<li><label><span class="lab-position">${pos + 1}</span><select data-sequence-slot="${pos}"><option value="">Choose item…</option>${presented.map(item => `<option value="${item}">${item}</option>`).join('')}</select></label></li>`).join('')}</ol><button class="lab-check-action" type="button" data-check><span class="lab-btn-icon" aria-hidden="true">✓</span>${stage.checkLabel || 'Check sequence'}</button>`;
    host.querySelector('[data-check]').addEventListener('click', () => {
      if (this.stageLocked) return;
      const values = [...host.querySelectorAll('[data-sequence-slot]')].map(x => x.value);
      const correct = values.every(Boolean) && new Set(values).size === stage.answer.length && values.every((item, i) => item === stage.answer[i]);
      this.finishStage(stage, correct, stage.feedback || { why: correct ? 'The sequence is correct.' : `The intended sequence is: ${stage.answer.join(' → ')}.`, consequence: 'Use the sequence to reason about how engineering work and evidence progress.' });
    });
  }

  renderMatching(host, stage) {
    const outputs = stage.pairs.map(pair => pair[1]);
    host.innerHTML = stage.pairs.map((pair, i) => `<label class="lab-row"><span>${pair[0]}</span><select data-match="${i}"><option value="">Choose…</option>${outputs.map(output => `<option value="${output}">${output}</option>`).join('')}</select></label>`).join('') + `<button class="lab-check-action" type="button" data-check><span class="lab-btn-icon" aria-hidden="true">✓</span>${stage.checkLabel || 'Check matches'}</button>`;
    host.querySelector('[data-check]').addEventListener('click', () => {
      if (this.stageLocked) return;
      const answers = [...host.querySelectorAll('[data-match]')].map(x => x.value);
      const correct = answers.every((value, i) => value === stage.pairs[i][1]);
      this.finishStage(stage, correct, stage.feedback || { why: 'Review the relationship between each concept and its engineering consequence.', consequence: 'Reason from concept to evidence or action, not labels in isolation.' });
    });
  }

  renderMultiSelect(host, stage) {
    host.innerHTML = `<fieldset class="lab-multiselect"><legend>${stage.instruction || 'Select all that apply.'}</legend>${stage.options.map((option, i) => `<label class="lab-check-option"><input type="checkbox" value="${i}" data-multi><span>${option}</span></label>`).join('')}</fieldset><button class="lab-check-action" type="button" data-check><span class="lab-btn-icon" aria-hidden="true">✓</span>${stage.checkLabel || 'Check decision'}</button>`;
    host.querySelector('[data-check]').addEventListener('click', () => {
      if (this.stageLocked) return;
      const selected = [...host.querySelectorAll('[data-multi]:checked')].map(x => Number(x.value)).sort((a,b) => a-b);
      const expected = [...stage.answer].sort((a,b) => a-b);
      const correct = selected.length === expected.length && selected.every((value, i) => value === expected[i]);
      this.finishStage(stage, correct, stage.feedback);
    });
  }

  renderUnsupported(host, stage) { host.innerHTML = `<p class="lab-error">Unsupported activity type: ${stage.type}</p>`; }

  finishStage(stage, correct, feedback) {
    if (this.stageLocked) return;
    this.stageLocked = true;
    this.results.set(stage.id, { correct, skill: stage.skill, lesson: stage.lesson, title: stage.title });
    this.saveState();
    this.root.querySelector('[data-interaction]').querySelectorAll('button, select, input').forEach(control => { control.disabled = true; });
    const box = this.root.querySelector('[data-feedback]');
    box.hidden = false;
    box.classList.toggle('is-correct', correct);
    box.classList.toggle('is-review', !correct);
    box.innerHTML = `<strong>${correct ? 'Correct reasoning' : 'Review the reasoning'}</strong><p><b>Why:</b> ${feedback.why}</p><p><b>Engineering consequence:</b> ${feedback.consequence}</p>`;
    this.root.querySelector('[data-next]').hidden = false;
    box.focus({ preventScroll: true });
  }

  retryWeakAreas(weakIds) {
    const validWeakIds = weakIds.filter(id => this.mission.stages.some(stage => stage.id === id));
    if (!validWeakIds.length) return this.renderSummary();
    this.activeStageIds = validWeakIds;
    validWeakIds.forEach(id => this.results.delete(id));
    this.stageIndex = 0;
    this.saveState();
    this.renderStage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetMission() {
    this.activeStageIds = this.mission.stages.map(stage => stage.id);
    this.stageIndex = 0;
    this.results.clear();
    this.state.clear();
    this.renderStage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderSummary() {
    const orderedResults = this.mission.stages.map(stage => [stage.id, this.results.get(stage.id)]).filter(([, result]) => result);
    if (orderedResults.length < this.mission.stages.length) {
      const nextIncomplete = this.mission.stages.find(stage => !this.results.has(stage.id));
      if (nextIncomplete) {
        this.activeStageIds = this.mission.stages.map(stage => stage.id);
        this.stageIndex = this.activeStageIds.indexOf(nextIncomplete.id);
        this.saveState();
        return this.renderStage();
      }
    }
    const results = orderedResults.map(([, result]) => result);
    const correct = results.filter(x => x.correct).length;
    const weakEntries = orderedResults.filter(([, result]) => !result.correct);
    const weak = weakEntries.map(([, result]) => result);
    const weakIds = weakEntries.map(([id]) => id);
    const ratio = this.mission.stages.length ? correct / this.mission.stages.length : 0;
    const readiness = ratio === 1 ? 'Mission Ready' : ratio >= .75 ? 'Nearly Ready' : ratio >= .5 ? 'Developing' : 'Needs Review';
    const readyMessage = this.mission.readyMessage || 'You demonstrated the reasoning chain for this mission.';
    const returnUrl = this.mission.returnUrl || '../';
    const returnLabel = this.mission.returnLabel || `Return to Topic ${this.mission.topic || ''}`;
    this.root.innerHTML = `<section class="lab-summary" aria-labelledby="lab-summary-title">
      <p class="lab-kicker">Mission debrief</p><h2 id="lab-summary-title">Engineering Readiness Profile</h2>
      <div class="lab-readiness"><strong>${readiness}</strong><span>${correct} of ${this.mission.stages.length} engineering decisions demonstrated</span></div>
      <div class="lab-skill-list">${orderedResults.map(([, result]) => `<div><span>${result.skill}<small>${result.title}</small></span><strong class="${result.correct ? 'is-mastered' : 'is-review-text'}">${result.correct ? 'Mastered' : 'Review'}</strong></div>`).join('')}</div>
      ${weak.length ? `<aside class="lab-recommendation"><span>Recommended next step</span><p>Revisit <strong>${weak[0].title}</strong>, then retry only the concepts that need more work.</p><a class="lab-review-link" href="${weak[0].lesson}"><span class="lab-btn-icon" aria-hidden="true">📘</span>Review recommended lesson</a></aside>` : `<aside class="lab-recommendation is-ready"><span>Engineering checkpoint</span><p>${readyMessage}</p></aside>`}
      <p class="lab-summary-note">This is a diagnostic learning profile, not a grade. Your progress is saved on this device.</p>
      <div class="lab-actions lab-summary-actions">${weakIds.length ? '<button class="lab-weak-action" type="button" data-retry-weak><span class="lab-btn-icon" aria-hidden="true">🎯</span>Retry weak areas</button>' : ''}<button class="lab-restart-action" type="button" data-retry><span class="lab-btn-icon lab-restart-icon" aria-hidden="true">↻</span><span>Restart full mission</span></button><a class="lab-topic-action" href="${returnUrl}"><span class="lab-btn-icon" aria-hidden="true">⌂</span>${returnLabel}</a></div></section>`;
    const retryWeak = this.root.querySelector('[data-retry-weak]');
    if (retryWeak) retryWeak.addEventListener('click', () => this.retryWeakAreas(weakIds));
    this.root.querySelector('[data-retry]').addEventListener('click', () => this.resetMission());
    this.saveState();
  }
}
