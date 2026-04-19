# Blog Personality Sidebar — Design

**Date:** 2026-04-18
**Status:** Ready

## Problem

The blog home page at `blog.safnet.com` feels boring. The current Docusaurus default layout shows a year-grouped "Recent posts" list in the left sidebar and a stacked column of full post previews on the right. There is no sense of who the author is, no imagery, and no way to browse the author's three main topic areas (technology, nature, Bahá'í faith) as distinct lanes.

## Goal

Make a new visitor feel, within one screen, that this blog belongs to a specific person with specific interests — and give them an obvious way to jump to the topic that drew them in.

## Non-goals

* Restyling the post list (it remains stacked full-width previews).
* A typography or color palette overhaul.
* Adding imagery, cards, or thumbnails to individual posts.
* Any change to `/docs` or the `/best-practices-tdd-oo` plugin.
* Rebuilding the archive page (Section 5 below uses the built-in Docusaurus archive as-is).

## Design

### 1. Swizzled `BlogSidebar` — the identity layer

The `BlogSidebar` theme component is swizzled (via `npx docusaurus swizzle`, eject mode) and replaced with a personality block. The year-grouped recent-posts list that currently lives there disappears from the sidebar; the existing built-in `/archive` page absorbs that browsing role.

Sidebar contents, top to bottom:

1. **Avatar** — circular, ~120px, sourced from `static/img/author-avatar.webp`. A placeholder image ships with the change; the author replaces it with a real photo later.
2. **Name** — "Stephen A. Fuqua" (h2 or visually equivalent).
3. **Tagline** — one line, e.g. _"Software engineer, Bahá'í, nature lover in Austin, Texas."_ Drafted from the existing site tagline in `docusaurus.config.js`.
4. **Bio** — two to three sentences. Drafted from the existing `/about` page content; final wording chosen by the author.
5. **Topic chips** — three pill-shaped links in a row (wraps on narrow widths):
   * Technology → `/tags/technology`
   * Nature → `/tags/nature`
   * Bahá'í Faith → `/tags/bahai-faith`
6. **(Optional) Social links** — GitHub, LinkedIn. Deferred unless author wants them duplicated from the navbar.

The component lives at `src/theme/BlogSidebar/index.jsx` (or `.tsx`) with styles in a sibling `styles.module.css`. It is small, stateless, and contains a comment noting it is a swizzle override so future Docusaurus upgrades do not silently diverge.

### 2. Archive page

The existing Docusaurus-generated `/archive` page (already linked from the footer) remains unchanged. No `BlogArchivePage` swizzle in this project. If the plain archive feels too sparse once the sidebar changes ship, a follow-up can add year grouping and post counts.

### 3. Tag backfill — classification script

A one-time Node.js script at `scripts/classify-posts.js`:

1. Walks every `.md` and `.mdx` file under `blog/`.
2. Parses frontmatter with `gray-matter`.
3. Reads title plus roughly the first 500 characters of body text.
4. Classifies each post into exactly one bucket using keyword heuristics:
   * `nature` — birds, hiking, trails, eBird, parks, climate, species names, etc.
   * `bahai-faith` — Bahá'í, Abdu'l-Bahá, faith, prayer, spiritual, religion, Writings.
   * `technology` — default fallback, and matched explicitly by dev/software keywords.
5. Writes `tag-classification.csv` with columns `filepath, title, current_tags, proposed_tag, first_paragraph_snippet`.
6. Does **not** modify any post file.

The author reviews the CSV and edits the `proposed_tag` column for any misclassifications.

### 4. Tag backfill — apply script

A second script at `scripts/apply-tags.js`:

1. Reads the reviewed CSV.
2. For each row, loads the post file, parses frontmatter, and adds the bucket tag to the existing `tags` array. It never removes or replaces existing tags (`programming`, `austin`, etc. remain intact).
3. Runs in dry-run mode by default, printing a unified diff per file.
4. Requires `--write` to actually modify files on disk.
5. Preserves frontmatter key ordering and trailing newline conventions.

Each post ends up with exactly one of the three bucket tags; free-form tags it already carries are untouched.

### 5. Tag slugs are permanent

Once `/tags/technology`, `/tags/nature`, and `/tags/bahai-faith` are live, renaming them breaks inbound links and feed URLs. These three slugs are fixed as part of this design and will not change.

## File changes

* `src/theme/BlogSidebar/index.jsx` — new, swizzled component.
* `src/theme/BlogSidebar/styles.module.css` — new, scoped styles.
* `static/img/author-avatar.webp` — new, placeholder avatar image.
* `scripts/classify-posts.js` — new.
* `scripts/apply-tags.js` — new.
* `package.json` — adds `gray-matter` (and a CSV library if convenient) to dev dependencies.
* `blog/**/*.md` / `blog/**/*.mdx` — frontmatter updated with one bucket tag per post (via apply script, reviewed in git diff before commit).

## Risks and mitigations

* **Swizzle drift across Docusaurus upgrades.** Mitigation: keep the override minimal and stateless; add a header comment identifying it as a swizzle of `@docusaurus/theme-classic/src/theme/BlogSidebar`.
* **Classification errors.** Mitigation: CSV review step; dry-run default on apply; everything in git for easy revert.
* **Tag slug churn.** Mitigation: slugs fixed in this spec; changes require a follow-up spec with redirect plan.
* **Malformed frontmatter after apply.** Mitigation: `npm run build` is run after the apply step and must pass before committing; Docusaurus fails loudly on malformed frontmatter.

## Testing

* `npm run build` passes locally after all changes.
* Home page visually renders the new sidebar with avatar, name, tagline, bio, and three chips.
* Each chip navigates to a non-empty tag page.
* Spot-check ~10 random posts across different years to confirm frontmatter is valid and the existing tags were preserved.
* `/archive` still loads and lists posts.

## Open items for author

* Final bio wording (draft proposed by implementer, author edits).
* Real avatar image to replace placeholder.
* Whether to include GitHub/LinkedIn links in the sidebar (already in navbar).
