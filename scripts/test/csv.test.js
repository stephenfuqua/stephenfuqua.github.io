import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, stringifyCsv } from '../lib/csv.js';

test('parseCsv: plain rows', () => {
  const input = 'a,b,c\n1,2,3\n4,5,6\n';
  assert.deepEqual(parseCsv(input), [
    { a: '1', b: '2', c: '3' },
    { a: '4', b: '5', c: '6' },
  ]);
});

test('parseCsv: quoted field with comma', () => {
  const input = 'a,b\n"x,y",z\n';
  assert.deepEqual(parseCsv(input), [{ a: 'x,y', b: 'z' }]);
});

test('parseCsv: quoted field with escaped quote', () => {
  const input = 'a\n"he said ""hi"""\n';
  assert.deepEqual(parseCsv(input), [{ a: 'he said "hi"' }]);
});

test('parseCsv: quoted field with embedded newline', () => {
  const input = 'a,b\n"line1\nline2",z\n';
  assert.deepEqual(parseCsv(input), [{ a: 'line1\nline2', b: 'z' }]);
});

test('stringifyCsv: quotes fields containing comma, quote, or newline', () => {
  const rows = [{ a: 'x,y', b: 'he said "hi"', c: 'line1\nline2' }];
  const out = stringifyCsv(rows, ['a', 'b', 'c']);
  assert.equal(out, 'a,b,c\n"x,y","he said ""hi""","line1\nline2"\n');
});

test('stringifyCsv + parseCsv: round-trip', () => {
  const rows = [
    { name: 'alpha', note: 'simple' },
    { name: 'beta', note: 'has, comma' },
    { name: 'gamma', note: 'has "quote"' },
  ];
  const parsed = parseCsv(stringifyCsv(rows, ['name', 'note']));
  assert.deepEqual(parsed, rows);
});
