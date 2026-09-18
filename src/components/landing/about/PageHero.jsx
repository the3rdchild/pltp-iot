import PropTypes from 'prop-types';

import styles from './PageHero.module.css';

export default function PageHero({ eyebrow, title, lead }) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
      </div>
    </section>
  );
}

PageHero.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.node.isRequired,
  lead: PropTypes.node
};
