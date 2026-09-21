import PropTypes from 'prop-types';

import styles from './Article.module.css';

/**
 * Reference list. Entries are indexed from 1 so the anchor a `Citation` points
 * at matches the number a reader sees.
 */
export default function References({ id = 'dafpus', entries }) {
  return (
    <section id={id} className={styles.references}>
      <h2 className={styles.referencesHeading}>Daftar Pustaka</h2>
      <ol className={styles.referenceList}>
        {entries.map((entry, index) => (
          <li key={entry.title} id={`ref-${index + 1}`} className={styles.reference}>
            <span className={styles.referenceNumber}>[{index + 1}]</span>
            <span>
              {entry.author} <cite>{entry.title}</cite>
              {entry.source ? `. ${entry.source}` : ''}
              {entry.year ? `, ${entry.year}.` : '.'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

References.propTypes = {
  id: PropTypes.string,
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      author: PropTypes.string,
      title: PropTypes.string.isRequired,
      source: PropTypes.string,
      year: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ).isRequired
};
