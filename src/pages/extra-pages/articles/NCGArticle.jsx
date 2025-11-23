import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import gambar dari folder ncg
import ncgCompositionChart from '/src/assets/images/articles/ncg/ncg_composition_chart.jpg';
import turbineCorrosionNcg from '/src/assets/images/articles/ncg/turbine_corrosion_ncg.jpg';
import abatementSystem from '/src/assets/images/articles/ncg/abatement_system.jpg';
import ncgEfficiencyImpact from '/src/assets/images/articles/ncg/ncg_efficiency_impact.jpg';

export default function NCGArticle() {
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
    { id: 'definisi', label: 'Definisi & Komposisi' },
    { id: 'dampak', label: 'Dampak NCG' },
    { id: 'studi', label: 'Studi Lapangan' },
    { id: 'teknologi', label: 'Teknologi Pengendalian' },
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
            Non Condensable Gas (NCG)
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500',
            marginTop: '10px'
          }}>
            Pembunuh Senyap yang Merampas 22% Efisiensi dan Menggerogoti Turbin dari Dalam
          </p>
        </div>

        {/* Content Section */}
        <div style={{ padding: '50px 60px' }}>
          
          {/* Opening - The Invisible Enemy */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Musuh Tak Terlihat dalam Setiap Aliran Uap
            </h2>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Saat operator PLTP memantau parameter operasional — tekanan, temperatur, flow rate — 
              semuanya tampak normal. Namun ada ancaman tersembunyi yang tidak tertangkap oleh mata 
              telanjang: <strong>Non Condensable Gas (NCG)</strong>. Gas-gas ini — terutama CO₂ dan H₂S — 
              mengalir bersama uap, tidak terlihat, tidak berbau pada konsentrasi rendah, tetapi secara 
              diam-diam menggerogoti efisiensi turbin dan mempercepat korosi material.<Ref num={1} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Studi eksperimental menunjukkan dampak yang mengejutkan: <strong>peningkatan konten NCG 
              hanya 1% dapat menurunkan daya turbin hingga 0.86%</strong>. Pada konsentrasi 25% NCG, 
              penurunan efisiensi total mencapai <strong>22%</strong> — setara dengan kehilangan 24 MW 
              dari turbin 110 MW, atau cukup energi untuk 18,000 rumah!<Ref num={2} />
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
                <strong>☁️ Apa itu NCG?</strong><br/>
                Non Condensable Gas adalah gas yang tidak dapat dikondensasikan pada tekanan dan 
                temperatur kerja kondenser. Berbeda dengan uap air yang berubah menjadi kondensat, 
                NCG tetap dalam fase gas dan "menumpuk" di sistem, menciptakan thermal blanket yang 
                menghambat perpindahan panas dan menurunkan vacuum condenser — kunci efisiensi turbin.
              </p>
            </div>
          </section>

          {/* Definisi & Komposisi */}
          <section id="definisi" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Komposisi NCG: Siapa Pelakunya?
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              NCG di PLTP berasal dari fluida geothermal yang terperangkap di reservoir selama jutaan 
              tahun. Komposisinya bervariasi tergantung karakteristik reservoir, tetapi umumnya 
              didominasi oleh beberapa gas utama:<Ref num={3} /><Ref num={4} />
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                🧪 Komposisi Tipikal NCG di PLTP Indonesia
              </h4>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '5px'
                }}>
                  <span style={{ fontSize: '15px', color: '#4a5568', fontWeight: '500' }}>
                    CO₂ (Karbon Dioksida)
                  </span>
                  <span style={{ fontSize: '15px', color: '#2563eb', fontWeight: '700' }}>
                    85-95%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '92%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #2563eb, #1e40af)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '5px'
                }}>
                  <span style={{ fontSize: '15px', color: '#4a5568', fontWeight: '500' }}>
                    H₂S (Hidrogen Sulfida)
                  </span>
                  <span style={{ fontSize: '15px', color: '#2563eb', fontWeight: '700' }}>
                    1-3%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '2%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #dc2626, #991b1b)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '5px'
                }}>
                  <span style={{ fontSize: '15px', color: '#4a5568', fontWeight: '500' }}>
                    NH₃ (Amonia)
                  </span>
                  <span style={{ fontSize: '15px', color: '#2563eb', fontWeight: '700' }}>
                    ~0.1%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '0.5%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #16a34a, #15803d)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '5px'
                }}>
                  <span style={{ fontSize: '15px', color: '#4a5568', fontWeight: '500' }}>
                    Gas Lain (N₂, CH₄, Ar, H₂)
                  </span>
                  <span style={{ fontSize: '15px', color: '#2563eb', fontWeight: '700' }}>
                    1-5%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '3%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #9333ea, #7e22ce)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              <strong>Catatan Penting:</strong> Meskipun CO₂ mendominasi secara kuantitas, H₂S 
              yang hanya 1-3% justru paling berbahaya karena sifatnya yang sangat korosif terhadap 
              logam dan toksik terhadap manusia (berbau busuk pada konsentrasi sangat rendah, 
              kemudian merusak indera penciuman pada konsentrasi tinggi — making it invisible killer).<Ref num={5} />
            </p>
          </section>

          {/* Gambar: NCG Composition Chart */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={ncgCompositionChart} 
              alt="Diagram komposisi NCG di berbagai PLTP"
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
              Gambar 1: Variasi komposisi NCG di berbagai lapangan geothermal
            </div>
          </div>

          {/* Dampak NCG */}
          <section id="dampak" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Triple Threat: Tiga Cara NCG Menghancurkan PLTP
            </h2>

            {/* A. Penurunan Efisiensi */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                A. Penurunan Efisiensi Turbin: Thermal Blanket Effect
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                NCG menciptakan "thermal blanket" (selimut termal) pada permukaan kondenser yang 
                menghambat perpindahan panas dari uap ke cooling water. Mekanismenya:<Ref num={6} />
              </p>

              <ul style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                paddingLeft: '40px',
                marginBottom: '15px'
              }}>
                <li><strong>NCG bersifat inert:</strong> Tidak menghasilkan energi kerja saat melewati 
                turbin, hanya "menumpang" dalam aliran uap.</li>
                <li><strong>Menurunkan tekanan parsial uap:</strong> Dengan adanya NCG, tekanan parsial 
                uap di condenser turun, meningkatkan back pressure turbin.</li>
                <li><strong>Menghambat kondensasi:</strong> Layer NCG pada tube condenser bertindak 
                sebagai insulator, memperlambat transfer panas.</li>
                <li><strong>Degradasi vacuum:</strong> Akumulasi NCG merusak vacuum condenser, 
                mengurangi driving force ekspansi uap di turbin.<Ref num={7} /></li>
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
                  ⚠️ <strong>Data Eksperimental:</strong> Penelitian menunjukkan hubungan non-linear 
                  antara NCG dan efisiensi. Pada NCG content:
                  <br/>• 5% → Penurunan efisiensi ~4-5%
                  <br/>• 10% → Penurunan efisiensi ~8-10%
                  <br/>• 25% → Penurunan efisiensi hingga <strong>22%</strong>
                  <br/><br/>
                  Untuk PLTP 110 MW, penurunan 22% berarti kehilangan 24 MW output — kerugian 
                  revenue >$2 juta/tahun (asumsi $0.08/kWh, capacity factor 85%)!<Ref num={2} />
                </p>
              </div>
            </div>

            {/* B. Korosi & Erosi */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                B. Korosi Akselerasi: Serangan Kimia dari Dalam
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                H₂S dan CO₂ dalam NCG adalah agen korosif yang sangat agresif, terutama pada suhu 
                tinggi dan kondisi basah:<Ref num={8} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>• Korosi H₂S (Sulfide Stress Cracking):</strong> H₂S bereaksi dengan baja 
                membentuk iron sulfide (FeS) yang rapuh dan merusak struktur kristal logam. Pada 
                konsentrasi tinggi, dapat menyebabkan <em>hydrogen embrittlement</em> — logam menjadi 
                getas dan mudah retak.<Ref num={9} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>• Korosi CO₂ (Carbonic Acid Attack):</strong> CO₂ larut dalam kondensat 
                membentuk asam karbonat (H₂CO₃) yang menurunkan pH hingga 3-4. Pada pH rendah, laju 
                korosi meningkat eksponensial, mengikis material turbin, pipa, dan heat exchanger.<Ref num={10} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>• Synergistic Effect:</strong> Kombinasi H₂S + CO₂ + O₂ dalam kondisi basah 
                menciptakan lingkungan ultra-korosif. Laju korosi bisa mencapai <strong>10-50x lipat</strong> 
                dibandingkan dengan hanya satu jenis gas. Mikrostruktur material mengalami pitting, 
                cracking, dan bahkan spalling (pengelupasan material).<Ref num={11} />
              </p>

              <div style={{
                background: '#fef3c7',
                padding: '20px 25px',
                borderRadius: '12px',
                marginTop: '20px'
              }}>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#78350f',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  <strong>💀 Case Study - Silent Killer:</strong> Sudu turbin yang terlihat normal 
                  dari luar bisa mengalami <em>internal corrosion</em> yang parah akibat NCG. Pada 
                  beberapa kasus, sudu tiba-tiba patah saat operasi — menyebabkan unplanned shutdown, 
                  kerusakan sekunder pada turbin, dan kerugian jutaan dollar. Inilah mengapa monitoring 
                  NCG dan corrosion management sangat kritis!
                </p>
              </div>
            </div>

            {/* C. Dampak Lingkungan */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a2642',
                marginBottom: '15px'
              }}>
                C. Dampak Lingkungan: Dari PLTP ke Atmosfer
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                NCG yang tidak tertangani dengan baik menjadi sumber emisi greenhouse gas dan 
                polutan udara:<Ref num={12} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>• Emisi CO₂:</strong> Meskipun PLTP lebih bersih dari fossil fuel, emisi CO₂ 
                dari NCG tetap signifikan — berkisar 50-200 g CO₂/kWh tergantung konten NCG reservoir. 
                PLTP dengan NCG tinggi bisa mendekati 50% emisi dari gas-fired power plant.<Ref num={13} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>• Emisi H₂S:</strong> Gas berbau "telur busuk" ini sangat toksik dan berdampak 
                pada kesehatan masyarakat sekitar. WHO menetapkan batas 0.005 ppm untuk exposure jangka 
                panjang. Banyak PLTP harus memasang scrubber dan monitoring station untuk memenuhi 
                regulasi.<Ref num={14} />
              </p>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '12px'
              }}>
                <strong>• Regulasi Ketat:</strong> Indonesia, seperti negara lain, memiliki regulasi 
                ketat tentang emisi dari PLTP. Pelanggaran bisa mengakibatkan denda, forced shutdown, 
                bahkan pencabutan izin operasi. Ini mendorong adopsi teknologi NCG removal yang lebih 
                canggih.<Ref num={15} />
              </p>
            </div>
          </section>

          {/* Gambar: Turbine Corrosion */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={turbineCorrosionNcg} 
              alt="Korosi parah pada turbin akibat H₂S dan CO₂"
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
              Gambar 2: Kerusakan korosi mikro dan pitting pada sudu turbin akibat NCG
            </div>
          </div>

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
              Pengalaman Lapangan: Dari Indonesia hingga Selandia Baru
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
                📍 PLTP Wayang Windu (Jawa Barat) — 227 MW
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                Salah satu PLTP terbesar di Indonesia ini menghadapi tantangan NCG content 1.0-1.2% 
                dari total steam. <strong>Solusi yang diterapkan:</strong> Gas removal system dengan 
                ejector vakum untuk mengekstrak NCG dari condenser, kemudian sebagian direinjeksikan 
                ke reservoir bersama brine. Hasilnya: <strong>emisi H₂S turun hingga 95%</strong>, 
                efisiensi turbin meningkat 3-4%, dan compliance terhadap environmental regulations 
                terjaga.<Ref num={3} /><Ref num={16} />
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
                📍 PLTP Kamojang (Jawa Barat) — 235 MW
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                Studi dispersi emisi H₂S dan NH₃ menunjukkan bahwa tanpa sistem abatement yang 
                memadai, konsentrasi H₂S di area pemukiman sekitar bisa melebihi batas WHO. Implementasi 
                <strong> H₂S scrubber dengan caustic soda</strong> berhasil menurunkan emisi hingga 
                memenuhi standar nasional. Monitoring continuous dengan sensor elektrokimia memastikan 
                compliance real-time.<Ref num={14} />
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
                📍 Te Huka (Selandia Baru) — Pioneering NCG Reinjection ⭐
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                <strong>Game changer dalam pengelolaan NCG!</strong> Te Huka mengimplementasikan 
                <em>full NCG reinjection</em> — semua NCG yang diekstrak dari condenser direinjeksikan 
                ke reservoir dalam bentuk terlarut bersama condensate. <strong>Hasil spektakuler:</strong> 
                Emisi CO₂ dan H₂S turun hingga <strong>hampir nol</strong>, pressure reservoir terjaga, 
                dan tidak ada masalah korosi jangka panjang setelah 5+ tahun operasi. Model ini menjadi 
                <em>best practice</em> global untuk NCG management.<Ref num={17} />
              </p>
            </div>

            <div style={{
              background: '#f7fafc',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #9333ea'
            }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1a2642',
                marginBottom: '12px'
              }}>
                📍 Ngatamariki (Selandia Baru) — NCG Reinjection Trial
              </h4>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                margin: 0
              }}>
                Trial NCG reinjection dengan <strong>monitoring corrosion coupon</strong> selama 12 bulan 
                menunjukkan: corrosion rate rendah (0.1-0.3 mm/year), scaling terbatas pada compound 
                antimon/arsenik yang bisa dikontrol dengan chemical treatment. Kesimpulan: NCG reinjection 
                aman dan sustainable untuk long-term operation.<Ref num={18} />
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
                <strong>💡 Pembelajaran Global:</strong> Pengelolaan NCG yang efektif bukan hanya 
                soal teknologi, tetapi juga <strong>integrated approach</strong>: monitoring real-time, 
                regulasi yang clear, dan commitment untuk sustainability. PLTP yang berhasil adalah 
                yang treating NCG sebagai resource to manage, bukan waste to discard!
              </p>
            </div>
          </section>

          {/* Gambar: NCG Efficiency Impact */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={ncgEfficiencyImpact} 
              alt="Grafik dampak NCG content terhadap efisiensi turbin"
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
              Gambar 3: Hubungan non-linear antara NCG content dan penurunan efisiensi turbin
            </div>
          </div>

          {/* Teknologi Pengendalian */}
          <section id="teknologi" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Teknologi Pengendalian NCG: From Extraction to Reinjection
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Pengelolaan NCG memerlukan sistem terintegrasi yang mencakup extraction, treatment, 
              dan disposal/reinjection. Berikut teknologi state-of-the-art yang digunakan di PLTP modern:
            </p>

            <h4 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '30px'
            }}>
              🔧 1. NCG Extraction System
            </h4>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>Steam Jet Ejector:</strong> Menggunakan high-pressure steam untuk menciptakan 
              vacuum yang mengekstrak NCG dari condenser. Multi-stage ejector (3-4 stages) dapat 
              menurunkan tekanan condenser hingga 0.1 bar absolute, meningkatkan efisiensi turbin 
              secara signifikan. Keuntungan: no moving parts, reliable, low maintenance.<Ref num={19} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>Liquid Ring Vacuum Pump:</strong> Alternatif mechanical extraction dengan 
              efisiensi lebih tinggi untuk NCG content &gt;5%. Menggunakan rotating impeller dan 
              sealing liquid untuk create vacuum. Trade-off: higher capital cost dan maintenance, 
              tetapi electricity consumption lebih rendah daripada ejector.<Ref num={6} />
            </p>

            <h4 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '30px'
            }}>
              🧪 2. H₂S Abatement Plant
            </h4>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>Caustic Scrubbing:</strong> NCG dialirkan melalui packed tower dengan caustic 
              soda (NaOH) spray yang menyerap H₂S membentuk sodium sulfide (Na₂S). Efficiency removal 
              &gt;95%, meeting environmental regulations. Produk samping Na₂S bisa dijual atau 
              direinjeksikan.<Ref num={3} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>SulfaTreat Process:</strong> Menggunakan iron oxide bed untuk adsorb H₂S. 
              Advantages: simpler operation, no liquid waste. Disadvantages: memerlukan regeneration 
              atau replacement bed secara periodik. Cocok untuk low H₂S content (&lt;100 ppm).
            </p>

            <h4 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '30px'
            }}>
              💉 3. NCG Reinjection Technology
            </h4>

            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              padding: '30px',
              borderRadius: '15px',
              marginTop: '25px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '20px'
              }}>
                🌟 Game Changer: Total NCG Reinjection
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
                  <strong>• Dissolution in Condensate:</strong> NCG dilarutkan dalam condensate 
                  dengan tekanan tinggi (20-40 bar) sebelum reinjection
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
                  <strong>• Reinjection Wells:</strong> Condensate + NCG terlarut diinjeksikan ke 
                  peripheral wells, menjaga pressure reservoir dan mineral precipitation
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
                  <strong>• Zero Emission:</strong> Dengan full reinjection, emisi CO₂ dan H₂S 
                  praktis nol — truly clean geothermal energy!<Ref num={17} />
                </p>
              </div>
            </div>

            <h4 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a2642',
              marginBottom: '15px',
              marginTop: '30px'
            }}>
              📊 4. Monitoring & Control System
            </h4>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>Online Gas Analyzers:</strong> Continuous monitoring NCG composition (CO₂, H₂S, 
              NH₃) dengan Gas Chromatography atau Infrared analyzers. Data real-time untuk optimize 
              extraction dan treatment process.<Ref num={20} />
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>Corrosion Coupons & Sensors:</strong> Monitoring corrosion rate pada critical 
              locations (condenser tubes, piping, turbine). Early detection prevents catastrophic 
              failures.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '12px'
            }}>
              <strong>SCADA Integration:</strong> Sistem SMART (System Monitoring Analysis Real Time) 
              mengintegrasikan semua sensor untuk provide operator dengan complete situational awareness 
              dan enable predictive maintenance.
            </p>
          </section>

          {/* Gambar: Abatement System */}
          <div style={{
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={abatementSystem} 
              alt="Sistem abatement dan reinjection NCG"
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
              Gambar 4: Skema lengkap sistem extraction, abatement, dan reinjection NCG
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
              Kesimpulan: NCG Management sebagai Kunci Sustainability PLTP
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Non Condensable Gas adalah tantangan inheren dalam operasi PLTP geothermal yang tidak 
              bisa dihindari, tetapi harus dikelola dengan baik. Dampaknya triple threat — menurunkan 
              efisiensi hingga 22%, mengakselerasi korosi material turbin, dan menciptakan environmental 
              liability jika tidak ditangani.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Pengalaman dari PLTP Indonesia dan global menunjukkan bahwa <strong>integrated NCG 
              management</strong> — dari extraction, treatment, hingga reinjection — bukan hanya 
              memenuhi regulasi, tetapi juga <strong>menguntungkan secara ekonomi</strong>: efisiensi 
              meningkat, maintenance cost turun, dan umur turbin lebih panjang.
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
                🎯 Best Practices untuk Operator PLTP Indonesia
              </h4>
              <ul style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: 'white',
                marginTop: '15px',
                paddingLeft: '20px'
              }}>
                <li><strong>Prioritas #1: Monitoring Continuous</strong> — Real-time NCG composition & condenser pressure untuk early detection</li>
                <li><strong>Invest in Extraction System</strong> — Multi-stage ejector atau hybrid ejector-pump untuk optimal efficiency</li>
                <li><strong>H₂S Abatement is Non-Negotiable</strong> — Caustic scrubbing untuk compliance dengan environmental regulations</li>
                <li><strong>Consider NCG Reinjection</strong> — Model Te Huka menunjukkan zero-emission is achievable dan sustainable</li>
                <li><strong>Corrosion Management Program</strong> — Regular inspection, coupon monitoring, material upgrade untuk high-risk areas</li>
                <li><strong>Operator Training</strong> — NCG management memerlukan specialized knowledge; invest in people!</li>
              </ul>
            </div>

            <div style={{
              background: '#e0f2fe',
              padding: '25px',
              borderRadius: '12px',
              marginTop: '30px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#075985',
                margin: 0,
                fontWeight: '500'
              }}>
                <strong>🔮 Future Outlook:</strong> Dengan semakin ketatnya regulasi emisi dan 
                meningkatnya awareness terhadap carbon footprint, NCG reinjection akan menjadi 
                <strong> standard practice</strong> di semua PLTP baru. Teknologi seperti direct 
                contact condenser dan enhanced dissolution system sedang dikembangkan untuk membuat 
                reinjection lebih ekonomis. Indonesia, sebagai negara dengan potensi geothermal 
                terbesar di dunia, harus leading the way dalam clean geothermal technology!
              </p>
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
                [1] Gokcen, G., Yıldırım, N. "Effect of Non-Condensable Gases on geothermal power plant performance". 
                <em>Semantic Scholar</em>, 2016.
              </p>

              <p id="ref-2" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [2] Cengic, I., Soldo, V. "Environmental Impact of Geothermal Power Plants". 
                <em>Hrcak Journal</em>, 2018.
              </p>

              <p id="ref-3" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [3] ThinkGeoEnergy. "Treating non-condensable gases (NCG) of geothermal plants - experience by Mannvit". 
                <em>ThinkGeoEnergy</em>, 2019.
              </p>

              <p id="ref-4" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [4] "Possibilities Study of a Non-condensable Gas Exhaust System". 
                <em>Journal of Geoscience, Engineering, Environment, and Technology (JGEET)</em>, 2024.
              </p>

              <p id="ref-5" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [5] World Bank ESMAP. "Geothermal handbook: Planning and financing power generation". 
                <em>ESMAP Technical Report</em>, 2012.
              </p>

              <p id="ref-6" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [6] "Journal of Geoscience, Engineering, Environment, and Technology". 
                <em>JGEET UIR</em>, Vol. 9, 2024.
              </p>

              <p id="ref-7" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [7] JICA. "Preparatory Survey for Lumut Balai Geothermal Project in the Republic of Indonesia". 
                <em>JICA Report</em>, 2012.
              </p>

              <p id="ref-8" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [8] Nogara, J. et al. "The influence of non-condensable gases on the net work produced by a geothermal power plant". 
                <em>ScienceDirect - Applied Energy</em>, 1982.
              </p>

              <p id="ref-9" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [9] EPRI. "Corrosion of Materials Used in Geothermal Power Production". 
                <em>EPRI Technical Report</em>, 2016.
              </p>

              <p id="ref-10" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [10] Nogara, J., Zarrouk, S.J. "Corrosion in geothermal environment: Part 1". 
                <em>Renewable and Sustainable Energy Reviews</em>, 2018.
              </p>

              <p id="ref-11" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [11] EPRI. "Materials Degradation and Failure Mechanisms in Geothermal Power Systems". 
                <em>EPRI Report</em>, 2016.
              </p>

              <p id="ref-12" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [12] Bertani, R., Thain, I. "Geothermal power generating plant CO₂ emission survey". 
                <em>IGA News</em>, 2002.
              </p>

              <p id="ref-13" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [13] Bloomfield, K.K., Moore, J.N., Neilson, R.M. "Geothermal Energy Reduces Greenhouse Gases". 
                <em>Geothermal Resources Council Bulletin</em>, 2003.
              </p>

              <p id="ref-14" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [14] Putra, A.D. "Analisis Dispersi H₂S dan NH₃ dari PLTP Kamojang". 
                <em>Digital Library ITB</em>, 2016.
              </p>

              <p id="ref-15" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [15] PT SMI. "Environmental and Social Impact Assessment (ESIA) - Waesano GEUDP Project". 
                <em>PT SMI Documentation</em>, 2019.
              </p>

              <p id="ref-16" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [16] Star Energy Geothermal. "Wayang Windu Sustainability Report 2016". 
                <em>Star Energy Corporate Report</em>, 2016.
              </p>

              <p id="ref-17" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [17] Kilgour, G. et al. "Non-condensable gas reinjection at the Te Huka geothermal power plant". 
                <em>Geothermal Resources Council Transactions</em>, 2016.
              </p>

              <p id="ref-18" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [18] McNamara, D.D. et al. "Non Condensable Gas Reinjection Trial at Ngatamariki Geothermal Field". 
                <em>New Zealand Geothermal Workshop</em>, 2022.
              </p>

              <p id="ref-19" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [19] Sterzinger, G., Taylor, M. "Sustainable removal of non-condensable gases from geothermal plants". 
                <em>Renewable and Sustainable Energy Reviews</em>, 2013.
              </p>

              <p id="ref-20" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [20] KROHNE. "Gas analysis systems for geothermal power generation". 
                <em>KROHNE Technical Documentation</em>, 2020.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}