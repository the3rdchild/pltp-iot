import { aiModels } from '../data/content';
import { ArrowLink } from '../ui/Button';
import { Section, SectionHead } from '../ui/Section';
import styles from './AiAnalysis.module.css';

export default function AiAnalysis() {
  return (
    <Section id="ai" tone="alt">
      <SectionHead
        eyebrow="Analisis"
        title="Dua model yang membaca datanya"
        lead="Angka mentah saja belum menjelaskan apa-apa. Dua model ini yang mengubahnya jadi peringatan dan perkiraan."
      />

      <div className={styles.grid}>
        {aiModels.map((model) => (
          <article key={model.tag} className={styles.card}>
            <figure className={styles.figure}>
              <img src={model.image} alt={model.alt} loading="lazy" />
            </figure>

            <div className={styles.body}>
              <p className={styles.tag}>{model.tag}</p>
              <h3 className={styles.title}>{model.title}</h3>
              <p className={styles.text}>{model.text}</p>

              <div className={styles.foot}>
                <ArrowLink href={model.href}>Cara kerjanya</ArrowLink>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
