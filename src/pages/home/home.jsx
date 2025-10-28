import React from 'react';
import { Link } from 'react-router-dom';
import pertaminaLogo from '../../assets/images/pertamina1x1.svg';
import unpadLogo from '../../assets/images/Logo-Unpad.svg';
import Footer from 'components/layout/Footer';

const SteamMonitoring = () => {
  return (
    <div className="steam-monitoring">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="logo-left">
            <img src={pertaminaLogo} alt="Pertamina Logo" />
          </div>
          <div className="hero-text">
            <h1 className="hero-title">
              Pengembangan Online Steam Quality - Purity<br />
              Monitoring Smart System di Lapangan<br />
              Geotermal
            </h1>
            <p className="hero-subtitle">
              Kerjasama Penelitian PT.Pertamina dengan Universitas Padjadjaran
            </p>
          </div>
          <div className="logo-right">
            <img src={unpadLogo} alt="Unpad Logo" />
          </div>
        </div>
      </section>

      {/* Dashboard Cards - Revised Version */}
      <section className="dashboard-section">
        <div className="container">
          <div className="dashboard-grid">
            {/* PLTP Kamojang Unit 5 */}
            <div className="dashboard-card">
              <img 
                src="https://framerusercontent.com/images/fxCvwkQgyA8fWju3S9RurCWJQ.png?width=715&height=403" 
                alt="PLTP Kamojang" 
                className="card-image" 
              />
              <h3 className="card-title">PLTP Kamojang Unit 5</h3>
              
              <div className="quality-metrics-container">
                <div className="quality-metrics-grid">
                  <div className="quality-metric-item">
                    <span className="quality-metric-label">Dryness Fraction</span>
                    <span className="quality-metric-value">98.23%</span>
                  </div>
                  <div className="quality-metric-item">
                    <span className="quality-metric-label">Total Dissolve Solid (TDS)</span>
                    <span className="quality-metric-value">0.021%</span>
                  </div>
                  <div className="quality-metric-item">
                    <span className="quality-metric-label">Non Condensed Gas (NCG)</span>
                    <span className="quality-metric-value">0.012%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '98.23%' }}></div>
                </div>
              </div>

              <div className="metrics-row">
                <div className="metric-item">
                  <span className="metric-label">Temp</span>
                  <span className="metric-value">165.2°C</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Pressure</span>
                  <span className="metric-value">5.87 barg</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Power</span>
                  <span className="metric-value">32.46 MW</span>
                </div>
              </div>
              <Link to="" className="btn-dashboard btn-dashboard-link">Dashboard</Link>
              </div>

            {/* PLTP Ulubelu Unit 3 */}
            <div className="dashboard-card">
              <img 
                src="https://framerusercontent.com/images/z3X7nyBGwXDrmzDeGnN08549CVo.webp?width=1189&height=690" 
                alt="PLTP Ulubelu" 
                className="card-image" 
              />
              <h3 className="card-title">PLTP Ulubelu Unit 3</h3>
              
              <div className="quality-metrics-container">
                <div className="quality-metrics-grid">
                  <div className="quality-metric-item">
                    <span className="quality-metric-label">Dryness Fraction</span>
                    <span className="quality-metric-value">98.23%</span>
                  </div>
                  <div className="quality-metric-item">
                    <span className="quality-metric-label">Total Dissolve Solid (TDS)</span>
                    <span className="quality-metric-value">0.021%</span>
                  </div>
                  <div className="quality-metric-item">
                    <span className="quality-metric-label">Non Condensed Gas (NCG)</span>
                    <span className="quality-metric-value">0.012%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '98.23%' }}></div>
                </div>
              </div>

              <div className="metrics-row">
                <div className="metric-item">
                  <span className="metric-label">Temp</span>
                  <span className="metric-value">165.2°C</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Pressure</span>
                  <span className="metric-value">5.87 barg</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Power</span>
                  <span className="metric-value">32.46 MW</span>
                </div>
              </div>

              <button className="btn-dashboard">Dashboard</button>
            </div>
          </div>
        </div>
      </section>

      {/* PLTP Information */}
      <section className="info-section">
        <div className="container">
          <img 
            src="https://framerusercontent.com/images/qPB02uBw6FuErZttYN5NN4TTnY.png?scale-down-to=1024&width=1126&height=626" 
            alt="PLTP Diagram" 
            className="info-image" 
          />
          <h2 className="section-title">Pembangkit Listrik Tenaga Panas Bumi (PLTP)</h2>

          <div className="steps">
            <div className="step">
              <h4>Sumber panas bumi (reservoir):</h4>
              <p>Di bawah permukaan bumi terdapat kantong uap panas alami dari aktivitas magma.</p>

              <h4>Produksi uap:</h4>
              <p>
                Air tanah yang meresap ke dalam bumi dipanaskan oleh magma hingga berubah menjadi uap 
                bertekanan tinggi. Uap ini kemudian dikeluarkan melalui sumur produksi (production well) 
                menuju permukaan.
              </p>

              <h4>Pemanfaatan uap di pembangkit:</h4>
              <p>
                Uap panas tersebut dialirkan melalui pipa menuju turbin uap. Tekanan uap memutar turbin → 
                turbin memutar generator → menghasilkan listrik.
              </p>

              <h4>Kondensasi & injeksi ulang:</h4>
              <p>
                Setelah melewati turbin, uap dikondensasikan menjadi air di kondensor. Air hasil kondensasi 
                kemudian diinjeksikan kembali ke dalam bumi melalui sumur injeksi (injection well) agar 
                siklus panas bumi berkelanjutan.
              </p>

              <h4>Distribusi listrik:</h4>
              <p>
                Listrik dari generator dinaikkan tegangannya oleh transformator, lalu disalurkan ke jaringan 
                listrik PLN.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steam Quality Section */}
      <section className="quality-section">
        <div className="container">
          <h2 className="section-title">Pentingnya Memantau Kualitas Uap yang Masuk Turbin</h2>
          <p className="section-intro">Kualitas dan kemurnian uap sangat mempengaruhi kinerja dari turbin</p>

          <div className="quality-cards">
            {/* TDS Card */}
            <div className="quality-card">
              <img 
                src="https://framerusercontent.com/images/FVi31RljoWcuDczOzaHhMlZhx1g.png?scale-down-to=1024&width=1375&height=583" 
                alt="TDS" 
                className="quality-image" 
              />
              <h3>TDS (Total Dissolved Solid)</h3>
              <p className="quality-desc">
                TDS adalah perbandingan banyaknya zat padat dalam larutan/uap/cairan yang dinyatakan 
                dalam persentase
              </p>
              <p>
                TDS tinggi bisa menyebabkan carryover (terikutnya zat padat atau cairan dalam uap), yang dapat:
              </p>
              <ul>
                <li>Mengikis sudu turbin</li>
                <li>Merusak lapisan pelindung (coating)</li>
                <li>Mengganggu keseimbangan turbin</li>
              </ul>
            </div>

            {/* Dryness Fraction Card */}
            <div className="quality-card">
              <img 
                src="https://framerusercontent.com/images/wAMDPfSSGtN1k78Js0PWw8BqBg4.png?scale-down-to=1024&width=1530&height=525" 
                alt="Dryness Fraction" 
                className="quality-image" 
              />
              <h3>Dryness Fraction</h3>
              <p className="quality-desc">
                Dryness fraction adalah tingkat kadar air dalam uap yang dinyatakan dalam persentase
              </p>
              <p>Banyaknya air dalam uap dapat menyebabkan korosi pada turbin</p>
              <ul>
                <li>
                  <strong>Efisiensi Turbin:</strong> Menurun karena energi digunakan untuk menggerakkan 
                  air, bukan menghasilkan kerja
                </li>
                <li>
                  <strong>Erosi/korosi:</strong> Bilah turbin cepat aus jika x &lt; 0.9
                </li>
              </ul>
            </div>

            {/* NCG Card */}
            <div className="quality-card">
              <img 
                src="https://framerusercontent.com/images/8zivXU5iJPzTMagWXuWt6VFzM.png?scale-down-to=1024&width=1541&height=540" 
                alt="NCG" 
                className="quality-image" 
              />
              <h3>NCG (Non Condensed Gas)</h3>
              <p className="quality-desc">
                NCG adalah gas yang tidak dapat dikondensasikan yang dinyatakan dalam persen
              </p>
              <p>Contoh: CO₂, H₂S, dan gas lainnya.</p>
              <p><strong>Dampak:</strong></p>
              <ul>
                <li>Kerusakan pada sudu turbin akibat erosi dan korosi.</li>
                <li>Menurunkan efisiensi pembangkit.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Existing vs Development Section */}
      <section className="comparison-section">
        <div className="container">
          <div className="comparison-grid">
            {/* Existing System */}
            <div className="comparison-card existing">
              <h2>Existing</h2>
              <img 
                src="https://framerusercontent.com/images/x82t3EgGS06sBAtcanrMT886GI.png?scale-down-to=1024&width=1175&height=508" 
                alt="Existing System" 
                className="comparison-image" 
              />
              <ul className="comparison-list">
                <li>
                  <h4>Pengambilan data masih manual</h4>
                  <p>
                    Sampel uap atau kondensat diambil secara periodik oleh petugas. Analisis parameter 
                    seperti TDS dan dryness fraction dilakukan di laboratorium.
                  </p>
                </li>
                <li>
                  <h4>Data bersifat offline</h4>
                  <p>
                    Tidak ada integrasi real-time ke sistem DCS/SCADA. Operator harus menunggu hasil lab 
                    untuk mengambil keputusan.
                  </p>
                </li>
                <li>
                  <h4>Risiko keterlambatan mitigasi</h4>
                  <p>
                    Anomali hanya terdeteksi setelah data keluar dari lab. Potensi kerusakan bisa terjadi 
                    sebelum diketahui.
                  </p>
                </li>
                <li>
                  <h4>Tidak ada histori data terintegrasi</h4>
                  <p>
                    Data tidak tersimpan secara time-series. Sulit melakukan analisis tren dan prediksi 
                    jangka panjang.
                  </p>
                </li>
              </ul>
            </div>

            {/* Development System */}
            <div className="comparison-card development">
              <h2>Pengembangan Sistem Online Monitoring</h2>
              <img 
                src="https://framerusercontent.com/images/0fuVB6xdxaME5uXciFT2v1NzN9g.png?scale-down-to=1024&width=1118&height=839" 
                alt="Development System" 
                className="comparison-image" 
              />
              <ul className="comparison-list">
                <li>
                  <h4>Pengukuran real-time langsung dari sensor lapangan</h4>
                  <p>
                    Integrasi sensor TDS, suhu, tekanan, FLOW, dryness fraction ke database dan dashboard
                  </p>
                </li>
                <li>
                  <h4>
                    Pemrosesan data menggunakan Artificial Intelligence untuk prediksi steam quality 
                    dan deteksi anomali
                  </h4>
                </li>
                <li>
                  <h4>Visualisasi data melalui dashboard web secara langsung</h4>
                </li>
                <li>
                  <h4>Notifikasi dini (early warning) jika terjadi anomali parameter</h4>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer sx={{ mt: 0 }} />

      <style jsx>{`
        .steam-monitoring {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background-color: #ffffff;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        .hero {
          background: #1a3a52;
          color: white;
          padding: 40px 0;
          border: none;
          border-radius: 0;
          margin: 0;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .logo-left,
        .logo-right {
          width: 160px;
          height: auto;
          flex-shrink: 0;
        }

        .logo-left img,
        .logo-right img {
          width: 150px;
          height: auto;
          filter: brightness(1.2);
        }

        .hero-text {
          flex: 1;
          text-align: center;
        }

        .hero-title {
          font-size: 2.0rem;
          font-weight: 700;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          font-weight: 500;
          opacity: 1;
          color: #FFA500;
        }

        .dashboard-section {
          padding: 80px 0;
          background-color: #f8f9fa;
        }

        .dashboard-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 50px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 40px;
          max-width: 900px;
          margin: 0 auto;
        }

        .dashboard-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
        }

        .card-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 20px;
        }

        .quality-metrics-container {
          margin-bottom: 20px;
        }

        .quality-metrics-grid {
          display: flex;
          flex-direction: column;  /* ← JADI INI */
          gap: 8px;
          margin-bottom: 16px;
        }

        .quality-metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .quality-metric-label {
          font-size: 0.85rem;
          color: #495057;
          font-weight: 500;
        }

        .quality-metric-value {
          font-size: 0.9rem;
          color: #1a1a1a;
          font-weight: 700;
        }

        .progress-bar {
          background-color: #e9ecef;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .metrics-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          gap: 15px;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #667eea;
        }

        .btn-dashboard {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 40px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          width: 100%;
          height:60px;
          display: flex;              /* ← GANTI INI */
          align-items: center;        /* ← TAMBAH INI */
          justify-content: center;    /* ← TAMBAH INI */
          text-decoration: none;
          text-align: center;
        }
        .btn-dashboard-link {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .btn-dashboard:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
        }

        .info-section {
          padding: 80px 0;
          background: #f8f9fa;
        }

        .info-image {
          width: 100%;
          border-radius: 16px;
          margin-bottom: 40px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
          text-align: center;
        }

        .section-subtitle {
          font-size: 1.75rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 40px;
          text-align: center;
        }

        .section-intro {
          font-size: 1.25rem;
          color: #495057;
          text-align: center;
          margin-bottom: 60px;
        }

        .steps {
          display: flex;
          flex-direction: column;
        }

        .step {
          padding: 30px;
          background: linear-gradient(135deg, #e9ecef 0%, #e9ecef 100%);
          border-radius: 16px;
          // border-left: 4px solid #667eea;
        }

        .step h4 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-top: 20px;
          margin-bottom: 12px;
        }

        .step h4:first-child {
          margin-top: 0;
        }

        .step p {
          font-size: 1rem;
          color: #495057;
          line-height: 1.8;
          margin-bottom: 12px;
        }

        .quality-section {
          padding: 80px 0;
          background: #f8f9fa;
        }

        .quality-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 40px;
          margin-top: 60px;
        }

        .quality-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .quality-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
        }

        .quality-image {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .quality-card h3 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 16px;
        }

        .quality-desc {
          font-size: 1rem;
          color: #495057;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .quality-card p {
          font-size: 0.95rem;
          color: #6c757d;
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .quality-card ul {
          list-style: none;
          padding-left: 0;
        }

        .quality-card ul li {
          padding: 12px 0;
          padding-left: 30px;
          position: relative;
          font-size: 0.95rem;
          color: #495057;
          line-height: 1.6;
        }

        .quality-card ul li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #667eea;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .comparison-section {
          padding: 80px 0;
          background: #f8f9fa;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 40px;
          margin-top: 40px;
        }

        .comparison-card {
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
        }

        .comparison-card:hover {
          transform: translateY(-5px);
        }

        .comparison-card.existing {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
          border: 2px solid #ffc9c9;
        }

        .comparison-card.development {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #7dd3fc;
        }

        .comparison-card h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 30px;
        }

        .comparison-card.existing h2 {
          color: #dc3545;
        }

        .comparison-card.development h2 {
          color: #0ea5e9;
        }

        .comparison-image {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .comparison-list {
          list-style: none;
          padding: 0;
        }

        .comparison-list li {
          margin-bottom: 24px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 12px;
          transition: transform 0.2s ease;
        }

        .comparison-list li:hover {
          transform: translateX(5px);
        }

        .comparison-list h4 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .comparison-list p {
          font-size: 0.95rem;
          color: #495057;
          line-height: 1.6;
        }

        .footer {
          background: #1a1a1a;
          color: white;
          padding: 40px 0;
          text-align: center;
        }

        .footer p {
          font-size: 0.95rem;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            gap: 20px;
          }

          .logo-left img,
          .logo-right img {
            width: 70px;
          }

          .hero-title {
            font-size: 1.35rem;
          }

          .hero-subtitle {
            font-size: 0.9rem;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .section-subtitle {
            font-size: 1.25rem;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .quality-cards {
            grid-template-columns: 1fr;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-card,
          .quality-card,
          .comparison-card {
            padding: 24px;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 30px 0;
            margin: 10px 12px;
          }

          .hero-title {
            font-size: 1.1rem;
          }

          .hero-subtitle {
            font-size: 0.8rem;
          }

          .logo-left img,
          .logo-right img {
            width: 50px;
          }

          .dashboard-section,
          .info-section,
          .quality-section,
          .comparison-section {
            padding: 40px 0;
          }

          .card-title {
            font-size: 1.25rem;
          }

          .metrics-row {
            flex-direction: column;
            gap: 12px;
          }

          .metric-item {
            flex-direction: row;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default SteamMonitoring;