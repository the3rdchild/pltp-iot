import engineerImage from '../../assets/images/landing_page_image_2.png';
import { missionCards } from './homeData';

const MissionSection = () => (
  <section id="about" className="mission-section">
    <div className="container">
      <h2 className="section-title">Misi Kami Berakar pada Inovasi</h2>
      <p className="section-intro">
        Kami hadir untuk mengembangkan inovasi dalam industri energi panas bumi melalui teknologi monitoring yang canggih dan berkelanjutan.
        Dengan sistem SMART (System Monitoring Analysis Real Time) yang didukung kecerdasan buatan (AI), kami mampu memprediksi potensi
        anomali dan mengoptimalkan kinerja sistem secara proaktif. Berkolaborasi dengan institusi pendidikan terkemuka, kami menciptakan
        solusi yang dapat dipantau kapan saja dan dari mana saja, memberikan kendali penuh kepada operator untuk memastikan efisiensi
        maksimal dan keberlanjutan lingkungan untuk masa depan energi Indonesia.
      </p>

      <div className="mission-grid">
        <div className="mission-cards">
          {missionCards.map((card) => (
            <div key={card.title} className="mission-card">
              <div className="mission-icon">{card.icon}</div>
              <h3 className="mission-card-title">{card.title}</h3>
              <p className="mission-card-text">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="engineer-image-container">
          <img src={engineerImage} alt="Pertamina Engineer" className="engineer-image" />
        </div>
        <div className="mission-button-container"></div>
      </div>
    </div>
  </section>
);

export default MissionSection;
