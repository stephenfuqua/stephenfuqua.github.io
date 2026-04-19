import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from '../lib/classifier.js';

test('nature: birding post classifies as nature', () => {
  const result = classify({
    title: 'Spring Warblers at Hornsby Bend',
    snippet: 'Went birding this weekend and saw a dozen warblers along the trails.',
  });
  assert.equal(result, 'nature');
});

test('nature: hiking / trails keywords', () => {
  const result = classify({
    title: 'A long hike',
    snippet: 'The trails at the state park were beautiful this weekend.',
  });
  assert.equal(result, 'nature');
});

test("bahai-faith: Bahá'í keywords", () => {
  const result = classify({
    title: "Reflections on the Bahá'í Writings",
    snippet: "Abdu'l-Bahá speaks here about the unity of humanity and prayer.",
  });
  assert.equal(result, 'bahai-faith');
});

test('bahai-faith: faith/spiritual keywords without diacritics', () => {
  const result = classify({
    title: 'A Spiritual Reflection',
    snippet: 'The Bahai teachings on unity of religion speak to our time.',
  });
  assert.equal(result, 'bahai-faith');
});

test('technology: default when no bucket keywords match', () => {
  const result = classify({
    title: 'A Rambling Essay',
    snippet: 'I was thinking about lots of things today with no particular theme.',
  });
  assert.equal(result, 'technology');
});

test('technology: explicit dev keywords', () => {
  const result = classify({
    title: 'Refactoring a Python script',
    snippet: 'I was debugging a function and decided to extract it into a module.',
  });
  assert.equal(result, 'technology');
});

test('precedence: nature keyword beats technology default', () => {
  const result = classify({
    title: 'Weekend notes',
    snippet: 'Saw a scissor-tailed flycatcher on my hike yesterday.',
  });
  assert.equal(result, 'nature');
});

test('precedence: faith keyword beats technology default', () => {
  const result = classify({
    title: 'Morning thoughts',
    snippet: 'I was reflecting on prayer and what it means to be a Bahai.',
  });
  assert.equal(result, 'bahai-faith');
});
