import engineerImage from 'assets/images/landing_page_image_2.webp';

import { missionPillars } from '../data/content';
import { Section, SectionHead } from '../ui/Section';
import styles from './Mission.module.css';

export default function Mission() {
  return (
    <Section id="misi" tone="paper">
      <SectionHead eyebrow="Tujuan" title="Mendukung pengambilan keputusan operasi berbasis data terkini" />

      <div className={styles.layout}>
        <div className={styles.prose}>
          <p>
            Operasi pembangkit listrik tenaga panas bumi bertumpu pada asumsi bahwa uap yang memasuki turbin memiliki tingkat kemurnian dan
            kekeringan yang memadai. Verifikasi terhadap asumsi tersebut selama ini dilakukan melalui pengambilan sampel berkala yang
            dianalisis di laboratorium.
          </p>
          <p>
            PertaSmart memindahkan proses verifikasi tersebut ke jalur pipa produksi. Sensor mengukur parameter kualitas uap secara kontinu,
            hasil pengukuran dihimpun pada satu dashboard, dan model kecerdasan buatan menandai pola yang menyimpang sebelum berkembang
            menjadi kerusakan.
          </p>
          <p>
            Sistem ini dikembangkan bersama oleh PT Pertamina dan Universitas Padjadjaran serta telah diimplementasikan di PLTP Kamojang.
          </p>
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
