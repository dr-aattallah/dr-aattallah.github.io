'use strict';

const SUPABASE_URL = 'https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
const $ = (id) => document.getElementById(id);
const ADMIN_ROLES = [
  window.RoleAccess.ROLES.ADMINISTRATOR,
  window.RoleAccess.ROLES.INSTRUCTOR
];

function metric(id, value) {
  $(id).textContent = String(value || 0);
}

function renderHealth(issues) {
  const container = $('healthChecks');
  container.innerHTML = '';
  Object.entries(window.PilotReadiness.ISSUE_LABELS).forEach(
    ([key, label]) => {
      const value = Number(issues?.[key] || 0);
      const row = document.createElement('div');
      row.className = 'health-row';
      const title = document.createElement('strong');
      title.textContent = label;
      const badge = document.createElement('span');
      badge.className =
        `health-value ${window.PilotReadiness.issueTone(value)}`;
      badge.textContent = value === 0 ? 'سليم' : `${value} مشكلة`;
      row.append(title, badge);
      container.appendChild(row);
    }
  );
}

function renderHistory(rows) {
  const container = $('pilotHistory');
  container.innerHTML = '';
  if (!rows?.length) {
    container.textContent = 'لم تُسجل نتائج اختبار ميداني بعد.';
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement('article');
    row.className = 'history-row';
    const details = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent =
      window.PilotReadiness.SCENARIOS[item.scenario_code] ||
      item.scenario_code;
    const note = document.createElement('p');
    note.textContent = [
      item.execution_mode === 'HumanField' ? 'ميداني' : 'تحقق آلي',
      item.participant_count != null
        ? `${item.participant_count} مشارك`
        : null,
      item.course_code,
      item.session_id,
      item.evidence_reference,
      item.note
    ].filter(Boolean).join(' • ') || 'دون ملاحظات';
    details.append(title, note);

    const result = document.createElement('span');
    result.className = `result-pill ${item.result.toLowerCase()}`;
    result.textContent = {
      Passed: 'ناجح',
      Failed: 'فشل',
      Blocked: 'متعذر'
    }[item.result] || item.result;

    const time = document.createElement('span');
    time.className = 'history-time';
    time.textContent = new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(item.checked_at));
    row.append(details, result, time);
    container.appendChild(row);
  });
}

function renderScenarioGuide() {
  const scenarioCode = $('scenarioCode').value;
  const details = window.PilotReadiness.SCENARIO_DETAILS[scenarioCode];
  if (!details) return;
  $('participantCount').min =
    $('executionMode').value === 'HumanField'
      ? String(details.participants)
      : '0';
  if (
    $('executionMode').value === 'HumanField' &&
    Number($('participantCount').value) < details.participants
  ) {
    $('participantCount').value = String(details.participants);
  }
  $('scenarioGuide').innerHTML = '';
  const steps = document.createElement('p');
  const acceptance = document.createElement('p');
  steps.textContent = `طريقة التنفيذ: ${details.steps}`;
  acceptance.textContent = `معيار النجاح: ${details.acceptance}`;
  $('scenarioGuide').append(steps, acceptance);
}

function renderScenarioCoverage(statuses, rehearsals, metrics) {
  const container = $('scenarioCoverageList');
  const resultLabels = {
    Passed: 'ناجح',
    Failed: 'فشل',
    Blocked: 'متعذر'
  };
  container.innerHTML = '';

  Object.entries(window.PilotReadiness.SCENARIOS).forEach(
    ([scenarioCode, label]) => {
      const status = statuses?.[scenarioCode] || {};
      const rehearsal = rehearsals?.[scenarioCode] || {};
      const result = status.result || 'NotTested';
      const row = document.createElement('article');
      row.className = 'scenario-coverage-row';

      const title = document.createElement('strong');
      title.textContent = label;

      const badge = document.createElement('span');
      badge.className =
        `scenario-state ${result === 'NotTested'
          ? 'not-tested'
          : result.toLowerCase()}`;
      badge.textContent = resultLabels[result] || 'لم يُختبر';

      const badges = document.createElement('div');
      badges.className = 'scenario-badges';
      if (rehearsal.result) {
        const rehearsalBadge = document.createElement('span');
        rehearsalBadge.className =
          `scenario-state rehearsal ${rehearsal.result.toLowerCase()}`;
        rehearsalBadge.textContent =
          `آلي: ${resultLabels[rehearsal.result] || rehearsal.result}`;
        badges.appendChild(rehearsalBadge);
      }
      badges.appendChild(badge);
      row.append(title, badges);
      container.appendChild(row);
    }
  );

  const passed = Number(metrics?.passed_scenarios || 0);
  const required = Number(
    metrics?.required_scenarios ||
    Object.keys(window.PilotReadiness.SCENARIOS).length
  );
  $('scenarioCoverage').textContent = `${passed}/${required}`;
  $('rehearsalCoverage').textContent =
    `${Number(metrics?.passed_rehearsal_scenarios || 0)}/${required}`;
}

function renderReadiness(data) {
  const metrics = data?.metrics || {};
  const issues = data?.issues || {};
  const readiness = window.PilotReadiness.calculateReadiness(issues, metrics);
  $('readinessLabel').textContent = readiness.state;
  $('readinessDescription').textContent =
    readiness.tone === 'ready'
      ? 'اكتملت الفحوص الآلية والسيناريوهات الميدانية.'
      : 'أكمل السيناريوهات وعالج العناصر الظاهرة قبل توسيع التجربة.';
  $('readinessScore').textContent = `${readiness.score}%`;
  $('readinessScore').dataset.tone = readiness.tone;
  metric('activeCoursePlans', metrics.active_course_plans);
  metric('activeStudents', metrics.active_students);
  metric('totalSessions', metrics.total_sessions);
  metric('attendanceRecords', metrics.attendance_records);
  renderHealth(issues);
  renderScenarioCoverage(
    data?.scenario_statuses,
    data?.rehearsal_statuses,
    metrics
  );
  renderHistory(data?.latest_checks || []);
  $('pilotMessage').classList.add('is-hidden');
  $('pilotView').classList.remove('is-hidden');
}

async function loadReadiness() {
  $('refreshPilotButton').disabled = true;
  const {data, error} = await db.rpc('admin_get_pilot_readiness');
  $('refreshPilotButton').disabled = false;
  if (error) {
    $('pilotMessage').className = 'pilot-message liquid-glass error';
    $('pilotMessage').textContent =
      error.message || 'تعذر تحميل جاهزية الإطلاق.';
    return;
  }
  renderReadiness(data);
}

function populateScenarios() {
  Object.entries(window.PilotReadiness.SCENARIOS).forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    $('scenarioCode').appendChild(option);
  });
}

$('pilotCheckForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  $('formMessage').className = 'form-message';
  $('formMessage').textContent = '';
  const {error} = await db.rpc('admin_record_pilot_check', {
    p_scenario_code: $('scenarioCode').value,
    p_result: $('scenarioResult').value,
    p_course_code: $('pilotCourseCode').value.trim() || null,
    p_session_id: $('pilotSessionId').value.trim() || null,
    p_note: $('pilotNote').value.trim() || null,
    p_execution_mode: $('executionMode').value,
    p_participant_count: Number($('participantCount').value),
    p_evidence_reference: $('evidenceReference').value.trim()
  });
  button.disabled = false;
  if (error) {
    $('formMessage').className = 'form-message error';
    $('formMessage').textContent = error.message;
    return;
  }
  $('formMessage').textContent = 'تم حفظ نتيجة الاختبار.';
  event.currentTarget.reset();
  await loadReadiness();
});

$('refreshPilotButton').addEventListener('click', loadReadiness);
$('scenarioCode').addEventListener('change', renderScenarioGuide);
$('executionMode').addEventListener('change', renderScenarioGuide);

async function initialize() {
  const access = await window.RoleAccess.requireRole(
    db,
    ADMIN_ROLES,
    '../'
  );
  if (!access) return;
  populateScenarios();
  renderScenarioGuide();
  await loadReadiness();
}

initialize();
