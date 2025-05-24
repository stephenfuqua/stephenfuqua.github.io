// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Stephen A. Fuqua (safnet) - Blog",
  tagline: "Stephen A. Fuqua (SAF) is a Bahá'í, software engineer, and nature lover in Austin, Texas, USA.",
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
          sidebarPath: "./sidebars.js",
          path: "./best-practices-tdd-oo",
          routeBasePath: "best-practices-tdd-oo",
          editUrl:
            "https://github.com/stephenfuqua/stephenfuqua.github.io/tree/main/best-practices-tdd-oo",
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
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
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
        //   { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/stephenfuqua",
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://linkedin.com/stephenfuqua",
            label: "LinkedIn",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
        //   {
        //     title: "Docs",
        //     items: [
        //       {
        //         label: "Tutorial",
        //         to: "/docs/intro",
        //       },
        //     ],
        //   },
        //   {
        //     title: "Community",
        //     items: [
        //       {
        //         label: "Stack Overflow",
        //         href: "https://stackoverflow.com/questions/tagged/docusaurus",
        //       },
        //       {
        //         label: "Discord",
        //         href: "https://discordapp.com/invite/docusaurus",
        //       },
        //       {
        //         label: "Twitter",
        //         href: "https://twitter.com/stephen_fuqua",
        //       },
        //     ],
        //   },
        //   {
        //     title: "More",
        //     items: [
        //       {
        //         label: "Blog",
        //         to: "/blog",
        //       },
        //       {
        //         label: "GitHub",
        //         href: "https://github.com/stephenfuqua",
        //       },
        //     ],
        //   },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Stephen A. Fuqua. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['powershell', 'csharp', 'sql', 'json', 'ini', 'bash'],
      },
    }),
    markdown: {
      mermaid: true,
    },
    themes: ['@docusaurus/theme-mermaid'],
};

export default config;
