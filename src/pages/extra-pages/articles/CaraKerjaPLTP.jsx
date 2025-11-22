import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CaraKerjaPLTP = () => {
  const navigate = useNavigate();
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      number: 1,
      title: "Sumber Panas Bumi (Reservoir)",
      description: "Di bawah permukaan bumi terdapat kantong uap panas alami dari aktivitas magma.",
      image: "/src/assets/images/articles/geothermal-reservoir.jpg",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 7l-5 5-5-5M7 13l5 5 5-5"/>
        </svg>
      )
    },
    {
      number: 2,
      title: "Produksi Uap",
      description: "Air tanah yang meresap ke dalam bumi dipanaskan oleh magma hingga berubah menjadi uap bertekanan tinggi. Uap ini kemudian dikeluarkan melalui sumur produksi (production well) menuju permukaan.",
      image: "/src/assets/images/articles/production-well.jpg",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      )
    },
    {
      number: 3,
      title: "Pemanfaatan Uap di Pembangkit",
      description: "Uap panas tersebut dialirkan melalui pipa menuju turbin uap. Tekanan uap memutar turbin → turbin memutar generator → menghasilkan listrik.",
      image: "/src/assets/images/articles/turbine-generator.jpg",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )
    },
    {
      number: 4,
      title: "Kondensasi & Injeksi Ulang",
      description: "Setelah melewati turbin, uap dikondensasikan menjadi air di kondensor. Air hasil kondensasi kemudian diinjeksikan kembali ke dalam bumi melalui sumur injeksi (injection well) agar siklus panas bumi berkelanjutan.",
      image: "/src/assets/images/articles/cooling-tower.jpg",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      )
    },
    {
      number: 5,
      title: "Distribusi Listrik",
      description: "Listrik dari generator dinaikkan tegangannya oleh transformator, lalu disalurkan ke jaringan listrik PLN.",
      image: "/src/assets/images/articles/power-grid.jpg",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="cara-kerja-page">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Kembali
      </button>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Cara Kerja Pembangkit Listrik Tenaga Panas Bumi</h1>
          <p className="hero-subtitle">
            Memanfaatkan energi panas alami dari dalam bumi untuk menghasilkan listrik yang berkelanjutan
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="intro-section">
        <div className="container">
          <p className="intro-text">
            Pembangkit Listrik Tenaga Panas Bumi (PLTP) adalah teknologi ramah lingkungan yang mengubah 
            energi panas dari perut bumi menjadi energi listrik. Proses ini memanfaatkan uap panas alami 
            yang dihasilkan dari aktivitas geothermal di bawah permukaan bumi.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title">Tahapan Proses PLTP</h2>
          
          <div className="steps-timeline">
            {steps.map((step, index) => (
              <div key={step.number}>
                <div 
                  className={`step-card ${index % 2 === 0 ? 'left' : 'right'} ${hoveredStep === index ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div className="step-number-badge">
                    <span>{step.number}</span>
                  </div>
                  
                  <div className="step-content">
                    <div className="step-icon-container">
                      {step.icon}
                    </div>
                    
                    <div className="step-text">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-description">{step.description}</p>
                    </div>
                    
                    <div className="step-image-container">
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="step-image"
                      />
                    </div>
                  </div>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="step-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M19 12l-7 7-7-7"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary Section */}
      <section className="summary-section">
        <div className="container">
          <div className="summary-card">
            <h3 className="summary-title">Keunggulan PLTP</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-icon">🌱</div>
                <h4>Ramah Lingkungan</h4>
                <p>Emisi karbon sangat rendah dibanding pembangkit fosil</p>
              </div>
              <div className="summary-item">
                <div className="summary-icon">♻️</div>
                <h4>Berkelanjutan</h4>
                <p>Sumber energi terbarukan yang tidak akan habis</p>
              </div>
              <div className="summary-item">
                <div className="summary-icon">⚡</div>
                <h4>Efisien</h4>
                <p>Dapat beroperasi 24/7 tanpa terpengaruh cuaca</p>
              </div>
              <div className="summary-item">
                <div className="summary-icon">🇮🇩</div>
                <h4>Potensi Indonesia</h4>
                <p>Indonesia memiliki 40% cadangan panas bumi dunia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .cara-kerja-page {
          min-height: 100vh;
          background: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }

        .back-button {
          position: fixed;
          top: 24px;
          left: 24px;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid #e0e0e0;
          padding: 12px 20px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 600;
          color: #1a2642;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .back-button:hover {
          background: #1a2642;
          color: white;
          transform: translateX(-4px);
        }

        .hero {
          position: relative;
          height: 500px;
          background: linear-gradient(135deg, #1a2642 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('/src/assets/images/articles/pltp-hero.jpg') center/cover;
          opacity: 0.2;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(26, 38, 66, 0.8) 0%, rgba(37, 99, 235, 0.8) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 0 24px;
          max-width: 900px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
        }

        .intro-section {
          padding: 80px 0 40px;
          background: white;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .intro-text {
          font-size: 1.125rem;
          color: #495057;
          line-height: 1.8;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .steps-section {
          padding: 60px 0 80px;
          background: #f8f9fa;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a2642;
          text-align: center;
          margin-bottom: 60px;
        }

        .steps-timeline {
          max-width: 900px;
          margin: 0 auto;
        }

        .step-card {
          position: relative;
          margin-bottom: 40px;
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }

        .step-card.left {
          animation-delay: 0.1s;
        }

        .step-card.right {
          animation-delay: 0.2s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-number-badge {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
        }

        .step-number-badge span {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
        }

        .step-content {
          background: white;
          border-radius: 20px;
          padding: 60px 40px 40px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: all 0.4s ease;
          border: 3px solid transparent;
        }

        .step-card.hovered .step-content {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(37, 99, 235, 0.15);
          border-color: #2563eb;
        }

        .step-icon-container {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f7941d 0%, #f97316 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          transition: transform 0.3s ease;
        }

        .step-icon-container svg {
          width: 40px;
          height: 40px;
          color: white;
        }

        .step-card.hovered .step-icon-container {
          transform: scale(1.1) rotate(5deg);
        }

        .step-text {
          text-align: center;
          margin-bottom: 32px;
        }

        .step-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a2642;
          margin-bottom: 16px;
        }

        .step-description {
          font-size: 1rem;
          color: #495057;
          line-height: 1.8;
        }

        .step-image-container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .step-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .step-card.hovered .step-image {
          transform: scale(1.05);
        }

        .step-arrow {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }

        .step-arrow svg {
          color: #2563eb;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }

        .summary-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #1a2642 0%, #2563eb 100%);
        }

        .summary-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .summary-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1a2642;
          text-align: center;
          margin-bottom: 48px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .summary-item {
          text-align: center;
          padding: 24px;
          border-radius: 16px;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .summary-item:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: translateY(-8px);
        }

        .summary-item:hover h4,
        .summary-item:hover p {
          color: white;
        }

        .summary-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .summary-item h4 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a2642;
          margin-bottom: 8px;
          transition: color 0.3s ease;
        }

        .summary-item p {
          font-size: 0.875rem;
          color: #495057;
          line-height: 1.6;
          transition: color 0.3s ease;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .step-content {
            padding: 50px 24px 24px;
          }

          .step-title {
            font-size: 1.25rem;
          }

          .step-description {
            font-size: 0.875rem;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CaraKerjaPLTP;