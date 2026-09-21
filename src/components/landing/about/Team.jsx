import { getInitials, researchTeam } from '../data/content';
import { Section, SectionHead } from '../ui/Section';
import styles from './Team.module.css';

export default function Team() {
  return (
    <Section id="tim" tone="alt">
      <SectionHead
        eyebrow="Tim riset"
        title="Peneliti dan pelaksana pengembangan"
        lead="Pengembangan Online Steam Quality and Purity Monitoring Smart System pada lapangan panas bumi."
      />

      <div className={styles.grid}>
        {researchTeam.map((group) => (
          <section key={group.institution} className={styles.group}>
            <header className={styles.groupHead}>
              <img src={group.logo} alt="" className={styles.groupLogo} />
              <h3 className={styles.groupName}>
                {group.institution}
                <span className={styles.groupCount}>{group.members.length} anggota</span>
              </h3>
            </header>

            <ul className={styles.list}>
              {group.members.map((member) => (
                <li key={member.name} className={styles.member}>
                  <span className={styles.avatar} aria-hidden="true">
                    {getInitials(member.name)}
                  </span>
                  <span>
                    <span className={styles.name}>{member.name}</span>
                    <span className={`${styles.role} ${member.role === 'Anggota' ? '' : styles.roleLead}`}>{member.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}
