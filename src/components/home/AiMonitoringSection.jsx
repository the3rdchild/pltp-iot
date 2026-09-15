import { aiCards } from './homeData';
import { ArrowRightIcon } from './icons';

const AiMonitoringSection = () => (
  <section id="ai-monitoring" className="ai-section">
    <div className="container">
      <div className="ai-intro-grid">
        <div>
          <h2 className="section-title">Sistem Monitoring & Analisis AI</h2>
        </div>
        <div>
          <p className="section-intro">
            Sistem pemantauan kami didukung oleh teknologi kecerdasan buatan yang mampu menganalisis data secara real-time dan memberikan
            prediksi akurat. Melalui integrasi AI, sistem dapat mendeteksi potensi anomali operasional, memprediksi kondisi turbin, serta
            memperkirakan parameter kualitas uap seperti dryness fraction dan NCG tanpa pengambilan sampel langsung. Teknologi ini
            memungkinkan tindakan preventif lebih cepat dan efisien.
          </p>
        </div>
      </div>

      <div className="ai-cards">
        {aiCards.map((card) => (
          <div key={card.href} className="ai-card">
            <div className="ai-image-container">
              <img src={card.image} alt={card.alt} className="ai-image" />
            </div>
            <div className="ai-content">
              <h3 className="ai-title">{card.title}</h3>
              <p className="ai-description">{card.description}</p>
              <a href={card.href} className="btn-ai-read-more">
                Selengkapnya
                <ArrowRightIcon />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AiMonitoringSection;
