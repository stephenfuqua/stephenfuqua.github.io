import matter from 'gray-matter';

// Adds `tag` to the `tags` array in the frontmatter of `raw` and returns the
// rewritten file text. Idempotent: if `tag` is already present, returns `raw`
// unchanged. If the file has no frontmatter, a minimal one is prepended.
export function addTag(raw, tag) {
  const parsed = matter(raw);
  const existing = Array.isArray(parsed.data.tags) ? parsed.data.tags : [];
  if (existing.includes(tag)) {
    return raw;
  }
  const newData = { ...parsed.data, tags: [...existing, tag] };
  return matter.stringify(parsed.content, newData);
}
