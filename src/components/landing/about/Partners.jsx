import indonesiaMap from 'assets/images/Indonesiaku.webp';

import PartnerLogos from '../ui/PartnerLogos';
import { Section, SectionHead } from '../ui/Section';
import styles from './Partners.module.css';

const scope = [
  'Kualitas uap',
  'Dryness fraction',
  'Total dissolved solid',
  'Non condensable gas',
  'Deteksi anomali berbasis kecerdasan buatan'
];

export default function Partners() {
  return (
    <Section id="mitra" tone="paper">
      <SectionHead eyebrow="Mitra" title="Kolaborasi riset antara perguruan tinggi dan industri" />

      <div className={styles.layout}>
        <div className={styles.prose}>
          <p>
            PertaSmart dikembangkan bersama PT Pertamina (Persero), PT Pertamina Geothermal Energy, Universitas Padjadjaran, serta penyedia
            instrumentasi Hach dan Honeywell.
          </p>
          <p>
            Sistem telah diimplementasikan di PLTP Kamojang dan sedang disiapkan untuk PLTP Ulubelu guna menunjang keandalan operasi serta
            pengambilan keputusan berbasis data terkini.
          </p>

          <ul className={styles.scope}>
            {scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <figure className={styles.map}>
          <img src={indonesiaMap} alt="Peta sebaran lokasi pemantauan di Indonesia" loading="lazy" />
        </figure>
      </div>

      <PartnerLogos />
    </Section>
  );
}
