import IndonesiaMAP from '../../assets/images/Indonesiaku.png';
import { partners } from './homeData';

const CollaborationSection = () => (
  <section id="collaboration" className="collaboration-section">
    <div className="container">
      <div className="collaboration-header">
        <span className="collaboration-badge">KOLABORASI RISET, AKADEMIK, DAN INDUSTRI</span>
        <h2 className="section-title">KOLABORASI & KERJA SAMA</h2>
      </div>

      <div className="collaboration-content">
        <div className="collaboration-text">
          <p className="section-intro">
            PertaSmart secara aktif menjalin kerja sama strategis dengan mitra industri energi dan teknologi terkemuka, antara lain PT
            Pertamina (Persero), PT Pertamina Geothermal Energy Tbk, Hach, dan Honeywell. Kolaborasi ini berfokus pada penyediaan dan
            implementasi Sistem Online Monitoring & Analysis untuk pemantauan Kualitas Uap, Dryness Fraction, Total Dissolved Solids (TDS),
            serta deteksi anomali berbasis Artificial Intelligence (AI). Sistem pemantauan ini telah diterapkan pada PLTP Kamojang dan PLTP
            Ulubelu, mendukung peningkatan keandalan operasi, efisiensi pembangkitan, serta pengambilan keputusan berbasis data secara
            real-time. Melalui sinergi lintas disiplin dan pemanfaatan teknologi mutakhir, PertaSmart berkomitmen menghadirkan solusi yang
            presisi, terukur, dan berstandar industri untuk mendukung keberlanjutan sektor pemantauan panas bumi nasional.
          </p>
        </div>

        <div className="collaboration-map">
          <img src={IndonesiaMAP} alt="Global Collaboration Map" className="map-image" />
        </div>
      </div>

      <div className="partners-grid">
        {partners.map((partner) => (
          <div key={partner.name} className="partner-card">
            <div className="partner-logo-container">
              <img src={partner.logo} alt={partner.alt} className="partner-logo" />
            </div>
            <h3 className="partner-name">{partner.name}</h3>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CollaborationSection;
