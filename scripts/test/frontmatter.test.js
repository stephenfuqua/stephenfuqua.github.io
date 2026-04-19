import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTag } from '../lib/frontmatter.js';

test('adds tag to existing list', () => {
  const input = `---
title: Hello
tags:
- programming
---

Body text.
`;
  const out = addTag(input, 'technology');
  assert.match(out, /tags:\n  - programming\n  - technology\n/);
  assert.match(out, /\nBody text\.\n/);
});

test('is idempotent when tag already present', () => {
  const input = `---
title: Hello
tags:
- technology
- programming
---

Body.
`;
  const out = addTag(input, 'technology');
  assert.equal(out, input);
});

test('creates tags list when none exists', () => {
  const input = `---
title: Hello
date: 2020-01-01
---

Body.
`;
  const out = addTag(input, 'nature');
  assert.match(out, /tags:\n  - nature\n/);
  assert.match(out, /title: Hello/);
  assert.match(out, /date: 2020-01-01/);
});

test('preserves body verbatim', () => {
  const body = '\n# Heading\n\nParagraph with --- triple dashes inside.\n';
  const input = `---
title: Hello
tags:
- a
---${body}`;
  const out = addTag(input, 'technology');
  assert.ok(out.endsWith(body));
});

test('handles file with no frontmatter by prepending one', () => {
  const input = 'Just a body, no frontmatter.\n';
  const out = addTag(input, 'technology');
  assert.match(out, /^---\ntags:\n  - technology\n---\n/);
  assert.ok(out.endsWith('Just a body, no frontmatter.\n'));
});
