# Migration Plan: Jekyll to Docusaurus

<!--
Prompt: This blog currently uses Jekyll and I want to convert it to use Docusaurus
instead. Develop a plan for how to make this change. Save the plan to a file called
migration-plan.md.
-->

Create a `git commit` after every step below.

## 1. Set up a new Docusaurus project
- Initialize a new Docusaurus site in a separate directory.
- Choose the classic template for a blog/documentation site.

## 2. Configure site metadata
- Update `docusaurus.config.js` with your site title, URL, favicon, and other metadata from `_config.yml`.

## 3. Migrate blog posts
- Convert all Markdown files from `_posts/` (and possibly `_drafts/`) to the Docusaurus `/blog` directory.
- Rename files to the Docusaurus format: `YYYY-MM-DD-title.md`.
- Update front matter: Docusaurus uses YAML front matter, but you may need to adjust fields (e.g., `layout`, `tags`, `categories`).

## 4. Migrate BDD
- Add a new `plugin-content-docs` plugin to `docusaurus.config.js` with id `bdd` and path `best-practices-tdd-oo`.
- Remove `best-practices-tdd-oo/index.html` and rename `intro.md` to `readme.md`.
- Adjust front matter and internal links as needed in the `best-practices-tdd-oo` directory.

## 5. Migrate static assets
- Copy images and other static files from `images/`, `archive/`, etc., to the `/static` directory in Docusaurus.

## 6. Migrate data and tags
- If you use `_data/tags.yml` or similar, convert this to Docusaurus tags (add `tags` in front matter of blog posts).
- For custom data, consider using JSON/YAML in `/src/data` or as needed.

## 7. Recreate layouts and includes
- Docusaurus uses React components for layouts. Recreate any custom includes or layouts (e.g., sidebar, header, footer) as React components in `/src/components`.
- Update the theme as needed to match your previous design.

## 8. Configure navigation and sidebar
- Update `sidebars.js` and navigation in `docusaurus.config.js` to reflect your site structure.

<!-- ## 9. Set up redirects
- If you have old URLs (e.g., from Jekyll permalinks), use the Docusaurus plugin for client-side redirects. -->

## 10. Test locally
- Run the Docusaurus dev server and verify that all content, links, and assets work as expected.

## 11. Deploy
- Create a GitHub Actions workflow to run on pull request, testing the build process.
- Create a GitHUb Actions workflow to run on merge to `main`, building and deploying the site.
