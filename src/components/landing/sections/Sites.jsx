import { sites } from '../data/content';
import { MapPinIcon } from '../icons';
import { Button } from '../ui/Button';
import { Section, SectionHead } from '../ui/Section';
import styles from './Sites.module.css';

export default function Sites() {
  return (
    <Section id="lokasi" tone="paper">
      <SectionHead eyebrow="Lokasi" title="Implementasi pada dua lapangan panas bumi" />

      <div className={styles.grid}>
        {sites.map((site) => (
          <article key={site.name} className={`${styles.card} ${site.active ? '' : styles.pending}`}>
            <img src={site.image} alt="" loading="lazy" />

            <p className={styles.status}>
              <span className={styles.statusDot} />
              {site.status}
            </p>

            <p className={styles.region}>
              <MapPinIcon size={15} />
              {site.region}
            </p>
            <h3 className={styles.name}>{site.name}</h3>

            {site.href && (
              <Button href={site.href} variant="onDark">
                Buka dashboard
              </Button>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
