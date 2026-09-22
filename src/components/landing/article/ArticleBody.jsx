import { useMemo } from 'react';
import PropTypes from 'prop-types';

import { Section } from '../ui/Section';
import useActiveSection from './useActiveSection';
import styles from './Article.module.css';

/**
 * Reference-style body: a sticky contents rail beside a single column.
 *
 * Used by the articles and by the two long public pages (cara kerja PLTP and
 * about), which is why the children are free-form rather than article-shaped.
 *
 * The rail is plain anchors, so it works without JavaScript, is reachable by
 * keyboard, and lets the browser own the scrolling; `scroll-margin-top` keeps
 * a heading clear of the sticky header. What JavaScript adds on top is only
 * the highlight marking where the reader currently is.
 */
export default function ArticleBody({ sections, chapters = false, children }) {
  const ids = useMemo(() => sections.map((section) => section.id), [sections]);
  const active = useActiveSection(ids);

  return (
    <Section tone="paper">
      <div className={styles.layout}>
        <nav className={styles.toc} aria-label="Daftar isi">
          <p className={styles.tocHeading}>Daftar isi</p>
          <ul className={styles.tocList}>
            {sections.map((section) => {
              const current = section.id === active;

              return (
                <li key={section.id}>
                  <a
                    className={`${styles.tocLink} ${current ? styles.tocLinkActive : ''}`}
                    href={`#${section.id}`}
                    aria-current={current ? 'true' : undefined}
                  >
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`${styles.body} ${chapters ? styles.bodyChapters : ''}`}>{children}</div>
      </div>
    </Section>
  );
}

ArticleBody.propTypes = {
  /** Set on pages whose sections are chapters, not steps of one argument. */
  chapters: PropTypes.bool,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  children: PropTypes.node
};
