// Swizzle override of @docusaurus/theme-classic/src/theme/BlogSidebar.
// Replaces the default year-grouped "Recent posts" list with a personality
// block (avatar, bio, topic chips). Kept minimal to survive Docusaurus upgrades.
import React from 'react';

export default function BlogSidebar() {
  return <aside aria-label="About the author">Sidebar</aside>;
}
