import heroImage from 'assets/images/landing_page_image.webp';

import { heroStats } from '../data/content';
import { Button } from '../ui/Button';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.backdrop}>
        {/* LCP element: eagerly fetched, and decorative -- the headline in
            front of it already says what it shows. */}
        <img src={heroImage} alt="" fetchpriority="high" decoding="async" />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.dot} />
            Riset kolaboratif PT Pertamina dan Universitas Padjadjaran
          </p>

          <h1 className={styles.title}>
            Pemantauan kualitas dan kemurnian uap PLTP secara <span className={styles.titleAccent}>kontinu</span>
          </h1>

          <p className={styles.lead}>
            PertaSmart mengukur parameter mutu uap langsung pada jalur produksi PLTP. Kondisi uap yang memasuki turbin dapat diketahui
            setiap saat tanpa menunggu hasil analisis laboratorium.
          </p>

          <div className={styles.actions}>
            <Button href="/login">Masuk Dashboard</Button>
            <Button href="#parameter" variant="onDark">
              Parameter yang dipantau
            </Button>
          </div>
        </div>

        <ul className={styles.stats}>
          {heroStats.map((stat) => (
            <li key={stat.label} className={styles.stat}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
