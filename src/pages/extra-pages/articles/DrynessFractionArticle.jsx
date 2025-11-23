import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import gambar - Lab upload ke folder ini ya
import wetSteamDiagram from '/src/assets/images/articles/dryness-fraction/wet_steam_diagram.jpg';
import turbineErosionBlade from '/src/assets/images/articles/dryness-fraction/turbine_erosion_blade.jpg';
import separatorSystem from '/src/assets/images/articles/dryness-fraction/separator_system.jpg';
import drynessEfficiencyGraph from '/src/assets/images/articles/dryness-fraction/dryness_efficiency_graph.jpg';

export default function DrynessArticle() {
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
    { id: 'definisi', label: 'Definisi & Konsep' },
    { id: 'dampak', label: 'Dampak Wet Steam' },
    { id: 'standar', label: 'Standar & Rekomendasi' },
    { id: 'studi', label: 'Studi Lapangan' },
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
            Dryness Fraction
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500',
            marginTop: '10px'
          }}>
            Mengapa Kandungan Air 1% Bisa Menghancurkan Efisiensi Turbin Hingga 20%
          </p>
        </div>

        {/* Content Section */}
        <div style={{ padding: '50px 60px' }}>
          
          {/* Opening - The Silent Killer */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Musuh Tersembunyi dalam Setiap Tetesan Air
            </h2>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Di PLTU Mamuju, sebuah fenomena mengejutkan terjadi setelah overhaul turbin. Efisiensi yang 
              semula 91,16% merosot tajam menjadi hanya 86,7% — kehilangan hampir 5% produktivitas. 
              Analisis mendalam mengungkap penyebabnya: <strong>dryness fraction turun dari 1.02 menjadi 0.99</strong>. 
              Penurunan yang tampak kecil ini — hanya 3% — ternyata berdampak pada kerugian operasional 
              yang sangat besar.<Ref num={1} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Ini bukan kasus terisolasi. Di PLTP Kamojang, turbin harus menjalani overhaul setiap 2 tahun 
              karena akumulasi kerak dan erosi yang disebabkan oleh wet steam. Efisiensi turun drastis dari 
              97,55% menjadi 78,18% — kehilangan hampir 20% output hanya dalam 2 tahun operasi.<Ref num={2} />
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
                <strong>💧 Apa itu Dryness Fraction?</strong><br/>
                Dryness fraction (fraksi kekeringan) adalah rasio massa uap terhadap total massa campuran 
                uap-air. Nilai 1.0 (100%) berarti uap murni tanpa tetesan air, sedangkan 0.9 (90%) berarti 
                10% massa adalah air cair. Dalam PLTP, bahkan perbedaan 1% dalam dryness fraction bisa 
                menyebabkan penurunan efisiensi turbin hingga 1% — yang diterjemahkan menjadi jutaan dolar 
                kerugian per tahun.
              </p>
            </div>
          </section>

          {/* Gambar: Wet Steam Diagram */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={wetSteamDiagram} 
              alt="Diagram wet steam vs dry steam - visualisasi dryness fraction"
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
              Gambar 1: Perbedaan wet steam (dryness fraction rendah) dan dry steam (dryness fraction tinggi)
            </div>
          </div>

          {/* Definisi & Konsep */}
          <section id="definisi" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Memahami Dryness Fraction: Dari Konsep ke Realita
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Dryness fraction didefinisikan sebagai rasio massa uap kering terhadap total massa campuran 
              dua fase (uap + air). Secara matematis:<Ref num={3} />
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '20px 25px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '18px'
            }}>
              x = m<sub>vapor</sub> / (m<sub>vapor</sub> + m<sub>liquid</sub>)
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Dimana:
              <br/>• x = dryness fraction (0 hingga 1)
              <br/>• m<sub>vapor</sub> = massa uap kering
              <br/>• m<sub>liquid</sub> = massa air cair dalam campuran
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              <strong>Rentang Nilai:</strong>
              <br/>• x = 0: Seluruhnya air cair (saturated liquid)
              <br/>• 0 &lt; x &lt; 1: Campuran dua fase (wet steam)
              <br/>• x = 1: Uap jenuh kering (saturated vapor)
              <br/>• x &gt; 1: Uap panas lanjut (superheated steam)<Ref num={4} />
            </p>
          </section>

          {/* Dampak Wet Steam */}
          <section id="dampak" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Tiga Cara Wet Steam Menghancurkan Turbin
            </h2>

            {/* A. Penurunan Efisiensi */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                A. Penurunan Efisiensi: "Baumann Rule"
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                Baumann Rule adalah prinsip empiris yang menyatakan: <strong>setiap 1% peningkatan kadar air 
                (penurunan dryness fraction) menyebabkan penurunan efisiensi turbin sekitar 1%</strong>. 
                Ini terjadi karena:<Ref num={5} />
              </p>

              <ul style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                paddingLeft: '40px',
                marginBottom: '15px'
              }}>
                <li><strong>Energi terbuang untuk mengangkut air cair:</strong> Tetesan air tidak berkontribusi 
                pada kerja turbin, tetapi tetap mengonsumsi energi kinetik dari aliran uap.</li>
                <li><strong>Penurunan tekanan efektif:</strong> Air cair mengurangi area aliran uap yang efektif, 
                menurunkan ekspansi dan kerja yang dihasilkan.</li>
                <li><strong>Losses akibat percikan:</strong> Tetesan yang terlempar dari sudu menciptakan turbulensi 
                dan losses tambahan.<Ref num={6} /></li>
              </ul>

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
                  💡 <strong>Contoh Perhitungan:</strong> Turbin dengan dryness fraction 0.90 (10% moisture) 
                  akan mengalami penurunan efisiensi sekitar 10% dibandingkan dengan dry steam (x=1.0). 
                  Untuk PLTP 110 MW, ini setara dengan kehilangan 11 MW output — cukup untuk menerangi 
                  8,000+ rumah!
                </p>
              </div>
            </div>

            {/* B. Erosi & Korosi */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                B. Erosi Sudu Turbin: Water Droplet Erosion (WDE)
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                Tetesan air dalam wet steam bergerak dengan kecepatan 100-600 m/s dan menghantam sudu turbin 
                dengan tekanan impak yang luar biasa tinggi. Fenomena Water Droplet Erosion (WDE) ini menyebabkan:<Ref num={7} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>• Pitting dan Erosi Permukaan:</strong> Tumbukan berulang menciptakan lubang-lubang 
                kecil (pits) yang secara progresif memperdalam dan memperluas, mengubah profil aerodinamis sudu.<Ref num={8} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>• Crack Initiation:</strong> Konsentrasi tegangan di sekitar pit menjadi titik awal 
                retak (crack) yang dapat menyebar hingga kegagalan katastropik sudu.<Ref num={9} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>• Coating Failure:</strong> Lapisan pelindung seperti stellite atau chrome plating 
                mengalami delaminasi akibat tumbukan tetesan, mengekspos material dasar yang lebih rentan.<Ref num={10} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>Tingkat erosi meningkat eksponensial saat dryness fraction &lt; 0.9</strong> — penelitian 
                menunjukkan bahwa penurunan dari x=0.95 ke x=0.85 dapat meningkatkan laju erosi hingga 
                <strong> 10x lipat</strong>.<Ref num={11} />
              </p>
            </div>

            {/* C. Korosi */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                C. Korosi Akselerasi
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                Wet steam tidak hanya merusak secara mekanis, tetapi juga secara kimiawi. Air cair dalam 
                wet steam mengandung mineral terlarut dan gas korosif yang mempercepat korosi:<Ref num={12} />
              </p>

              <ul style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                paddingLeft: '40px',
                marginBottom: '15px'
              }}>
                <li>Film air pada sudu menciptakan lingkungan elektrolit ideal untuk korosi galvanik</li>
                <li>Oksigen terlarut mengakselerasi oksidasi permukaan logam</li>
                <li>Gas asam (CO₂, H₂S) dalam wet steam menurunkan pH, meningkatkan laju korosi</li>
                <li>Siklus basah-kering berulang mempercepat pertumbuhan lapisan oksida dan pengelupasannya</li>
              </ul>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>Sinergi erosi-korosi</strong> sangat berbahaya: erosi menghilangkan lapisan oksida 
                pelindung, mengekspos logam segar yang cepat teroksidasi. Lapisan oksida yang rapuh kemudian 
                mudah tererosi. Siklus ini mempercepat degradasi material hingga 100x dibandingkan dengan 
                erosi atau korosi saja.<Ref num={13} />
              </p>
            </div>
          </section>

          {/* Gambar: Turbine Erosion */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={turbineErosionBlade} 
              alt="Kerusakan sudu turbin akibat wet steam erosion"
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
              Gambar 2: Erosi dan korosi parah pada sudu turbin akibat wet steam
            </div>
          </div>

          {/* Standar & Rekomendasi */}
          <section id="standar" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Standar Dryness Fraction untuk Operasi Optimal
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Berdasarkan pengalaman operasional PLTP global dan rekomendasi pabrikan turbin, standar 
              dryness fraction yang harus dijaga adalah:<Ref num={14} />
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
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                🎯 Target Dryness Fraction
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
                  <strong>• Minimum Acceptable:</strong> x ≥ 0.90 (90% steam quality)<br/>
                  Di bawah nilai ini, risiko kerusakan turbin meningkat drastis
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
                  <strong>• Recommended:</strong> x ≥ 0.95 (95% steam quality)<br/>
                  Operasi efisien dengan wear rate turbin minimal
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
                  <strong>• Optimal:</strong> x ≥ 0.98-1.00 (Dry/Superheated steam)<br/>
                  Efisiensi maksimum, umur turbin terpanjang
                </p>
              </div>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              <strong>Catatan Penting:</strong> Pada PLTP flash, mencapai x = 1.0 sangat sulit karena proses 
              pemisahan uap-air tidak pernah 100% efektif. Oleh karena itu, target realistis adalah x = 0.96-0.99 
              dengan separator dan demister yang optimal.<Ref num={15} />
            </p>
          </section>

          {/* Studi Lapangan */}
          <section id="studi" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Bukti dari Lapangan: Studi Kasus PLTP Indonesia
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
                📍 PLTP Dieng (Jawa Tengah)
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                Penelitian energi dan eksergi di PLTP Dieng menunjukkan bahwa setelah pemisahan optimal di 
                separator, <strong>dryness fraction mencapai 0.96-0.99</strong>. Analisis mengonfirmasi bahwa 
                turbin dengan x &lt; 0.90 mengalami penurunan efisiensi signifikan dan peningkatan biaya 
                maintenance yang drastis — hingga <strong>3x lipat</strong> dibandingkan operasi pada x ≥ 0.95.<Ref num={2} />
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
                📍 PLTU Mamuju (Sulawesi Barat)
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                Studi performa setelah overhaul menunjukkan hubungan langsung antara dryness fraction dan 
                efisiensi: penurunan dari x=1.02 ke x=0.99 menyebabkan efisiensi turbin turun dari 91,16% 
                menjadi 86,7%. Ini memvalidasi Baumann Rule dan menggarisbawahi pentingnya menjaga dryness 
                fraction setinggi mungkin.<Ref num={1} />
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
                📍 PLTP Mutnovsky (Rusia) - Best Practice ⭐
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                Dengan implementasi superheater untuk meningkatkan dryness fraction hingga 0.98-1.0, PLTP 
                Mutnovsky berhasil meningkatkan efisiensi siklus dan <strong>memperpanjang interval overhaul 
                turbin hingga 2x lipat</strong>. Investasi superheater terbayar dalam 3-4 tahun melalui 
                penghematan maintenance dan peningkatan output.<Ref num={16} />
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
                <strong>💡 Pembelajaran Kunci:</strong> Perbedaan antara PLTP yang beroperasi pada x=0.90 
                versus x=0.98 bukan hanya efisiensi — tetapi juga <strong>biaya lifecycle total</strong>. 
                Investasi dalam separator berkualitas tinggi dan superheater terbukti menguntungkan dalam 
                jangka panjang.
              </p>
            </div>
          </section>

          {/* Gambar: Separator System */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={separatorSystem} 
              alt="Sistem separator dan demister untuk meningkatkan dryness fraction"
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
              Gambar 3: Sistem separator dan demister untuk pemisahan air dari uap
            </div>
          </div>

          {/* Monitoring & Kontrol */}
          <section id="monitoring" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Cara Menjaga dan Memantau Dryness Fraction
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Maintaining dryness fraction yang optimal memerlukan kombinasi desain sistem yang baik, 
              monitoring berkelanjutan, dan kontrol operasional yang ketat.
            </p>

            <h4 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '30px'
            }}>
              🔧 Teknologi Pemisahan
            </h4>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>1. Separator Primer (Cyclone Separator):</strong> Menggunakan gaya sentrifugal untuk 
              memisahkan tetesan air dari uap. Efisiensi pemisahan 95-98% untuk droplet &gt;50 μm. Kontrol 
              level separator sangat kritis — level terlalu tinggi menyebabkan carryover, terlalu rendah 
              mengurangi efisiensi pemisahan.<Ref num={17} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>2. Demister (Mesh/Vane Type):</strong> Tahap kedua untuk menangkap tetesan mikro 
              (5-50 μm) yang lolos dari separator. Mesh pads atau vane separators meningkatkan dryness 
              fraction dari ~0.95 menjadi 0.98-0.99. Maintenance rutin diperlukan untuk mencegah fouling 
              dan plugging.<Ref num={18} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>3. Superheater (Optional):</strong> Memanaskan uap jenuh hingga superheated, 
              menghilangkan risiko kondensasi di pipa dan turbin. Meningkatkan dryness fraction efektif 
              ke &gt;1.0, tetapi memerlukan investasi kapital yang signifikan. Cost-effective untuk PLTP 
              skala besar (&gt;100 MW).<Ref num={16} />
            </p>

            <h4 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '30px'
            }}>
              📊 Monitoring & Pengukuran
            </h4>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>Metode Langsung:</strong> Steam quality analyzer mengukur dryness fraction dengan 
              sampling uap, kondensasi, dan penimbangan massa. Akurat tetapi memerlukan shutdown periodik.<Ref num={19} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>Metode Tidak Langsung:</strong> Perhitungan dari pengukuran entalpi, tekanan, dan 
              temperatur menggunakan tabel steam. Online monitoring dengan sensor flow, pressure, temperature 
              memungkinkan estimasi real-time dryness fraction.<Ref num={20} />
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              padding: '30px',
              borderRadius: '15px',
              marginTop: '25px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '20px'
              }}>
                💻 Sistem SMART untuk Monitoring Dryness Fraction
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
                  <strong>• Real-time Calculation:</strong> Sensor tekanan, temperatur, dan flow rate 
                  terintegrasi dengan algoritma untuk estimasi dryness fraction kontinyu
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
                  <strong>• Alarm System:</strong> Peringatan otomatis saat dryness fraction mendekati 
                  batas minimum (x &lt; 0.92) untuk tindakan preventif
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
                  <strong>• Predictive Analytics:</strong> Machine learning untuk prediksi degradasi 
                  separator dan scheduling maintenance optimal
                </p>
              </div>
            </div>
          </section>

          {/* Gambar: Efficiency Graph */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={drynessEfficiencyGraph} 
              alt="Grafik hubungan dryness fraction dengan efisiensi turbin"
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
              Gambar 4: Hubungan dryness fraction dengan efisiensi dan wear rate turbin
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
              Kesimpulan: Dryness Fraction sebagai Parameter Kritis
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Dryness fraction adalah salah satu parameter operasional paling kritis dalam PLTP. Menjaga 
              dryness fraction di atas 0.95 bukan hanya tentang efisiensi — tetapi juga tentang umur turbin, 
              biaya maintenance, dan keandalan jangka panjang.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Pengalaman dari PLTP Indonesia dan global menunjukkan bahwa investasi dalam sistem pemisahan 
              berkualitas tinggi, monitoring berkelanjutan, dan kontrol operasional yang ketat memberikan 
              return yang signifikan melalui:
            </p>

            <ul style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              paddingLeft: '40px',
              marginBottom: '15px'
            }}>
              <li>Efisiensi turbin yang konsisten tinggi</li>
              <li>Pengurangan biaya maintenance hingga 50%</li>
              <li>Perpanjangan interval overhaul 2-3x lipat</li>
              <li>Peningkatan availability dan capacity factor</li>
            </ul>

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
                🎯 Rekomendasi Praktis untuk Operator PLTP
              </h4>
              <ul style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: 'white',
                marginTop: '15px',
                paddingLeft: '20px'
              }}>
                <li><strong>Target x ≥ 0.95:</strong> Jangan puas dengan minimum 0.90 — target 0.95+ untuk operasi optimal</li>
                <li><strong>Kontrol Level Separator:</strong> Parameter operasional paling kritis untuk mencegah carryover</li>
                <li><strong>Maintenance Demister:</strong> Schedule cleaning/replacement rutin untuk menjaga efisiensi</li>
                <li><strong>Monitoring Berkelanjutan:</strong> Implementasi sistem SMART untuk early warning</li>
                <li><strong>Evaluasi Superheater:</strong> Untuk plant &gt;100 MW, ROI superheater sangat menarik</li>
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
                [1] Pambudi, N.A. "Performance Evaluation of Double-flash Geothermal Power Plant". 
                <em>Stanford Pangea</em>, 2013.
              </p>

              <p id="ref-2" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [2] "An Update Dieng—Energy and Exergy Analysis". <em>Politeknik Negeri Jember</em>, 2024.
              </p>

              <p id="ref-3" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [3] TLV. "The Importance of the Steam Dryness Fraction". [Online]. Available: 
                https://www.tlv.com/steam-info/steam-theory/steam-basics/wet-steam-dry-steam
              </p>

              <p id="ref-4" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [4] Thermopedia. "Geothermal Heat Utilization Methods". [Online]. Available: 
                https://www.thermopedia.com/content/10302/
              </p>

              <p id="ref-5" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [5] "Optimizing Efficiency and Performance in Rankine Cycle". <em>Techscience</em>, 2024.
              </p>

              <p id="ref-6" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [6] Liu University. "Wet Steam and Condensation Loss Analysis". <em>Energy Procedia</em>, 2013.
              </p>

              <p id="ref-7" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [7] S Soni. "Analysis of Liquid Droplet Erosion for Steam Turbine". <em>IJMERR</em>, 2012.
              </p>

              <p id="ref-8" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [8] T Kashyap. "Silt erosion and cavitation impact on hydraulic turbines". 
                <em>ScienceDirect</em>, 2024.
              </p>

              <p id="ref-9" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [9] Walker, D. "Wet Steam Measurement Techniques". <em>Nottingham Repository</em>.
              </p>

              <p id="ref-10" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [10] Ramadhan, D.F. et al. "Evaluation Turbine Blade Design and Materials Steam Turbine". 
                <em>JREM ITENAS</em>, 2025.
              </p>

              <p id="ref-11" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [11] Wen, C. "Wet steam flow and condensation loss in turbine blade cascade". 
                <em>ScienceDirect</em>, 2021.
              </p>

              <p id="ref-12" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [12] TLV. "Wet Steam Corrosion". [Online]. Available: 
                https://www.tlv.com/global/TLVSteam/images/steam_theory_basics/wetsteam_corrosion.jpg
              </p>

              <p id="ref-13" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [13] POWER Magazine. "Fighting Scale and Corrosion on Balance of Geothermal Plant Equipment". 
                <em>POWER Magazine</em>, 2015.
              </p>

              <p id="ref-14" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [14] Han et al. "Dehumidification optimization of steam turbines". <em>ScienceDirect</em>, 2023.
              </p>

              <p id="ref-15" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [15] "Int. Journal of Renewable Energy Development". <em>Ejournal Undip</em>, 2016.
              </p>

              <p id="ref-16" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [16] "Mutnovsky Geothermal Plant study". <em>ScienceDirect</em>, 2018.
              </p>

              <p id="ref-17" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [17] Rizaldy, M., Zarrouk, S.J. "Liquid Carryover in Geothermal Steam-Water Separators". 
                <em>Proceedings of New Zealand Geothermal Workshop</em>, 2016.
              </p>

              <p id="ref-18" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [18] ResearchGate. "Monitoring of geothermal steam moisture separator efficiency". 
                <em>Geothermics</em>, Vol. 32, 2003.
              </p>

              <p id="ref-19" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [19] OSTI. "Steam Quality Monitoring Systems for Geothermal Applications". 
                <em>OSTI.GOV</em>, 1995.
              </p>

              <p id="ref-20" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [20] Moya, D. "Geothermal energy technology review". <em>Sci-Hub</em>, 2018.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}