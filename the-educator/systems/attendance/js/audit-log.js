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

function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(new Date(value));
}

function appendCell(row, value, className = '') {
  const cell = document.createElement('td');
  if (className) cell.className = className;
  cell.textContent = value || '—';
  row.appendChild(cell);
}

function renderRows(rows) {
  const body = $('auditTableBody');
  body.innerHTML = '';
  $('auditCount').textContent = String(rows.length);
  $('lastRefresh').textContent = new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());

  if (!rows.length) {
    $('auditMessage').className = 'audit-message';
    $('auditMessage').textContent = 'لا توجد عمليات مطابقة للمرشحات.';
    $('auditTableWrap').classList.add('is-hidden');
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement('tr');
    appendCell(row, formatDateTime(item.occurred_at));

    const actionCell = document.createElement('td');
    const action = document.createElement('span');
    action.className = 'audit-action';
    action.textContent = window.AuditLogFormat.actionLabel(item.action);
    actionCell.appendChild(action);
    row.appendChild(actionCell);

    appendCell(row, item.actor_email || item.actor_role || 'النظام');
    appendCell(row, item.course_code);
    appendCell(row, item.session_id || item.entity_id);
    appendCell(row, item.student_university_id);
    appendCell(
      row,
      window.AuditLogFormat.summarizeDetails(item.details),
      'audit-details'
    );
    body.appendChild(row);
  });

  $('auditMessage').classList.add('is-hidden');
  $('auditTableWrap').classList.remove('is-hidden');
}

async function loadAudit() {
  $('refreshAuditButton').disabled = true;
  $('auditMessage').className = 'audit-message';
  $('auditMessage').textContent = 'جارٍ تحميل السجل...';
  $('auditTableWrap').classList.add('is-hidden');

  const action = $('actionFilter').value || null;
  const course = $('courseFilter').value.trim() || null;
  const limit = Number($('limitFilter').value) || 200;
  const {data, error} = await db.rpc('admin_list_attendance_audit', {
    p_limit: limit,
    p_action: action,
    p_course_code: course
  });

  $('refreshAuditButton').disabled = false;
  if (error) {
    $('auditMessage').className = 'audit-message error';
    $('auditMessage').textContent =
      error.message || 'تعذر تحميل سجل التدقيق.';
    return;
  }
  renderRows(Array.isArray(data) ? data : []);
}

function populateActions() {
  Object.entries(window.AuditLogFormat.ACTION_LABELS).forEach(
    ([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      $('actionFilter').appendChild(option);
    }
  );
}

async function initialize() {
  const access = await window.RoleAccess.requireRole(
    db,
    ADMIN_ROLES,
    '../'
  );
  if (!access) return;
  populateActions();
  await loadAudit();
}

$('refreshAuditButton').addEventListener('click', loadAudit);
$('actionFilter').addEventListener('change', loadAudit);
$('limitFilter').addEventListener('change', loadAudit);
$('courseFilter').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') loadAudit();
});

initialize();
