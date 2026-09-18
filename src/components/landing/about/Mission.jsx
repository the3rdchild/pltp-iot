import engineerImage from 'assets/images/landing_page_image_2.png';

import { missionPillars } from '../data/content';
import { Section, SectionHead } from '../ui/Section';
import styles from './Mission.module.css';

export default function Mission() {
  return (
    <Section id="misi" tone="paper">
      <SectionHead eyebrow="Misi kami" title="Supaya keputusan di lapangan tidak lagi menunggu" />

      <div className={styles.layout}>
        <div className={styles.prose}>
          <p>
            Sebuah pembangkit panas bumi berjalan di atas satu asumsi: uap yang masuk turbin cukup bersih dan cukup kering. Selama puluhan
            tahun, asumsi itu diperiksa seminggu sekali lewat sampel yang dibawa ke laboratorium.
          </p>
          <p>
            PertaSmart memindahkan pemeriksaan itu ke jalur pipanya langsung. Sensor membaca mutu uap terus-menerus, angkanya masuk ke satu
            dashboard, dan model AI menandai pola yang menyimpang sebelum sempat jadi kerusakan.
          </p>
          <p>Sistem ini dikembangkan bersama oleh PT Pertamina dan Universitas Padjadjaran, dan sudah berjalan di PLTP Kamojang.</p>
        </div>

        <figure className={styles.figure}>
          <img src={engineerImage} alt="Teknisi Pertamina di lapangan panas bumi" />
        </figure>
      </div>

      <ul className={styles.pillars}>
        {missionPillars.map((pillar) => (
          <li key={pillar.title} className={styles.pillar}>
            <span className={styles.icon}>{pillar.icon}</span>
            <h3 className={styles.pillarTitle}>{pillar.title}</h3>
            <p className={styles.pillarText}>{pillar.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
