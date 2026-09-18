import { samplingMethods } from '../data/content';
import { ArrowLink } from '../ui/Button';
import { Section, SectionHead } from '../ui/Section';
import styles from './Sampling.module.css';

export default function Sampling() {
  return (
    <Section id="sampling" tone="paper">
      <SectionHead
        eyebrow="Di lapangan"
        title="Bagaimana angkanya diambil"
        lead="Setiap parameter punya cara pengukurannya sendiri. Inilah yang jadi rujukan sekaligus bahan pembanding untuk model AI."
      />

      <ul className={styles.list}>
        {samplingMethods.map((method) => (
          <li key={method.title} className={styles.row}>
            <figure className={styles.figure}>
              <img src={method.image} alt={method.alt} loading="lazy" />
            </figure>

            <div>
              <h3 className={styles.title}>{method.title}</h3>
              <p className={styles.text}>{method.text}</p>
              <ArrowLink href={method.href}>Lihat prosedurnya</ArrowLink>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
