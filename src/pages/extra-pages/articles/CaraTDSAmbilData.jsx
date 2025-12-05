import React from 'react';
import { useNavigate } from 'react-router-dom';

import turbineDamageImg from '/src/assets/images/articles/tds/turbine_damage_before_after.jpg';
import pltpSystemImg from '/src/assets/images/articles/tds/pltp_system_diagram.png';
import silicaDepositsImg from '/src/assets/images/articles/tds/silica_deposits_blade.jpg';
import monitoringSystemImg from '/src/assets/images/articles/tds/monitoring_system_panel.jpg';
import pertasmartLogo from '/src/assets/images/articles/Pertasmart4x1.svg';
import sc4500Img from '/src/assets/images/SC4500.png';

export default function CaraTDSAmbilData() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('');

  // Scroll to reference function
  const scrollToRef = (refNumber) => {
    const element = document.getElementById(`ref-${refNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight effect
      element.style.backgroundColor = '#fef3c7';
      setTimeout(() => {
        element.style.backgroundColor = 'transparent';
      }, 2000);
    }
  };

  // Scroll to section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setIsSidebarOpen(false);
    }
  };

  // Reference component
  const Ref = ({ num }) => (
    <sup 
      onClick={() => scrollToRef(num)}
      style={{
        color: '#2563eb',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        display: 'inline-block'
      }}
      onMouseEnter={(e) => {
        e.target.style.color = '#1e40af';
        e.target.style.transform = 'scale(1.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.color = '#2563eb';
        e.target.style.transform = 'scale(1)';
      }}
    >
      [{num}]
    </sup>
  );

  // Navigation sections
  const sections = [
    { id: 'intro', label: 'Pendahuluan' },
    { id: 'sampling', label: 'Pengambilan Sampel' },
    { id: 'conditioning', label: 'Sample Conditioning' },
    { id: 'measurement', label: 'Pengukuran Konduktivitas' },
    { id: 'conversion', label: 'Konversi Digital' },
    { id: 'output', label: 'Output Sinyal' },
    { id: 'integration', label: 'Integrasi Analyzer' },
    { id: 'kesimpulan', label: 'Kesimpulan' },
    { id: 'dafpus', label: 'Daftar Pustaka' }
  ];

  return (
    <>
      <style jsx>{`
      /* Footer */
      .footer {
        background: #0f1729;
        color: white;
        padding: 48px 0;
      }
      .footer-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 32px;
        margin-bottom: 32px;
      }
      .footer-logos {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .footer-logo {
        height: 32px;
        width: auto;
      }
      .footer-text {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.6;
      }
      .footer-heading {
        font-weight: 700;
        margin-bottom: 16px;
      }
      .footer-links {
        list-style: none;
        padding: 0;
      }
      .footer-links li {
        margin-bottom: 8px;
      }
      .footer-links a {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.3s ease;
      }
      .footer-links a:hover {
        color: white;
      }
      .footer-bottom {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 32px;
        text-align: center;
      }
      .footer-bottom p {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.6);
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
    `}</style>

    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1729 0%, #1a2642 50%, #0f1729 100%)',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Fixed Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          background: 'rgba(37, 99, 235, 0.9)',
          border: 'none',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '50px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          zIndex: 1002,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(37, 99, 235, 1)';
          e.target.style.transform = 'translateX(-5px)';
          e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(37, 99, 235, 0.9)';
          e.target.style.transform = 'translateX(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
        }}
      >
        ← Kembali
      </button>

      {/* Hamburger Menu */}
      <div 
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          width: '40px',
          height: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
          zIndex: 1002,
          padding: '8px',
          borderRadius: '8px',
          background: 'rgba(26, 38, 66, 0.8)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(37, 99, 235, 0.9)';
          setIsSidebarOpen(true);
        }}
      >
        <div style={{ width: '24px', height: '3px', background: 'white', borderRadius: '2px', transition: 'all 0.3s ease' }}></div>
        <div style={{ width: '24px', height: '3px', background: 'white', borderRadius: '2px', transition: 'all 0.3s ease' }}></div>
        <div style={{ width: '24px', height: '3px', background: 'white', borderRadius: '2px', transition: 'all 0.3s ease' }}></div>
      </div>

      {/* Sidebar Navigation */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: isSidebarOpen ? 0 : '-280px',
          width: '280px',
          height: '100vh',
          background: 'rgba(26, 38, 66, 0.98)',
          backdropFilter: 'blur(20px)',
          zIndex: 1001,
          transition: 'right 0.3s ease',
          boxShadow: '-2px 0 20px rgba(0, 0, 0, 0.3)',
          padding: '80px 24px 24px 24px',
          overflowY: 'auto'
        }}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              style={{
                color: 'white',
                textDecoration: 'none',
                padding: '16px 20px',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                display: 'block',
                cursor: 'pointer',
                background: activeSection === section.id ? 'rgba(37, 99, 235, 0.2)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(37, 99, 235, 0.2)';
                e.currentTarget.style.color = '#60a5fa';
                e.currentTarget.style.transform = 'translateX(-8px)';
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = 'transparent';
                }
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {section.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header Section dengan Background Image Blur */}
        <div id="intro" style={{
          position: 'relative',
          padding: '80px 40px 60px 40px',
          textAlign: 'center',
          overflow: 'hidden',
          minHeight: '320px'
        }}>
          {/* Background Image with Blur Effect */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            right: '-20px',
            bottom: '-20px',
            backgroundImage: `url(${sc4500Img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(12px) brightness(0.7)',
            transform: 'scale(1.1)',
            zIndex: 1
          }} />
          
          {/* Gradient Overlay untuk Readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.88) 0%, rgba(30, 64, 175, 0.92) 50%, rgba(37, 99, 235, 0.88) 100%)',
            zIndex: 2
          }} />
          
          {/* Decorative Accent Lines */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)',
            zIndex: 3
          }} />
          
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 4 }}>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: 'white',
              marginBottom: '15px',
              textShadow: '3px 5px 12px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.1)',
              lineHeight: '1.2',
              letterSpacing: '-0.5px'
            }}>
              Cara Pengambilan Data Total Dissolved Solids (TDS)
            </h1>
            <div style={{
              width: '80px',
              height: '4px',
              background: 'rgba(255,255,255,0.8)',
              margin: '20px auto',
              borderRadius: '2px',
              boxShadow: '0 2px 8px rgba(255,255,255,0.3)'
            }} />
            <p style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.98)',
              fontWeight: '500',
              marginTop: '15px',
              textShadow: '2px 3px 6px rgba(0,0,0,0.4)',
              letterSpacing: '0.3px'
            }}>
              Dari Sifat Fisis Sampel Hingga Menjadi Data Digital
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '50px 60px' }}>
          
          {/* Pendahuluan */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Pendahuluan
            </h2>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Monitoring Total Dissolved Solids (TDS) pada sistem geothermal merupakan parameter kritis untuk 
              mencegah kerusakan turbin akibat scaling, korosi, dan carryover. Artikel ini menjelaskan secara 
              detail proses pengambilan data TDS mulai dari pengambilan sampel fisik hingga konversi menjadi 
              sinyal digital yang dapat dibaca oleh sistem monitoring PertaSmart.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              padding: '20px 25px',
              borderRadius: '12px',
              marginTop: '25px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: 'white',
                margin: 0,
                fontWeight: '500'
              }}>
                <strong>💡 Apa itu TDS?</strong><br/>
                TDS (Total Dissolved Solids) adalah ukuran konsentrasi total zat padat terlarut (mineral, garam, 
                logam) dalam air, dinyatakan dalam mg/L atau ppm. TDS tinggi mengindikasikan risiko scaling dan 
                korosi yang dapat merusak turbin geothermal.
              </p>
            </div>
          </section>

          {/* 1. Pengambilan Sampel */}
          <section id="sampling" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              1. Pengambilan Sampel dari Main Pipe
            </h2>
            
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '10px'
            }}>
              Sample Probe dan Sample Line
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Sampel fluida geothermal diambil dari <strong>main pipe</strong> menggunakan <strong>Sample Probe 
              Retractable</strong>. Probe ini dapat dipasang dan dilepas tanpa harus mematikan sistem (hot tapping), 
              memungkinkan perawatan tanpa downtime. Sampel yang diambil kemudian dialirkan melalui 
              <strong> 1/2 inch tube SS316</strong> (stainless steel 316).<Ref num={1} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              <strong>Mengapa SS316?</strong> Stainless steel 316 dipilih karena ketahanannya terhadap korosi dalam 
              lingkungan geothermal yang agresif (mengandung H₂S, CO₂, dan mineral korosif). Material ini juga tahan 
              terhadap tekanan tinggi dan temperatur ekstrem.
            </p>

            <div style={{
              background: '#fff5f5',
              border: '2px solid #fc8181',
              padding: '20px',
              borderRadius: '12px',
              marginTop: '20px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#1a2642',
                margin: 0,
                fontWeight: '600'
              }}>
                ⚠️ <strong>Kondisi Sampel pada Tahap Ini:</strong><br/>
                • Fase: Uap panas (steam)<br/>
                • Tekanan: 2-87 psi (tekanan tinggi dari main pipe)<br/>
                • Temperatur: lebih besar dari 100°C (di atas titik didih air)<br/>
                • Status: <strong>BELUM BISA DIUKUR</strong> - perlu conditioning terlebih dahulu
              </p>
            </div>
          </section>

          {/* 2. Sample Conditioning */}
          <section id="conditioning" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              2. Sample Conditioning: Membuat Sampel Siap Diukur
            </h2>
            
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '10px'
            }}>
              A. Penurunan Temperatur (Sample Cooler)
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Sampel panas dari main pipe melewati <strong>Sample Cooler</strong> yang menurunkan temperatur dari 
              lebih besar dari 100°C menjadi sekitar <strong>50°C</strong>. Temperatur ini dipilih karena:<Ref num={1} />
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #48bb78'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>• Keselamatan Sensor:</strong> Sensor konduktivitas HACH 3422 memiliki batas maksimum 
                temperatur operasi 150°C, namun operasi optimal pada 5-45°C<br/>
                <strong>• Akurasi Pengukuran:</strong> Konduktivitas sangat sensitif terhadap temperatur (±2% per 1°C), 
                sehingga temperatur harus stabil<br/>
                <strong>• Konsistensi Data:</strong> Temperatur setpoint yang konstan memastikan repeatability pengukuran
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Sistem cooling menggunakan <strong>water cooling coil</strong> dengan aliran cooling water yang masuk 
              dan keluar melalui <strong>1/2 inch tube SS316</strong>. Proses pendinginan ini mengubah fase sampel 
              dari uap menjadi liquid yang dapat diukur oleh sensor konduktivitas.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              <strong>Thermal Safety Valve</strong> (Sentry model 7-03634J) dipasang sebagai proteksi jika terjadi 
              overheating. Valve ini akan membuka secara otomatis jika temperatur melebihi setpoint, mengalirkan 
              sampel panas ke drain dan mencegah kerusakan sensor.
            </p>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              B. Stabilisasi Tekanan (Pressure Regulator)
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Setelah pendinginan, tekanan sampel diatur menggunakan <strong>Pressure Regulator</strong> (DK-LOK 
              model KPR1ELA412A20000) yang di-set pada <strong>15 PSI</strong>. Tekanan ini dipilih karena:<Ref num={1} />
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>• Operating Window Sensor:</strong> Sensor konduktivitas dapat beroperasi pada range 2-87 psi, 
                15 psi adalah nilai tengah yang aman<br/>
                <strong>• Stabilitas Aliran:</strong> Tekanan yang stabil menghasilkan flow rate yang konsisten<br/>
                <strong>• Mencegah Bubble Formation:</strong> Tekanan cukup tinggi untuk mencegah gas terlarut keluar 
                dari larutan (degassing)
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Tekanan dipantau menggunakan <strong>Pressure Gauge</strong> (Wika model 232.50) dengan range 
              <strong> 0-30 PSI</strong>. Gauge analog ini memberikan visual indication langsung kepada operator 
              untuk memastikan tekanan berada dalam range yang aman.
            </p>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              C. Kontrol Laju Alir (Flowmeter)
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Laju aliran sampel dikontrol pada <strong>100-300 mL/min</strong> menggunakan <strong>Variable Area 
              Flowmeter</strong> (Swagelok model VAF-M41-1-B6L-0). Flow rate ini dipilih berdasarkan kebutuhan:<Ref num={1} />
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>• Refreshing Sampel:</strong> Aliran cukup cepat untuk memastikan sampel yang melewati 
                sensor selalu segar (bukan stagnant)<br/>
                <strong>• Residence Time:</strong> Flow rate menghasilkan residence time optimal di measurement cell 
                untuk pembacaan akurat<br/>
                <strong>• Konsumsi Efisien:</strong> Tidak terlalu boros sampel, penting untuk efisiensi operasi
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Ball valves (DK-LOK model SS-43GS4 untuk 1/4 inch dan SS-43GS8 untuk 1/2 inch) dipasang di berbagai 
              titik untuk isolasi dan kontrol aliran. Valve-valve ini memungkinkan maintenance sensor tanpa 
              menghentikan keseluruhan sistem.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              padding: '25px',
              borderRadius: '15px',
              marginTop: '25px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '12px'
              }}>
                ✅ Hasil Sample Conditioning
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: 'white',
                margin: 0
              }}>
                Setelah melalui proses conditioning, sampel memiliki karakteristik:<br/>
                • <strong>Fase:</strong> Liquid (air)<br/>
                • <strong>Temperatur:</strong> ~50°C (stabil, terkontrol)<br/>
                • <strong>Tekanan:</strong> 15 PSI (stabil, aman untuk sensor)<br/>
                • <strong>Flow Rate:</strong> 100-300 mL/min (optimal untuk pengukuran)<br/>
                • <strong>Status:</strong> <strong>SIAP UNTUK DIUKUR</strong> oleh sensor konduktivitas
              </p>
            </div>
          </section>

          {/* 3. Pengukuran Konduktivitas */}
          <section id="measurement" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              3. Pengukuran Konduktivitas: Dari Fisis ke Elektrikal
            </h2>
            
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '10px'
            }}>
              Sensor Konduktivitas HACH 3422
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Sampel yang sudah dikondisikan (50°C, 15 PSI, 100-300 mL/min) masuk ke <strong>Conductivity Sensor 
              HACH 3422</strong>. Sensor ini menggunakan teknologi <strong>contacting conductivity</strong> dengan 
              konfigurasi <strong>two-electrode sensor</strong>.<Ref num={2} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              HACH menyediakan tiga model sensor dengan cell constant berbeda, pemilihan model tergantung pada 
              range konduktivitas yang diharapkan:
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>• Model 8315:</strong> Cell constant 0.01 cm⁻¹ → Range 0.01-200 µS/cm (ultra pure water)<br/>
                <strong>• Model 8316:</strong> Cell constant 0.1 cm⁻¹ → Range 0.1-2,000 µS/cm (pure water)<br/>
                <strong>• Model 8317:</strong> Cell constant 1 cm⁻¹ → Range 1-20,000 µS/cm (process water)
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              <strong>Konstruksi Sensor:</strong> Elektroda terbuat dari <strong>Stainless Steel 316L</strong> 
              (Model 8315 dan 8316) atau <strong>Graphite</strong> (Model 8317). O-ring gasket FKM/FPM memastikan 
              sealing yang sempurna. Sensor terintegrasi dengan <strong>PT100 Temperature Sensor</strong> untuk 
              automatic temperature compensation (ATC).<Ref num={2} />
            </p>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              Prinsip Pengukuran Konduktivitas
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Konduktivitas adalah kemampuan larutan untuk menghantarkan arus listrik. Dalam air geothermal, 
              ion-ion terlarut seperti <strong>Na⁺, Cl⁻, Ca²⁺, SO₄²⁻</strong> berperan sebagai carrier muatan 
              listrik. Semakin tinggi konsentrasi ion, semakin tinggi konduktivitas.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              <strong>Langkah-langkah Pengukuran:</strong>
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>1. Aplikasi Tegangan AC:</strong> SC4500 Controller memberikan tegangan AC dengan frekuensi 
                tertentu ke elektroda pertama. Penggunaan AC penting untuk mencegah polarisasi elektroda.<br/><br/>
                
                <strong>2. Pergerakan Ion:</strong> Tegangan AC menyebabkan ion-ion dalam larutan bergerak bolak-balik 
                (oscillation) antara dua elektroda. Ion positif tertarik ke elektroda negatif, dan sebaliknya.<br/><br/>
                
                <strong>3. Aliran Arus:</strong> Pergerakan ion ini menghasilkan arus listrik yang mengalir dalam 
                larutan. Besarnya arus (I) proporsional dengan konsentrasi ion dan tegangan yang diaplikasikan (V).<br/><br/>
                
                <strong>4. Perhitungan Konduktivitas:</strong> Controller mengukur arus yang mengalir dan menghitung 
                konduktivitas menggunakan hukum Ohm yang dimodifikasi untuk sel konduktivitas:<br/>
                <strong style={{ color: '#2563eb', display: 'block', marginTop: '8px', textAlign: 'center' }}>
                  G = κ × (A/L)
                </strong><br/>
                di mana G = conductance (1/resistance), κ = konduktivitas, A/L = cell constant
              </p>
            </div>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              Automatic Temperature Compensation (ATC)
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Konduktivitas sangat sensitif terhadap temperatur - setiap kenaikan 1°C dapat mengubah pembacaan 
              konduktivitas sekitar <strong>2%</strong>. Untuk mendapatkan pembacaan yang akurat dan comparable, 
              konduktivitas harus dinormalisasi ke temperatur referensi (biasanya 25°C).<Ref num={2} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              <strong>PT100 Temperature Sensor</strong> yang terintegrasi dalam sensor konduktivitas mengukur 
              temperatur sampel secara real-time. SC4500 Controller menggunakan data temperatur ini untuk melakukan 
              kompensasi otomatis menggunakan koefisien temperatur yang dapat dikonfigurasi (biasanya 2% per °C 
              untuk pure water, dapat berbeda untuk solution lain).
            </p>

            <div style={{
              background: '#fffaf0',
              padding: '20px 25px',
              borderRadius: '12px',
              marginTop: '25px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#744210',
                margin: 0,
                fontWeight: '500'
              }}>
                <strong>💡 Mengapa ATC Penting?</strong><br/>
                Tanpa ATC, pembacaan konduktivitas pada 30°C bisa 10% lebih tinggi dari pembacaan pada 25°C untuk 
                sampel yang sama. ATC memastikan semua pembacaan comparable dan konsisten, regardless of temperatur 
                fluctuations di field.
              </p>
            </div>
          </section>

          {/* 4. Konversi Digital dan Kalkulasi TDS */}
          <section id="conversion" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              4. Konversi Digital dan Kalkulasi TDS
            </h2>
            
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '10px'
            }}>
              SC4500 Digital Controller: Otak Sistem
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Sinyal konduktivitas dari sensor dikirim ke <strong>SC4500 Digital Controller</strong> melalui kabel 
              sensor khusus. Controller ini adalah microprocessor-based instrument yang berfungsi sebagai "otak" 
              sistem monitoring TDS.<Ref num={3} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              <strong>Fungsi-fungsi SC4500 Controller:</strong>
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>1. Power Supply ke Sensor:</strong> Menyuplai tegangan AC dengan frekuensi dan amplitude 
                yang tepat ke sensor konduktivitas<br/><br/>
                
                <strong>2. Signal Acquisition:</strong> Membaca kembali sinyal arus listrik yang dihasilkan oleh 
                pergerakan ion dalam sampel<br/><br/>
                
                <strong>3. Signal Processing:</strong> Memproses sinyal analog menggunakan precision ADC (Analog 
                to Digital Converter) untuk mendapatkan nilai digital<br/><br/>
                
                <strong>4. Temperature Compensation:</strong> Mengaplikasikan koreksi temperatur menggunakan data 
                dari PT100 sensor<br/><br/>
                
                <strong>5. Conductivity Calculation:</strong> Menghitung nilai konduktivitas (µS/cm) berdasarkan 
                arus terukur dan cell constant sensor<br/><br/>
                
                <strong>6. TDS Conversion:</strong> Mengkonversi konduktivitas menjadi TDS menggunakan faktor 
                konversi yang telah dikalibrasi
              </p>
            </div>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              Formula Konversi TDS
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Konduktivitas tidak secara langsung menunjukkan TDS, karena berbeda ion memiliki kontribusi 
              konduktivitas yang berbeda. Namun, ada korelasi empiris yang kuat antara konduktivitas dan TDS:
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '30px',
              borderRadius: '15px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                Formula Konversi TDS
              </h4>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'white',
                textAlign: 'center',
                margin: '20px 0',
                fontFamily: 'monospace'
              }}>
                TDS (mg/L) = Conductivity (µS/cm) × Conversion Factor
              </p>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: 'white',
                margin: 0,
                textAlign: 'center'
              }}>
                di mana Conversion Factor = 0.55 - 0.70 (tergantung komposisi ion)
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              <strong>Faktor Konversi untuk Berbagai Aplikasi:</strong>
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>• Pure Water / Demineralized Water:</strong> 0.55 (konduktivitas didominasi oleh ion H⁺ dan OH⁻)<br/>
                <strong>• Natural Water / Groundwater:</strong> 0.65 (campuran various ions)<br/>
                <strong>• Seawater / Brine:</strong> 0.70 (high NaCl content)<br/>
                <strong>• Geothermal Fluid:</strong> 0.55-0.65 (tergantung field-specific composition)
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              SC4500 memungkinkan operator untuk mengkonfigurasi faktor konversi spesifik berdasarkan karakteristik 
              fluida di lapangan. Kalibrasi awal dilakukan dengan membandingkan pembacaan TDS sensor dengan hasil 
              analisa laboratorium (gravimetric method) untuk mendapatkan faktor konversi yang akurat.<Ref num={3} />
            </p>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              Display dan User Interface
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              SC4500 dilengkapi dengan <strong>5.7" color LCD touchscreen</strong> yang menampilkan data secara 
              real-time:<Ref num={3} />
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #48bb78'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>• Primary Display:</strong> Nilai TDS saat ini dalam mg/L atau ppm<br/>
                <strong>• Secondary Parameters:</strong> Konduktivitas, temperatur, status alarms<br/>
                <strong>• Trend Graphs:</strong> Historical data untuk analisa trend<br/>
                <strong>• Diagnostics:</strong> Status sensor, calibration due dates, maintenance alerts<br/>
                <strong>• Configuration:</strong> Setup menu untuk parameter adjustment
              </p>
            </div>

            <div style={{
              background: '#fffaf0',
              padding: '20px 25px',
              borderRadius: '12px',
              marginTop: '25px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#744210',
                margin: 0,
                fontWeight: '500'
              }}>
                <strong>💡 Prognosys Predictive Diagnostics:</strong><br/>
                SC4500 dengan fitur Prognosys dapat memprediksi kegagalan sensor sebelum terjadi, berdasarkan 
                analisa trend dan pattern recognition. Ini memungkinkan preventive maintenance alih-alih reactive 
                maintenance, mengurangi downtime dan biaya operasi.
              </p>
            </div>
          </section>

          {/* 5. Output Sinyal */}
          <section id="output" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              5. Output Sinyal: Integrasi dengan Sistem Monitoring
            </h2>
            
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '10px'
            }}>
              Analog Output: 4-20 mA Current Loop
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              SC4500 mengkonversi nilai TDS digital menjadi sinyal analog <strong>4-20 mA current loop</strong>. 
              Standar industri ini dipilih karena keunggulannya dalam transmisi sinyal jarak jauh:<Ref num={3} />
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>Keunggulan 4-20 mA Current Loop:</strong><br/><br/>
                
                <strong>1. Tahan Noise:</strong> Current loop sangat resistant terhadap electrical noise dan EMI 
                (Electromagnetic Interference) dibanding voltage signal<br/><br/>
                
                <strong>2. Long Distance:</strong> Dapat ditransmisikan hingga ratusan meter tanpa degradasi signal<br/><br/>
                
                <strong>3. Live Zero:</strong> 4 mA (bukan 0 mA) sebagai batas bawah memungkinkan deteksi 
                wire break - jika arus turun ke 0 mA, artinya ada putus kabel, bukan pembacaan rendah<br/><br/>
                
                <strong>4. Standard Interface:</strong> Kompatibel dengan semua sistem SCADA, DCS, PLC tanpa 
                additional signal conditioning
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              <strong>Mapping Nilai ke Current:</strong> Controller melakukan linear scaling dari range pengukuran 
              TDS ke output 4-20 mA. Contoh:<Ref num={3} />
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: 'white',
                margin: 0
              }}>
                <strong>Range Setting: 0 - 1000 mg/L TDS</strong><br/><br/>
                
                • TDS = 0 mg/L → Output = 4 mA<br/>
                • TDS = 250 mg/L → Output = 8 mA<br/>
                • TDS = 500 mg/L → Output = 12 mA<br/>
                • TDS = 750 mg/L → Output = 16 mA<br/>
                • TDS = 1000 mg/L → Output = 20 mA<br/><br/>
                
                <strong>Formula:</strong> Output (mA) = 4 + (TDS / Range_max) × 16
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              SC4500 menyediakan hingga <strong>5 isolated 4-20 mA outputs</strong> yang dapat dikonfigurasi secara 
              independen. Setiap output memiliki <strong>maximum load impedance 600 Ohm</strong>, cukup untuk 
              mentransmisikan sinyal jarak jauh dengan wire resistance 300-400 Ohm.
            </p>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              Relay Outputs untuk Alarm dan Control
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Selain analog output, SC4500 dilengkapi dengan <strong>4-6 relay outputs</strong> (tergantung model) 
              yang dapat dikonfigurasi untuk berbagai fungsi:<Ref num={3} />
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #fc8181'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>• High TDS Alarm:</strong> Relay close jika TDS melebihi setpoint (misal lebih besar dari 50 ppm)<br/>
                <strong>• Low TDS Alarm:</strong> Relay close jika TDS di bawah setpoint (misal lebih kecil dari1 ppm)<br/>
                <strong>• System Fault:</strong> Relay untuk sensor error, communication loss, power failure<br/>
                <strong>• Blowdown Control:</strong> Mengaktifkan blowdown valve ketika TDS terlalu tinggi<br/>
                <strong>• Sampling Sequence:</strong> Kontrol multi-stream sampling dengan sequential selection
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Relay contacts rated <strong>5A at 240 VAC (resistive load)</strong>, cukup untuk menggerakkan 
              solenoid valves, alarm bells, atau pilot relays untuk kontrol equipment yang lebih besar.
            </p>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              Digital Communication Protocols
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Untuk integrasi dengan sistem digital modern, SC4500 mendukung berbagai protokol komunikasi:<Ref num={3} />
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>• Modbus RTU (RS485):</strong> Serial communication untuk integrasi dengan PLC atau SCADA. 
                Baud rate configurable 1200-19200 bps<br/><br/>
                
                <strong>• Modbus TCP/IP (Ethernet):</strong> Network communication untuk web-based monitoring dan 
                remote access. Support DHCP atau static IP<br/><br/>
                
                <strong>• Profibus DP:</strong> Industrial fieldbus untuk integrasi dengan Siemens PLC atau DCS<br/><br/>
                
                <strong>• HART Protocol:</strong> Analog + digital hybrid untuk smart device communication
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              <strong>Claros Integration:</strong> SC4500 dapat terhubung dengan <strong>Hach Claros Water 
              Intelligence System</strong>, cloud-based platform untuk water analytics. Ini memungkinkan:<Ref num={3} />
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: 'white',
                margin: 0
              }}>
                <strong>✓</strong> Remote monitoring dari smartphone atau computer<br/>
                <strong>✓</strong> Automatic data logging dan trending<br/>
                <strong>✓</strong> Predictive maintenance alerts via email/SMS<br/>
                <strong>✓</strong> Fleet management untuk multiple sites<br/>
                <strong>✓</strong> Data analytics dan optimization recommendations
              </p>
            </div>

            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              Integration with PertaSmart Dashboard
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Untuk proyek monitoring geothermal PT. Pertamina, SC4500 terintegrasi dengan <strong>PertaSmart 
              Dashboard</strong> yang dikembangkan oleh UNPAD. Data TDS dikirim melalui:
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>1. Hardware Layer:</strong> 4-20 mA output dari SC4500 → Data acquisition module 
                (ADC) → Microcontroller/IoT gateway<br/><br/>
                
                <strong>2. Communication Layer:</strong> IoT gateway mengirim data via MQTT protocol ke cloud 
                server/local server<br/><br/>
                
                <strong>3. Application Layer:</strong> Node.js backend menerima data, menyimpan ke PostgreSQL 
                database, dan serve via REST API<br/><br/>
                
                <strong>4. Presentation Layer:</strong> React frontend menampilkan data real-time dengan 
                ApexCharts visualization
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Dashboard menampilkan tidak hanya nilai TDS current, tetapi juga historical trends, alarm status, 
              dan correlation dengan parameter lain (silica, chloride, sodium) untuk comprehensive water quality 
              monitoring.
            </p>
          </section>

          {/* 6. Integrasi dengan Analyzer Lain */}
          <section id="integration" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              6. Integrasi dengan Analyzer Parameter Lain
            </h2>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Sistem monitoring kualitas air geothermal yang komprehensif tidak hanya mengukur TDS, tetapi juga 
              parameter spesifik lain yang critical untuk operasi turbin. Data TDS dari SC4500 menjadi 
              <strong> baseline reference</strong> untuk analyzer lainnya:
            </p>

            {/* Silica Analyzer */}
            <div style={{ marginBottom: '30px', marginTop: '25px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                A. HACH 5500sc Silica Analyzer
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px',
                textAlign: 'justify'
              }}>
                <strong>Fungsi:</strong> Mengukur <strong>reactive silica (SiO₂)</strong> dalam rentang ultra-low 
                0.5-5000 µg/L (ppb). Silica adalah komponen utama yang menyebabkan scaling pada turbin blade.<Ref num={4} />
              </p>

              <div style={{
                background: '#f7fafc',
                padding: '20px 25px',
                borderRadius: '12px',
                marginBottom: '15px',
                borderLeft: '4px solid #38a169'
              }}>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: '#1a2642',
                  margin: 0
                }}>
                  <strong>Metode Pengukuran:</strong> Silicomolybdate/heteropoly blue colorimetric method<br/>
                  <strong>Wavelength:</strong> 815 nm<br/>
                  <strong>Response Time:</strong> 9.5 minutes at T lebih besar dari 90%<br/>
                  <strong>Accuracy:</strong> ±1% or ±1 µg/L (0-500 µg/L range)<br/>
                  <strong>Sample Requirement:</strong> Sama dengan TDS analyzer - 55-300 mL/min, 5-50°C
                </p>
              </div>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px',
                textAlign: 'justify'
              }}>
                <strong>Korelasi dengan TDS:</strong> TDS tinggi sering berkorelasi dengan silica tinggi. Monitoring 
                kedua parameter membantu memahami composition fluida dan memprediksi scaling potential. Jika TDS 
                naik tapi silica tetap rendah, kemungkinan peningkatan dari ionic species lain (chloride, sulfate).
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px',
                textAlign: 'justify'
              }}>
                <strong>Maintenance:</strong> Reagent replacement setiap 90 hari (2L per reagent). Semi-annual 
                maintenance meliputi stir bar replacement dan tubing replacement.
              </p>
            </div>

            {/* Chloride Analyzer */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                B. EZ1000 Chloride Analyzer
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px',
                textAlign: 'justify'
              }}>
                <strong>Fungsi:</strong> Mengukur <strong>chloride ion (Cl⁻)</strong> dalam rentang 1-10 mg/L. 
                Chloride adalah indikator kuat untuk corrosion potential dan seawater intrusion.<Ref num={5} />
              </p>

              <div style={{
                background: '#f7fafc',
                padding: '20px 25px',
                borderRadius: '12px',
                marginBottom: '15px',
                borderLeft: '4px solid #38a169'
              }}>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: '#1a2642',
                  margin: 0
                }}>
                  <strong>Metode Pengukuran:</strong> Silver chloride precipitation + turbidimetric detection<br/>
                  <strong>Wavelength:</strong> 480 nm<br/>
                  <strong>Cycle Time:</strong> 10 minutes<br/>
                  <strong>Precision:</strong> Better than 2% full scale<br/>
                  <strong>LOD:</strong> ≤1 mg/L
                </p>
              </div>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px',
                textAlign: 'justify'
              }}>
                <strong>Korelasi dengan TDS:</strong> Chloride adalah salah satu major contributors untuk TDS 
                di many geothermal systems. Sudden spike dalam chloride menunjukkan possible seawater intrusion 
                atau reservoir changes, yang akan tercermin juga dalam peningkatan TDS.
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px',
                textAlign: 'justify'
              }}>
                <strong>Impact:</strong> High chloride accelerates corrosion of stainless steel components, 
                particularly in crevices dan heat-affected zones. Combined monitoring TDS dan chloride essential 
                untuk corrosion management.
              </p>
            </div>

            {/* Sodium Analyzer */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                C. NA5600sc Sodium Analyzer
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px',
                textAlign: 'justify'
              }}>
                <strong>Fungsi:</strong> Mengukur <strong>sodium ion (Na⁺)</strong> dengan ultra-sensitive range 
                0.01 ppb hingga 200 ppm. Sodium adalah primary indicator untuk <strong>steam purity</strong> dan 
                boiler water carryover.<Ref num={6} />
              </p>

              <div style={{
                background: '#f7fafc',
                padding: '20px 25px',
                borderRadius: '12px',
                marginBottom: '15px',
                borderLeft: '4px solid #38a169'
              }}>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: '#1a2642',
                  margin: 0
                }}>
                  <strong>Metode Pengukuran:</strong> Ion-selective electrode (ISE) after pH conditioning<br/>
                  <strong>Response Time:</strong> T90 ≤ 3 minutes (0.1 ppb to 10 ppb)<br/>
                  <strong>Repeatability:</strong> lebih kecil dari 0.02 ppb or 1.5% reading<br/>
                  <strong>LOD:</strong> 0.01 ppb (10 ppt)<br/>
                  <strong>Auto Reactivation:</strong> Automatic electrode reactivation every 90 days
                </p>
              </div>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px',
                textAlign: 'justify'
              }}>
                <strong>Steam Purity Monitoring:</strong> Dalam steam cycle, sodium adalah THE most critical 
                parameter. Target sodium in steam: <strong>&lt;2 ppb</strong>. Levels above this indicate boiler 
                water carryover yang dapat menyebabkan turbine deposits dan corrosion.
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px',
                textAlign: 'justify'
              }}>
                <strong>Korelasi dengan TDS:</strong> Sodium umumnya membentuk 30-50% dari TDS dalam geothermal 
                brine. Rasio Na/TDS yang abnormal mengindikasikan changes dalam reservoir chemistry atau 
                contamination dari external sources.
              </p>
            </div>

            {/* System Integration */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '30px',
              borderRadius: '15px',
              marginTop: '30px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                🔄 Multi-Parameter System Integration
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: 'white',
                margin: 0
              }}>
                <strong>Centralized Data Collection:</strong> Semua analyzer terhubung ke PertaSmart Dashboard 
                melalui unified data acquisition system. Data dari TDS, Silica, Chloride, dan Sodium 
                dikorelasikan untuk comprehensive water quality assessment.<br/><br/>
                
                <strong>Alarm Coordination:</strong> Multi-parameter alarm logic memungkinkan intelligent 
                decision making. Contoh: High TDS + High Chloride + High Sodium → Immediate blowdown, bukan 
                cuma single parameter alarm.<br/><br/>
                
                <strong>Predictive Analytics:</strong> Machine learning algorithms menganalisa correlation 
                dan trends dari multiple parameters untuk prediksi scaling, corrosion, dan carryover events 
                sebelum terjadi damage.
              </p>
            </div>
          </section>

          {/* Kesimpulan */}
          <section id="kesimpulan" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #48bb78',
              paddingLeft: '15px'
            }}>
              Kesimpulan: Journey dari Fisis ke Digital
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Proses pengambilan data TDS merupakan contoh sempurna dari konversi properti fisik (konduktivitas 
              ionik) menjadi data digital yang actionable. Setiap tahap dalam chain - dari sample extraction, 
              conditioning, measurement, hingga digital conversion - dirancang dengan precision engineering untuk 
              menghasilkan data yang accurate, reliable, dan real-time.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Sistem monitoring TDS bukan hanya tentang "berapa nilai TDS-nya", tetapi tentang understanding 
              the complete water chemistry, predicting potential problems, dan enabling proactive maintenance 
              decisions yang dapat menghemat miliaran rupiah dalam avoided downtime dan equipment damage.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              padding: '30px',
              borderRadius: '15px',
              marginTop: '30px',
              boxShadow: '0 10px 30px rgba(72,187,120,0.3)'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                🎯 Key Takeaways
              </h4>
              <ul style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: 'white',
                marginTop: '15px',
                paddingLeft: '20px'
              }}>
                <li><strong>Precision at Every Step:</strong> Sample conditioning (temperature, pressure, flow) 
                harus presisi untuk akurasi pengukuran</li>
                <li><strong>Two-Electrode Simplicity:</strong> Sensor konduktivitas contacting sederhana namun 
                sangat akurat dan reliable</li>
                <li><strong>Intelligent Processing:</strong> SC4500 tidak hanya measure, tetapi juga apply 
                temperature compensation dan conversion algorithms</li>
                <li><strong>Industry Standard Output:</strong> 4-20 mA current loop memungkinkan integration 
                seamless dengan existing control systems</li>
                <li><strong>Multi-Parameter Correlation:</strong> TDS data paling powerful ketika dikorelasikan 
                dengan silica, chloride, dan sodium untuk holistic water quality picture</li>
                <li><strong>Predictive Power:</strong> Continuous real-time monitoring dengan Prognosys enables 
                predictive maintenance dan process optimization</li>
              </ul>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginTop: '25px',
              marginBottom: '15px',
              textAlign: 'justify'
            }}>
              Dengan memahami proses lengkap pengambilan data TDS - dari physics hingga digital display di 
              PertaSmart Dashboard - operator dan engineers dapat membuat better decisions, optimize processes, 
              dan ultimately ensure reliable, efficient operation dari geothermal power plants.
            </p>
          </section>

          {/* Daftar Pustaka */}
          <section id="dafpus" style={{ 
            marginTop: '50px',
            paddingTop: '30px',
            borderTop: '3px solid #e2e8f0'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px'
            }}>
              Daftar Pustaka
            </h2>

            <div style={{
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#4a5568'
            }}>
              <p id="ref-1" style={{ marginBottom: '12px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [1] PT Pertamina Research & Technology Innovation. "Hookup Drawing: Schematic Sampling Conditioning 
                System TDS Analyzer". <em>Technical Drawing</em>, Rev.0, 2025.
              </p>

              <p id="ref-2" style={{ marginBottom: '12px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [2] Hach Company. "Contacting Conductivity Sensors Models 8315, 8316, 8317". 
                <em>Product Technical Data</em>, LIT2820 Rev 2, 2022.
              </p>

              <p id="ref-3" style={{ marginBottom: '12px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [3] Hach Company. "Digital Controller SC4500". <em>Product Specification Sheet</em>, 
                DOC053.53.35316.Sep23, 2023.
              </p>

              <p id="ref-4" style={{ marginBottom: '12px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [4] Hach Company. "5500 sc Silica Analyzer". <em>Product Brochure and Technical Specifications</em>, 
                Section 13400, 2024.
              </p>

              <p id="ref-5" style={{ marginBottom: '12px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [5] Hach Company. "EZ1000 Series Chloride Analyzers". <em>Product Technical Data</em>, 
                DOC053.53.35185.Oct22, 2022.
              </p>

              <p id="ref-6" style={{ marginBottom: '12px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [6] Hach Company. "NA5600sc Online Sodium Analyzer". <em>Product Brochure</em>, 
                DOC053.53.35149.Sep19, 2019.
              </p>

              <p id="ref-7" style={{ marginBottom: '12px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [7] ASTM International. "ASTM D1125 - Standard Test Methods for Electrical Conductivity and 
                Resistivity of Water". <em>ASTM Standards</em>, 2014.
              </p>

              <p id="ref-8" style={{ marginBottom: '12px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [8] ISO 7888:1985. "Water quality - Determination of electrical conductivity". 
                <em>International Organization for Standardization</em>, 1985.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>

    {/* Footer */}
    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          <p>&copy; 2025 PertaSmart System - PT. Pertamina Geothermal Energy & Universitas Padjadjaran. All rights reserved.</p>
        </div>
      </div>
    </footer>
    </>
  );
}
