import { comparison } from '../data/content';
import { CheckIcon, ClockIcon } from '../icons';
import { Section, SectionHead } from '../ui/Section';
import styles from './Comparison.module.css';

export default function Comparison() {
  return (
    <Section id="mengapa" tone="paper">
      <SectionHead
        eyebrow="Latar belakang"
        title="Keterbatasan pengukuran berbasis sampel berkala"
        lead="Kandungan pengotor dan fraksi air pada uap menimbulkan deposisi serta erosi pada sudu turbin. Pada praktik pengambilan sampel berkala, penyimpangan tersebut baru teridentifikasi setelah dampaknya terjadi."
      />

      <div className={styles.grid}>
        {comparison.map((panel) => {
          const isAfter = panel.kind === 'after';
          const Marker = isAfter ? CheckIcon : ClockIcon;

          return (
            <article key={panel.kind} className={`${styles.panel} ${isAfter ? styles.after : styles.before}`}>
              <p className={styles.label}>{panel.label}</p>
              <h3 className={styles.title}>{panel.title}</h3>

              <ul className={styles.points}>
                {panel.points.map((point) => (
                  <li key={point} className={styles.point}>
                    <span className={styles.marker}>
                      <Marker size={12} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
