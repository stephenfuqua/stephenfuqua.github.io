#!/usr/bin/env node
// Walks blog/ and emits tag-classification.csv with one row per post.
// The author reviews the CSV and edits proposed_tag before apply-tags.js
// consumes it. This script never modifies post files.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import matter from 'gray-matter';
import { classify } from './lib/classifier.js';
import { stringifyCsv } from './lib/csv.js';

const BLOG_DIR = resolve('blog');
const OUTPUT = resolve('tag-classification.csv');
const SNIPPET_CHARS = 500;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function snippet(body) {
  return body.replace(/\s+/g, ' ').trim().slice(0, SNIPPET_CHARS);
}

async function main() {
  const files = await walk(BLOG_DIR);
  const rows = [];
  for (const filepath of files) {
    const raw = await readFile(filepath, 'utf8');
    const parsed = matter(raw);
    const title = parsed.data.title ?? '';
    const snip = snippet(parsed.content);
    const proposed = classify({ title, snippet: snip });
    const currentTags = Array.isArray(parsed.data.tags)
      ? parsed.data.tags.join(';')
      : '';
    rows.push({
      filepath: relative(process.cwd(), filepath).replace(/\\/g, '/'),
      title,
      current_tags: currentTags,
      proposed_tag: proposed,
      first_paragraph_snippet: snip,
    });
  }
  rows.sort((a, b) => a.filepath.localeCompare(b.filepath));
  const csv = stringifyCsv(rows, [
    'filepath',
    'title',
    'current_tags',
    'proposed_tag',
    'first_paragraph_snippet',
  ]);
  await writeFile(OUTPUT, csv, 'utf8');
  console.log(`Wrote ${rows.length} rows to ${relative(process.cwd(), OUTPUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
