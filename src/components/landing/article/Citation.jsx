import PropTypes from 'prop-types';

import styles from './Article.module.css';

/**
 * A numbered citation that jumps to its entry in the reference list.
 *
 * An anchor, not the `<sup onClick>` the old articles used: that version was
 * invisible to the keyboard and scrolled by mutating `element.style` directly.
 * The `:target` highlight now lives in CSS.
 */
export default function Citation({ num }) {
  return (
    <a className={styles.citation} href={`#ref-${num}`} aria-label={`Rujukan ${num}`}>
      [{num}]
    </a>
  );
}

Citation.propTypes = { num: PropTypes.number.isRequired };
