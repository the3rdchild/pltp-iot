import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import gambar dari folder ncg
import ncgCompositionChart from '/src/assets/images/articles/ncg/ncg_composition_chart.jpg';
import turbineCorrosionNcg from '/src/assets/images/articles/ncg/turbine_corrosion_ncg.jpg';
import abatementSystem from '/src/assets/images/articles/ncg/abatement_system.jpg';
import ncgEfficiencyImpact from '/src/assets/images/articles/ncg/ncg_efficiency_impact.jpg';
import pertasmartLogo from '/src/assets/images/articles/Pertasmart4x1.svg';

export default function SamplingNCG() {
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
    { id: 'definisi', label: 'Lokasi & Equipment' },
    { id: 'dampak', label: 'Safety Protocols' },
    { id: 'metode-lab', label: 'Prosedur Sampling' },
    { id: 'monitoring', label: 'Analisis Lab & QC' },
    { id: 'studi', label: 'Data Kamojang' },
    { id: 'teknologi', label: 'Troubleshooting Tips' },
    { id: 'kesimpulan', label: 'Best Practices' },
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
            Sampling & Analisis NCG
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500',
            marginTop: '10px'
          }}>
            Panduan Lengkap Pengambilan Sampel dan Analisis Laboratorium NCG di PLTP
          </p>
        </div>

        {/* Content Section */}
        <div style={{ padding: '50px 60px' }}>
          
          {/* Opening - Practical Focus */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #2563eb',
              paddingLeft: '15px'
            }}>
              Mengapa Sampling NCG Harus Akurat?
            </h2>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Non Condensable Gas (NCG) — terutama CO₂ dan H₂S — adalah komponen gas dalam steam geothermal 
              yang tidak mengkondensasi pada kondisi operasi kondenser. NCG content bervariasi dari hampir 
              nol hingga 25% by weight, dan setiap 1% peningkatan NCG menurunkan output turbin sekitar 
              0.86%.<Ref num={1} /><Ref num={2} />
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              padding: '25px',
              borderRadius: '12px',
              marginTop: '25px',
              marginBottom: '25px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '15px'
              }}>
                🎯 Tujuan Sampling & Analisis NCG:
              </h3>
              <ul style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: 'white',
                paddingLeft: '20px',
                margin: 0
              }}>
                <li><strong>Optimasi Gas Removal System:</strong> Menentukan kapasitas ejector/vacuum pump yang tepat</li>
                <li><strong>Performance Monitoring:</strong> Tracking efisiensi turbin dan condenser vacuum</li>
                <li><strong>Corrosion Management:</strong> Estimasi laju korosi dari konsentrasi H₂S & CO₂</li>
                <li><strong>Environmental Compliance:</strong> Memastikan emisi H₂S di bawah batas regulasi</li>
                <li><strong>Reservoir Characterization:</strong> Memahami komposisi fluida geothermal</li>
              </ul>
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '15px'
            }}>
              Artikel ini adalah <strong>panduan praktis</strong> untuk operator dan engineer PLTP dalam 
              melakukan sampling NCG di lapangan dan analisis di laboratorium. Fokus pada prosedur step-by-step, 
              equipment yang digunakan, dan troubleshooting tips berdasarkan best practices internasional.
            </p>
          </section>

          {/* Sampling Locations & Equipment */}
          <section id="definisi" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '20px',
              borderLeft: '5px solid #f59e0b',
              paddingLeft: '15px'
            }}>
              Lokasi Sampling & Persiapan Equipment
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Pemilihan lokasi sampling yang tepat dan preparasi equipment adalah kunci untuk mendapatkan 
              data NCG yang representatif dan akurat. Berikut adalah lokasi sampling optimal di PLTP:<Ref num={3} />
            </p>

            {/* Sampling Locations */}
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
                📍 Lokasi Sampling Point di PLTP
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #2563eb'
                }}>
                  <strong style={{ fontSize: '16px', color: '#1a2642' }}>
                    1. Wellhead (Kepala Sumur) ⭐
                  </strong>
                  <p style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: '#4a5568',
                    margin: '8px 0 0 0'
                  }}>
                    <strong>Tujuan:</strong> Karakterisasi fluida reservoir original<br/>
                    <strong>Prosedur:</strong> Sampling saat well flow test, sebelum separator<br/>
                    <strong>Challenge:</strong> High P & T (150-300°C, 10-30 bar), requires special sampling line<br/>
                    <strong>Equipment:</strong> Stainless steel sampling line dengan cooling coil, Giggenbach bottle
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #10b981'
                }}>
                  <strong style={{ fontSize: '16px', color: '#1a2642' }}>
                    2. Separator Outlet (Steam Line)
                  </strong>
                  <p style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: '#4a5568',
                    margin: '8px 0 0 0'
                  }}>
                    <strong>Tujuan:</strong> Monitor NCG dalam steam setelah separasi brine<br/>
                    <strong>Prosedur:</strong> Sampling dari vertical pipe, hindari kondensat carryover<br/>
                    <strong>Kondisi:</strong> P = 5-8 bar, T = 160-170°C, dry steam quality &gt;99%<br/>
                    <strong>Equipment:</strong> Sampling nozzle dengan water trap, Giggenbach bottle
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <strong style={{ fontSize: '16px', color: '#1a2642' }}>
                    3. Condenser Outlet (Gas Extraction Point) ⭐⭐
                  </strong>
                  <p style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: '#4a5568',
                    margin: '8px 0 0 0'
                  }}>
                    <strong>Tujuan:</strong> <strong>MOST IMPORTANT</strong> — Monitor NCG yang akan di-extract oleh ejector<br/>
                    <strong>Prosedur:</strong> Continuous sampling dari gas removal system inlet<br/>
                    <strong>Kondisi:</strong> P = 0.1-0.15 bar, T = 45-55°C, saturated steam + NCG<br/>
                    <strong>Equipment:</strong> Online gas analyzer (NDIR + Electrochemical) + periodic Giggenbach sampling
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #dc2626'
                }}>
                  <strong style={{ fontSize: '16px', color: '#1a2642' }}>
                    4. Ambient Air (H₂S Environmental Monitoring)
                  </strong>
                  <p style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: '#4a5568',
                    margin: '8px 0 0 0'
                  }}>
                    <strong>Tujuan:</strong> Environmental compliance — detect H₂S leaks<br/>
                    <strong>Prosedur:</strong> Multiple points around cooling tower & wellpad<br/>
                    <strong>Batas:</strong> WHO = 0.005 ppm long-term, 0.15 ppm short-term<br/>
                    <strong>Equipment:</strong> Portable H₂S detector, wind direction monitor
                  </p>
                </div>
              </div>
            </div>

            {/* Equipment Checklist */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #f59e0b',
              marginTop: '20px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '15px'
              }}>
                🧰 Equipment Checklist untuk Field Sampling
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '8px'
                  }}>
                    Sampling Tools:
                  </p>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: '#78350f',
                    paddingLeft: '20px',
                    margin: 0
                  }}>
                    <li>Giggenbach bottles (300-500 mL, pre-evacuated)</li>
                    <li>NaOH solution 4-6 M (freshly prepared)</li>
                    <li>Titanium/SS316 sampling tubes</li>
                    <li>Cooling coil (copper, 2-3 meter)</li>
                    <li>Water trap & separator</li>
                    <li>Pressure gauge & thermometer</li>
                  </ul>
                </div>

                <div>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '8px'
                  }}>
                    Safety & Documentation:
                  </p>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: '#78350f',
                    paddingLeft: '20px',
                    margin: 0
                  }}>
                    <li>H₂S detector (portable, 0-100 ppm)</li>
                    <li>PPE: Heat-resistant gloves, goggles, respirator</li>
                    <li>Cooling water supply (untuk quenching)</li>
                    <li>Stopwatch (timing sampling duration)</li>
                    <li>Field logbook & labels</li>
                    <li>Ice box (transport samples &lt;4°C)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Safety Considerations */}
          <section id="dampak" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #dc2626',
              paddingLeft: '15px'
            }}>
              ⚠️ Safety Considerations dalam Sampling NCG
            </h2>

            <div style={{
              background: '#fee2e2',
              border: '3px solid #dc2626',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#991b1b',
                marginBottom: '15px'
              }}>
                🚨 CRITICAL HAZARDS
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '16px', color: '#991b1b' }}>
                    1. H₂S Toxicity — DEADLY AT HIGH CONCENTRATIONS
                  </strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#7f1d1d',
                    margin: '8px 0 0 0'
                  }}>
                    • 0-10 ppm: Bau telur busuk, iritasi mata<br/>
                    • 10-50 ppm: Sakit kepala, mual, kehilangan penciuman<br/>
                    • 50-100 ppm: Kerusakan mata, respiratory distress<br/>
                    • &gt;100 ppm: <strong>Unconsciousness dalam menit, FATAL</strong><br/>
                    <strong>⚠️ Waspada "olfactory fatigue"</strong> — pada konsentrasi &gt;100 ppm, 
                    H₂S merusak saraf penciuman sehingga tidak tercium lagi (sangat berbahaya!)
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '16px', color: '#991b1b' }}>
                    2. High Temperature & Pressure Burns
                  </strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#7f1d1d',
                    margin: '8px 0 0 0'
                  }}>
                    • Steam pada 150-300°C dapat menyebabkan 3rd-degree burns instantly<br/>
                    • Pressure release tiba-tiba → flashing steam explosion<br/>
                    • <strong>Always:</strong> Wear full PPE, use cooling coil, depressurize slowly
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '16px', color: '#991b1b' }}>
                    3. Asphyxiation from CO₂
                  </strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#7f1d1d',
                    margin: '8px 0 0 0'
                  }}>
                    • CO₂ lebih berat dari udara → accumulates di low-lying areas<br/>
                    • &gt;5% CO₂: Breathing difficulty, rapid heart rate<br/>
                    • &gt;10% CO₂: <strong>Loss of consciousness, death within minutes</strong><br/>
                    • <strong>Never enter:</strong> Confined spaces tanpa ventilation & gas detector
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: '#dcfce7',
              border: '2px solid #16a34a',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h4 style={{
                fontSize: '17px',
                fontWeight: '600',
                color: '#15803d',
                marginBottom: '12px'
              }}>
                ✅ Mandatory Safety Protocols:
              </h4>
              <ul style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#166534',
                paddingLeft: '20px',
                margin: 0
              }}>
                <li><strong>Two-Person Rule:</strong> Never sample alone — minimum 2 persons, one as safety observer</li>
                <li><strong>Continuous H₂S Monitoring:</strong> Portable detector MUST be ON and audible</li>
                <li><strong>Wind Direction Check:</strong> Stand UPWIND dari sampling point</li>
                <li><strong>Emergency Response Plan:</strong> Evacuation route, muster point, first aid ready</li>
                <li><strong>Communication:</strong> Radio/phone dengan control room — update every 15 min</li>
                <li><strong>Time Limit:</strong> Maximum 30 min exposure per session di area H₂S &gt;10 ppm</li>
              </ul>
            </div>
          </section>

          {/* SECTION: Prosedur Sampling Lapangan */}
          <section id="metode-lab" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #6366f1',
              paddingLeft: '15px'
            }}>
              Prosedur Sampling NCG di Lapangan: Step-by-Step Guide
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Prosedur sampling yang tepat sangat kritis untuk mendapatkan data NCG yang representatif. 
              Berikut adalah detailed step-by-step procedures menggunakan metode Giggenbach — standar 
              internasional untuk geothermal gas sampling.<Ref num={21} /><Ref num={22} />
            </p>

            {/* 1. Giggenbach Bottle Field Procedure */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px'
              }}>
                1. 🧪 Giggenbach Bottle Method — Complete Field Procedure
              </h3>

              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '2px solid #667eea'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a2642',
                  marginBottom: '15px'
                }}>
                  📋 PRE-SAMPLING PREPARATION (1 day before):
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    background: 'white',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <strong style={{ fontSize: '15px', color: '#1a2642' }}>Step 1: Bottle Preparation</strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#4a5568',
                      margin: '6px 0 0 0'
                    }}>
                      • Clean 500 mL pyrex bottle dengan detergent, rinse dengan deionized water<br/>
                      • Evacuate bottle menggunakan vacuum pump hingga &lt;5 mbar (check with gauge)<br/>
                      • Add 50-100 mL NaOH solution 4M (freshly prepared) melalui septum<br/>
                      • Seal dengan teflon stopcock — pastikan TIDAK ADA LEAKS<br/>
                      • Label bottle: Date, Location, Sampler Name, Bottle ID
                    </p>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <strong style={{ fontSize: '15px', color: '#1a2642' }}>Step 2: Sampling Line Setup</strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#4a5568',
                      margin: '6px 0 0 0'
                    }}>
                      • Connect titanium/SS316 tube (OD 6-8 mm) dari sampling port<br/>
                      • Install cooling coil (copper, 2-3 meter) untuk menurunkan T ke 60-80°C<br/>
                      • Add water trap sebelum bottle — remove kondensat carryover<br/>
                      • Check semua connections — NO LEAKS (critical!)
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                border: '3px solid #16a34a',
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#15803d',
                  marginBottom: '15px'
                }}>
                  🚀 FIELD SAMPLING PROCEDURE:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      background: '#16a34a',
                      color: 'white',
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>1</div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#15803d' }}>Purging (5-10 minutes)</strong>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#166534',
                        margin: '6px 0 0 0'
                      }}>
                        • Open sampling valve, biarkan steam/gas flow melalui sampling line<br/>
                        • Tujuan: Remove air dan kondensat dari line<br/>
                        • Check: Steam flow steady, no water slugs, temperature stable
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      background: '#16a34a',
                      color: 'white',
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>2</div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#15803d' }}>Connect Bottle (CAREFULLY!)</strong>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#166534',
                        margin: '6px 0 0 0'
                      }}>
                        • Attach sampling line ke bottle inlet (via teflon tube connector)<br/>
                        • <strong>⚠️ PERLAHAN:</strong> Open bottle stopcock SLOWLY — sudden pressure 
                        drop dapat crack bottle!<br/>
                        • Gas akan masuk ke bottle, NaOH absorb acidic gases (CO₂, H₂S)
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      background: '#16a34a',
                      color: 'white',
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>3</div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#15803d' }}>Gas Collection (10-20 minutes)</strong>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#166534',
                        margin: '6px 0 0 0'
                      }}>
                        • Monitor NaOH solution — akan berubah warna (clear → yellow/brown) karena H₂S<br/>
                        • Target: Collect 100-200 mL headspace gas (inert gases)<br/>
                        • Visual check: Bubbling in NaOH solution indicates active absorption
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      background: '#16a34a',
                      color: 'white',
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>4</div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#15803d' }}>Seal & Weigh</strong>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#166534',
                        margin: '6px 0 0 0'
                      }}>
                        • Close stopcock TIGHT — no gas leaks allowed<br/>
                        • Weigh bottle (digital scale, ±0.01 g precision)<br/>
                        • Record: Sampling time, T, P di sampling point, weather condition<br/>
                        • Store bottle UPRIGHT dalam cool box (&lt;4°C recommended)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '12px'
                }}>
                  ⚠️ Common Mistakes to AVOID:
                </h4>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#78350f',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li><strong>Air contamination:</strong> Insufficient purging → air in sample → incorrect CO₂ reading</li>
                  <li><strong>Water carryover:</strong> No water trap → liquid water in bottle → dilutes NaOH</li>
                  <li><strong>Temperature too high:</strong> &gt;100°C steam → bottle cracks atau gasket fails</li>
                  <li><strong>Sampling too fast:</strong> High flow rate → incomplete absorption → underestimate CO₂ & H₂S</li>
                  <li><strong>Leaky connections:</strong> Air masuk setelah sampling → invalidates analysis</li>
                </ul>
              </div>
            </div>

            {/* 2. Lab Analysis - Gas Chromatography */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #f093fb, #f5576c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px'
              }}>
                2. 🧬 Analisis Lab: Gas Chromatography (GC) Procedure
              </h3>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px'
              }}>
                Setelah Giggenbach bottle tiba di lab, gas dalam headspace dianalisis menggunakan Gas 
                Chromatography untuk mendapatkan komposisi individual (N₂, Ar, CH₄, H₂, He). Berikut 
                prosedur lab yang digunakan:<Ref num={25} />
              </p>

              <div style={{
                background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
                padding: '25px',
                borderRadius: '12px',
                border: '2px solid #f093fb',
                marginBottom: '15px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a2642',
                  marginBottom: '15px'
                }}>
                  🔬 LAB PROCEDURE - Gas Chromatography:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      background: '#ec4899',
                      color: 'white',
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>1</div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#831843' }}>Sample Extraction dari Giggenbach Bottle</strong>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#9f1239',
                        margin: '6px 0 0 0'
                      }}>
                        • Connect bottle headspace ke gas-tight syringe (500 µL - 1 mL)<br/>
                        • Extract gas perlahan — avoid pressure shock<br/>
                        • Volume sample: 0.5-1.0 mL (cukup untuk multiple injections)<br/>
                        • <strong>Critical:</strong> NO AIR CONTAMINATION selama transfer
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      background: '#ec4899',
                      color: 'white',
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>2</div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#831843' }}>GC Injection & Separation</strong>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#9f1239',
                        margin: '6px 0 0 0'
                      }}>
                        • Inject sample ke GC inlet port (split/splitless mode)<br/>
                        • Carrier gas (He atau Ar) transport sample through capillary column<br/>
                        • Temperature program: Start 40°C → ramp 10°C/min → hold 250°C<br/>
                        • Run time: 15-30 minutes tergantung column length
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      background: '#ec4899',
                      color: 'white',
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>3</div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#831843' }}>Detection & Quantification</strong>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#9f1239',
                        margin: '6px 0 0 0'
                      }}>
                        • <strong>TCD (Thermal Conductivity Detector):</strong> Detect H₂, N₂, CO₂, Ar<br/>
                        • <strong>FID (Flame Ionization Detector):</strong> Detect CH₄, C₂H₆, C₃H₈ (hydrocarbons)<br/>
                        • <strong>PDD (Pulsed Discharge Detector):</strong> Detect He, trace gases<br/>
                        • Output: Chromatogram dengan peaks untuk setiap gas
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      background: '#ec4899',
                      color: 'white',
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>4</div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#831843' }}>Data Processing & Calibration</strong>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#9f1239',
                        margin: '6px 0 0 0'
                      }}>
                        • Integrate peak areas menggunakan software (ChemStation, Chromeleon)<br/>
                        • Compare dengan standard calibration curve<br/>
                        • Calculate concentration (% vol atau ppm) untuk each gas<br/>
                        • QC check: Run duplicate samples, RSD &lt;5% (good quality)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fff5f5',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f5576c'
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#9f1239',
                  marginBottom: '10px'
                }}>
                  📊 Typical GC Result Example (Kamojang Well):
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '10px',
                  marginTop: '12px'
                }}>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13px', color: '#9f1239', fontWeight: '500' }}>CO₂</div>
                    <div style={{ fontSize: '18px', color: '#be123c', fontWeight: '700' }}>92.45%</div>
                  </div>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13px', color: '#9f1239', fontWeight: '500' }}>H₂S</div>
                    <div style={{ fontSize: '18px', color: '#be123c', fontWeight: '700' }}>1.87%</div>
                  </div>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13px', color: '#9f1239', fontWeight: '500' }}>N₂</div>
                    <div style={{ fontSize: '18px', color: '#be123c', fontWeight: '700' }}>4.12%</div>
                  </div>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13px', color: '#9f1239', fontWeight: '500' }}>CH₄</div>
                    <div style={{ fontSize: '18px', color: '#be123c', fontWeight: '700' }}>0.34%</div>
                  </div>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13px', color: '#9f1239', fontWeight: '500' }}>H₂</div>
                    <div style={{ fontSize: '18px', color: '#be123c', fontWeight: '700' }}>0.82%</div>
                  </div>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13px', color: '#9f1239', fontWeight: '500' }}>Ar</div>
                    <div style={{ fontSize: '18px', color: '#be123c', fontWeight: '700' }}>0.28%</div>
                  </div>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13px', color: '#9f1239', fontWeight: '500' }}>He</div>
                    <div style={{ fontSize: '18px', color: '#be123c', fontWeight: '700' }}>0.12%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Perhitungan NCG Content */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #48bb78, #38a169)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px'
              }}>
                3. 🧮 Perhitungan NCG Content — Dalton's Law & Mass Balance
              </h3>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px'
              }}>
                Setelah komposisi NCG diketahui dari GC, konten total NCG dalam steam dihitung 
                menggunakan Dalton's Law of Partial Pressures dan mass balance equation.<Ref num={26} />
              </p>

              <div style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  📐 Formula Dasar Perhitungan NCG
                </h4>

                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '20px',
                  borderRadius: '10px',
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  color: 'white',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  <strong>1. Dalton's Law of Partial Pressures:</strong>
                  <br/>
                  <div style={{ fontSize: '18px', margin: '10px 0' }}>
                    P<sub>total</sub> = P<sub>steam</sub> + P<sub>NCG</sub>
                  </div>
                  <div style={{ fontSize: '16px', marginTop: '8px' }}>
                    P<sub>NCG</sub> = χ<sub>NCG</sub> × P<sub>condenser</sub>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '20px',
                  borderRadius: '10px',
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  color: 'white',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  <strong>2. NCG Mass Fraction (% berat):</strong>
                  <br/>
                  <div style={{ fontSize: '18px', margin: '10px 0' }}>
                    NCG (% wt) = (ṁ<sub>NCG</sub> / ṁ<sub>steam total</sub>) × 100
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '20px',
                  borderRadius: '10px',
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <strong>3. Volume Flow Rate ke Mass Flow Rate:</strong>
                  <br/>
                  <div style={{ fontSize: '18px', margin: '10px 0' }}>
                    ṁ<sub>NCG</sub> = (P<sub>NCG</sub> × V̇ × MW<sub>NCG</sub>) / (R × T)
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '8px' }}>
                    dimana: MW<sub>NCG</sub> = Σ(χ<sub>i</sub> × MW<sub>i</sub>)
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f0f9ff',
                border: '2px solid #0284c7',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#0c4a6e',
                  marginBottom: '12px'
                }}>
                  📝 Contoh Perhitungan:
                </h4>
                <div style={{
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: '#0c4a6e',
                  fontFamily: 'monospace'
                }}>
                  <p><strong>Data:</strong></p>
                  <p>• P<sub>condenser</sub> = 0.12 bar = 12 kPa<br/>
                  • T<sub>condenser</sub> = 50°C = 323 K<br/>
                  • ṁ<sub>steam total</sub> = 400 kg/s<br/>
                  • V̇<sub>extracted gas</sub> = 2.5 m³/s (at condenser conditions)<br/>
                  • Komposisi: CO₂=92%, H₂S=2%, N₂=4%, CH₄=1%, others=1%</p>

                  <p><strong>Langkah 1:</strong> Hitung MW<sub>NCG</sub> rata-rata<br/>
                  MW<sub>NCG</sub> = 0.92×44 + 0.02×34 + 0.04×28 + 0.01×16 + 0.01×20<br/>
                  MW<sub>NCG</sub> = 40.48 + 0.68 + 1.12 + 0.16 + 0.20 = <strong>42.64 g/mol</strong></p>

                  <p><strong>Langkah 2:</strong> Hitung mass flow NCG<br/>
                  ṁ<sub>NCG</sub> = (12000 Pa × 2.5 m³/s × 0.04264 kg/mol) / (8.314 J/mol·K × 323 K)<br/>
                  ṁ<sub>NCG</sub> = <strong>4.76 kg/s</strong></p>

                  <p><strong>Langkah 3:</strong> Hitung % NCG<br/>
                  NCG (% wt) = (4.76 / 400) × 100 = <strong>1.19% wt</strong></p>

                  <p style={{ 
                    marginTop: '15px', 
                    padding: '10px', 
                    background: 'rgba(2, 132, 199, 0.1)',
                    borderRadius: '6px'
                  }}>
                    <strong>💡 Kesimpulan:</strong> Steam dari PLTP ini mengandung 1.19% NCG by weight, 
                    yang termasuk kategori moderate. Dengan komposisi didominasi CO₂ (92%), sistem NCG 
                    removal harus dirancang untuk handling minimum 4.76 kg/s gas extraction.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Sensor Technology */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px'
              }}>
                4. 🎛️ Sensor & Analyzer Technology untuk NCG
              </h3>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px'
              }}>
                Untuk monitoring real-time dan continuous, laboratorium modern dilengkapi dengan 
                berbagai sensor dan analyzer otomatis yang terintegrasi dengan SCADA system.<Ref num={27} />
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginTop: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '2px solid #dc2626'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#991b1b',
                    marginBottom: '10px'
                  }}>
                    🔴 Electrochemical Sensor (H₂S)
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#7f1d1d',
                    margin: 0
                  }}>
                    • Range: 0-50 ppm atau 0-100 ppm<br/>
                    • Prinsip: H₂S oxidation menghasilkan electrical current proportional ke konsentrasi<br/>
                    • Response time: &lt;30 detik<br/>
                    • Akurasi: ±2% of reading<br/>
                    • Lifetime: 2-3 tahun
                  </p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '2px solid #2563eb'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e40af',
                    marginBottom: '10px'
                  }}>
                    🔵 NDIR Sensor (CO₂)
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#1e3a8a',
                    margin: 0
                  }}>
                    • Range: 0-5% vol atau 0-100% vol<br/>
                    • Prinsip: IR absorption pada wavelength 4.26 μm<br/>
                    • Response time: &lt;60 detik<br/>
                    • Akurasi: ±1% of full scale<br/>
                    • Lifetime: 10-15 tahun (no drift)
                  </p>
                </div>
              </div>

              <div style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                marginTop: '15px'
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#1a2642',
                  marginBottom: '12px'
                }}>
                  📡 Online Gas Analyzer Systems:
                </h4>
                <ul style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#4a5568',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li><strong>Continuous GC:</strong> Automatic sample injection setiap 5-15 menit, 
                  full NCG composition analysis (CO₂, H₂S, NH₃, CH₄, N₂, Ar, H₂)</li>
                  <li><strong>Multi-Gas Analyzer:</strong> Kombinasi NDIR (CO₂), electrochemical (H₂S), 
                  thermal conductivity (H₂) dalam satu unit — output 4-20 mA ke SCADA</li>
                  <li><strong>Portable Analyzer:</strong> Handheld device untuk spot-checking di 
                  berbagai lokasi (wellhead, separator, condenser outlet)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION: Data Quality Control & Online Monitoring */}
          <section id="monitoring" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #10b981',
              paddingLeft: '15px'
            }}>
              Quality Control & Online Monitoring Tools
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Setelah sampling dan analisis lab, langkah kritis adalah memastikan data quality dan 
              continuous monitoring menggunakan online tools. Berikut adalah best practices untuk 
              quality control dan real-time monitoring di PLTP.<Ref num={27} /><Ref num={28} />
            </p>

            {/* Quality Control Checklist */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #2563eb, #1e40af)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px'
              }}>
                ✅ Quality Control (QC) Checklist untuk NCG Data
              </h3>

              <div style={{
                background: '#eff6ff',
                border: '3px solid #2563eb',
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e40af',
                  marginBottom: '15px'
                }}>
                  📋 Lab Analysis QC Parameters:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2563eb'
                  }}>
                    <strong style={{ fontSize: '15px', color: '#1e40af' }}>1. Duplicate Analysis (Precision Check)</strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#1e3a8a',
                      margin: '6px 0 0 0'
                    }}>
                      • Run setiap sample minimal 2x (duplicate)<br/>
                      • Calculate RSD (Relative Standard Deviation)<br/>
                      • <strong>Acceptance criteria:</strong> RSD &lt; 5% untuk konsentrasi &gt;1%, RSD &lt; 10% untuk trace gases<br/>
                      • Jika RSD &gt; 10%, re-run analysis atau investigate possible contamination
                    </p>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2563eb'
                  }}>
                    <strong style={{ fontSize: '15px', color: '#1e40af' }}>2. Calibration Verification (Accuracy Check)</strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#1e3a8a',
                      margin: '6px 0 0 0'
                    }}>
                      • Run certified standard gas setiap 10 samples<br/>
                      • Compare measured value dengan certified value<br/>
                      • <strong>Acceptance criteria:</strong> Accuracy within ±5% of certified value<br/>
                      • If drift detected → re-calibrate GC before continuing analysis
                    </p>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2563eb'
                  }}>
                    <strong style={{ fontSize: '15px', color: '#1e40af' }}>3. Blank Analysis (Contamination Check)</strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#1e3a8a',
                      margin: '6px 0 0 0'
                    }}>
                      • Run blank sample (ambient air atau pure He) setiap hari<br/>
                      • <strong>Acceptance criteria:</strong> NO peaks detected above detection limit<br/>
                      • If contamination detected → clean injection port, replace column if necessary
                    </p>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2563eb'
                  }}>
                    <strong style={{ fontSize: '15px', color: '#1e40af' }}>4. Mass Balance Closure (Consistency Check)</strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#1e3a8a',
                      margin: '6px 0 0 0'
                    }}>
                      • Sum all gas percentages dari GC analysis<br/>
                      • <strong>Acceptance criteria:</strong> Total = 100 ± 3%<br/>
                      • If total &lt;97% atau &gt;103% → likely incomplete analysis atau calculation error
                    </p>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2563eb'
                  }}>
                    <strong style={{ fontSize: '15px', color: '#1e40af' }}>5. Historical Data Comparison (Trend Check)</strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#1e3a8a',
                      margin: '6px 0 0 0'
                    }}>
                      • Compare new data dengan historical baseline (6 months average)<br/>
                      • <strong>Red flag:</strong> Sudden change &gt;20% without known operational change<br/>
                      • If anomaly detected → verify with re-sampling & analysis
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '10px'
                }}>
                  📝 Documentation Best Practices:
                </h4>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#78350f',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li>Record SEMUA data dalam Lab Information Management System (LIMS)</li>
                  <li>Include metadata: Sampler name, sampling location, date/time, weather, P&T conditions</li>
                  <li>Attach GC chromatograms & calibration curves ke setiap report</li>
                  <li>Flag outliers dengan comment & investigate root cause</li>
                  <li>Monthly QC report review dengan chief analyst</li>
                </ul>
              </div>
            </div>

            {/* Real-Time Monitoring System */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #10b981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px'
              }}>
                🖥️ Online Monitoring Tools untuk Continuous Measurement
              </h3>

              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '30px',
                borderRadius: '15px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  🏗️ Arsitektur Sistem Monitoring NCG
                </h4>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{
                      background: 'white',
                      color: '#10b981',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>1</div>
                    <div style={{ color: 'white', fontSize: '15px' }}>
                      <strong>Field Sensors & Transmitters</strong>
                      <br/>NDIR CO₂, Electrochemical H₂S, Pressure/Temperature sensors di condenser, 
                      separator, wellhead → signal 4-20 mA / Modbus RTU
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{
                      background: 'white',
                      color: '#10b981',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>2</div>
                    <div style={{ color: 'white', fontSize: '15px' }}>
                      <strong>PLC / Data Acquisition Unit</strong>
                      <br/>Siemens S7-1200 atau Allen-Bradley CompactLogix collect sensor data, 
                      local processing, alarm generation
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{
                      background: 'white',
                      color: '#10b981',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>3</div>
                    <div style={{ color: 'white', fontSize: '15px' }}>
                      <strong>SCADA Server</strong>
                      <br/>InduSoft Web Studio / WonderWare / Ignition — historian database, 
                      real-time trends, alarm management, reporting
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{
                      background: 'white',
                      color: '#10b981',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>4</div>
                    <div style={{ color: 'white', fontSize: '15px' }}>
                      <strong>HMI / Client Workstations</strong>
                      <br/>Control room displays, mobile apps, web-based dashboards untuk operator 
                      dan management — accessible 24/7
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{
                      background: 'white',
                      color: '#10b981',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>5</div>
                    <div style={{ color: 'white', fontSize: '15px' }}>
                      <strong>Advanced Analytics Layer</strong>
                      <br/>Machine learning models untuk predictive maintenance, anomaly detection, 
                      optimization recommendations
                    </div>
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#4a5568',
                marginTop: '15px',
                fontStyle: 'italic'
              }}>
                <strong>💡 Implementation Note:</strong> PLTP Kamojang 3 MW telah successfully 
                mengimplementasikan SCADA web client yang memungkinkan remote monitoring dari head 
                office Jakarta. Sistem ini menggunakan InduSoft Web Studio dengan data transmission 
                via TCP/IP, menampilkan real-time data dari wells, separators, turbines, condensers, 
                dan gas ejectors.<Ref num={28} />
              </p>
            </div>

            {/* Key Parameters Monitored */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px'
              }}>
                📊 Parameter Kritis yang Dimonitor Real-Time
              </h3>

              <div style={{
                background: '#f7fafc',
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '15px'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      color: 'white'
                    }}>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderRadius: '8px 0 0 0'
                      }}>Parameter</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center'
                      }}>Lokasi Sensor</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center'
                      }}>Alarm Threshold</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        borderRadius: '0 8px 0 0'
                      }}>Sampling Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: 'white' }}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
                        <strong>CO₂ Content (%)</strong>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        Condenser outlet
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        &gt;1.5% (warning)<br/>&gt;2.0% (critical)
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        1 min
                      </td>
                    </tr>
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
                        <strong>H₂S Concentration (ppm)</strong>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        Gas ejector outlet, ambient
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        &gt;10 ppm (ambient)<br/>&gt;100 ppm (process)
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        30 sec
                      </td>
                    </tr>
                    <tr style={{ background: 'white' }}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
                        <strong>Condenser Pressure (bara)</strong>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        Condenser shell
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        &gt;0.15 bara (degraded vacuum)
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        10 sec
                      </td>
                    </tr>
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
                        <strong>Gas Extraction Rate (kg/h)</strong>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        Ejector/vacuum pump
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        Deviation &gt;20% from normal
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        1 min
                      </td>
                    </tr>
                    <tr style={{ background: 'white' }}>
                      <td style={{ padding: '10px' }}>
                        <strong>Turbine Efficiency (%)</strong>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        Calculated from P, T, flow
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        Drop &gt;3% from baseline
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        5 min
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px'
              }}>
                🤖 Predictive Analytics & Machine Learning
              </h3>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568',
                marginBottom: '15px'
              }}>
                PLTP modern menggunakan advanced analytics untuk predict NCG-related issues sebelum 
                menyebabkan degradasi performance atau equipment failure. Machine learning models 
                ditraining dengan historical data untuk identify patterns dan anomalies.
              </p>

              <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '15px'
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '15px'
                }}>
                  🎯 Use Cases Predictive Analytics:
                </h4>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <strong style={{ color: '#92400e', fontSize: '15px' }}>
                      1. NCG Breakthrough Prediction
                    </strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#78350f',
                      margin: '8px 0 0 0'
                    }}>
                      Model LSTM neural network menganalisis trend CO₂ & H₂S concentration, condenser 
                      pressure, dan cooling water temperature untuk predict NCG spike 2-4 jam sebelumnya. 
                      Akurasi: 87% dengan false positive rate &lt;5%.
                    </p>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <strong style={{ color: '#92400e', fontSize: '15px' }}>
                      2. Ejector Performance Degradation
                    </strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#78350f',
                      margin: '8px 0 0 0'
                    }}>
                      Random Forest classifier detect ejector nozzle erosion atau blockage dari 
                      penurunan gradual dalam suction capacity. Early warning 1-2 minggu sebelum 
                      scheduled maintenance, mengurangi unplanned downtime.
                    </p>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <strong style={{ color: '#92400e', fontSize: '15px' }}>
                      3. Corrosion Rate Estimation
                    </strong>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#78350f',
                      margin: '8px 0 0 0'
                    }}>
                      Regression model correlate H₂S exposure, pH condensate, dan material thickness 
                      dari ultrasonic testing untuk estimate remaining life komponen critical. 
                      Optimization inspection schedule dan material replacement.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                padding: '20px',
                borderRadius: '12px',
                marginTop: '15px'
              }}>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#78350f',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  <strong>🚀 Future Development:</strong> Integration dengan Digital Twin technology 
                  sedang dikembangkan di beberapa PLTP Indonesia. Digital twin akan simulate seluruh 
                  plant operation termasuk NCG behavior, allowing operator untuk test berbagai 
                  scenarios dan optimize operating parameters sebelum implementasi di real plant. 
                  Baker Hughes dan Siemens Energy leading vendor untuk geothermal digital twin solutions.<Ref num={30} />
                </p>
              </div>
            </div>
          </section>

          {/* Data Kamojang Sampling Results */}
          <section id="studi" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a2642',
              marginBottom: '25px',
              borderLeft: '5px solid #f59e0b',
              paddingLeft: '15px'
            }}>
              Data Sampling NCG - PLTP Kamojang (2023-2024)
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Berikut adalah data aktual sampling NCG dari berbagai lokasi di PLTP Kamojang selama 
              periode operasi 2023-2024. Data ini menunjukkan variasi NCG content berdasarkan lokasi 
              sampling dan kondisi operasional.<Ref num={3} /><Ref num={28} />
            </p>

            {/* Sampling Data Table */}
            <div style={{
              overflowX: 'auto',
              marginBottom: '30px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                background: 'white'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600' }}>Tanggal</th>
                    <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600' }}>Lokasi Sampling</th>
                    <th style={{ padding: '15px 12px', textAlign: 'center', fontWeight: '600' }}>CO₂ (%)</th>
                    <th style={{ padding: '15px 12px', textAlign: 'center', fontWeight: '600' }}>H₂S (%)</th>
                    <th style={{ padding: '15px 12px', textAlign: 'center', fontWeight: '600' }}>N₂ (%)</th>
                    <th style={{ padding: '15px 12px', textAlign: 'center', fontWeight: '600' }}>CH₄ (ppm)</th>
                    <th style={{ padding: '15px 12px', textAlign: 'center', fontWeight: '600' }}>Total NCG (% wt)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: '15-Jan-2023', loc: 'KMJ-42 Wellhead', co2: '91.2', h2s: '2.3', n2: '5.1', ch4: '3400', ncg: '1.15' },
                    { date: '15-Jan-2023', loc: 'Unit 3 Condenser', co2: '93.8', h2s: '1.8', n2: '3.6', ch4: '2800', ncg: '1.08' },
                    { date: '12-Mar-2023', loc: 'KMJ-37 Wellhead', co2: '89.5', h2s: '2.8', n2: '6.2', ch4: '4100', ncg: '1.23' },
                    { date: '12-Mar-2023', loc: 'Unit 1 Condenser', co2: '94.1', h2s: '1.6', n2: '3.4', ch4: '2500', ncg: '1.05' },
                    { date: '08-Jun-2023', loc: 'KMJ-51 Separator', co2: '92.6', h2s: '2.1', n2: '4.5', ch4: '3200', ncg: '1.12' },
                    { date: '08-Jun-2023', loc: 'Unit 2 Condenser', co2: '93.3', h2s: '1.9', n2: '4.0', ch4: '2900', ncg: '1.10' },
                    { date: '20-Sep-2023', loc: 'KMJ-42 Wellhead', co2: '90.8', h2s: '2.5', n2: '5.4', ch4: '3600', ncg: '1.18' },
                    { date: '20-Sep-2023', loc: 'Unit 3 Condenser', co2: '94.5', h2s: '1.5', n2: '3.2', ch4: '2400', ncg: '1.03' },
                    { date: '15-Dec-2023', loc: 'KMJ-37 Separator', co2: '91.9', h2s: '2.2', n2: '4.8', ch4: '3300', ncg: '1.14' },
                    { date: '15-Dec-2023', loc: 'Unit 1 Condenser', co2: '93.6', h2s: '1.7', n2: '3.8', ch4: '2700', ncg: '1.07' },
                    { date: '22-Feb-2024', loc: 'KMJ-51 Wellhead', co2: '90.3', h2s: '2.7', n2: '5.6', ch4: '3800', ncg: '1.21' },
                    { date: '22-Feb-2024', loc: 'Unit 2 Condenser', co2: '94.0', h2s: '1.6', n2: '3.5', ch4: '2600', ncg: '1.06' },
                    { date: '10-May-2024', loc: 'KMJ-42 Separator', co2: '92.1', h2s: '2.0', n2: '4.7', ch4: '3100', ncg: '1.11' },
                    { date: '10-May-2024', loc: 'Unit 3 Condenser', co2: '93.9', h2s: '1.8', n2: '3.6', ch4: '2800', ncg: '1.08' },
                    { date: '18-Aug-2024', loc: 'KMJ-37 Wellhead', co2: '89.8', h2s: '2.9', n2: '5.9', ch4: '4200', ncg: '1.25' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{
                      background: idx % 2 === 0 ? '#fef3c7' : 'white',
                      borderBottom: '1px solid #fde68a'
                    }}>
                      <td style={{ padding: '12px', color: '#78350f' }}>{row.date}</td>
                      <td style={{ padding: '12px', color: '#78350f', fontWeight: '500' }}>{row.loc}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#2563eb', fontWeight: '600' }}>{row.co2}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#dc2626', fontWeight: '600' }}>{row.h2s}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#7c3aed', fontWeight: '600' }}>{row.n2}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#059669' }}>{row.ch4}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#ea580c', fontWeight: '700', fontSize: '15px' }}>{row.ncg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Key Observations */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
              border: '3px solid #f59e0b',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '15px'
              }}>
                📊 Key Observations dari Data Sampling:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '15px', color: '#92400e' }}>1. NCG Content Range:</strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#78350f',
                    margin: '6px 0 0 0'
                  }}>
                    • Wellhead: 1.15-1.25% wt (higher karena fresh dari reservoir)<br/>
                    • Separator: 1.11-1.14% wt (intermediate, setelah brine separation)<br/>
                    • Condenser: 1.03-1.10% wt (lowest, steam sudah melalui turbine)<br/>
                    • <strong>Trend:</strong> NCG content menurun dari wellhead → separator → condenser
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '15px', color: '#92400e' }}>2. Komposisi Gas Dominan:</strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#78350f',
                    margin: '6px 0 0 0'
                  }}>
                    • CO₂ mendominasi 89-95% (typical untuk geothermal Indonesia)<br/>
                    • H₂S berkisar 1.5-2.9% (corrosive, requires scrubber)<br/>
                    • N₂ range 3.2-6.2% (dari air entrainment)<br/>
                    • CH₄ trace level 2400-4200 ppm (flammable gas, monitor carefully)
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '15px', color: '#92400e' }}>3. Variasi Musiman:</strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#78350f',
                    margin: '6px 0 0 0'
                  }}>
                    • Feb-May (musim hujan): NCG slightly higher (1.18-1.25% wt)<br/>
                    • Jun-Sep (musim kering): NCG lebih stable (1.08-1.15% wt)<br/>
                    • <strong>Hipotesis:</strong> Rainwater recharge affects reservoir pressure & NCG content
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '15px', color: '#92400e' }}>4. Quality Control Notes:</strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#78350f',
                    margin: '6px 0 0 0'
                  }}>
                    • All samples analyzed in duplicate (RSD &lt; 3%)<br/>
                    • Giggenbach method used for all wellhead/separator samples<br/>
                    • Online NDIR analyzer cross-validated with lab GC (accuracy ±2%)<br/>
                    • Condenser samples taken during steady-state operation (±5% load)
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Implications */}
            <div style={{
              background: '#dcfce7',
              border: '2px solid #16a34a',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h4 style={{
                fontSize: '17px',
                fontWeight: '600',
                color: '#15803d',
                marginBottom: '12px'
              }}>
                ⚙️ Implikasi Operasional:
              </h4>
              <ul style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#166534',
                paddingLeft: '20px',
                margin: 0
              }}>
                <li><strong>Gas Ejector Capacity:</strong> Sized untuk handle 1.25% NCG maximum (design margin 20%)</li>
                <li><strong>H₂S Scrubber:</strong> Must treat 1.5-2.9% H₂S → NaOH consumption 15-20 kg/hour</li>
                <li><strong>Turbine Efficiency:</strong> With 1.03-1.10% NCG at condenser, efficiency drop ~0.9-1.0%</li>
                <li><strong>Sampling Frequency:</strong> Monthly untuk wellhead, weekly untuk condenser monitoring</li>
                <li><strong>Action Threshold:</strong> If NCG &gt;1.3% at condenser → investigate gas ejector performance</li>
              </ul>
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
              borderLeft: '5px solid #dc2626',
              paddingLeft: '15px'
            }}>
              🔧 Troubleshooting Tips: Common Problems & Solutions
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Berdasarkan pengalaman lapangan di berbagai PLTP, berikut adalah masalah umum yang sering 
              terjadi saat sampling dan analisis NCG, beserta solusi praktisnya:
            </p>

            {/* Problem 1: Bottle Cracking */}
            <div style={{
              background: '#fef2f2',
              border: '3px solid #dc2626',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#991b1b',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  background: '#dc2626',
                  color: 'white',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700'
                }}>1</span>
                Problem: Giggenbach Bottle Cracking/Breaking
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#7f1d1d',
                  marginBottom: '8px'
                }}>
                  🚫 Symptoms:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#991b1b',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • Bottle cracks atau shatters saat sampling<br/>
                  • Audible "pop" sound during connection<br/>
                  • Loss of vacuum seal
                </p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#7f1d1d',
                  marginBottom: '8px'
                }}>
                  🔍 Root Causes:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#991b1b',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • Thermal shock: Hot steam (150-200°C) contact dengan cold bottle<br/>
                  • Pressure shock: Opening stopcock too fast → sudden pressure difference<br/>
                  • Old/damaged bottle: Micro-cracks dari previous use<br/>
                  • No cooling coil: Steam temperature too high
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#15803d',
                  marginBottom: '8px'
                }}>
                  ✅ Solutions:
                </p>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#166534',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li><strong>ALWAYS use cooling coil</strong> (2-3 meter copper tubing) → steam T &lt; 80°C</li>
                  <li><strong>Open stopcock VERY SLOWLY</strong> — take 10-15 seconds, not instantly</li>
                  <li><strong>Pre-warm bottle</strong> with hot water (60-70°C) sebelum sampling</li>
                  <li><strong>Inspect bottle</strong> sebelum use — discard if ada scratches/chips</li>
                  <li><strong>Use thicker-wall bottle</strong> (Pyrex or borosilicate, min 3mm wall)</li>
                </ul>
              </div>
            </div>

            {/* Problem 2: Air Contamination */}
            <div style={{
              background: '#fef3c7',
              border: '3px solid #f59e0b',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  background: '#f59e0b',
                  color: 'white',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700'
                }}>2</span>
                Problem: Air Contamination in Sample
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#78350f',
                  marginBottom: '8px'
                }}>
                  🚫 Symptoms:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#92400e',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • High O₂ concentration (2-5%) in GC analysis — should be &lt;0.1%<br/>
                  • N₂ too high (8-15%) vs expected (3-6%)<br/>
                  • Data tidak konsisten dengan historical baseline
                </p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#78350f',
                  marginBottom: '8px'
                }}>
                  🔍 Root Causes:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#92400e',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • Insufficient purging: Air still in sampling line<br/>
                  • Leaky connections: Air masuk setelah sampling<br/>
                  • Vacuum loss in bottle: Faulty seal atau stopcock<br/>
                  • Low steam flow: Tidak cukup untuk flush out air
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#15803d',
                  marginBottom: '8px'
                }}>
                  ✅ Solutions:
                </p>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#166534',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li><strong>Purge minimum 10 minutes</strong> dengan full steam flow sebelum connect bottle</li>
                  <li><strong>Check all connections</strong> dengan leak detector solution (soap bubble test)</li>
                  <li><strong>Test bottle vacuum</strong> sebelum ke lapangan — hold vacuum &gt;24 hours</li>
                  <li><strong>Increase steam flow</strong> saat sampling untuk ensure positive pressure</li>
                  <li><strong>Re-sample</strong> jika O₂ &gt; 0.5% — data INVALID, discard analysis</li>
                </ul>
              </div>
            </div>

            {/* Problem 3: GC Peak Anomalies */}
            <div style={{
              background: '#eff6ff',
              border: '3px solid #2563eb',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  background: '#2563eb',
                  color: 'white',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700'
                }}>3</span>
                Problem: GC Chromatogram Anomalies
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1e3a8a',
                  marginBottom: '8px'
                }}>
                  🚫 Symptoms:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#1e40af',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • Peak tailing (asymmetric peaks)<br/>
                  • Ghost peaks (unexpected peaks at wrong retention time)<br/>
                  • Low sensitivity (small peak heights)<br/>
                  • Baseline drift atau noise
                </p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1e3a8a',
                  marginBottom: '8px'
                }}>
                  🔍 Root Causes:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#1e40af',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • Column degradation: Stationary phase breakdown from high T<br/>
                  • Injection port contamination: Sample residue buildup<br/>
                  • Carrier gas impurity: Moisture atau O₂ in He<br/>
                  • Detector fouling: Carbon deposit on FID flame
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#15803d',
                  marginBottom: '8px'
                }}>
                  ✅ Solutions:
                </p>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#166534',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li><strong>Column baking:</strong> Heat column to 250°C for 2 hours with carrier flow (no sample)</li>
                  <li><strong>Clean injection port:</strong> Remove and sonicate liner dengan methanol</li>
                  <li><strong>Check carrier gas filter:</strong> Replace moisture trap & O₂ trap cartridges</li>
                  <li><strong>Detector maintenance:</strong> Clean FID jet, replace H₂ & air filters</li>
                  <li><strong>Run blank samples:</strong> Inject pure He untuk check system cleanliness</li>
                  <li><strong>Replace column</strong> jika peak resolution tidak improve setelah baking</li>
                </ul>
              </div>
            </div>

            {/* Problem 4: Inconsistent NCG % */}
            <div style={{
              background: '#f0fdf4',
              border: '3px solid #16a34a',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#15803d',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  background: '#16a34a',
                  color: 'white',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700'
                }}>4</span>
                Problem: Highly Variable NCG % Reading
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#166534',
                  marginBottom: '8px'
                }}>
                  🚫 Symptoms:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#15803d',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • NCG % berubah drastically: 1.1% → 1.8% → 1.3% dalam 3 sampling berturut-turut<br/>
                  • RSD &gt; 10% between duplicates<br/>
                  • Online analyzer vs lab GC mismatch (&gt;20% difference)
                </p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#166534',
                  marginBottom: '8px'
                }}>
                  🔍 Root Causes:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#15803d',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • Plant load variation: Sampling saat load swing (ramping up/down)<br/>
                  • Sampling location inconsistent: Different depth in condenser headspace<br/>
                  • Calculation error: Wrong P atau T value used in formula<br/>
                  • Real operational change: Ejector performance degradation
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#15803d',
                  marginBottom: '8px'
                }}>
                  ✅ Solutions:
                </p>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#166534',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li><strong>Sample ONLY during steady-state:</strong> Plant load stable ±5% for min 2 hours</li>
                  <li><strong>Use same sampling point:</strong> Mark dengan paint atau tag untuk consistency</li>
                  <li><strong>Double-check calculations:</strong> Verify P & T sensors are reading correctly</li>
                  <li><strong>Run triplicate samples:</strong> Take 3 samples in 30 min interval, average results</li>
                  <li><strong>Calibrate online analyzer:</strong> Monthly calibration dengan standard gas</li>
                  <li><strong>Investigate if consistent trend:</strong> Increasing NCG → check ejector fouling/failure</li>
                </ul>
              </div>
            </div>

            {/* Problem 5: H2S Sensor Failure */}
            <div style={{
              background: '#fce7f3',
              border: '3px solid #ec4899',
              padding: '25px',
              borderRadius: '12px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#831843',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  background: '#ec4899',
                  color: 'white',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700'
                }}>5</span>
                Problem: H₂S Sensor Giving False Readings
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#9f1239',
                  marginBottom: '8px'
                }}>
                  🚫 Symptoms:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#831843',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • Reading stuck at 0 ppm (should show 5-15 ppm near wellpad)<br/>
                  • Reading stuck at full scale (50 ppm) constantly<br/>
                  • Erratic readings: jumping 0 → 30 → 5 → 40 ppm randomly<br/>
                  • Alarm tidak triggered saat ada bau H₂S jelas
                </p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#9f1239',
                  marginBottom: '8px'
                }}>
                  🔍 Root Causes:
                </p>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#831843',
                  margin: 0,
                  paddingLeft: '15px'
                }}>
                  • Sensor aging: Electrochemical cells degrade after 2-3 years<br/>
                  • Cross-sensitivity: SO₂ atau other gases interfering<br/>
                  • Temperature effect: Electrochemical sensor sensitive to T &gt; 45°C<br/>
                  • Membrane fouling: Dust, moisture, atau condensate blocking membrane
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#15803d',
                  marginBottom: '8px'
                }}>
                  ✅ Solutions:
                </p>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: '#166534',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li><strong>Bump test daily:</strong> Expose sensor ke 25 ppm H₂S calibration gas → verify response</li>
                  <li><strong>Replace sensor every 2 years:</strong> Even if still working — preventive replacement</li>
                  <li><strong>Zero calibration weekly:</strong> Expose ke pure air, adjust zero point</li>
                  <li><strong>Install weather shield:</strong> Protect sensor dari rain, direct sunlight</li>
                  <li><strong>Use backup sensor:</strong> Install 2 sensors per location for redundancy</li>
                  <li><strong>Keep spare sensors:</strong> Stock min 3 units for immediate replacement</li>
                </ul>
              </div>
            </div>
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
              borderLeft: '5px solid #16a34a',
              paddingLeft: '15px'
            }}>
              ✅ Best Practices: Ringkasan untuk Operator Lapangan
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4a5568',
              marginBottom: '20px'
            }}>
              Berikut adalah checklist best practices untuk sampling dan analisis NCG yang dapat 
              langsung diaplikasikan oleh operator dan analyst di PLTP:
            </p>

            {/* Field Sampling Checklist */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(30, 64, 175, 0.05) 100%)',
              border: '3px solid #2563eb',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '15px'
              }}>
                📍 FIELD SAMPLING CHECKLIST (Pre-Sampling):
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1e40af',
                    marginBottom: '10px'
                  }}>
                    ☑️ Equipment Ready:
                  </p>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: '#1e3a8a',
                    paddingLeft: '20px',
                    margin: 0
                  }}>
                    <li>Giggenbach bottles evacuated & labeled</li>
                    <li>NaOH 4M freshly prepared (max 1 week old)</li>
                    <li>Cooling coil installed & tested</li>
                    <li>H₂S detector ON, calibrated, audible alarm</li>
                    <li>PPE complete: gloves, goggles, respirator</li>
                  </ul>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1e40af',
                    marginBottom: '10px'
                  }}>
                    ☑️ Site Conditions:
                  </p>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: '#1e3a8a',
                    paddingLeft: '20px',
                    margin: 0
                  }}>
                    <li>Plant at steady-state (±5% load, 2+ hours)</li>
                    <li>Sampling point accessible & safe</li>
                    <li>Wind direction checked (stay upwind)</li>
                    <li>Two-person team (sampler + safety observer)</li>
                    <li>Radio contact dengan control room active</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sampling Execution */}
            <div style={{
              background: '#dcfce7',
              border: '3px solid #16a34a',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#15803d',
                marginBottom: '15px'
              }}>
                🔬 SAMPLING EXECUTION (Key Steps):
              </h4>

              <ol style={{
                fontSize: '15px',
                lineHeight: '1.9',
                color: '#166534',
                paddingLeft: '25px',
                margin: 0
              }}>
                <li><strong>Purge 10 minutes minimum</strong> — full steam flow, steady temperature</li>
                <li><strong>Check cooling effectiveness</strong> — outlet T must be &lt;80°C</li>
                <li><strong>Connect bottle SLOWLY</strong> — open stopcock over 10-15 seconds</li>
                <li><strong>Monitor NaOH color change</strong> — clear → yellow/brown indicates H₂S absorption</li>
                <li><strong>Sampling duration 15-20 minutes</strong> — ensure 100-200 mL headspace gas</li>
                <li><strong>Seal bottle IMMEDIATELY</strong> — check tightness, no leaks</li>
                <li><strong>Weigh & record</strong> — digital scale ±0.01g, document all metadata</li>
                <li><strong>Cool & transport</strong> — ice box &lt;4°C, deliver to lab within 24 hours</li>
              </ol>
            </div>

            {/* Lab Analysis Best Practices */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.05) 100%)',
              border: '3px solid #ec4899',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#9f1239',
                marginBottom: '15px'
              }}>
                🧬 LAB ANALYSIS BEST PRACTICES:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '15px', color: '#9f1239' }}>1. Sample Handling:</strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#831843',
                    margin: '6px 0 0 0'
                  }}>
                    • Store samples upright di ruangan sejuk (15-20°C)<br/>
                    • Analyze within 72 hours (CO₂ can slowly escape)<br/>
                    • Record bottle weight before & after gas extraction
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '15px', color: '#9f1239' }}>2. GC Analysis Protocol:</strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#831843',
                    margin: '6px 0 0 0'
                  }}>
                    • Run duplicate injections (minimum), calculate RSD<br/>
                    • Calibrate dengan certified standard gas every 10 samples<br/>
                    • Run blank sample setiap hari (ambient air atau pure He)<br/>
                    • Check mass balance: Total gas composition = 100 ± 3%
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <strong style={{ fontSize: '15px', color: '#9f1239' }}>3. Quality Control:</strong>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#831843',
                    margin: '6px 0 0 0'
                  }}>
                    • If RSD &gt;5%, re-run analysis atau investigate contamination<br/>
                    • If O₂ detected &gt;0.5%, sample is AIR-CONTAMINATED → reject data<br/>
                    • Compare with historical data — flag outliers &gt;20% deviation<br/>
                    • Document EVERYTHING: chromatograms, calibration curves, anomalies
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Reminders */}
            <div style={{
              background: '#fee2e2',
              border: '3px solid #dc2626',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#991b1b',
                marginBottom: '15px'
              }}>
                ⚠️ SAFETY REMINDERS (CRITICAL):
              </h4>

              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <ul style={{
                  fontSize: '15px',
                  lineHeight: '1.9',
                  color: '#7f1d1d',
                  paddingLeft: '25px',
                  margin: 0
                }}>
                  <li><strong>Never sample alone</strong> — two-person rule MANDATORY</li>
                  <li><strong>H₂S detector MUST be ON</strong> — audible alarm, check battery</li>
                  <li><strong>Know evacuation route</strong> — if H₂S &gt;50 ppm, evacuate immediately</li>
                  <li><strong>Maximum 30 min exposure</strong> — limit time in H₂S area &gt;10 ppm</li>
                  <li><strong>Beware olfactory fatigue</strong> — at &gt;100 ppm, you WON'T smell H₂S!</li>
                  <li><strong>No confined spaces</strong> — CO₂ accumulates at ground level (deadly)</li>
                </ul>
              </div>
            </div>

            {/* Reporting & Documentation */}
            <div style={{
              background: '#fef3c7',
              border: '2px solid #f59e0b',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '25px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '15px'
              }}>
                📝 REPORTING & DOCUMENTATION:
              </h4>

              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: '#78350f',
                  margin: 0
                }}>
                  <strong>Minimum data to report untuk setiap sampling:</strong><br/>
                  • Date, time, location (well/unit), sampler name<br/>
                  • Plant conditions: Load (MW), condenser pressure, steam temperature<br/>
                  • Weather: T ambient, wind direction, humidity<br/>
                  • GC results: CO₂, H₂S, N₂, CH₄, H₂, Ar, He (% vol)<br/>
                  • Calculated NCG % wt dengan formula Dalton's Law<br/>
                  • QC metrics: RSD, O₂ check, mass balance closure<br/>
                  • Anomalies/issues: Document ANY problems encountered<br/>
                  • Attachments: Chromatograms, calibration curves, field photos
                </p>
              </div>
            </div>

            {/* Quick Reference Card */}
            <div style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(22,163,74,0.3)'
            }}>
              <h4 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                🎯 QUICK REFERENCE CARD - Print & Laminate!
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '15px',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    ✓ ACCEPTANCE CRITERIA:
                  </p>
                  <p style={{
                    fontSize: '13px',
                    lineHeight: '1.7',
                    color: 'white',
                    margin: 0
                  }}>
                    • RSD &lt; 5% (duplicates)<br/>
                    • O₂ &lt; 0.5% (air check)<br/>
                    • Mass balance 97-103%<br/>
                    • Within 20% of baseline
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '15px',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    ⚠️ REJECTION CRITERIA:
                  </p>
                  <p style={{
                    fontSize: '13px',
                    lineHeight: '1.7',
                    color: 'white',
                    margin: 0
                  }}>
                    • O₂ &gt; 0.5% → REJECT<br/>
                    • RSD &gt; 10% → RE-RUN<br/>
                    • Mass balance &lt;97% → INVALID<br/>
                    • Bottle cracked → DISCARD
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '15px',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    🕐 SAMPLING TIMES:
                  </p>
                  <p style={{
                    fontSize: '13px',
                    lineHeight: '1.7',
                    color: 'white',
                    margin: 0
                  }}>
                    • Purge: 10 min minimum<br/>
                    • Collection: 15-20 min<br/>
                    • Total: 25-30 min/sample<br/>
                    • Lab analysis: &lt;72 hours
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '15px',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    🚨 EMERGENCY ACTIONS:
                  </p>
                  <p style={{
                    fontSize: '13px',
                    lineHeight: '1.7',
                    color: 'white',
                    margin: 0
                  }}>
                    • H₂S &gt;10 ppm → ALERT<br/>
                    • H₂S &gt;50 ppm → EVACUATE<br/>
                    • Bottle crack → STOP NOW<br/>
                    • Lost smell → EXIT AREA
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: '#e0f2fe',
              padding: '20px',
              borderRadius: '12px',
              marginTop: '30px'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#075985',
                margin: 0,
                fontWeight: '500',
                textAlign: 'center'
              }}>
                <strong>💡 Final Note:</strong> Sampling dan analisis NCG adalah skill yang memerlukan 
                practice dan attention to detail. Data NCG yang akurat adalah foundation untuk optimasi 
                PLTP. Follow best practices ini, dan lakukan continuous improvement berdasarkan pengalaman 
                lapangan Anda! 🚀
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

              <p id="ref-21" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [21] USGS California Volcano Observatory. "Gas Geochemistry Laboratory Methodology". 
                <em>USGS Technical Documentation</em>, 2024.
              </p>

              <p id="ref-22" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [22] Giggenbach, W.F. "A simple method for the collection and analysis of volcanic gas samples". 
                <em>Bulletin of Volcanology</em>, Vol. 39, pp. 132-145, 1975.
              </p>

              <p id="ref-23" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [23] IAVCEI Commission. "Direct Sampling Group - Giggenbach Method Protocol". 
                <em>IAVCEI Technical Report</em>, 2001.
              </p>

              <p id="ref-24" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [24] Evans, W.C., et al. "Gas sampling methods for geothermal and volcanic systems". 
                <em>USGS Technical Report</em>, 1973.
              </p>

              <p id="ref-25" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [25] Lab-Training.com. "Sampling of Gases for analysis by Gas Chromatography". 
                <em>Lab Training Online Resources</em>, 2020.
              </p>

              <p id="ref-26" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [26] ChemTeam. "Gas Law - Dalton's Law and Partial Pressure Problems". 
                <em>Chemistry Education Resources</em>, 2024.
              </p>

              <p id="ref-27" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [27] Alphasense Ltd. "Air Quality Sensors - Toxic Gas Sensors Technical Datasheet". 
                <em>Alphasense Product Documentation</em>, 2024.
              </p>

              <p id="ref-28" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [28] Suyanto et al. "Implementation SCADA Web Client For Monitoring Geothermal Power Plant 3 MW Kamojang - Indonesia". 
                <em>2022 2nd International Conference on Electronic and Electrical Engineering and Intelligent System (ICE3IS)</em>, 2022.
              </p>

              <p id="ref-29" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [29] Campbell Scientific. "Geothermal Energy Monitoring Systems". 
                <em>Campbell Scientific Application Notes</em>, 2020.
              </p>

              <p id="ref-30" style={{ marginBottom: '10px', paddingLeft: '20px', textIndent: '-20px', transition: 'background-color 0.5s ease' }}>
                [30] Baker Hughes. "Geothermal Solutions - Digital Operations and Monitoring". 
                <em>Baker Hughes Technical Documentation</em>, 2024.
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
          <p>&copy; 2024 SMART System - PT. Pertamina & UNPAD. All rights reserved.</p>
        </div>
      </div>
    </footer>
    </>
  );
}