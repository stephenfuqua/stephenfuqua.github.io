// Swizzle override of @docusaurus/theme-classic/src/theme/BlogSidebar.
// Replaces the default year-grouped "Recent posts" list with a personality
// block (avatar, bio, topic chips).
import React from 'react';
import Link from '@docusaurus/Link';
import { bio } from './bio';
import styles from './styles.module.css';

export default function BlogSidebar() {
  return (
    <aside
      className={styles.sidebar}
      aria-label={`About ${bio.name}`}
    >
      <img
        className={styles.avatar}
        src={bio.avatarSrc}
        alt={bio.avatarAlt}
        width={120}
        height={120}
      />
      <h2 className={styles.name}>{bio.name}</h2>
      <p className={styles.tagline}>{bio.tagline}</p>
      <p className={styles.paragraph}>{bio.paragraph}</p>
      <ul className={styles.chips} aria-label="Topics">
        {bio.chips.map((chip) => (
          <li key={chip.href}>
            <Link className={styles.chip} to={chip.href}>
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
