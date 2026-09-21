import { parameters } from '../data/content';
import { ArrowLink } from '../ui/Button';
import { Section, SectionHead } from '../ui/Section';
import styles from './Parameters.module.css';

export default function Parameters() {
  return (
    <Section id="parameter" tone="alt">
      <SectionHead
        eyebrow="Parameter"
        title="Tiga parameter penentu keandalan turbin"
        lead="Setiap parameter merepresentasikan aspek yang berbeda dari kondisi uap yang memasuki turbin."
      />

      <div className={styles.grid}>
        {parameters.map((item) => (
          <article key={item.name} className={styles.card}>
            <figure className={styles.figure}>
              <img src={item.image} alt={item.alt} loading="lazy" />
              <span className={styles.index}>{item.index}</span>
            </figure>

            <div className={styles.body}>
              <h3 className={styles.name}>
                {item.name}
                <span className={styles.full}>{item.full}</span>
              </h3>

              <p className={styles.summary}>{item.summary}</p>
              <p className={styles.detail}>{item.detail}</p>

              <div className={styles.foot}>
                <ArrowLink href={item.href}>Uraian {item.name}</ArrowLink>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
