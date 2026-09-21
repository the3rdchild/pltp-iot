import PropTypes from 'prop-types';

import styles from './Article.module.css';

/**
 * A set-aside note. `tone="warning"` is for a consequence the reader should not
 * skim past; everything else uses the default.
 *
 * The label is a word, not an emoji: the old articles opened these boxes with
 * 💡, ⚠️ and 🎯, which a screen reader announces by name and which sit oddly in
 * an academic register.
 */
export default function Callout({ label, tone = 'note', children }) {
  return (
    <aside className={`${styles.callout} ${tone === 'warning' ? styles.calloutWarning : ''}`}>
      {label && <p className={styles.calloutLabel}>{label}</p>}
      <div className={styles.calloutBody}>{children}</div>
    </aside>
  );
}

Callout.propTypes = {
  label: PropTypes.string,
  tone: PropTypes.oneOf(['note', 'warning']),
  children: PropTypes.node
};
