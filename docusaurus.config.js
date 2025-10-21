// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Stephen A. Fuqua - Blog",
  tagline:
    "Stephen A. Fuqua (SAF) is a Bahá'í, software engineer, and nature lover in Austin, Texas, USA.",
  favicon: "img/BHCU-logo-safnet-small.webp",

  // Set the production url of your site here
  url: "https://blog.safnet.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "stephenfuqua", // Usually your GitHub org/user name.
  projectName: "stephenfuqua.github.io", // Usually your repo name.

  onBrokenLinks: "warn", //"throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          id: "docs",
          sidebarPath: "./sidebars.js",
          editUrl: ({ docPath }) =>
            `https://github.com/stephenfuqua/stephenfuqua.github.io/tree/main/docs/${docPath}`,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          path: "./blog",
          routeBasePath: "/",
          editUrl:
            "https://github.com/stephenfuqua/stephenfuqua.github.io/tree/main/blog",
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
          blogDescription:
            "Stephen A. Fuqua writes about technology, the natural world, and religion.",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "tdd",
        path: "./best-practices-tdd-oo",
        routeBasePath: "best-practices-tdd-oo",
        editUrl: ({ docPath }) =>
          `https://github.com/stephenfuqua/stephenfuqua.github.io/tree/main/best-practices-tdd-oo/${docPath}`,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "Stephen A. Fuqua",
        logo: {
          alt: "Stephen A. Fuqua Logo",
          src: "img/BHCU-logo-safnet-small-darktheme.webp",
        },
        items: [
          { to: "/", label: "Blog", position: "left" },
          { to: "/about", label: "About", position: "left" },
          {
            href: "https://github.com/stephenfuqua",
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://linkedin.com/in/stephenfuqua",
            label: "LinkedIn",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        logo: {
          alt: "Stephen A. Fuqua Logo",
          src: "img/BHCU-logo-safnet-small-darktheme.webp",
        },
        links: [
          {
            title: "Blog",
            items: [
              {
                label: "Latest Posts",
                to: "/",
              },
              {
                label: "Archive",
                to: "/archive",
              },
              {
                label: "Tags",
                to: "/tags",
              },
            ],
          },
          {
            title: "Other Sites",
            items: [
              {
                label: "South Central Regional Training Institute",
                href: "https://www.southcentralrti.org",
              },
              {
                label: "Green Bahá'í",
                href: "https://www.greenbahai.com",
              },
              {
                label: "InterfaithNews.Net (in memoriam)",
                href: "https://www.safnet.com/inn/",
              },
            ],
          },
        ],
        copyright: `
                <p>The information on this site, unless otherwise attributed, is the sole opinion of its author and should not be construed
                as reflecting the views of any organization or employer unless explicitly stated.</p>
                <p>Copyright © ${new Date().getFullYear()} Stephen A. Fuqua. Built with Docusaurus. Content and design are published under
                the <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution - ShareAlike 4.0 License</a>.
                Unless otherwise stated or granted, source code is licensed under the <a href="/LICENSE">MIT license</a>.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: [
          "powershell",
          "csharp",
          "sql",
          "json",
          "ini",
          "bash",
        ],
      },
    }),
  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap",
      },
    },
  ],
  stylesheets: [
    {
      href: "https://unpkg.com/@antonz/codapi@0.19.7/dist/snippet.css",
    },
  ],
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],
};

export default config;
