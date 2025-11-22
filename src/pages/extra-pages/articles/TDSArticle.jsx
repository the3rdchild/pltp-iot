import React from 'react';
import { useNavigate } from 'react-router-dom';

import turbineDamageImg from '/src/assets/images/articles/tds/turbine_damage_before_after.jpg';
import pltpSystemImg from '/src/assets/images/articles/tds/pltp_system_diagram.png';
import silicaDepositsImg from '/src/assets/images/articles/tds/silica_deposits_blade.jpg';
import monitoringSystemImg from '/src/assets/images/articles/tds/monitoring_system_panel.jpg';

export default function TDSArticle() {
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
      setIsSidebarOpen(false); // Close sidebar after click
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
    { id: 'carryover', label: 'Fenomena Carryover' },
    { id: 'dampak', label: 'Dampak TDS' },
    { id: 'kasus', label: 'Kasus Indonesia' },
    { id: 'monitoring', label: 'Monitoring & Kontrol' },
    { id: 'kesimpulan', label: 'Kesimpulan' },
    { id: 'dafpus', label: 'Daftar Pustaka' }
  ];

  return (
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
        {/* Header Section */}
        <div id="intro" style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          padding: '80px 40px 60px 40px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '15px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            lineHeight: '1.2'
          }}>
            Total Dissolved Solids (TDS)
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500',
            marginTop: '10px'
          }}>
            Bagaimana Mineral Terlarut Merusak Turbin Panas Bumi Senilai Miliaran Rupiah
          </p>
        </div>

        {/* Content Section */}
        <div style={{ padding: '50px 60px' }}>
          
          {/* Opening - The Problem */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Ketika Turbin Senilai Miliaran Rusak dalam Hitungan Bulan
            </h2>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Tahun 2009, inspeksi rutin di PLTP Wayang Windu, Jawa Barat, mengungkap kerusakan yang mengejutkan. 
              Erosi pada turbin 110 MW buatan Fuji begitu parah hingga seluruh rotor harus diganti — perbaikan yang 
              memakan biaya miliaran rupiah dan tidak selesai hingga 2012. Selama periode itu, pembangkit tidak 
              dapat beroperasi dengan kapasitas penuh.<Ref num={1} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Penyebabnya? Bukan kegagalan mekanis biasa. Musuh sebenarnya adalah sesuatu yang tidak terlihat mata: 
              <strong> Total Dissolved Solids (TDS)</strong> — mineral dan garam yang terlarut dalam fluida panas bumi.
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
                TDS adalah perbandingan banyaknya zat padat (mineral, garam, logam) yang terlarut dalam fluida 
                panas bumi. Bayangkan seperti gula yang larut dalam air — tidak terlihat saat larut, tetapi saat 
                air menguap, kristal akan terbentuk. Di PLTP, "kristal" ini membentuk endapan keras seperti kaca 
                pada sudu turbin dengan kecepatan dan suhu ekstrem.
              </p>
            </div>
          </section>

          {/* Gambar: Before/After Turbin dengan Deposit TDS */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={turbineDamageImg} 
              alt="Kerusakan turbin akibat deposit TDS - Before After"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            <div style={{
              background: '#f7fafc',
              padding: '12px 20px',
              fontSize: '13px',
              color: '#718096',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              Gambar 1: Perbandingan turbin bersih vs turbin dengan deposit TDS setelah operasi
            </div>
          </div>

          {/* Carryover Phenomenon */}
          <section id="carryover" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Fenomena "Carryover": Peluru Mikroskopis yang Menghancurkan
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              <strong>Carryover</strong> adalah terikutnya tetesan air yang mengandung mineral terlarut ke dalam 
              aliran uap menuju turbin. Meski separator dirancang dengan efisiensi 99,9%, tetesan mikroskopis 
              tetap lolos — dan di sinilah masalah dimulai.<Ref num={2} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Bayangkan <em>sandblaster</em> berkecepatan tinggi, tetapi alih-alih pasir, tetesan air berisi 
              mineral menghantam sudu turbin dengan kecepatan <strong>500 km/jam</strong> — lebih cepat dari kereta 
              peluru. Setiap tetesan seperti palu mikroskopis yang secara bertahap mengikis bahkan baja terkuat.<Ref num={3} />
            </p>

            <div style={{
              background: '#fff5f5',
              border: '2px solid #2563eb',
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
                ⚠️ <strong>Fakta Mengejutkan:</strong> Jika kecepatan tetesan digandakan, kerusakan tidak hanya 
                dua kali lipat — tetapi meningkat hingga <strong>lebih dari 100 kali lipat</strong>! Inilah mengapa 
                bahkan carryover dalam jumlah kecil menyebabkan kerusakan masif.<Ref num={4} />
              </p>
            </div>
          </section>

          {/* Gambar: Diagram Sistem PLTP */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            background: 'white'
          }}>
            <img 
              src={pltpSystemImg} 
              alt="Diagram sistem PLTP dengan titik monitoring TDS"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            <div style={{
              background: '#f7fafc',
              padding: '12px 20px',
              fontSize: '13px',
              color: '#718096',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              Gambar 2: Skema sistem PLTP menunjukkan aliran fluida dan titik-titik monitoring TDS
            </div>
          </div>

          {/* Tiga Dampak Utama */}
          <section id="dampak" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Tiga Cara TDS Menghancurkan Turbin
            </h2>

            {/* A. Erosi Sudu Turbin */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                A. Erosi Sudu Turbin (Mengikis Sudu Turbin)
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>Mekanisme Erosi Tetesan Air:</strong> Tetesan cairan bergerak dengan kecepatan tinggi 
                (100-600 m/s) dan saat menghantam permukaan sudu, menciptakan pulsa tekanan yang intens dan 
                terlokalisasi. Efek <em>water hammer</em> menghasilkan tekanan yang melebihi kekuatan luluh 
                material.<Ref num={5} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>Hubungan Eksponensial dengan Kecepatan:</strong> Erosi mengikuti hukum pangkat: 
                ER ~ V<sup>n</sup> di mana n = 7-13 tergantung material. Ini berarti <strong>menggandakan kecepatan 
                meningkatkan erosi 128-512 kali lipat</strong>. Ujung sudu, di mana kecepatan melebihi 600 m/s, 
                mengalami kerusakan paling parah.<Ref num={6} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>Contoh Nyata:</strong> Unit panas bumi 28 MW yang beroperasi selama 7 tahun menunjukkan 
                37 dari 62 sudu tahap terakhir mengalami retak yang dimulai dari <em>trailing edge</em>.<Ref num={7} />
              </p>
            </div>

            {/* B. Kerusakan Lapisan Pelindung */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                B. Kerusakan Lapisan Pelindung (Merusak Coating)
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                Sudu turbin sering memiliki lapisan pelindung (Stellite, kromium keras, lapisan nitrida). Tumbukan 
                tetesan air menciptakan kerusakan mekanis langsung, pengelupasan material coating, perambatan retak 
                pada antarmuka coating-substrat, dan delaminasi.<Ref num={8} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>Sinergi Oksidasi-Erosi:</strong> Ini sangat berbahaya — erosi menghilangkan lapisan oksida 
                pelindung, mengekspos permukaan logam segar yang cepat teroksidasi. Lapisan oksida yang rapuh 
                sangat rentan terhadap erosi. Siklus ini berulang, secara dramatis mempercepat kehilangan material.<Ref num={9} />
              </p>
            </div>

            {/* C. Gangguan Keseimbangan Turbin */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                C. Gangguan Keseimbangan Turbin
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>Kehilangan Material Tidak Merata:</strong> Erosi tidak terjadi secara seragam di sekitar 
                baris sudu. Variasi distribusi kualitas uap, zona kelembaban tinggi lokal, dan kerusakan sebelumnya 
                menciptakan pola erosi non-uniform.<Ref num={10} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>Konsekuensi Operasional:</strong> Peningkatan level getaran memicu alarm, reduksi 
                kecepatan operasi maksimum, <em>forced outages</em> untuk rebalancing, umur bearing lebih pendek, 
                dan potensi kegagalan katastropik jika tidak ditangani.<Ref num={11} />
              </p>
            </div>
          </section>

          {/* Gambar: Deposit Silika pada Sudu Turbin */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={silicaDepositsImg} 
              alt="Deposit silika pada sudu turbin panas bumi"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            <div style={{
              background: '#f7fafc',
              padding: '12px 20px',
              fontSize: '13px',
              color: '#718096',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              Gambar 3: Deposit silika dan mineral terlarut pada sudu turbin geothermal
            </div>
          </div>

          {/* Contoh Kasus Indonesia */}
          <section id="kasus" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Pengalaman PLTP Indonesia
            </h2>

            <div style={{
              background: '#f7fafc',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1a2642',
                marginBottom: '12px'
              }}>
                📍 PLTP Kamojang (Jawa Barat) — 235 MW
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                PLTP komersial pertama Indonesia (1983) ini menghadapi masalah berulang: turbin memerlukan 
                <strong> overhaul setiap 2 tahun</strong> akibat penumpukan kerak silika. Efisiensi turun dari 
                97,55% (setelah overhaul) menjadi 78,18% — kehilangan <strong>hampir 20% output</strong> hanya 
                dalam 2 tahun operasi. Pembentukan kerak SiO₂, FeS₂, dan ClO₂ pada nozel dan sudu turbin menjadi 
                bukti nyata dampak TDS tinggi.<Ref num={12} />
              </p>
            </div>

            <div style={{
              background: '#f7fafc',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb'
            }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1a2642',
                marginBottom: '12px'
              }}>
                📍 PLTP Wayang Windu (Jawa Barat) — 227 MW
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                Tahun 2009, inspeksi mengungkap kerusakan erosi pada turbin Fuji 110 MW yang begitu parah hingga 
                memerlukan <strong>penggantian rotor lengkap</strong>. Rotor baru baru terpasang pada 2012 — 
                investasi kapital signifikan ditambah kerugian produksi selama <em>outage</em> berkepanjangan.<Ref num={13} />
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(30, 64, 175, 0.05) 100%)',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #48bb78'
            }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1a2642',
                marginBottom: '12px'
              }}>
                📍 PLTP Salak (Jawa Barat) — 377 MW ⭐
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                <strong>Kisah sukses!</strong> Lapangan panas bumi terbesar di Indonesia ini mempertahankan 
                <strong> capacity factor 95%</strong> selama hampir 20 tahun melalui monitoring TDS yang waspada 
                dan manajemen proaktif. Pelajaran: monitoring berkelanjutan dan respons cepat mencegah perbaikan 
                mahal.<Ref num={14} />
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
                <strong>💡 Pelajaran Utama:</strong> Perbedaan antara Salak (95% capacity factor selama 20+ tahun) 
                dan Kamojang (overhaul 2 tahun) bukan pada teknologi turbin — tetapi pada <strong>kualitas 
                monitoring dan respons proaktif terhadap TDS</strong>.
              </p>
            </div>
          </section>

          {/* Monitoring dan Kontrol */}
          <section id="monitoring" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Monitoring dan Pengendalian TDS
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Monitoring TDS bukan opsional — sama pentingnya dengan monitoring tekanan dan temperatur. 
              Sistem modern menggunakan berbagai teknologi:<Ref num={15} />
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              padding: '30px',
              borderRadius: '15px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '20px'
              }}>
                🔬 Teknologi Monitoring Online
              </h4>

              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '15px 20px',
                borderRadius: '10px',
                marginBottom: '15px',
                backdropFilter: 'blur(10px)'
              }}>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: 'white',
                  margin: 0
                }}>
                  <strong>• Flame Photometry:</strong> Mengukur sodium sebagai indikator utama kemurnian uap. 
                  Sistem alarm pada level tinggi dan sangat tinggi terintegrasi dengan komputer sentral.<Ref num={16} />
                </p>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '15px 20px',
                borderRadius: '10px',
                marginBottom: '15px',
                backdropFilter: 'blur(10px)'
              }}>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: 'white',
                  margin: 0
                }}>
                  <strong>• Advanced Steam Purity Analyzer:</strong> Multi-parameter (sodium, silika, klorida, 
                  besi, kekeruhan, gas tidak terkondensasi). Batas deteksi 10-20 ppb untuk meminimalkan kerusakan 
                  turbin.<Ref num={17} />
                </p>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '15px 20px',
                borderRadius: '10px',
                backdropFilter: 'blur(10px)'
              }}>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: 'white',
                  margin: 0
                }}>
                  <strong>• Sistem SMART (Real-time):</strong> Integrasi SCADA untuk monitoring jarak jauh, 
                  sensor wireless dengan baterai 10 tahun, dan analytics prediktif berbasis machine learning.<Ref num={18} />
                </p>
              </div>
            </div>

            <div style={{
              background: '#fff5f5',
              border: '2px solid #2563eb',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '12px'
              }}>
                🎯 Target Kualitas Uap Kritis
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#1a2642',
                margin: 0
              }}>
                <strong>• TDS dalam uap:</strong> &lt;5 ppm ideal, &lt;15 ppm dapat diterima<br/>
                <strong>• Kualitas uap:</strong> ≥99% kering (≤1% moisture)<br/>
                <strong>• Silika dalam uap:</strong> &lt;0,02 ppm ideal, &lt;0,1 ppm dapat diterima<br/>
                <strong>• Sodium dalam uap:</strong> &lt;2 ppb (parts per billion)<Ref num={19} />
              </p>
            </div>

            <h4 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '30px'
            }}>
              ⚙️ Strategi Pengendalian
            </h4>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>1. Optimasi Separator Primer:</strong> Kontrol level separator (parameter operasional 
              paling kritis), optimasi kecepatan inlet dan tekanan, monitoring <em>breakdown velocity</em>.<Ref num={20} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>2. Sistem Scrubbing Uap:</strong> <em>Drain pots</em> menghilangkan kondensat dan 
              <em>liquid carry-over</em> melalui pengendapan gravitasi. Target ≥99% kualitas uap di inlet turbin.<Ref num={21} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>3. Separator Sekunder & Demister:</strong> Vessel besar dengan mesh atau pelat bergelombang 
              bertumpuk untuk mengkoalesi tetesan mikro. Dikombinasikan dengan scrubbing untuk hasil optimal.<Ref num={22} />
            </p>
          </section>
          
          {/* Gambar: Sistem Monitoring TDS Real-time */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            background: 'white'
          }}>
            <img 
              src={monitoringSystemImg} 
              alt="Sistem monitoring TDS real-time di PLTP"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            <div style={{
              background: '#f7fafc',
              padding: '12px 20px',
              fontSize: '13px',
              color: '#718096',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              Gambar 4: Sistem monitoring kualitas uap dan TDS secara real-time
            </div>
          </div>

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
              Kesimpulan: Monitoring adalah Kunci
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Pengalaman lapangan panas bumi Indonesia membuktikan: <strong>monitoring TDS yang konsisten 
              memungkinkan operasi andal selama 20+ tahun dengan capacity factor tinggi</strong>. Perbedaan antara 
              Salak yang sukses dan Kamojang yang memerlukan overhaul 2 tahunan bukan terletak pada teknologi 
              turbin — tetapi pada kualitas monitoring dan respons proaktif.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Dengan sistem SMART (System Monitoring Analysis Real Time) yang terintegrasi, PT Pertamina dan 
              Universitas Padjadjaran mengembangkan solusi monitoring yang memungkinkan deteksi dini, respons 
              cepat, dan optimasi berkelanjutan — memastikan PLTP Indonesia dapat beroperasi dengan efisiensi 
              maksimal dan downtime minimal.
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
                🎯 Poin Kunci untuk PLTP Indonesia
              </h4>
              <ul style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: 'white',
                marginTop: '15px',
                paddingLeft: '20px'
              }}>
                <li><strong>Monitoring TDS bukan opsional</strong> — sama pentingnya dengan tekanan dan temperatur</li>
                <li><strong>Deteksi dini menghemat miliaran</strong> — masalah yang tertangkap dini berharga ribuan, terlambat berharga miliaran</li>
                <li><strong>Setiap lapangan unik</strong> — Lahendong (150-540 mg/L) memerlukan manajemen berbeda dari Salak atau Kamojang</li>
                <li><strong>Teknologi terus maju</strong> — sistem SMART, sensor wireless, dan predictive analytics memungkinkan manajemen proaktif</li>
                <li><strong>Pengalaman Pertamina berharga</strong> — puluhan tahun operasi di berbagai lapangan memberikan pembelajaran vital</li>
              </ul>
            </div>
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
              <p id="ref-1" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [1] Star Energy Geothermal. "Wayang Windu Geothermal Power Plant Operations Report". 
                <em>Technical Documentation</em>, 2012.
              </p>

              <p id="ref-2" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [2] Rizaldy, M., Zarrouk, S.J. "Liquid Carryover in Geothermal Steam-Water Separators". 
                <em>Proceedings of New Zealand Geothermal Workshop</em>, 2016.
              </p>

              <p id="ref-3" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [3] Chemaqua. "Technical Bulletin TB1-004: Boiler Water Carryover". <em>Chemaqua Water Treatment</em>, 2024.
              </p>

              <p id="ref-4" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [4] NCBI. "Experimental Research on Water Droplet Erosion Resistance Characteristics of Turbine 
                Blade Substrate and Strengthened Layers Materials". <em>PMC</em>, 2020.
              </p>

              <p id="ref-5" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [5] IntechOpen. "An Overview of Droplet Impact Erosion, Related Theory and Protection Measures 
                in Steam Turbines". <em>IntechOpen</em>, 2018.
              </p>

              <p id="ref-6" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [6] IntechOpen. "Droplet Impact Erosion Theory and Protection Measures in Steam Turbines". 
                <em>IntechOpen</em>, 2018.
              </p>

              <p id="ref-7" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [7] ScienceDirect. "Last stage blades failure analysis of a 28 MW geothermal turbine". 
                <em>Engineering Failure Analysis</em>, Vol. 16, Issue 4, 2009.
              </p>

              <p id="ref-8" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [8] POWER Magazine. "Fighting Scale and Corrosion on Balance of Geothermal Plant Equipment". 
                <em>POWER Magazine</em>, 2015.
              </p>

              <p id="ref-9" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [9] POWER Magazine. "Fighting Scale and Corrosion on Balance of Geothermal Plant Equipment". 
                <em>POWER Magazine</em>, 2015.
              </p>

              <p id="ref-10" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [10] ThinkGeoEnergy. "Optimizing geothermal turbines: Best practices and innovations". 
                <em>ThinkGeoEnergy</em>, 2024.
              </p>

              <p id="ref-11" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [11] ThinkGeoEnergy. "Optimizing geothermal turbines: Best practices and innovations". 
                <em>ThinkGeoEnergy</em>, 2024.
              </p>

              <p id="ref-12" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [12] AIP Conference Proceedings. "The effect of the silica crust on the blades on the efficiency 
                of the steam turbine in geothermal power plant". <em>AIP Publishing</em>, Vol. 1983, 2018.
              </p>

              <p id="ref-13" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [13] Star Energy Geothermal. "Wayang Windu Geothermal Power Plant Operations Report". 
                <em>Technical Documentation</em>, 2012.
              </p>

              <p id="ref-14" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [14] ScienceDirect. "The Salak Field, Indonesia: On to the next 20 years of production". 
                <em>Geothermics</em>, Vol. 74, 2018.
              </p>

              <p id="ref-15" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [15] KROHNE. "Geothermal flash, binary and hybrid power generation". <em>KROHNE Group</em>, 2024.
              </p>

              <p id="ref-16" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [16] OSTI. "Continuous on-line steam quality monitoring system of the Bacman Geothermal Production 
                Field, Philippines". <em>OSTI.GOV</em>, 1995.
              </p>

              <p id="ref-17" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [17] Thermochem. "Advanced On-line Steam Purity Analyzer". <em>Thermochem Technical Documentation</em>, 2020.
              </p>

              <p id="ref-18" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [18] KROHNE. "Geothermal steam measurement systems". <em>KROHNE Solutions</em>, 2024.
              </p>

              <p id="ref-19" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [19] ResearchGate. "Steam Purity Considerations in Geothermal Power Generation". 
                <em>ResearchGate</em>, 2015.
              </p>

              <p id="ref-20" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [20] ScienceDirect. "Geothermal steam-water separators: Design overview". <em>Geothermics</em>, 
                Vol. 53, 2015.
              </p>

              <p id="ref-21" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [21] ResearchGate. "Scrubbing Lines in Geothermal Power Generation Systems". 
                <em>ResearchGate</em>, 2010.
              </p>

              <p id="ref-22" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [22] ResearchGate. "Monitoring of geothermal steam moisture separator efficiency". 
                <em>Geothermics</em>, Vol. 32, 2003.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}