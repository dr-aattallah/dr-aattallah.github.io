const assert = require('node:assert/strict');
const test = require('node:test');
const readiness = require('../js/pilot-readiness.js');

test('reports ready after all scenarios pass without data issues', () => {
  const result = readiness.calculateReadiness(
    {duplicates: 0, orphans: 0},
    {passed_checks: Object.keys(readiness.SCENARIOS).length}
  );
  assert.equal(result.state, 'جاهز للتعميم');
  assert.equal(result.score, 100);
});

test('reduces readiness for unresolved data issues', () => {
  const result = readiness.calculateReadiness(
    {duplicates: 3, orphans: 1},
    {passed_checks: 0}
  );
  assert.equal(result.state, 'يحتاج معالجة قبل التجربة');
  assert.ok(result.score < 70);
});

test('does not count repeated passes as distinct scenario coverage', () => {
  const result = readiness.calculateReadiness(
    {},
    {
      passed_checks: 9,
      passed_scenarios: 1,
      required_scenarios: 9
    }
  );
  assert.equal(result.state, 'يحتاج معالجة قبل التجربة');
  assert.equal(result.score, 75);
});

test('latest failed scenario prevents rollout readiness', () => {
  const result = readiness.calculateReadiness(
    {},
    {
      passed_checks: 20,
      passed_scenarios: 8,
      required_scenarios: 9
    }
  );
  assert.notEqual(result.state, 'جاهز للتعميم');
});

test('classifies health issue severity', () => {
  assert.equal(readiness.issueTone(0), 'good');
  assert.equal(readiness.issueTone(2), 'warning');
  assert.equal(readiness.issueTone(3), 'bad');
});
