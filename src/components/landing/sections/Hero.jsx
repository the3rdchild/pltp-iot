import heroImage from 'assets/images/landing_page_image.jpg';

import { heroStats } from '../data/content';
import { Button } from '../ui/Button';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.backdrop}>
        {/* LCP element: eagerly fetched, and decorative -- the headline in
            front of it already says what it shows. */}
        <img src={heroImage} alt="" fetchPriority="high" decoding="async" />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.dot} />
            Riset bersama Pertamina &amp; Universitas Padjadjaran
          </p>

          <h1 className={styles.title}>
            Mutu uap PLTP, terbaca <span className={styles.titleAccent}>setiap saat</span>.
          </h1>

          <p className={styles.lead}>
            PertaSmart membaca kualitas dan kemurnian uap yang masuk turbin secara langsung di lapangan — tanpa menunggu hasil laboratorium
            minggu depan.
          </p>

          <div className={styles.actions}>
            <Button href="/login">Masuk Dashboard</Button>
            <Button href="#parameter" variant="onDark">
              Lihat yang dipantau
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
