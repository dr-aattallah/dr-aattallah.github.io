/* Retain textual learning context even when remote artwork is unavailable. */
document.querySelectorAll('.story-visual').forEach(figure => {
  const image = figure.querySelector('img');
  const fallback = figure.querySelector('.image-fallback');
  const failed = () => {
    image.hidden = true;
    fallback.hidden = false;
    fallback.querySelector('.image-status').hidden = false;
  };
  const loaded = () => { image.hidden = false; fallback.hidden = true; };
  image.addEventListener('error', failed);
  image.addEventListener('load', loaded);
  if (image.complete) { image.naturalWidth > 0 ? loaded() : failed(); }
});

/* Unit 01 first-attempt practice; no grades or persistence. */
(() => {
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;
  const questions = [...quiz.querySelectorAll('.quiz-q')];
  const summary = document.createElement('p');
  summary.id = 'u01-quiz-summary';
  summary.className = 'u01-quiz-summary';
  summary.setAttribute('role', 'status');
  quiz.prepend(summary);
  function updateSummary() {
    const attempted = questions.filter(q => q.dataset.attempted === 'true');
    const correct = attempted.filter(q => q.dataset.correct === 'true');
    summary.textContent = `${attempted.length} of ${questions.length} practiced; ${correct.length} correct on current attempts. This is ungraded practice, not your Blackboard Quick Check.`;
  }
  questions.forEach((q, index) => {
    const buttons = [...q.querySelectorAll('button[data-choice]')];
    const feedback = q.querySelector('.quiz-feedback');
    const heading = q.querySelector('h3');
    heading.id = `u01-question-${index + 1}`;
    q.setAttribute('role', 'group');
    q.setAttribute('aria-labelledby', heading.id);
    const note = document.createElement('p');
    note.className = 'u01-attempt-note';
    note.setAttribute('role', 'status');
    note.setAttribute('aria-atomic', 'true');
    const prompt = 'Choose your first answer. Feedback appears after your attempt.';
    note.textContent = prompt;
    q.querySelector('.quiz-options').after(note);
    const correctButton = buttons.find(b => b.dataset.choice === q.dataset.answer);
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'u01-reset';
    reset.textContent = 'Try this question again';
    reset.hidden = true;
    feedback.after(reset);
    q.dataset.attempted = 'false';
    q.dataset.correct = 'false';
    buttons.forEach(b => {
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (q.dataset.attempted === 'true') return;
        const correct = b === correctButton;
        q.dataset.attempted = 'true';
        q.dataset.correct = String(correct);
        buttons.forEach(x => {
          // Keep the chosen control focusable while preventing a second attempt.
          x.setAttribute('aria-disabled', 'true');
          x.setAttribute('aria-pressed', String(x === b));
          x.classList.toggle('correct', x === correctButton);
        });
        if (!correct) b.classList.add('wrong');
        q.classList.add('answered');
        feedback.classList.add('show');
        reset.hidden = false;
        note.textContent = `${correct ? 'Correct first attempt.' : 'Not correct on the first attempt.'} Correct answer: ${correctButton.textContent.trim()} ${b.dataset.explanation || ""}`;
        updateSummary();
      });
    });
    reset.addEventListener('click', () => {
      q.dataset.attempted = 'false';
      q.dataset.correct = 'false';
      q.classList.remove('answered');
      feedback.classList.remove('show');
      buttons.forEach(b => {
        b.removeAttribute('aria-disabled');
        b.setAttribute('aria-pressed', 'false');
        b.classList.remove('correct', 'wrong');
      });
      note.textContent = prompt;
      reset.hidden = true;
      updateSummary();
      buttons[0].focus();
    });
  });
  updateSummary();
})();


/* Local worksheet export: no account, network request, storage or grading. */
(() => {
  const button = document.getElementById('u01-download-notes');
  if (!button) return;
  button.addEventListener('click', () => {
    const lines = ['CPCS351 — Unit 01 Foundation Workshop', 'Ungraded draft reasoning; no submission recorded.', ''];
    document.querySelectorAll('.u01-worksheet fieldset').forEach(fieldset => {
      lines.push(fieldset.querySelector('legend').textContent);
      fieldset.querySelectorAll('[data-worksheet]').forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        lines.push(`${label.textContent}: ${input.value.trim() || '[not yet completed]'}`);
      });
      lines.push('');
    });
    const url = URL.createObjectURL(new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'CPCS351-Unit01-Workshop-Notes.txt';
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById('u01-notes-status').textContent = 'Your notes file was prepared for download. Save it before leaving this page.';
  });
})();
