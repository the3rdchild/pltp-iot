import { serviceCards } from './homeData';

const ServicesSection = () => (
  <section id="services" className="services-section">
    <div className="container">
      <div className="services-intro-grid">
        <div>
          <h2 className="section-title">Layanan Kami</h2>
        </div>
        <div>
          <p className="section-intro">
            Sebagai bagian dari komitmen terhadap inovasi dan efisiensi energi panas bumi, kami menghadirkan berbagai layanan berbasis
            teknologi cerdas yang mendukung pemantauan, analisis, dan optimalisasi sistem geotermal. Melalui kolaborasi riset antara PT
            Pertamina dan Universitas Padjadjaran, setiap layanan kami dirancang untuk meningkatkan keandalan operasional serta mendorong
            transformasi menuju energi bersih yang berkelanjutan.
          </p>
        </div>
      </div>

      <div className="services-grid">
        {serviceCards.map((card) => (
          <div key={card.title} className="service-card">
            <div className="service-icon">{card.icon}</div>
            <h3 className="service-title">{card.title}</h3>
            <p className="service-text">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
