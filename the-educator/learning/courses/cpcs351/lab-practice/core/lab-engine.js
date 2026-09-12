export class LabEngine {
  constructor(root, mission) {
    this.root = root;
    this.mission = mission;
    this.stageIndex = 0;
    this.results = new Map();
    this.stageLocked = false;
  }

  start() { this.renderStage(); }

  renderStage() {
    const stage = this.mission.stages[this.stageIndex];
    if (!stage) return this.renderSummary();
    this.stageLocked = false;
    const progress = Math.round((this.stageIndex / this.mission.stages.length) * 100);
    const context = stage.context ? `<aside class="lab-context"><span>Project update</span><p>${stage.context}</p></aside>` : '';
    this.root.innerHTML = `<section class="lab-stage" aria-labelledby="lab-stage-title">
      <div class="lab-progress" aria-label="Mission progress"><div class="lab-progress-text"><span>Stage ${this.stageIndex + 1} of ${this.mission.stages.length}</span><span>${progress}% complete</span></div><div class="lab-progress-track" aria-hidden="true"><span style="width:${progress}%"></span></div></div>
      <div class="lab-stage-meta"><span>${stage.level}</span><span>${stage.skill}</span></div><h2 id="lab-stage-title">${stage.title}</h2>${context}<p class="lab-prompt">${stage.prompt}</p>
      <div class="lab-interaction" data-interaction></div><div class="lab-feedback" data-feedback tabindex="-1" hidden></div>
      <div class="lab-actions"><a class="lab-review-link" href="${stage.lesson}">Review lesson</a><button class="lab-primary" type="button" data-next hidden>Next stage</button></div></section>`;
    const host = this.root.querySelector('[data-interaction]');
    if (stage.type === 'choice') this.renderChoice(host, stage);
    else if (stage.type === 'classification') this.renderClassification(host, stage);
    else if (stage.type === 'sequence') this.renderSequence(host, stage);
    else if (stage.type === 'matching') this.renderMatching(host, stage);
    else if (stage.type === 'multiselect') this.renderMultiSelect(host, stage);
    else this.renderUnsupported(host, stage);
    this.root.querySelector('[data-next]').addEventListener('click', () => { this.stageIndex += 1; this.renderStage(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  renderChoice(host, stage) {
    host.innerHTML = `<div class="lab-options">${stage.options.map((option, i) => `<button type="button" class="lab-option" data-choice="${i}">${option}</button>`).join('')}</div>`;
    host.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => { if (this.stageLocked) return; const selected = Number(button.dataset.choice); button.classList.add('is-selected'); this.finishStage(stage, selected === stage.answer, stage.feedback); }));
  }

  renderClassification(host, stage) {
    host.innerHTML = stage.items.map((item, i) => `<label class="lab-row"><span>${item.text}</span><select data-classify="${i}"><option value="">Choose…</option>${stage.categories.map(c => `<option value="${c}">${c}</option>`).join('')}</select></label>`).join('') + `<button class="lab-primary lab-check" type="button" data-check>${stage.checkLabel || 'Check classification'}</button>`;
    host.querySelector('[data-check]').addEventListener('click', () => { if (this.stageLocked) return; const answers = [...host.querySelectorAll('[data-classify]')].map(x => x.value); const correct = answers.every((value, i) => value === stage.items[i].answer); this.finishStage(stage, correct, stage.feedback || { why: 'Review the categories used in this activity.', consequence: 'Correct classification supports engineering reasoning.' }); });
  }

  renderSequence(host, stage) {
    const presented = [...stage.answer].reverse();
    host.innerHTML = `<ol class="lab-sequence-builder">${stage.answer.map((_, pos) => `<li><label><span class="lab-position">${pos + 1}</span><select data-sequence-slot="${pos}"><option value="">Choose phase…</option>${presented.map(item => `<option value="${item}">${item}</option>`).join('')}</select></label></li>`).join('')}</ol><button class="lab-primary lab-check" type="button" data-check>Check lifecycle</button>`;
    host.querySelector('[data-check]').addEventListener('click', () => {
      if (this.stageLocked) return;
      const values = [...host.querySelectorAll('[data-sequence-slot]')].map(x => x.value);
      const complete = values.every(Boolean);
      const unique = new Set(values).size === stage.answer.length;
      const correct = complete && unique && values.every((item, i) => item === stage.answer[i]);
      this.finishStage(stage, correct, stage.feedback || { why: correct ? 'You reconstructed the lifecycle in the intended Topic 01 order.' : `The Topic 01 sequence is: ${stage.answer.join(' → ')}.`, consequence: 'Lifecycle order helps you reason about how decisions and evidence flow from concept through operation and change.' });
    });
  }

  renderMatching(host, stage) {
    const outputs = stage.pairs.map(pair => pair[1]);
    host.innerHTML = stage.pairs.map((pair, i) => `<label class="lab-row"><span>${pair[0]}</span><select data-match="${i}"><option value="">Choose…</option>${outputs.map(output => `<option value="${output}">${output}</option>`).join('')}</select></label>`).join('') + `<button class="lab-primary lab-check" type="button" data-check>${stage.checkLabel || 'Check matches'}</button>`;
    host.querySelector('[data-check]').addEventListener('click', () => { if (this.stageLocked) return; const answers = [...host.querySelectorAll('[data-match]')].map(x => x.value); const correct = answers.every((value, i) => value === stage.pairs[i][1]); this.finishStage(stage, correct, stage.feedback || { why: correct ? 'You connected each item to the appropriate engineering evidence.' : 'Review the relationship between each concept and its engineering consequence.', consequence: 'Reason from concept to engineering action, not labels in isolation.' }); });
  }

  renderMultiSelect(host, stage) {
    host.innerHTML = `<fieldset class="lab-multiselect"><legend>${stage.instruction || 'Select all that apply.'}</legend>${stage.options.map((option, i) => `<label class="lab-check-option"><input type="checkbox" value="${i}" data-multi><span>${option}</span></label>`).join('')}</fieldset><button class="lab-primary lab-check" type="button" data-check>${stage.checkLabel || 'Check decision'}</button>`;
    host.querySelector('[data-check]').addEventListener('click', () => { if (this.stageLocked) return; const selected = [...host.querySelectorAll('[data-multi]:checked')].map(x => Number(x.value)).sort((a,b) => a-b); const expected = [...stage.answer].sort((a,b) => a-b); const correct = selected.length === expected.length && selected.every((value, i) => value === expected[i]); this.finishStage(stage, correct, stage.feedback); });
  }

  renderUnsupported(host, stage) { host.innerHTML = `<p class="lab-error">Unsupported activity type: ${stage.type}</p>`; }

  finishStage(stage, correct, feedback) {
    if (this.stageLocked) return;
    this.stageLocked = true;
    this.results.set(stage.id, { correct, skill: stage.skill, lesson: stage.lesson, title: stage.title });
    this.root.querySelector('[data-interaction]').querySelectorAll('button, select, input').forEach(control => { control.disabled = true; });
    const box = this.root.querySelector('[data-feedback]');
    box.hidden = false; box.classList.toggle('is-correct', correct); box.classList.toggle('is-review', !correct);
    box.innerHTML = `<strong>${correct ? 'Correct reasoning' : 'Review the reasoning'}</strong><p><b>Why:</b> ${feedback.why}</p><p><b>Engineering consequence:</b> ${feedback.consequence}</p>`;
    this.root.querySelector('[data-next]').hidden = false; box.focus({ preventScroll: true });
  }

  renderSummary() {
    const results = [...this.results.values()];
    const correct = results.filter(x => x.correct).length;
    const weak = results.filter(x => !x.correct);
    const readiness = correct === this.mission.stages.length ? 'Mission Ready' : correct >= 6 ? 'Nearly Ready' : correct >= 4 ? 'Developing' : 'Needs Review';
    this.root.innerHTML = `<section class="lab-summary" aria-labelledby="lab-summary-title">
      <p class="lab-kicker">Mission debrief</p><h2 id="lab-summary-title">Engineering Readiness Profile</h2>
      <div class="lab-readiness"><strong>${readiness}</strong><span>${correct} of ${this.mission.stages.length} engineering decisions demonstrated</span></div>
      <div class="lab-skill-list">${results.map(result => `<div><span>${result.skill}<small>${result.title}</small></span><strong class="${result.correct ? 'is-mastered' : 'is-review-text'}">${result.correct ? 'Mastered' : 'Review'}</strong></div>`).join('')}</div>
      ${weak.length ? `<aside class="lab-recommendation"><span>Recommended next step</span><p>Revisit <strong>${weak[0].title}</strong> before retrying the mission.</p><a class="lab-review-link" href="${weak[0].lesson}">Review recommended lesson</a></aside>` : `<aside class="lab-recommendation is-ready"><span>Engineering checkpoint</span><p>You demonstrated the Topic 01 reasoning chain from software nature through lifecycle evidence and engineering control.</p></aside>`}
      <p class="lab-summary-note">This is a diagnostic learning profile, not a grade.</p>
      <div class="lab-actions"><button class="lab-primary" type="button" data-retry>Retry mission</button><a class="lab-review-link" href="../weeks/01-introduction/">Return to Topic 01</a></div></section>`;
    this.root.querySelector('[data-retry]').addEventListener('click', () => { this.stageIndex = 0; this.results.clear(); this.renderStage(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
}
