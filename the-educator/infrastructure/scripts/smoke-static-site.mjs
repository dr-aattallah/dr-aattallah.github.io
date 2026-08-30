#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const repoRoot = process.cwd();
const host = '127.0.0.1';

const routes = [
  '/the-educator/',
  '/the-educator/learning/',
  '/the-educator/learning/courses/cpcs351/',
  '/the-educator/learning/courses/cpcs351/resources/',
  '/the-educator/learning/courses/cpcs351/weeks/01-introduction/',
  '/the-educator/learning/courses/cpcs351/weeks/02-software-quality/',
  '/the-educator/learning/courses/cpcs351/weeks/03-system-engineering/',
  '/the-educator/learning/courses/cpcs351/weeks/04-process-and-methodology/',
  '/the-educator/learning/courses/cpcs351/weeks/05-software-requirements-elicitation/',
  '/the-educator/learning/courses/cpcs351/weeks/06-deriving-use-cases-from-requirements/',
  '/the-educator/learning/courses/cpcs351/weeks/07-architectural-design-and-software-design-principles/',
  '/the-educator/learning/courses/cpcs351/weeks/08-domain-modeling-and-uml-class-diagram/',
  '/the-educator/learning/courses/cpcs351/weeks/09-object-interaction-modeling/',
  '/the-educator/learning/courses/cpcs351/weeks/10-activity-modeling/',
  '/the-educator/learning/courses/cpcs351/weeks/11-modeling-interactions-and-behavior-revision/',
  '/the-educator/learning/courses/cpcs351/weeks/12-responsibility-assignment-patterns/',
  '/the-educator/learning/courses/cpcs351/weeks/13-software-testing/',
  '/the-educator/attendance/',
  '/the-educator/attendance/admin/',
  '/the-educator/attendance/admin/courses.html',
  '/the-educator/attendance/admin/live-session.html',
  '/the-educator/attendance/admin/reports.html',
  '/the-educator/attendance/student/',
  '/the-educator/attendance/checkin/',
  '/the-educator/classroom/',
  '/the-educator/classroom/login.html',
  '/the-educator/classroom/dashboard.html',
  '/the-educator/classroom/course.html',
  '/the-educator/classroom/gradebook.html',
  '/the-educator/classroom/students.html',
  '/the-educator/classroom/help.html',
  '/the-educator/practice/',
  '/the-educator/login.html',
  '/the-educator/help.html',
  '/the-educator/reset-password.html'
];

const compatibility = new Map([
  ['/the-educator/login.html', 'classroom/login.html'],
  ['/the-educator/help.html', 'classroom/help.html'],
  ['/the-educator/reset-password.html', 'classroom/reset-password.html']
]);

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return ({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'})[ext] || 'application/octet-stream';
}

function resolveRequest(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath.split('?')[0]); } catch { return null; }
  if (decoded.includes('\0')) return null;
  const abs = path.resolve(repoRoot, '.' + decoded);
  if (!abs.startsWith(repoRoot + path.sep) && abs !== repoRoot) return null;
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return path.join(abs, 'index.html');
  return abs;
}

const server = http.createServer((req, res) => {
  const file = resolveRequest(req.url || '/');
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, {'content-type':'text/plain; charset=utf-8'});
    res.end('Not found');
    return;
  }
  res.writeHead(200, {'content-type': contentType(file)});
  fs.createReadStream(file).pipe(res);
});

await new Promise(resolve => server.listen(0, host, resolve));
const { port } = server.address();
const base = `http://${host}:${port}`;
const failures = [];
let checked = 0;

try {
  for (const route of routes) {
    const response = await fetch(base + route, { redirect: 'manual' });
    const text = await response.text();
    checked++;
    if (response.status !== 200) {
      failures.push(`${route}: HTTP ${response.status}`);
      continue;
    }
    if (!text.trim()) failures.push(`${route}: empty response`);
    if (route.endsWith('.html') || route.endsWith('/')) {
      if (!/<html\b|<!doctype\s+html/i.test(text)) failures.push(`${route}: response is not recognizable HTML`);
    }
    const target = compatibility.get(route);
    if (target && !text.includes(target)) failures.push(`${route}: compatibility target ${target} not found`);
  }
} finally {
  await new Promise(resolve => server.close(resolve));
}

console.log(`Smoke-tested ${checked} critical routes through a local HTTP server.`);
if (failures.length) {
  console.error(`Found ${failures.length} smoke-test failure(s):`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log('All critical Learning, Attendance, Classroom, Practice and compatibility routes passed.');
