export class LabEngine {
  constructor(root, mission) {
    this.root = root;
    this.mission = mission;
    this.stageIndex = 0;
    this.results = new Map();
    this.stageLocked = false;
  }

  start() {
    this.renderStage();
  }

  renderStage() {
    const stage = this.mission.stages[this.stageIndex];
    if (!stage) return this.renderSummary();

    this.stageLocked = false;
    const progress = Math.round((this.stageIndex / this.mission.stages.length) * 100);
    const context = stage.context ? `<aside class="lab-context"><span>Project update</span><p>${stage.context}</p></aside>` : '';

    this.root.innerHTML = `
      <section class="lab-stage" aria-labelledby="lab-stage-title">
        <div class="lab-progress" aria-label="Mission progress">
          <div class="lab-progress-text"><span>Stage ${this.stageIndex + 1} of ${this.mission.stages.length}</span><span>${progress}% complete</span></div>
          <div class="lab-progress-track" aria-hidden="true"><span style="width:${progress}%"></span></div>
        </div>
        <div class="lab-stage-meta">
          <span>${stage.level}</span>
          <span>${stage.skill}</span>
        </div>
        <h2 id="lab-stage-title">${stage.title}</h2>
        ${context}
        <p class="lab-prompt">${stage.prompt}</p>
        <div class="lab-interaction" data-interaction></div>
        <div class="lab-feedback" data-feedback tabindex="-1" hidden></div>
        <div class="lab-actions">
          <a class="lab-review-link" href="${stage.lesson}">Review lesson</a>
          <button class="lab-primary" type="button" data-next hidden>Next stage</button>
        </div>
      </section>`;

    const host = this.root.querySelector('[data-interaction]');
    if (stage.type === 'choice') this.renderChoice(host, stage);
    else if (stage.type === 'classification') this.renderClassification(host, stage);
    else if (stage.type === 'sequence') this.renderSequence(host, stage);
    else if (stage.type === 'matching') this.renderMatching(host, stage);
    else this.renderUnsupported(host, stage);

    this.root.querySelector('[data-next]').addEventListener('click', () => {
      this.stageIndex += 1;
      this.renderStage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  renderChoice(host, stage) {
    host.innerHTML = `<div class="lab-options">${stage.options.map((option, i) => `
      <button type="button" class="lab-option" data-choice="${i}">${option}</button>`).join('')}</div>`;

    host.querySelectorAll('[data-choice]').forEach(button => {
      button.addEventListener('click', () => {
        if (this.stageLocked) return;
        const selected = Number(button.dataset.choice);
        button.classList.add('is-selected');
        this.finishStage(stage, selected === stage.answer, stage.feedback);
      });
    });
  }

  renderClassification(host, stage) {
    host.innerHTML = stage.items.map((item, i) => `
      <label class="lab-row"><span>${item.text}</span><select data-classify="${i}">
        <option value="">Choose…</option>
        ${stage.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select></label>`).join('') + '<button class="lab-primary" type="button" data-check>Check classification</button>';

    host.querySelector('[data-check]').addEventListener('click', () => {
      if (this.stageLocked) return;
      const answers = [...host.querySelectorAll('[data-classify]')].map(x => x.value);
      const correct = answers.every((value, i) => value === stage.items[i].answer);
      this.finishStage(stage, correct, {
        why: correct ? 'You correctly separated building work, quality assurance and project control.' : 'Development builds the product; SQA evaluates process/artifact quality; Project Management controls effort, schedule and administration.',
        consequence: 'Keep the three tracks distinct while remembering that they interact throughout the life cycle.'
      });
    });
  }

  renderSequence(host, stage) {
    const presented = [...stage.answer].reverse();
    host.innerHTML = presented.map((item, i) => `
      <label class="lab-row"><span>${item}</span><select data-order="${i}">
        <option value="">Position…</option>
        ${stage.answer.map((_, n) => `<option value="${n}">${n + 1}</option>`).join('')}
      </select></label>`).join('') + '<button class="lab-primary" type="button" data-check>Check sequence</button>';

    host.querySelector('[data-check]').addEventListener('click', () => {
      if (this.stageLocked) return;
      const selects = [...host.querySelectorAll('[data-order]')];
      const hasBlank = selects.some(select => select.value === '');
      const placements = selects.map((select, i) => ({ item: presented[i], pos: Number(select.value) }));
      const uniquePositions = new Set(placements.map(x => x.pos)).size === stage.answer.length;
      const valid = !hasBlank && uniquePositions;
      const ordered = valid ? [...placements].sort((a, b) => a.pos - b.pos).map(x => x.item) : [];
      const correct = valid && ordered.every((item, i) => item === stage.answer[i]);
      this.finishStage(stage, correct, {
        why: correct ? 'The development phases are in the intended Topic 01 Waterfall order.' : `The Topic 01 sequence is: ${stage.answer.join(' → ')}.`,
        consequence: 'The value of the sequence is understanding what evidence and decisions flow into the next phase.'
      });
    });
  }

  renderMatching(host, stage) {
    const outputs = stage.pairs.map(pair => pair[1]);
    host.innerHTML = stage.pairs.map((pair, i) => `
      <label class="lab-row"><span>${pair[0]}</span><select data-match="${i}">
        <option value="">Choose evidence…</option>
        ${outputs.map(output => `<option value="${output}">${output}</option>`).join('')}
      </select></label>`).join('') + '<button class="lab-primary" type="button" data-check>Check evidence</button>';

    host.querySelector('[data-check]').addEventListener('click', () => {
      if (this.stageLocked) return;
      const answers = [...host.querySelectorAll('[data-match]')].map(x => x.value);
      const correct = answers.every((value, i) => value === stage.pairs[i][1]);
      this.finishStage(stage, correct, {
        why: correct ? 'You connected each development phase to representative evidence.' : 'A phase is not complete just because work happened; it should leave artifacts or evidence that support verification and the next decisions.',
        consequence: 'Think phase → purpose → evidence, not phase names in isolation.'
      });
    });
  }

  renderUnsupported(host, stage) {
    host.innerHTML = `<p class="lab-error">Unsupported activity type: ${stage.type}</p>`;
  }

  finishStage(stage, correct, feedback) {
    if (this.stageLocked) return;
    this.stageLocked = true;
    this.results.set(stage.id, { correct, skill: stage.skill });

    const interaction = this.root.querySelector('[data-interaction]');
    interaction.querySelectorAll('button, select, input').forEach(control => {
      control.disabled = true;
    });

    const box = this.root.querySelector('[data-feedback]');
    box.hidden = false;
    box.classList.toggle('is-correct', correct);
    box.classList.toggle('is-review', !correct);
    box.innerHTML = `
      <strong>${correct ? 'Correct reasoning' : 'Review the reasoning'}</strong>
      <p><b>Why:</b> ${feedback.why}</p>
      <p><b>Engineering consequence:</b> ${feedback.consequence}</p>`;

    const next = this.root.querySelector('[data-next]');
    next.hidden = false;
    box.focus({ preventScroll: true });
  }

  renderSummary() {
    const total = this.mission.stages.length;
    const correct = [...this.results.values()].filter(x => x.correct).length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    const skills = [...this.results.values()].reduce((acc, result) => {
      const item = acc[result.skill] || { correct: 0, total: 0 };
      item.total += 1;
      if (result.correct) item.correct += 1;
      acc[result.skill] = item;
      return acc;
    }, {});

    this.root.innerHTML = `
      <section class="lab-summary" aria-labelledby="lab-summary-title">
        <p class="lab-kicker">Mission complete</p>
        <h2 id="lab-summary-title">Engineering Readiness</h2>
        <div class="lab-score" aria-label="Overall readiness ${percent} percent">${percent}%</div>
        <div class="lab-skill-list">${Object.entries(skills).map(([name, value]) => {
          const pct = Math.round((value.correct / value.total) * 100);
          const status = pct === 100 ? 'Mastered' : pct >= 50 ? 'Developing' : 'Review';
          return `<div><span>${name}<small>${status}</small></span><strong>${pct}%</strong></div>`;
        }).join('')}</div>
        <p>This profile is diagnostic. Revisit weak concepts, then run the mission again.</p>
        <div class="lab-actions"><button class="lab-primary" type="button" data-retry>Retry mission</button><a class="lab-review-link" href="../weeks/01-introduction/">Return to Topic 01</a></div>
      </section>`;

    this.root.querySelector('[data-retry]').addEventListener('click', () => {
      this.stageIndex = 0;
      this.results.clear();
      this.renderStage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
