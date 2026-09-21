import pltpImage from 'assets/images/PLTPKMJ.webp';

import { pltpSteps } from '../data/content';
import { ArrowLink } from '../ui/Button';
import { Section, SectionHead } from '../ui/Section';
import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  return (
    <Section id="cara-kerja" tone="ink">
      <SectionHead
        eyebrow="Prinsip kerja"
        title="Konversi energi panas bumi menjadi energi listrik"
        lead="Proses berlangsung dalam empat tahap yang berulang. Penyimpangan kualitas uap pada tahap kedua menimbulkan konsekuensi kerusakan yang paling besar."
      />

      <div className={styles.layout}>
        <div>
          <figure className={styles.figure}>
            <img src={pltpImage} alt="Fasilitas PLTP Kamojang" loading="lazy" />
          </figure>
          <p className={styles.caption}>PLTP Kamojang, Jawa Barat.</p>
        </div>

        <div>
          <ol className={styles.steps}>
            {pltpSteps.map((item) => (
              <li key={item.step} className={styles.step}>
                <span className={styles.marker}>{item.step}</span>
                <div>
                  <h3 className={styles.stepTitle}>{item.title}</h3>
                  <p className={styles.stepText}>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.more}>
            <ArrowLink href="/cara-kerja-pltp" onDark>
              Uraian lengkap proses PLTP
            </ArrowLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
