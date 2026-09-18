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
          title="Dikerjakan bersama industri dan kampus"
          lead="Operator pembangkit, peneliti, dan penyedia instrumentasi mengerjakan sistem ini di satu meja yang sama."
        />
        <div className={styles.more}>
          <ArrowLink href="/about">Kenali tim risetnya</ArrowLink>
        </div>
      </div>

      <PartnerLogos />
    </Section>
  );
}
