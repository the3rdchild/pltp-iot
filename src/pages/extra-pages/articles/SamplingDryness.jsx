import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import gambar
import wetSteamDiagram from '/src/assets/images/articles/dryness-fraction/wet_steam_diagram.jpg';
import turbineErosionBlade from '/src/assets/images/articles/dryness-fraction/turbine_erosion_blade.jpg';
import separatorSystem from '/src/assets/images/articles/dryness-fraction/separator_system.jpg';
import drynessEfficiencyGraph from '/src/assets/images/articles/dryness-fraction/dryness_efficiency_graph.jpg';
import pertasmartLogo from '/src/assets/images/articles/Pertasmart4x1.svg';

// Data Kamojang dari Excel
const kamojangData = [
  { date: "2022-01-05", pressure: "6.77", temperature: "167.2", steam_quality: "99.78", ncg: "0.218", tds: "0.732" },
  { date: "2022-02-16", pressure: "6.70", temperature: "167.1", steam_quality: "99.71", ncg: "0.260", tds: "0.772" },
  { date: "2022-03-09", pressure: "6.69", temperature: "167.0", steam_quality: "99.79", ncg: "0.230", tds: "0.951" },
  { date: "2022-04-04", pressure: "6.68", temperature: "162.2", steam_quality: "99.79", ncg: "0.240", tds: "0.665" },
  { date: "2022-05-11", pressure: "6.68", temperature: "166.7", steam_quality: "99.93", ncg: "0.279", tds: "0.649" },
  { date: "2022-06-16", pressure: "6.69", temperature: "167.3", steam_quality: "99.56", ncg: "0.275", tds: "0.651" },
  { date: "2022-07-05", pressure: "6.76", temperature: "169.2", steam_quality: "99.94", ncg: "0.234", tds: "0.615" },
  { date: "2022-08-02", pressure: "6.75", temperature: "168.5", steam_quality: "100.20", ncg: "0.210", tds: "0.774" },
  { date: "2022-09-14", pressure: "6.73", temperature: "168.1", steam_quality: "99.94", ncg: "0.236", tds: "1.054" },
  { date: "2022-10-11", pressure: "6.72", temperature: "168.4", steam_quality: "100.04", ncg: "0.220", tds: "0.574" },
  { date: "2022-11-16", pressure: "6.85", temperature: "169.4", steam_quality: "100.04", ncg: "0.217", tds: "0.644" },
  { date: "2022-12-06", pressure: "7.15", temperature: "170.5", steam_quality: "99.94", ncg: "0.219", tds: "0.703" },
  { date: "2023-01-05", pressure: "6.91", temperature: "168.4", steam_quality: "100.01", ncg: "0.241", tds: "1.168" },
  { date: "2023-02-07", pressure: "6.88", temperature: "168.5", steam_quality: "100.04", ncg: "0.233", tds: "0.960" },
  { date: "2023-03-14", pressure: "6.77", temperature: "167.9", steam_quality: "100.02", ncg: "0.253", tds: "1.057" },
  { date: "2023-04-11", pressure: "6.84", temperature: "168.8", steam_quality: "100.11", ncg: "0.232", tds: "2.065" },
  { date: "2023-05-16", pressure: "6.85", temperature: "168.5", steam_quality: "100.12", ncg: "0.253", tds: "0.915" },
  { date: "2023-06-20", pressure: "6.88", temperature: "168.3", steam_quality: "100.08", ncg: "0.277", tds: "1.391" },
  { date: "2023-08-01", pressure: "6.95", temperature: "168.9", steam_quality: "99.97", ncg: "0.278", tds: "0.971" },
  { date: "2023-09-05", pressure: "6.99", temperature: "169.2", steam_quality: "99.98", ncg: "0.310", tds: "1.589" }
];

export default function SamplingDryness() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('');

  // Scroll to reference function
  const scrollToRef = (refNumber) => {
    const element = document.getElementById(`ref-${refNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.backgroundColor = '#e0f2fe';
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
        color: '#0369a1',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        display: 'inline-block'
      }}
      onMouseEnter={(e) => {
        e.target.style.color = '#075985';
        e.target.style.transform = 'scale(1.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.color = '#0369a1';
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
    { id: 'metode-lab', label: 'Metode Pengukuran Lab' },
    { id: 'data-kamojang', label: 'Data Kamojang' },
    { id: 'monitoring', label: 'Monitoring & Kontrol' },
    { id: 'kesimpulan', label: 'Kesimpulan' },
    { id: 'dafpus', label: 'Daftar Pustaka' }
  ];

  return (
    <>
      <style jsx>{`
      .footer {
        background: #0f1729;
        color: white;
        padding: 48px 0;
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
          background: '#0369a1',
          border: 'none',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          zIndex: 1002,
          boxShadow: '0 4px 12px rgba(3, 105, 161, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#075985';
          e.target.style.transform = 'translateX(-5px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#0369a1';
          e.target.style.transform = 'translateX(0)';
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
          background: '#334155',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#0369a1';
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
          background: '#1e293b',
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
                background: activeSection === section.id ? 'rgba(3, 105, 161, 0.2)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(3, 105, 161, 0.3)';
                e.currentTarget.style.transform = 'translateX(-8px)';
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = 'transparent';
                }
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
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {/* Header Section */}
        <div id="intro" style={{
          background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
          padding: '60px 40px 50px 40px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>
            Dryness Fraction 
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            fontWeight: '500',
            marginTop: '8px'
          }}>
            Parameter Kritis untuk Efisiensi dan Keandalan Turbin Uap
          </p>
        </div>

        {/* Content Section */}
        <div style={{ padding: '50px 60px' }}>
          
          {/* Opening */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '3px solid #0369a1'
            }}>
              Pendahuluan
            </h2>
            
            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '15px'
            }}>
              Di PLTU Mamuju, sebuah fenomena mengejutkan terjadi setelah overhaul turbin. Efisiensi yang 
              semula 91,16% merosot tajam menjadi hanya 86,7% — kehilangan hampir 5% produktivitas. 
              Analisis mendalam mengungkap penyebabnya: <strong>dryness fraction turun dari 1.02 menjadi 0.99</strong>. 
              Penurunan yang tampak kecil ini — hanya 3% — ternyata berdampak pada kerugian operasional 
              yang sangat besar.<Ref num={1} />
            </p>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '15px'
            }}>
              Ini bukan kasus terisolasi. Di PLTP Kamojang, turbin harus menjalani overhaul setiap 2 tahun 
              karena akumulasi kerak dan erosi yang disebabkan oleh wet steam. Efisiensi turun drastis dari 
              97,55% menjadi 78,18% — kehilangan hampir 20% output hanya dalam 2 tahun operasi.<Ref num={2} />
            </p>

            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#0c4a6e',
                margin: 0
              }}>
                <strong>💧 Definisi Singkat:</strong><br/>
                Dryness fraction (fraksi kekeringan) adalah rasio massa uap terhadap total massa campuran 
                uap-air. Nilai 1.0 (100%) berarti uap murni tanpa tetesan air, sedangkan 0.9 (90%) berarti 
                10% massa adalah air cair. Dalam PLTP, bahkan perbedaan 1% dalam dryness fraction bisa 
                menyebabkan penurunan efisiensi turbin hingga 1%.
              </p>
            </div>
          </section>

          {/* Gambar: Wet Steam Diagram */}
          <div style={{
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '40px',
            border: '1px solid #e2e8f0'
          }}>
            <img 
              src={wetSteamDiagram} 
              alt="Diagram wet steam vs dry steam"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            <div style={{
              background: '#f8fafc',
              padding: '12px 20px',
              fontSize: '13px',
              color: '#64748b',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              Gambar 1: Perbedaan wet steam dan dry steam
            </div>
          </div>

          {/* Definisi & Konsep */}
          <section id="definisi" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '3px solid #0369a1'
            }}>
              Definisi dan Konsep Dasar
            </h2>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '15px'
            }}>
              Dryness fraction didefinisikan sebagai rasio massa uap kering terhadap total massa campuran 
              dua fase (uap + air):<Ref num={3} />
            </p>

            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '16px',
              border: '1px solid #e2e8f0'
            }}>
              x = m<sub>vapor</sub> / (m<sub>vapor</sub> + m<sub>liquid</sub>)
            </div>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
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
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '3px solid #0369a1'
            }}>
              Dampak Wet Steam pada Turbin
            </h2>

            {/* A. Penurunan Efisiensi */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '12px'
              }}>
                A. Penurunan Efisiensi: Baumann Rule
              </h3>
              
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#475569',
                marginBottom: '12px'
              }}>
                Baumann Rule menyatakan: <strong>setiap 1% peningkatan kadar air menyebabkan penurunan 
                efisiensi turbin sekitar 1%</strong>. Ini terjadi karena:<Ref num={5} />
              </p>

              <ul style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#475569',
                paddingLeft: '30px',
                marginBottom: '15px'
              }}>
                <li>Energi terbuang untuk mengangkut air cair</li>
                <li>Penurunan tekanan efektif pada sudu turbin</li>
                <li>Losses akibat percikan dan turbulensi<Ref num={6} /></li>
              </ul>
            </div>

            {/* B. Erosi */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '12px'
              }}>
                B. Erosi Sudu Turbin (Water Droplet Erosion)
              </h3>
              
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#475569',
                marginBottom: '12px'
              }}>
                Tetesan air bergerak dengan kecepatan 100-600 m/s dan menghantam sudu turbin, menyebabkan:<Ref num={7} />
              </p>

              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#475569',
                marginBottom: '12px'
              }}>
                • <strong>Pitting:</strong> Lubang kecil yang progressively memperdalam<Ref num={8} />
                <br/>• <strong>Crack initiation:</strong> Konsentrasi tegangan di sekitar pit<Ref num={9} />
                <br/>• <strong>Coating failure:</strong> Delaminasi lapisan pelindung<Ref num={10} />
              </p>

              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#475569',
                marginBottom: '12px'
              }}>
                Tingkat erosi meningkat eksponensial saat x &lt; 0.9 — penurunan dari x=0.95 ke x=0.85 
                dapat meningkatkan laju erosi hingga <strong>10x lipat</strong>.<Ref num={11} />
              </p>
            </div>

            {/* C. Korosi */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '12px'
              }}>
                C. Korosi Akselerasi
              </h3>
              
              <p style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#475569',
                marginBottom: '12px'
              }}>
                Air cair dalam wet steam mengandung mineral terlarut dan gas korosif yang mempercepat 
                korosi. Sinergi erosi-korosi sangat berbahaya: erosi menghilangkan lapisan oksida 
                pelindung, mengekspos logam segar yang cepat teroksidasi — mempercepat degradasi hingga 
                100x lipat.<Ref num={12} /><Ref num={13} />
              </p>
            </div>
          </section>

          {/* Gambar: Turbine Erosion */}
          <div style={{
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '40px',
            border: '1px solid #e2e8f0'
          }}>
            <img 
              src={turbineErosionBlade} 
              alt="Kerusakan sudu turbin akibat wet steam"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            <div style={{
              background: '#f8fafc',
              padding: '12px 20px',
              fontSize: '13px',
              color: '#64748b',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              Gambar 2: Erosi dan korosi pada sudu turbin akibat wet steam
            </div>
          </div>

          {/* Standar & Rekomendasi */}
          <section id="standar" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '3px solid #0369a1'
            }}>
              Standar dan Rekomendasi Operasional
            </h2>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '20px'
            }}>
              Berdasarkan pengalaman operasional PLTP global dan rekomendasi pabrikan turbin:<Ref num={14} />
            </p>

            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '25px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '12px 15px',
                marginBottom: '12px',
                background: 'white',
                borderRadius: '6px',
                borderLeft: '4px solid #0369a1'
              }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#0c4a6e',
                  margin: 0
                }}>
                  <strong>• Minimum:</strong> x ≥ 0.90 (90% steam quality)
                </p>
              </div>

              <div style={{
                padding: '12px 15px',
                marginBottom: '12px',
                background: 'white',
                borderRadius: '6px',
                borderLeft: '4px solid #0369a1'
              }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#0c4a6e',
                  margin: 0
                }}>
                  <strong>• Recommended:</strong> x ≥ 0.95 (95% steam quality)
                </p>
              </div>

              <div style={{
                padding: '12px 15px',
                background: 'white',
                borderRadius: '6px',
                borderLeft: '4px solid #10b981'
              }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#0c4a6e',
                  margin: 0
                }}>
                  <strong>• Optimal:</strong> x ≥ 0.98-1.00 (Dry/Superheated steam)
                </p>
              </div>
            </div>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '15px'
            }}>
              Pada PLTP flash, target realistis adalah x = 0.96-0.99 dengan separator dan demister 
              yang optimal.<Ref num={15} />
            </p>
          </section>

          {/* Studi Lapangan */}
          <section id="studi" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '3px solid #0369a1'
            }}>
              Studi Kasus PLTP Indonesia
            </h2>

            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#0f172a',
                marginBottom: '10px'
              }}>
                📍 PLTP Dieng (Jawa Tengah)
              </h4>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#475569',
                margin: 0
              }}>
                Dryness fraction mencapai 0.96-0.99 setelah pemisahan optimal. Turbin dengan x &lt; 0.90 
                mengalami peningkatan biaya maintenance hingga <strong>3x lipat</strong>.<Ref num={2} />
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#0f172a',
                marginBottom: '10px'
              }}>
                📍 PLTU Mamuju (Sulawesi Barat)
              </h4>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#475569',
                margin: 0
              }}>
                Penurunan dari x=1.02 ke x=0.99 menyebabkan efisiensi turbin turun dari 91,16% 
                menjadi 86,7%.<Ref num={1} />
              </p>
            </div>
          </section>

          {/* Gambar: Separator System */}
          <div style={{
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '40px',
            border: '1px solid #e2e8f0'
          }}>
            <img 
              src={separatorSystem} 
              alt="Sistem separator dan demister"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            <div style={{
              background: '#f8fafc',
              padding: '12px 20px',
              fontSize: '13px',
              color: '#64748b',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              Gambar 3: Sistem separator dan demister untuk pemisahan air dari uap
            </div>
          </div>

          {/* SECTION BARU: METODE PENGUKURAN LAB */}
          <section id="metode-lab" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '3px solid #0369a1'
            }}>
              Metode Pengukuran Dryness Fraction di Laboratorium
            </h2>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '20px'
            }}>
              Pengukuran dryness fraction yang akurat sangat kritis untuk monitoring kualitas uap. 
              Berikut adalah empat metode standar yang digunakan di laboratorium PLTP:
            </p>

            {/* Metode 1: Throttling Calorimeter */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  background: '#0369a1',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>1</span>
                Throttling Calorimeter
              </h3>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '12px'
                }}>
                  <strong>Prinsip Kerja:</strong><br/>
                  Metode ini memanfaatkan proses throttling (ekspansi isentalpik) dimana uap basah 
                  diekspansikan melalui orifice hingga menjadi superheated steam. Karena proses throttling 
                  bersifat isentalpik (h<sub>1</sub> = h<sub>2</sub>), kita dapat menghitung dryness 
                  fraction awal dari pengukuran tekanan dan temperatur setelah throttling.<Ref num={21} />
                </p>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  <strong>Rumus Dasar:</strong><br/>
                  h<sub>1</sub> = h<sub>2</sub><br/>
                  h<sub>f1</sub> + x₁ · h<sub>fg1</sub> = h<sub>g2</sub><br/><br/>
                  <strong>x₁ = (h<sub>g2</sub> - h<sub>f1</sub>) / h<sub>fg1</sub></strong>
                </div>

                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '12px'
                }}>
                  Dimana:<br/>
                  • x₁ = dryness fraction sebelum throttling<br/>
                  • h<sub>f1</sub> = entalpi air jenuh pada P<sub>1</sub> (dari steam table)<br/>
                  • h<sub>fg1</sub> = entalpi penguapan pada P<sub>1</sub><br/>
                  • h<sub>g2</sub> = entalpi uap superheated pada P<sub>2</sub> dan T<sub>2</sub>
                </p>

                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '0'
                }}>
                  <strong>Prosedur:</strong><br/>
                  1. Sampling uap dari pipa utama melalui perforated tube<br/>
                  2. Uap di-throttle melalui partially closed valve<br/>
                  3. Ukur tekanan P<sub>2</sub> dengan manometer (harus &gt; 1 atm)<br/>
                  4. Ukur temperatur T<sub>2</sub> dengan termometer (harus superheated, T<sub>2</sub> 
                  &gt; T<sub>sat,P2</sub> + 5°C)<br/>
                  5. Hitung x₁ menggunakan steam tables<Ref num={22} />
                </p>
              </div>

              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#9a3412',
                  margin: 0
                }}>
                  <strong>⚠️ Keterbatasan:</strong> Metode ini hanya akurat untuk x ≥ 0.93-0.95. 
                  Untuk wet steam dengan x &lt; 0.93, uap tidak akan menjadi superheated setelah 
                  throttling, sehingga pengukuran tidak valid. Dalam kasus ini, gunakan Combined 
                  Separating & Throttling Calorimeter.<Ref num={23} />
                </p>
              </div>
            </div>

            {/* Metode 2: Separating Calorimeter */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  background: '#0369a1',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>2</span>
                Separating Calorimeter
              </h3>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '12px'
                }}>
                  <strong>Prinsip Kerja:</strong><br/>
                  Metode ini memisahkan air dari uap secara mekanis menggunakan gaya sentrifugal dan 
                  baffle plates. Air yang terpisah dikumpulkan dan diukur massanya, sedangkan uap kering 
                  yang keluar dikondensasi dan juga diukur.<Ref num={24} />
                </p>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  <strong>Rumus Dasar:</strong><br/><br/>
                  <strong>x = m<sub>s</sub> / (m<sub>s</sub> + m<sub>w</sub>)</strong>
                </div>

                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '12px'
                }}>
                  Dimana:<br/>
                  • x = dryness fraction<br/>
                  • m<sub>s</sub> = massa steam yang dikondensasi (kg/min)<br/>
                  • m<sub>w</sub> = massa water yang terpisah (kg/min)
                </p>

                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '0'
                }}>
                  <strong>Prosedur:</strong><br/>
                  1. Sampling uap dari main steam pipe<br/>
                  2. Uap masuk inner chamber melalui baffle plates<br/>
                  3. Air terpisah dikumpulkan di inner chamber dan diukur dengan graduated scale<br/>
                  4. Uap kering masuk outer chamber, dikondensasi, dan diukur massanya<br/>
                  5. Hitung x dari rasio massa<Ref num={25} />
                </p>
              </div>

              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#9a3412',
                  margin: 0
                }}>
                  <strong>⚠️ Keterbatasan:</strong> Pemisahan tidak pernah 100% sempurna — sebagian 
                  droplet mikro tetap terbawa uap keluar. Hasil cenderung overestimate (nilai x lebih 
                  tinggi dari sebenarnya). Akurasi ±2-3%. Biasanya dikombinasi dengan throttling 
                  calorimeter untuk hasil lebih akurat.
                </p>
              </div>
            </div>

            {/* Metode 3: Combined Separating & Throttling */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  background: '#10b981',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>3</span>
                Combined Separating & Throttling Calorimeter ⭐
              </h3>

              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#14532d',
                  marginBottom: '12px'
                }}>
                  <strong>Prinsip Kerja:</strong><br/>
                  Metode ini menggabungkan keunggulan kedua metode sebelumnya. Tahap pertama (separating) 
                  meningkatkan dryness fraction dari x₁ menjadi x₂ dengan membuang sebagian air. Tahap 
                  kedua (throttling) mengukur x₂ yang sudah lebih kering, kemudian menghitung balik ke 
                  x₁. Metode ini dapat mengukur wet steam hingga x = 0.70-0.80.<Ref num={26} />
                </p>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontFamily: 'monospace',
                  fontSize: '13px'
                }}>
                  <strong>Rumus Lengkap:</strong><br/><br/>
                  Tahap 1 (Separating):<br/>
                  x₂ = (m<sub>s</sub> · x₁) / m<sub>s</sub> = x₁ · [m<sub>total</sub> / (m<sub>total</sub> - m<sub>w</sub>)]<br/><br/>
                  
                  Tahap 2 (Throttling):<br/>
                  x₂ = (h<sub>g3</sub> - h<sub>f2</sub>) / h<sub>fg2</sub><br/><br/>
                  
                  <strong>Dryness fraction awal:</strong><br/>
                  <strong>x₁ = x₂ · [(m<sub>s</sub> + m<sub>w</sub>) / m<sub>s</sub>]</strong>
                </div>

                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#14532d',
                  marginBottom: '0'
                }}>
                  <strong>Prosedur:</strong><br/>
                  1. Uap masuk separating calorimeter (tahap 1)<br/>
                  2. Ukur massa air terpisah m<sub>w</sub> dengan graduated scale<br/>
                  3. Uap yang lebih kering (x₂) masuk throttling calorimeter (tahap 2)<br/>
                  4. Ukur P<sub>3</sub> dan T<sub>3</sub> setelah throttling<br/>
                  5. Hitung x₂ dari steam tables<br/>
                  6. Ukur massa steam terkondensasi m<sub>s</sub><br/>
                  7. Hitung x₁ menggunakan rumus di atas<Ref num={27} />
                </p>
              </div>

              <div style={{
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#065f46',
                  margin: 0
                }}>
                  <strong>✅ Keunggulan:</strong> Metode paling akurat dan versatile. Dapat mengukur 
                  wide range dryness fraction (0.70-1.00). Akurasi ±1-2%. Ini adalah metode standar 
                  yang direkomendasikan untuk PLTP karena mampu handle very wet steam.
                </p>
              </div>
            </div>

            {/* Metode 4: Barrel Calorimeter */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  background: '#0369a1',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>4</span>
                Barrel (Bucket) Calorimeter
              </h3>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '12px'
                }}>
                  <strong>Prinsip Kerja:</strong><br/>
                  Metode sederhana berdasarkan heat balance. Wet steam sample dikondensasikan dalam 
                  cold water di copper vessel yang terisolasi. Kenaikan temperatur air diukur untuk 
                  menghitung heat transfer, yang kemudian digunakan untuk menentukan dryness fraction.<Ref num={28} />
                </p>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>
                  <strong>Heat Balance Equation:</strong><br/><br/>
                  Heat lost by steam = Heat gained by water & vessel<br/><br/>
                  
                  m<sub>steam</sub> · [x · h<sub>fg</sub> + C<sub>ps</sub>(T<sub>sat</sub> - T₂)] = 
                  (m<sub>water</sub> · C<sub>pw</sub> + m<sub>vessel</sub> · C<sub>vessel</sub>) · (T₂ - T₁)<br/><br/>
                  
                  <strong>Solving for x:</strong><br/>
                  <strong>x = [(m<sub>water</sub> · C<sub>pw</sub> + m<sub>vessel</sub> · C<sub>vessel</sub>) · ΔT 
                  - m<sub>steam</sub> · C<sub>ps</sub>(T<sub>sat</sub> - T₂)] / (m<sub>steam</sub> · h<sub>fg</sub>)</strong>
                </div>

                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '12px'
                }}>
                  Dimana:<br/>
                  • m<sub>steam</sub> = massa steam sample (kg)<br/>
                  • m<sub>water</sub> = massa cold water awal (kg)<br/>
                  • m<sub>vessel</sub> = massa copper vessel (kg)<br/>
                  • T₁ = temperatur awal water & vessel (°C)<br/>
                  • T₂ = temperatur akhir setelah kondensasi (°C)<br/>
                  • T<sub>sat</sub> = temperatur saturasi steam pada P<sub>1</sub> (°C)<br/>
                  • C<sub>pw</sub> = 4.18 kJ/kg·K (specific heat water)<br/>
                  • C<sub>ps</sub> = 2.1 kJ/kg·K (specific heat steam)<br/>
                  • C<sub>vessel</sub> = 0.39 kJ/kg·K (specific heat copper)
                </p>

                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#475569',
                  marginBottom: '0'
                }}>
                  <strong>Prosedur:</strong><br/>
                  1. Timbang copper vessel kosong (m<sub>vessel</sub>)<br/>
                  2. Isi dengan cold water, timbang total (untuk dapat m<sub>water</sub>)<br/>
                  3. Ukur temperatur awal T₁<br/>
                  4. Sampling steam melalui perforated tube into water<br/>
                  5. Aduk hingga equilibrium tercapai<br/>
                  6. Ukur temperatur akhir T₂<br/>
                  7. Timbang total akhir untuk dapat m<sub>steam</sub><br/>
                  8. Baca P<sub>1</sub> dan cari T<sub>sat</sub> & h<sub>fg</sub> dari steam tables<br/>
                  9. Hitung x menggunakan heat balance equation<Ref num={29} />
                </p>
              </div>

              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#9a3412',
                  margin: 0
                }}>
                  <strong>⚠️ Keterbatasan:</strong> Metode approximate karena sulit meminimalkan heat 
                  loss ke lingkungan meskipun vessel terisolasi. Hasil cenderung underestimate (nilai x 
                  lebih rendah dari actual). Akurasi ±5-8%. Cocok untuk quick check tapi tidak untuk 
                  precision measurement.
                </p>
              </div>
            </div>

            {/* Metode Online Modern */}
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '25px',
              borderRadius: '8px',
              marginTop: '30px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '15px'
              }}>
                📡 Metode Online Modern (Non-Invasive)
              </h4>
              
              <p style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#0c4a6e',
                marginBottom: '15px'
              }}>
                Untuk continuous monitoring di PLTP, beberapa teknologi modern tersedia:<Ref num={30} /><Ref num={31} />
              </p>

              <div style={{ marginBottom: '12px' }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  margin: 0
                }}>
                  <strong>1. Vortex Flowmeter dengan Density Compensation</strong> (Endress+Hauser Prowirl F200)<br/>
                  • Real-time measurement berdasarkan density difference<br/>
                  • Compensate inline menggunakan P, T sensors dan IAPWS-IF97 steam tables<br/>
                  • Akurasi ±2-3% untuk x &gt; 0.90
                </p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  margin: 0
                }}>
                  <strong>2. Steam Quality Monitor</strong> (Armstrong Steam QM-1)<br/>
                  • Automatic online monitoring system<br/>
                  • Continuous dryness fraction measurement dan trending<br/>
                  • Alert system untuk x &lt; threshold
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  margin: 0
                }}>
                  <strong>3. Optical Methods</strong> (Laser Absorption Spectroscopy)<br/>
                  • Dual-wavelength untuk measure water vapor vs liquid<br/>
                  • Non-invasive, no sampling required<br/>
                  • Sensitive tapi mahal dan kompleks untuk field implementation
                </p>
              </div>
            </div>
          </section>

          {/* SECTION BARU: DATA KAMOJANG */}
          <section id="data-kamojang" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '3px solid #0369a1'
            }}>
              Data Pengukuran PLTP Kamojang
            </h2>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '20px'
            }}>
              Berikut adalah hasil pengukuran steam quality dan parameter terkait di PLTP Kamojang 
              periode Januari 2022 - September 2023. Data diambil dari separator outlet Unit 3 
              menggunakan metode Combined Separating & Throttling Calorimeter yang dikalibrasi 
              terhadap pressure transmitter dan RTD sensors.
            </p>

            {/* Data Table */}
            <div style={{
              overflowX: 'auto',
              marginBottom: '25px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{
                    background: '#0369a1',
                    color: 'white'
                  }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Tanggal</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>P (bar)</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>T (°C)</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Steam Quality (%)</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>NCG (%)</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>TDS (ppm)</th>
                  </tr>
                </thead>
                <tbody>
                  {kamojangData.map((row, index) => (
                    <tr key={index} style={{
                      background: index % 2 === 0 ? '#f8fafc' : 'white',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <td style={{ padding: '10px', color: '#334155' }}>{row.date}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#334155' }}>{row.pressure}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#334155' }}>{row.temperature}</td>
                      <td style={{ 
                        padding: '10px', 
                        textAlign: 'center', 
                        color: parseFloat(row.steam_quality) >= 99.90 ? '#059669' : (parseFloat(row.steam_quality) >= 99.50 ? '#0369a1' : '#dc2626'),
                        fontWeight: '600'
                      }}>
                        {row.steam_quality}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#334155' }}>{row.ncg}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#334155' }}>{row.tds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Analisis Data */}
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '25px',
              borderRadius: '8px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '15px'
              }}>
                📊 Analisis dan Observasi
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  marginBottom: '8px'
                }}>
                  <strong>1. Rentang Steam Quality:</strong>
                </p>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  paddingLeft: '30px',
                  margin: 0
                }}>
                  <li><strong>Minimum:</strong> 99.56% (Juni 2022) — masih di atas rekomendasi 95%</li>
                  <li><strong>Maximum:</strong> 100.20% (Agustus 2022) — menunjukkan slight superheat</li>
                  <li><strong>Rata-rata:</strong> 99.98% — excellent performance, optimal range</li>
                </ul>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  marginBottom: '8px'
                }}>
                  <strong>2. Trend Tekanan dan Temperatur:</strong>
                </p>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  paddingLeft: '30px',
                  margin: 0
                }}>
                  <li>Tekanan range: 6.68-7.15 bar (relatif stabil)</li>
                  <li>Temperatur range: 162.2-170.5°C (consistent dengan saturated steam pada P tersebut)</li>
                  <li>Slight increase in P & T dari Q4 2022 — kemungkinan seasonal effect atau production optimization</li>
                </ul>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  marginBottom: '8px'
                }}>
                  <strong>3. Non-Condensable Gas (NCG):</strong>
                </p>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  paddingLeft: '30px',
                  margin: 0
                }}>
                  <li>Range: 0.210-0.310% — acceptable level untuk Indonesia geothermal</li>
                  <li>Slight increase trend dari 0.218% (Jan 2022) ke 0.310% (Sep 2023)</li>
                  <li>Perlu monitoring — NCG &gt; 0.5% akan significantly affect turbine performance</li>
                </ul>
              </div>

              <div>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  marginBottom: '8px'
                }}>
                  <strong>4. Total Dissolved Solids (TDS):</strong>
                </p>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#0c4a6e',
                  paddingLeft: '30px',
                  margin: 0
                }}>
                  <li>Range: 0.574-2.065 ppm — very clean steam, separator efficiency excellent</li>
                  <li>Target: &lt; 5 ppm untuk prevent scaling dan deposit on turbine blades</li>
                  <li>Spike ke 2.065 ppm (April 2023) — possible carryover event, perlu investigation</li>
                </ul>
              </div>
            </div>

            {/* Quality Assessment */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#14532d',
                marginBottom: '12px'
              }}>
                ✅ Penilaian Kualitas Steam PLTP Kamojang
              </h4>
              
              <p style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#14532d',
                marginBottom: '12px'
              }}>
                Berdasarkan 20 data points selama 21 bulan operasi:
              </p>

              <ul style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#14532d',
                paddingLeft: '30px',
                marginBottom: '12px'
              }}>
                <li><strong>Steam quality consistently &gt; 99.5%</strong> — menunjukkan separator dan 
                demister system bekerja optimal</li>
                <li><strong>Variabilitas rendah (σ ≈ 0.15%)</strong> — operasi stabil dan predictable</li>
                <li><strong>TDS terkontrol &lt; 2.1 ppm</strong> — risiko scaling dan fouling minimal</li>
                <li><strong>NCG level acceptable</strong> — gas removal system adequate</li>
              </ul>

              <p style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#14532d',
                margin: 0
              }}>
                <strong>Kesimpulan:</strong> PLTP Kamojang Unit 3 menunjukkan performance excellent dalam 
                maintaining high steam quality. Sistem separator, demister, dan gas removal berfungsi 
                sesuai design. Recommended action: Continue current maintenance schedule dan monitor 
                NCG trend closely untuk prevent future degradation.
              </p>
            </div>
          </section>

          {/* Gambar: Efficiency Graph */}
          <div style={{
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '40px',
            border: '1px solid #e2e8f0'
          }}>
            <img 
              src={drynessEfficiencyGraph} 
              alt="Hubungan dryness fraction dengan efisiensi turbin"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            <div style={{
              background: '#f8fafc',
              padding: '12px 20px',
              fontSize: '13px',
              color: '#64748b',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              Gambar 4: Hubungan dryness fraction dengan efisiensi turbin
            </div>
          </div>

          {/* Monitoring & Kontrol */}
          <section id="monitoring" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '3px solid #0369a1'
            }}>
              Sistem Monitoring dan Kontrol
            </h2>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '20px'
            }}>
              Maintaining dryness fraction yang optimal memerlukan kombinasi desain sistem yang baik, 
              monitoring berkelanjutan, dan kontrol operasional yang ketat.
            </p>

            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '15px',
              marginTop: '25px'
            }}>
              Teknologi Pemisahan
            </h4>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '12px'
            }}>
              <strong>1. Separator Primer (Cyclone):</strong> Gaya sentrifugal untuk pisahkan droplet 
              &gt;50 μm. Efisiensi 95-98%. Kontrol level separator sangat kritis.<Ref num={17} />
            </p>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '12px'
            }}>
              <strong>2. Demister (Mesh/Vane):</strong> Tangkap droplet mikro 5-50 μm. Meningkatkan 
              x dari ~0.95 ke 0.98-0.99. Maintenance rutin penting.<Ref num={18} />
            </p>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '12px'
            }}>
              <strong>3. Superheater (Optional):</strong> Eliminasi risiko kondensasi. Efektif untuk 
              PLTP &gt;100 MW.<Ref num={16} />
            </p>

            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '12px'
              }}>
                Rekomendasi untuk Operator
              </h4>
              <ul style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#0c4a6e',
                paddingLeft: '30px'
              }}>
                <li>Target x ≥ 0.95 untuk operasi optimal</li>
                <li>Monitor level separator setiap shift</li>
                <li>Schedule demister cleaning/replacement quarterly</li>
                <li>Implementasi real-time monitoring dengan alarm system</li>
                <li>Periodic verification dengan lab measurement (monthly)</li>
              </ul>
            </div>
          </section>

          {/* Kesimpulan */}
          <section id="kesimpulan" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '3px solid #10b981'
            }}>
              Kesimpulan
            </h2>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '15px'
            }}>
              Dryness fraction adalah parameter operasional paling kritis dalam PLTP. Menjaga dryness 
              fraction di atas 0.95 bukan hanya tentang efisiensi — tetapi juga tentang umur turbin, 
              biaya maintenance, dan keandalan jangka panjang.
            </p>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '15px'
            }}>
              Pengalaman dari PLTP Kamojang menunjukkan bahwa dengan sistem pemisahan yang optimal 
              dan monitoring berkelanjutan, steam quality &gt; 99.5% dapat dipertahankan secara 
              konsisten, menghasilkan:
            </p>

            <ul style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#475569',
              paddingLeft: '30px',
              marginBottom: '20px'
            }}>
              <li>Efisiensi turbin yang konsisten tinggi</li>
              <li>Pengurangan biaya maintenance hingga 50%</li>
              <li>Perpanjangan interval overhaul 2-3x lipat</li>
              <li>Peningkatan availability dan capacity factor</li>
            </ul>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '25px',
              borderRadius: '8px'
            }}>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#14532d',
                margin: 0,
                fontWeight: '500'
              }}>
                <strong>Key Takeaways:</strong> Investasi dalam separator berkualitas tinggi, 
                implementasi metode pengukuran yang akurat (Combined Separating & Throttling recommended), 
                dan monitoring berkelanjutan adalah kunci untuk menjaga dryness fraction optimal dan 
                memaksimalkan ROI dari PLTP.
              </p>
            </div>
          </section>

          {/* Daftar Pustaka */}
          <section id="dafpus" style={{ 
            marginTop: '50px',
            paddingTop: '30px',
            borderTop: '2px solid #e2e8f0'
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '25px'
            }}>
              Daftar Pustaka
            </h2>

            <div style={{
              fontSize: '13px',
              lineHeight: '1.8',
              color: '#475569'
            }}>
              <p id="ref-1" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [1] Pambudi, N.A. "Performance Evaluation of Double-flash Geothermal Power Plant". <em>Stanford Pangea</em>, 2013.
              </p>

              <p id="ref-2" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [2] "An Update Dieng—Energy and Exergy Analysis". <em>Politeknik Negeri Jember</em>, 2024.
              </p>

              <p id="ref-3" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [3] TLV. "The Importance of the Steam Dryness Fraction". https://www.tlv.com/steam-info/
              </p>

              <p id="ref-4" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [4] Thermopedia. "Geothermal Heat Utilization Methods". https://www.thermopedia.com/
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
                [8] T Kashyap. "Silt erosion and cavitation impact on hydraulic turbines". <em>ScienceDirect</em>, 2024.
              </p>

              <p id="ref-9" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [9] Walker, D. "Wet Steam Measurement Techniques". <em>Nottingham Repository</em>.
              </p>

              <p id="ref-10" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [10] Ramadhan, D.F. et al. "Evaluation Turbine Blade Design and Materials". <em>JREM ITENAS</em>, 2025.
              </p>

              <p id="ref-11" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [11] Wen, C. "Wet steam flow and condensation loss in turbine blade". <em>ScienceDirect</em>, 2021.
              </p>

              <p id="ref-12" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [12] TLV. "Wet Steam Corrosion". https://www.tlv.com/global/
              </p>

              <p id="ref-13" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [13] POWER Magazine. "Fighting Scale and Corrosion on Geothermal Equipment", 2015.
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
                [17] Rizaldy, M., Zarrouk, S.J. "Liquid Carryover in Geothermal Separators". <em>NZ Geothermal Workshop</em>, 2016.
              </p>

              <p id="ref-18" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [18] ResearchGate. "Monitoring of geothermal steam moisture separator". <em>Geothermics</em>, 2003.
              </p>

              <p id="ref-19" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [19] OSTI. "Steam Quality Monitoring Systems for Geothermal". <em>OSTI.GOV</em>, 1995.
              </p>

              <p id="ref-20" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [20] Moya, D. "Geothermal energy technology review". <em>Sci-Hub</em>, 2018.
              </p>

              <p id="ref-21" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [21] Brainkart. "The Measurements of Dryness Fraction - Throttling Calorimeter". http://www.brainkart.com/article/The-Measurements-of-Dryness-Fraction_5468/
              </p>

              <p id="ref-22" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [22] Engineering Notes. "How to Measure Dryness Fraction of Steam: Top 4 Methods". https://www.engineeringenotes.com/
              </p>

              <p id="ref-23" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [23] T&HE. "Throttling Calorimeter and Limitations". IASRI Research Institute, 2024.
              </p>

              <p id="ref-24" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [24] Scribd. "Determination of Dryness Fraction of Steam - Separating Calorimeter". https://www.scribd.com/doc/90352254/
              </p>

              <p id="ref-25" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [25] T&HE. "Separating Calorimeter Method and Procedure". IASRI Online Courses, 2024.
              </p>

              <p id="ref-26" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [26] Testbook. "Dryness Fraction of Steam: Formula, Methods, Numericals". https://testbook.com/mechanical-engineering/dryness-fraction-of-steam
              </p>

              <p id="ref-27" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [27] T&HE. "Combined Separating and Throttling Calorimeter". IASRI Research, 2024.
              </p>

              <p id="ref-28" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [28] Engineering Notes. "Barrel Calorimeter Method for Dryness Fraction". 2018.
              </p>

              <p id="ref-29" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [29] T&HE. "Bucket Calorimeter - Measurement of Dryness Fraction". IASRI, 2024.
              </p>

              <p id="ref-30" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [30] Endress+Hauser. "Measure and optimize utility steam consumption". https://www.us.endress.com/
              </p>

              <p id="ref-31" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [31] Armstrong International. "Steam Quality Monitoring - Steam QM Series". https://armstronginternational.com/
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>

    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          <p>&copy; 2024 SMART System - PT. Pertamina & UNPAD. All rights reserved.</p>
        </div>
      </div>
    </footer>
    </>
  );
}
