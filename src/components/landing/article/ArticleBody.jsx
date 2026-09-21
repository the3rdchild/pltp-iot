import PropTypes from 'prop-types';

import { Section } from '../ui/Section';
import styles from './Article.module.css';

/**
 * Reference-style article body: a sticky contents rail beside the prose.
 *
 * The rail is a list of plain anchors rather than the scroll-spy the old
 * articles ran. Native anchors work without JavaScript, are reachable by
 * keyboard, and let the browser own the scrolling; `scroll-margin-top` keeps a
 * heading clear of the sticky header.
 */
export default function ArticleBody({ sections, children }) {
  return (
    <Section tone="paper">
      <div className={styles.layout}>
        <nav className={styles.toc} aria-label="Daftar isi">
          <p className={styles.tocHeading}>Daftar isi</p>
          <ul className={styles.tocList}>
            {sections.map((section) => (
              <li key={section.id}>
                <a className={styles.tocLink} href={`#${section.id}`}>
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.body}>{children}</div>
      </div>
    </Section>
  );
}

ArticleBody.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  children: PropTypes.node
};
