import { ArrowLink } from '../ui/Button';
import PartnerLogos from '../ui/PartnerLogos';
import { Section, SectionHead } from '../ui/Section';
import styles from './Collaboration.module.css';

export default function Collaboration() {
  return (
    <Section id="kolaborasi" tone="alt">
      <div className={styles.head}>
        <SectionHead
          eyebrow="Kolaborasi"
          title="Kolaborasi industri dan perguruan tinggi"
          lead="Pengembangan sistem melibatkan operator pembangkit, peneliti perguruan tinggi, dan penyedia instrumentasi."
        />
        <div className={styles.more}>
          <ArrowLink href="/about">Susunan tim riset</ArrowLink>
        </div>
      </div>

      <PartnerLogos />
    </Section>
  );
}
