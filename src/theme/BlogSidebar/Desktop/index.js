// import React from 'react';
// import Desktop from '@theme-original/BlogSidebar/Desktop';

import React, { memo } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import { translate } from "@docusaurus/Translate";
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from "@docusaurus/plugin-content-blog/client";
import BlogSidebarContent from "@theme/BlogSidebar/Content";

import styles from "./styles.module.css";

const Bio = function () {
  return (
    <>
      <img
        className={styles.avatar}
        src="/img/author-avatar.webp"
        alt="Stephen A. Fuqua"
        width={120}
        height={120}
      />
      <p>
        I write about{" "}
        <Link to="/tags/technology">
          technology
        </Link>
        ,{" "}
        <Link to="/tags/nature">
          nature
        </Link>
        , the{" "}
        <Link to="/tags/bahai-faith">
          Bahá'í Faith
        </Link>
        , and{" "}
        <Link to="/tags">
          other topics
        </Link>
        . This has been my public notebook since 2003 — equal parts technical
        journal, social essays, and personal reflections.
      </p>
    </>
  );
};

const ListComponent = ({ items }) => {
  return (
    <BlogSidebarItemList
      items={items}
      ulClassName={clsx(styles.sidebarItemList, "clean-list")}
      liClassName={styles.sidebarItem}
      linkClassName={styles.sidebarItemLink}
      linkActiveClassName={styles.sidebarItemLinkActive}
    />
  );
};

function BlogSidebarDesktop({ sidebar }) {
  const items = useVisibleBlogSidebarItems(sidebar.items);
  return (
    <>
      <aside className="col col--3">
        <nav
          className={clsx(styles.sidebar, "thin-scrollbar")}
          aria-label={translate({
            id: "theme.blog.sidebar.navAriaLabel",
            message: "Blog recent posts navigation",
            description: "The ARIA label for recent posts in the blog sidebar",
          })}
        >
          <Bio />
          <div className={clsx(styles.sidebarItemTitle, "margin-bottom--md")}>
            {sidebar.title}
          </div>
          <BlogSidebarContent
            items={items}
            ListComponent={ListComponent}
            yearGroupHeadingClassName={styles.yearGroupHeading}
          />
        </nav>
      </aside>
    </>
  );
}

export default memo(BlogSidebarDesktop);
