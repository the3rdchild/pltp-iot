import { partners } from '../data/content';
import styles from './PartnerLogos.module.css';

export default function PartnerLogos() {
  return (
    <ul className={styles.grid}>
      {partners.map((partner) => (
        <li key={partner.name} className={styles.item}>
          <img src={partner.logo} alt="" className={styles.logo} loading="lazy" />
          <p className={styles.name}>{partner.name}</p>
        </li>
      ))}
    </ul>
  );
}
