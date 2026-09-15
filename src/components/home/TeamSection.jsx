import { researchTeam, getInitials } from './homeData';

const TeamSection = () => (
  <section id="research-team" className="team-section">
    <div className="container">
      <div className="team-header">
        <span className="team-badge">Anggota Tim Riset</span>
        <h2 className="section-title">
          Pengembangan <em>Online Steam Quality-Purity Monitoring Smart System</em> di Lapangan Geotermal
        </h2>
      </div>

      <div className="team-grid">
        {researchTeam.map((group) => (
          <div key={group.institution} className="team-group">
            <div className="team-group-header">
              <div className="team-group-logo-container">
                <img src={group.logo} alt={group.institution} className={`team-group-logo ${group.logoClassName}`} />
              </div>
              <h3 className="team-group-name">{group.institution}</h3>
            </div>

            <ul className="team-list">
              {group.members.map((member) => (
                <li key={member.name} className="team-member">
                  <span className="team-avatar">{getInitials(member.name)}</span>
                  <div className="team-member-info">
                    <span className="team-member-name">{member.name}</span>
                    <span className={`team-role ${member.role === 'Anggota' ? '' : 'team-role-highlight'}`}>{member.role}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TeamSection;
