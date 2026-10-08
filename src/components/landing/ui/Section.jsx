import PropTypes from 'prop-types';

import styles from './Section.module.css';

/**
 * Section shell for the public site.
 *
 * `tone` picks the background band. Alternating bands down the page is
 * deliberate -- it is the only thing separating sections that would otherwise
 * look identical, so it belongs here rather than in each section's stylesheet.
 */
export function Section({ id, tone = 'paper', className = '', children }) {
  return (
    <section id={id} className={`${styles.section} ${styles[tone]} ${className}`}>
      <div className={styles.container}>{children}</div>
    </section>
  );
}

Section.propTypes = {
  id: PropTypes.string,
  tone: PropTypes.oneOf(['paper', 'alt', 'ink']),
  className: PropTypes.string,
  children: PropTypes.node
};

export function SectionHead({ eyebrow, title, lead, wide = false }) {
  return (
    <header className={`${styles.head} ${wide ? styles.headWide : ''}`}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 className={styles.title}>{title}</h2>
      {lead && <p className={styles.lead}>{lead}</p>}
    </header>
  );
}

SectionHead.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.node,
  lead: PropTypes.node,
  wide: PropTypes.bool
};

export const sectionStyles = styles;
