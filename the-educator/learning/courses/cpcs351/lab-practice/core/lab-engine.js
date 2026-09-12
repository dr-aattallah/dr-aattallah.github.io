export class LabEngine {
  constructor(root, mission) {
    this.root = root;
    this.mission = mission;
    this.stageIndex = 0;
    this.results = new Map();
  }

  start() {
    this.renderStage();
  }

  renderStage() {
    const stage = this.mission.stages[this.stageIndex];
    if (!stage) return this.renderSummary();

    this.root.innerHTML = `
      <section class="lab-stage" aria-labelledby="lab-stage-title">
        <div class="lab-stage-meta">
          <span>Stage ${this.stageIndex + 1} of ${this.mission.stages.length}</span>
          <span>${stage.level}</span>
        </div>
        <h2 id="lab-stage-title">${stage.title}</h2>
        <p class="lab-skill">${stage.skill}</p>
        <p class="lab-prompt">${stage.prompt}</p>
        <div class="lab-interaction" data-interaction></div>
        <div class="lab-feedback" data-feedback hidden></div>
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
        const selected = Number(button.dataset.choice);
        this.finishStage(stage, selected === stage.answer, stage.feedback);
      }, { once: true });
    });
  }

  renderClassification(host, stage) {
    host.innerHTML = stage.items.map((item, i) => `
      <label class="lab-row"><span>${item.text}</span><select data-classify="${i}">
        <option value="">Choose…</option>
        ${stage.categories.map(c => `<option>${c}</option>`).join('')}
      </select></label>`).join('') + '<button class="lab-primary" type="button" data-check>Check classification</button>';
    host.querySelector('[data-check]').addEventListener('click', () => {
      const answers = [...host.querySelectorAll('[data-classify]')].map(x => x.value);
      const correct = answers.every((value, i) => value === stage.items[i].answer);
      this.finishStage(stage, correct, {
        why: correct ? 'You correctly separated building work, quality assurance and project control.' : 'Development builds the product; SQA evaluates process/artifact quality; Project Management controls effort, schedule and administration.',
        consequence: 'Keep the three tracks distinct while remembering that they interact throughout the life cycle.'
      });
    });
  }

  renderSequence(host, stage) {
    const shuffled = [...stage.answer].reverse();
    host.innerHTML = shuffled.map((item, i) => `
      <label class="lab-row"><span>${item}</span><select data-order="${i}">
        <option value="">Position…</option>
        ${stage.answer.map((_, n) => `<option value="${n}">${n + 1}</option>`).join('')}
      </select></label>`).join('') + '<button class="lab-primary" type="button" data-check>Check sequence</button>';
    host.querySelector('[data-check]').addEventListener('click', () => {
      const placements = [...host.querySelectorAll('[data-order]')].map((select, i) => ({ item: shuffled[i], pos: Number(select.value) }));
      const valid = placements.every(x => Number.isInteger(x.pos)) && new Set(placements.map(x => x.pos)).size === stage.answer.length;
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
        ${outputs.map(output => `<option>${output}</option>`).join('')}
      </select></label>`).join('') + '<button class="lab-primary" type="button" data-check>Check evidence</button>';
    host.querySelector('[data-check]').addEventListener('click', () => {
      const answers = [...host.querySelectorAll('[data-match]')].map(x => x.value);
      const correct = answers.every((value, i) => value === stage.pairs[i][1]);
      this.finishStage(stage, correct, {
        why: correct ? 'You connected each development phase to representative evidence.' : 'A phase is not complete just because work happened; it should leave artifacts or evidence that support verification and the next decisions.',
        consequence: 'Think phase → purpose → evidence, not phase names in isolation.'
      });
    });
  }

  finishStage(stage, correct, feedback) {
    this.results.set(stage.id, { correct, skill: stage.skill });
    const box = this.root.querySelector('[data-feedback]');
    box.hidden = false;
    box.innerHTML = `
      <strong>${correct ? 'Correct reasoning' : 'Review the reasoning'}</strong>
      <p><b>Why:</b> ${feedback.why}</p>
      <p><b>Engineering consequence:</b> ${feedback.consequence}</p>`;
    this.root.querySelector('[data-next]').hidden = false;
  }

  renderSummary() {
    const total = this.mission.stages.length;
    const correct = [...this.results.values()].filter(x => x.correct).length;
    const percent = Math.round((correct / total) * 100);
    const skills = [...this.results.values()].reduce((acc, result) => {
      const item = acc[result.skill] || { correct: 0, total: 0 };
      item.total += 1;
      if (result.correct) item.correct += 1;
      acc[result.skill] = item;
      return acc;
    }, {});

    this.root.innerHTML = `
      <section class="lab-summary">
        <p class="lab-kicker">Mission complete</p>
        <h2>Engineering Readiness</h2>
        <div class="lab-score">${percent}%</div>
        <div class="lab-skill-list">${Object.entries(skills).map(([name, value]) => {
          const pct = Math.round((value.correct / value.total) * 100);
          return `<div><span>${name}</span><strong>${pct}%</strong></div>`;
        }).join('')}</div>
        <p>This profile is diagnostic. Revisit weak concepts, then run the mission again.</p>
        <div class="lab-actions"><button class="lab-primary" type="button" data-retry>Retry mission</button><a class="lab-review-link" href="../weeks/01-introduction/">Return to Topic 01</a></div>
      </section>`;

    this.root.querySelector('[data-retry]').addEventListener('click', () => {
      this.stageIndex = 0;
      this.results.clear();
      this.renderStage();
    });
  }
}
