import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

function pages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return pages(target);
    if (
      entry.name.endsWith('.html') &&
      entry.name !== 'ADMIN_INDEX_PATCH.html'
    ) {
      return [target];
    }
    return [];
  });
}

const htmlPages = pages(root);

test('all product pages provide the structural accessibility baseline', () => {
  const failures = [];

  for (const file of htmlPages) {
    const html = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file);
    const checks = [
      [/<html[^>]+\blang="[^"]+"/i, 'document language'],
      [/<meta[^>]+name="viewport"/i, 'responsive viewport'],
      [/<title>[^<]+<\/title>/i, 'page title'],
      [/<main\b/i, 'main landmark'],
      [/<h1\b/i, 'primary heading'],
      [/iso-accessibility\.js/i, 'shared accessibility runtime']
    ];

    for (const [pattern, label] of checks) {
      if (!pattern.test(html)) failures.push(`${relative}: missing ${label}`);
    }

    const ids = [...html.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length) {
      failures.push(
        `${relative}: duplicate ids ${[...new Set(duplicates)].join(', ')}`
      );
    }
  }

  assert.deepEqual(failures, []);
});

test('all static buttons declare their behavior', () => {
  const failures = [];

  for (const file of htmlPages) {
    const html = fs.readFileSync(file, 'utf8');
    const buttons = html.match(/<button\b[^>]*>/gi) || [];
    for (const button of buttons) {
      if (!/\btype="(?:button|submit|reset)"/i.test(button)) {
        failures.push(`${path.relative(root, file)}: ${button}`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

test('all pages are covered by the audit', () => {
  assert.ok(htmlPages.length >= 30);
});
