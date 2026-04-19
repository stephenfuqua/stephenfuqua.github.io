// Keyword-based post classifier. Deterministic, case-insensitive.
// Bucket precedence: nature > bahai-faith > technology (default).
// The author reviews the CSV output before any tags are applied,
// so 100% accuracy is not the goal — good-enough-to-reduce-tedium is.

const NATURE_PATTERNS = [
  /\bbird(s|ing|er|ers)?\b/i,
  /\bhik(e|es|ing)\b/i,
  /\btrail(s)?\b/i,
  /\bebird\b/i,
  /\bpark(s)?\b/i,
  /\bclimate\b/i,
  /\bwarbler(s)?\b/i,
  /\bflycatcher(s)?\b/i,
  /\bnature\b/i,
  /\bwildlife\b/i,
  /\bspecies\b/i,
  /\bforest(s)?\b/i,
  /\briver(s)?\b/i,
  /\bhornsby\b/i,
];

const FAITH_PATTERNS = [
  /bahá'í/i,
  /bahai/i,
  /abdu'l-bahá/i,
  /abdul-baha/i,
  /\bprayer\b/i,
  /\bspiritual\b/i,
  /\bwritings\b/i,
  /\bunity of religion\b/i,
  /\bfaith\b/i,
  /\bsoul\b/i,
  /\bgod\b/i,
];

function anyMatch(text, patterns) {
  return patterns.some((re) => re.test(text));
}

export function classify({ title, snippet }) {
  const text = `${title ?? ''}\n${snippet ?? ''}`;
  if (anyMatch(text, NATURE_PATTERNS)) return 'nature';
  if (anyMatch(text, FAITH_PATTERNS)) return 'bahai-faith';
  return 'technology';
}
