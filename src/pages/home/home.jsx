import React, { useState, useRef, useEffect } from 'react';
import pertaminaLogo from '../../assets/images/pertamina1x1.svg';
import unpadLogo from '../../assets/images/Logo-Unpad.svg';
import pertasmartLogo from '../../assets/images/Pertasmart4x1.svg';
import heroImage from '../../assets/images/landing_page_image.jpg';
import engineerImage from '../../assets/images/landing_page_image_2.png';
import tdsImage from '../../assets/images/tds.png';
import drynessImage from '../../assets/images/dryness.png';
import ncgImage from '../../assets/images/ncg.png';
import SC4500 from '../../assets/images/SC4500.png';
import sampelncg from '../../assets/images/sampelncg.png';
import DrynessFraction from '../../assets/images/DrynessFraction.jpg';
import CARAPLTP from '../../assets/images/PLTPKMJ.jpg';
import IndonesiaMAP from '../../assets/images/Indonesiaku.png';
import PTPGE from '../../assets/images/LOGOPGE.png';
import LogoPertamina from '../../assets/images/LOGOPertamina.png';
import Hach from '../../assets/images/LOGOHach.png';
import Honeywell from '../../assets/images/LOGOHW.png';
import indonesiaMap from '../../assets/images/indonesia-map.png';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { generateLiveUnitData } from '../../data/simulasi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Home = () => {
  const [activeUnit, setActiveUnit] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, side: 'right' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [liveUnitData, setLiveUnitData] = useState(generateLiveUnitData());
  const popupRef = useRef(null);
  const mapRef = useRef(null);

  // Live data update every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUnitData(generateLiveUnitData());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside popup and not on a pin
      if (
        activeUnit &&
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !event.target.closest('.map-pin')
      ) {
        setActiveUnit(null);
      }
    };

    if (activeUnit) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeUnit]);
  
  const units = {
    kamojang: {
      name: 'Kamojang',
      location: 'Jawa Barat',
      dryness: liveUnitData.kamojang.dryness,
      tds: liveUnitData.kamojang.tds,
      ncg: liveUnitData.kamojang.ncg,
      pressure: liveUnitData.kamojang.pressure,
      temp: liveUnitData.kamojang.temp,
      power: liveUnitData.kamojang.power
    },
    ulubelu: {
      name: 'Ulubelu',
      location: 'Lampung',
      dryness: liveUnitData.ulubelu.dryness,
      tds: liveUnitData.ulubelu.tds,
      ncg: liveUnitData.ulubelu.ncg,
      pressure: liveUnitData.ulubelu.pressure,
      temp: liveUnitData.ulubelu.temp,
      power: liveUnitData.ulubelu.power
    }
  };

  // Custom pin icon
  const customIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="40" height="40">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  // Koordinat lokasi
  const locations = {
    kamojang: {
      position: [-7.1485, 107.7947], // Kamojang, Jawa Barat
      name: 'Kamojang Unit 5',
      location: 'Jawa Barat'
    },
    ulubelu: {
      position: [-5.0833, 104.5833], // Ulubelu, Lampung  
      name: 'Ulubelu Unit 3',
      location: 'Lampung'
    }
  };

  // Calculate popup position dynamically
  const handlePinClick = (unit, event) => {
    const pin = event.currentTarget;
    const mapContainer = mapRef.current;
    
    if (!mapContainer) return;
    
    const pinRect = pin.getBoundingClientRect();
    const mapRect = mapContainer.getBoundingClientRect();
    
    const popupWidth = 420;
    const popupHeight = 500;
    const offset = 20;
    
    // Calculate relative position to map container
    let top = pinRect.top - mapRect.top;
    let left = pinRect.right - mapRect.left + offset;
    let side = 'right';
    
    // Check if popup fits on the right
    if (left + popupWidth > mapRect.width) {
      // Try left side
      left = pinRect.left - mapRect.left - popupWidth - offset;
      side = 'left';
      
      // If still doesn't fit on left, center it
      if (left < 0) {
        left = Math.max(20, (mapRect.width - popupWidth) / 2);
        side = 'center';
      }
    }
    
    // Adjust vertical position
    if (top + popupHeight > mapRect.height) {
      top = Math.max(20, mapRect.height - popupHeight - 20);
    }
    if (top < 20) top = 20;
    
    setPopupPosition({ top, left, side });
    setActiveUnit(unit);
  };

  return (
    <div className={`home ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Hamburger Menu */}
      <div 
        className="hamburger-menu"
        onMouseEnter={() => setIsSidebarOpen(true)}
      >
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </div>

      {/* Sidebar Navigation */}
      <div 
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="sidebar-content">
          <a href="#home" className="sidebar-link">Home</a>
          <a href="#about" className="sidebar-link">Misi Kami</a>
          <a href="#services" className="sidebar-link">Layanan Kami</a>
          <a href="/unit-pemantauan" className="sidebar-link">Unit Pemantauan</a>
          <a href="#quality" className="sidebar-link">Kualitas Uap</a>
          <a href="#pltp-works" className="sidebar-link">Cara Kerja PLTP</a>
          <a href="#sampling" className="sidebar-link">Teknik Pengambilan Sampel</a>
          <a href="#ai-monitoring" className="sidebar-link">Sistem Monitoring & Analisis AI</a>
          <a href="#collaboration" className="sidebar-link">Kolaborasi & Kerja Sama</a>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="header">
        <div className="header-container">
          <div className="header-logos">
            <img src={pertasmartLogo} alt="Pertasmart" className="header-logo" />
          </div>
          <nav className="nav">
            <a href="#home" className="nav-link">Home</a>
            
            <div className="nav-dropdown">
              <button className="nav-link dropdown-btn">
                Lokasi
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className="dropdown-content">
                <a href="/login">Kamojang Unit 5</a>
                <a href="#">Ulubelu Unit 3</a>
              </div>
            </div>
            
            <a href="/unit-pemantauan" className="nav-link">Steam Monitoring</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="brand-logos">
            <img src={pertaminaLogo} alt="Pertamina" className="brand-logo" />
            <img src={unpadLogo} alt="UNPAD" className="brand-logo" />
          </div>
          
          <h1 className="hero-title">
            Pengembangan Online Steam Quality - Purity<br />
            <span className="hero-highlight">Monitoring Smart System</span> di Lapangan<br />
            Geothermal
          </h1>
          
          <div className="hero-content-wrapper">
            <p className="hero-text">
              Pengembangan Steam Quality dan Purity Monitoring Smart System di lapangan geotermal merupakan kegiatan riset kolaboratif antara PT Pertamina dan Universitas Padjadjaran untuk meningkatkan keandalan operasi PLTP.  Salah satu faktor penting dalam menjaga performa PLTP adalah memastikan kualitas dan kemurnian uap yang masuk ke turbin tetap berada dalam batas aman. 
            <br /><br />
              Saat ini pemantauan kualitas dan kemurnian uap di PLTP masih dilakukan melalui pengambilan sampel mingguan secara manual, yang kemudian dianalisis di laboratorium untuk mengetahui kandungan pengotor dalam uap. Metode ini membutuhkan waktu dan tidak menyediakan data secara real-time,  potensi adanya pengotor pada uap baru diketahui setelah hasil analisa di laboratorium yang membutuhkan waktu.  Selain itu,  Pola kemunculan pengotor tidak diketahui dengan metode sampling manual.
            </p>
            <p className="hero-text">
              Dengan menerapkan sistem pemantauan kualitas dan kemurnian uap secara langsung real-time, pola pengotor uap dapat dipantau setiap saat, termasuk siklus munculnya pengotor. Informasi ini memungkinkan tindakan pencegahan dini untuk melindungi peralatan turbin. Sistem real-time juga mengurangi biaya operasional serta mempermudah proses analisis dan pengambilan keputusan di lapangan.
            <br /><br />
            Sistem yang dikembangkan juga dilengkapi dengan analisis berbasis artificial intelligence (AI). Setiap parameter yang dipantau diproses lebih lanjut untuk mendeteksi anomali, mengidentifikasi tren, serta menghasilkan prediksi kondisi operasional. Kemampuan ini memungkinkan penerapan perawatan prediktif yang dapat mencegah potensi kerusakan pada sistem PLTP, sehingga risiko gangguan operasi dan kerugian yang lebih besar dapat dihindari.
            </p>
          </div>

          <div className="hero-image-container">
            <img 
              src={heroImage} 
              alt="PLTP Geothermal Facility" 
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="about" className="mission-section">
        <div className="container">
          <h2 className="section-title">
            Misi Kami Berakar pada Inovasi
          </h2>
          <p className="section-intro">
            Kami hadir untuk mengembangkan inovasi dalam industri energi panas bumi melalui 
            teknologi monitoring yang canggih dan berkelanjutan. Dengan sistem SMART (System 
            Monitoring Analysis Real Time) yang didukung kecerdasan buatan (AI), kami mampu 
            memprediksi potensi anomali dan mengoptimalkan kinerja sistem secara proaktif. 
            Berkolaborasi dengan institusi pendidikan terkemuka, kami menciptakan solusi yang 
            dapat dipantau kapan saja dan dari mana saja, memberikan kendali penuh kepada 
            operator untuk memastikan efisiensi maksimal dan keberlanjutan lingkungan untuk 
            masa depan energi Indonesia.
          </p>

          <div className="mission-grid">
            <div className="mission-cards">
              <div className="mission-card">
                <div className="mission-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                    <path d="M9 18h6"></path>
                    <path d="M10 22h4"></path>
                  </svg>
                </div>
                <h3 className="mission-card-title">
                  Meningkatkan Efisiensi Geothermal
                </h3>
                <p className="mission-card-text">
                  Dengan monitoring real-time terhadap kualitas uap, kami membantu 
                  mengoptimalkan performa turbin dan mengurangi downtime operasional, 
                  sehingga produktivitas PLTP meningkat secara signifikan.
                </p>
              </div>

              <div className="mission-card">
                <div className="mission-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="mission-card-title">
                  Kolaborasi untuk Inovasi Energi
                </h3>
                <p className="mission-card-text">
                  Sinergi antara industri dan akademisi menghasilkan riset dan 
                  pengembangan teknologi yang aplikatif, menjawab tantangan energi 
                  terbarukan dengan solusi yang inovatif dan berkelanjutan.
                </p>
              </div>
            </div>

            <div className="engineer-image-container">
              <img 
                src={engineerImage} 
                alt="Pertamina Engineer" 
                className="engineer-image"
              />
            </div>
            <div className="mission-button-container">
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="services-intro-grid">
            <div>
              <h2 className="section-title">Layanan Kami</h2>
            </div>
            <div>
              <p className="section-intro">
                Sebagai bagian dari komitmen terhadap inovasi dan efisiensi energi panas bumi, kami menghadirkan berbagai layanan berbasis teknologi cerdas yang mendukung pemantauan, analisis, dan optimalisasi sistem geotermal. Melalui kolaborasi riset antara PT Pertamina dan Universitas Padjadjaran, setiap layanan kami dirancang untuk meningkatkan keandalan operasional serta mendorong transformasi menuju energi bersih yang berkelanjutan.
              </p>
            </div>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className="service-title">
                Memantau Kualitas Uap Real-Time
              </h3>
              <p className="service-text">
                Sistem monitoring yang memberikan data akurat setiap saat untuk 
                memastikan kualitas uap yang masuk ke turbin selalu dalam kondisi optimal.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3 className="service-title">
                Analisis Data Berbasis AI
              </h3>
              <p className="service-text">
                Platform AI yang mengintegrasikan sensor IoT dan 
                machine learning untuk analisis prediktif, deteksi 
                anomali otomatis, dan pengambilan keputusan yang 
                lebih cerdas dan akurat.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
                </svg>
              </div>
              <h3 className="service-title">
                Optimisasi Kinerja Turbin
              </h3>
              <p className="service-text">
                Membantu meningkatkan efisiensi turbin dengan monitoring parameter 
                kritis yang mempengaruhi performa dan umur peralatan.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"></path>
                </svg>
              </div>
              <h3 className="service-title">
                Solusi Digital Berkelanjutan
              </h3>
              <p className="service-text">
                Transformasi digital PLTP melalui ekosistem IoT 
                yang menghadirkan industri 5.0, di mana teknologi 
                pintar, big data, dan human-centered innovation 
                bersinergi untuk operasional yang lebih efisien.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="service-title">
                Kolaborasi Riset dan Inovasi
              </h3>
              <p className="service-text">
                Kerjasama antara industri dan akademisi dalam mengembangkan 
                teknologi baru untuk meningkatkan efisiensi energi geothermal.
              </p>
            </div>
          </div>
        </div>
      </section>

 {/* How Geothermal Power Plants Work Section */}
 <section id="pltp-works" className="pltp-works-section">
  <div className="container">
    <div className="pltp-works-intro-grid">
      <div>
        <h2 className="section-title">Cara Kerja PLTP</h2>
        
        {/* GAMBAR PINDAH KE SINI - DI BAWAH JUDUL */}
        <div className="pltp-works-image-container">
          <img 
            src={CARAPLTP} 
            alt="Cara Kerja PLTP" 
            className="pltp-works-image"
          />
        </div>
      </div>
      
      <div>
        <p className="section-intro">
          Pembangkit Listrik Tenaga Panas Bumi (PLTP) memanfaatkan panas dari dalam bumi untuk menghasilkan listrik. Panas tersebut mengubah air bawah tanah menjadi uap bertekanan tinggi yang dialirkan ke permukaan untuk memutar turbin. Turbin yang berputar menggerakkan generator sehingga menghasilkan energi listrik. Uap sisa kemudian didinginkan dan airnya dikembalikan ke dalam bumi agar proses dapat berlangsung secara berkelanjutan.
        </p>
        <a href="/cara-kerja-pltp" className="btn-pltp-guide">
          Selengkapnya
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</section>

      {/* Steam Quality Section */}
      <section id="quality" className="quality-section">
        <div className="container">
          <div className="quality-intro-grid">
            <div>
              <h2 className="section-title">
                Pentingnya Memantau Kualitas Uap yang Masuk Turbin
              </h2>
            </div>
            <div>
              <p className="section-intro">
                Kualitas dan kemurnian uap yang masuk ke turbin memiliki peran penting dalam menjaga efisiensi serta umur peralatan pembangkit. Uap yang mengandung kotoran atau kadar air berlebih dapat menurunkan performa turbin, menyebabkan korosi, dan meningkatkan biaya perawatan. Melalui sistem pemantauan kualitas uap secara real-time, potensi gangguan tersebut dapat diminimalkan, sehingga kinerja pembangkit tetap optimal dan berkelanjutan.
              </p>
            </div>
          </div>

          <div className="quality-cards">
            <div className="quality-card">
              <div className="quality-image-container">
                <img 
                  src={tdsImage} 
                  alt="TDS - Total Dissolved Solid" 
                  className="quality-image"
                />
              </div>
              <div className="quality-content">
                <h3 className="quality-title">
                  TDS (Total Dissolved Solid)
                </h3>
                <p className="quality-description">
                  TDS adalah perbandingan banyaknya zat padat dalam larutan/uap/cairan yang dinyatakan dalam persentase. TDS tinggi bisa menyebabkan carryover (terikutnya zat padat atau cairan dalam uap).
                </p>
                <a href="/artikel-tds" className="btn-quality-read-more">
                Selengkapnya
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="quality-card">
              <div className="quality-image-container">
                <img
                  src={drynessImage}
                  alt="Dryness Fraction"
                  className="quality-image"
                />
              </div>
              <div className="quality-content">
                <h3 className="quality-title">
                  Dryness Fraction
                </h3>
                <p className="quality-description">
                  Dryness fraction adalah tingkat kadar air dalam uap yang dinyatakan dalam persentase. Banyaknya air dalam uap dapat menyebabkan korosi pada turbin
                </p>
                <a href="/artikel-dryness" className="btn-quality-read-more">
                  Selengkapnya
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="quality-card">
              <div className="quality-image-container">
                <img
                  src={ncgImage}
                  alt="NCG - Non Condensed Gas"
                  className="quality-image"
                />
              </div>
              <div className="quality-content">
                <h3 className="quality-title">
                  NCG (Non Condensed Gas)
                </h3>
                <p className="quality-description">
                  NCG adalah gas yang tidak dapat dikondensasikan yang dinyatakan dalam persen. Contoh: CO₂, H₂S, dan gas lainnya.
                </p>
                <a href="/artikel-ncg" className="btn-quality-read-more">
                Selengkapnya
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sampling Techniques Section */}
      <section id="sampling" className="sampling-section">
        <div className="container">
          <div className="sampling-intro-grid">
            <div>
              <h2 className="section-title">
                Teknik Pengambilan Sampel
              </h2>
            </div>
            <div>
              <p className="section-intro">
                Kualitas dan kemurnian uap yang masuk ke turbin memiliki peran penting dalam menjaga efisiensi serta umur peralatan pembangkit. Uap yang mengandung kotoran atau kadar air berlebih dapat menurunkan performa turbin, menyebabkan korosi, dan meningkatkan biaya perawatan. Melalui sistem pemantauan kualitas uap secara real-time, potensi gangguan tersebut dapat diminimalkan, sehingga kinerja pembangkit tetap optimal dan berkelanjutan.
              </p>
            </div>
          </div>

          <div className="sampling-cards">
            <div className="sampling-card">
              <div className="sampling-image-container">
                <img 
                  src={SC4500} 
                  alt="TDS - Total Dissolved Solid" 
                  className="sampling-image"
                />
              </div>
              <div className="sampling-content">
                <h3 className="sampling-title">
                  Sampling TDS<br />(Total Dissolved Solid)
                </h3>
                <p className="sampling-description">
                Proses pengambilan sampel TDS menggunakan perangkat SC4500 untuk mengukur kadar Total Dissolved Solid dalam uap secara akurat. Data sampel ini menjadi input penting untuk sistem monitoring dan validasi prediksi AI.
                </p>
                <a href="/artikel-SamplingTDS" className="btn-sampling-read-more">
                Selengkapnya
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="sampling-card">
              <div className="sampling-image-container">
                <img
                  src={DrynessFraction}
                  alt="Dryness Fraction"
                  className="sampling-image"
                />
              </div>
              <div className="sampling-content">
                <h3 className="sampling-title">
                  Sampling Dryness Fraction
                </h3>
                <p className="sampling-description">
                  Dryness fraction adalah tingkat kadar air dalam uap yang dinyatakan dalam persentase. Banyaknya air dalam uap dapat menyebabkan korosi pada turbin
                </p>
                <a href="/artikel-Samplingdryness" className="btn-sampling-read-more">
                  Selengkapnya
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="sampling-card">
              <div className="sampling-image-container">
                <img
                  src={sampelncg}
                  alt="NCG - Non Condensed Gas"
                  className="sampling-image"
                />
              </div>
              <div className="sampling-content">
                <h3 className="sampling-title">
                  Sampling NCG<br />(Non Condensed Gas)
                </h3>
                <p className="sampling-description">
                  NCG adalah gas yang tidak dapat dikondensasikan yang dinyatakan dalam persen. Contoh: CO₂, H₂S, dan gas lainnya.
                </p>
                <a href="/artikel-Samplingncg" className="btn-sampling-read-more">
                Selengkapnya
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Monitoring Section */}
      <section id="ai-monitoring" className="ai-section">
        <div className="container">
          <div className="ai-intro-grid">
            <div>
              <h2 className="section-title">
                Sistem Monitoring & Analisis AI
              </h2>
            </div>
            <div>
              <p className="section-intro">
                Sistem pemantauan kami didukung oleh teknologi kecerdasan buatan yang mampu menganalisis data secara real-time dan memberikan prediksi akurat. Melalui integrasi AI, sistem dapat mendeteksi potensi anomali operasional, memprediksi kondisi turbin, serta memperkirakan parameter kualitas uap seperti dryness fraction dan NCG tanpa pengambilan sampel langsung. Teknologi ini memungkinkan tindakan preventif lebih cepat dan efisien.
              </p>
            </div>
          </div>

          <div className="ai-cards">
            <div className="ai-card">
              <div className="ai-image-container">
                <img
                  src={drynessImage}
                  alt="AI1 Anomaly Detection"
                  className="ai-image"
                />
              </div>
              <div className="ai-content">
                <h3 className="ai-title">
                  AI1 - Prediksi Anomali & Status Turbin
                </h3>
                <p className="ai-description">
                  Sistem AI1 menganalisis 12 parameter operasional secara real-time untuk mendeteksi anomali dan memprediksi risiko kerusakan turbin. AI memberikan status kondisi (Low/Medium/High) dan peringatan dini untuk tindakan preventif.
                </p>
                <a href="/artikel-AI1" className="btn-ai-read-more">
                Selengkapnya
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="ai-card">
              <div className="ai-image-container">
                <img
                  src={ncgImage}
                  alt="AI2 Virtual Sensor"
                  className="ai-image"
                />
              </div>
              <div className="ai-content">
                <h3 className="ai-title">
                  AI2 - Virtual Sensor Dryness & NCG
                </h3>
                <p className="ai-description">
                  AI2 berfungsi sebagai virtual sensor yang memprediksi nilai dryness fraction dan NCG content tanpa pengambilan sampel langsung. Teknologi ini mengurangi biaya operasional sambil tetap menjaga akurasi monitoring.
                </p>
                <a href="/artikel-AI2" className="btn-ai-read-more">
                Selengkapnya
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section id="collaboration" className="collaboration-section">
        <div className="container">
          <div className="collaboration-header">
            <span className="collaboration-badge">KOLABORASI RISET, AKADEMIK, DAN INDUSTRI</span>
            <h2 className="section-title">KOLABORASI & KERJA SAMA</h2>
          </div>

          <div className="collaboration-content">
            <div className="collaboration-text">
              <p className="section-intro">
                PertaSmart secara aktif menjalin kerja sama strategis dengan mitra industri energi dan teknologi terkemuka,
                antara lain PT Pertamina (Persero), PT Pertamina Geothermal Energy Tbk, Hach, dan Honeywell.
                Kolaborasi ini berfokus pada penyediaan dan implementasi Sistem Online Monitoring & Analysis untuk pemantauan Kualitas Uap, 
                Dryness Fraction, Total Dissolved Solids (TDS), serta deteksi anomali berbasis Artificial Intelligence (AI).
                Sistem pemantauan ini telah diterapkan pada PLTP Kamojang dan PLTP Ulubelu, mendukung peningkatan keandalan operasi, efisiensi pembangkitan, serta pengambilan keputusan berbasis data secara real-time.
                Melalui sinergi lintas disiplin dan pemanfaatan teknologi mutakhir, PertaSmart berkomitmen menghadirkan solusi yang presisi, 
                terukur, dan berstandar industri untuk mendukung keberlanjutan sektor pemantauan panas bumi nasional.
              </p>
            </div>

            <div className="collaboration-map">
              <img 
                src={IndonesiaMAP} 
                alt="Global Collaboration Map" 
                className="map-image"
              />
            </div>
          </div>

          <div className="partners-grid">
            <div className="partner-card">
              <div className="partner-logo-container">
                <img 
                  src={LogoPertamina}
                  alt="Pertamina" 
                  className="partner-logo"
                />
              </div>
              <h3 className="partner-name">PT. Pertamina</h3>
            </div>

            <div className="partner-card">
              <div className="partner-logo-container">
                <img 
                  src={PTPGE} 
                  alt="Pertamina Geothermal Energy" 
                  className="partner-logo"
                />
              </div>
              <h3 className="partner-name">PT. Pertamina Geothermal Energy</h3>
            </div>

            <div className="partner-card">
              <div className="partner-logo-container">
                <img 
                  src={Hach} 
                  alt="HACH" 
                  className="partner-logo"
                />
              </div>
              <h3 className="partner-name">Hach</h3>
            </div>

            <div className="partner-card">
              <div className="partner-logo-container">
                <img 
                  src={Honeywell}
                  alt="Honeywell" 
                  className="partner-logo"
                />
              </div>
              <h3 className="partner-name">Honeywell</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logos">
                <img src={pertasmartLogo} alt="Pertasmart" className="header-logo" />
              </div>
              <p className="footer-text">
                Kolaborasi PT. Pertamina dan Universitas Padjadjaran dalam 
                mengembangkan teknologi monitoring steam quality untuk PLTP.
              </p>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Navigasi</h4>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#monitoring">Monitoring</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Lokasi PLTP</h4>
              <ul className="footer-links">
                <li>Kamojang, Jawa Barat</li>
                <li>Ulubelu, Lampung</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Kontak</h4>
              <ul className="footer-links">
                <li>PT. Pertamina Geothermal Energy</li>
                <li>Universitas Padjadjaran</li>
                <li>Email: info@pertasmart.com</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 SMART System - PT. Pertamina & UNPAD. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .home {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background-color: #ffffff;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Header */
        .header {
          background-color: #1a2642;
          color: white;
          padding: 16px 0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-logos {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-logo {
          height: 48px;
          width: auto;
          filter: brightness(0) invert(1);
        }

        /* Hamburger Menu */
        .hamburger-menu {
          position: fixed;
          top: 24px;
          left: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          z-index: 1001;
          padding: 8px;
          border-radius: 8px;
          background: rgba(26, 38, 66, 0.8);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .hamburger-menu:hover {
          background: rgba(37, 99, 235, 0.9);
        }

        .hamburger-line {
          width: 24px;
          height: 3px;
          background: white;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          left: -280px;
          width: 280px;
          height: 100vh;
          background: rgba(26, 38, 66, 0.98);
          backdrop-filter: blur(20px);
          z-index: 1000;
          transition: left 0.3s ease;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
          overflow-y: auto;
        }

        .sidebar.open {
          left: 0;
        }

        .sidebar-content {
          padding: 80px 24px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-link {
          color: white;
          text-decoration: none;
          padding: 16px 20px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          display: block;
        }

        .sidebar-link:hover {
          background: rgba(37, 99, 235, 0.2);
          color: #2563eb;
          transform: translateX(8px);
        }

        /* Dropdown Lokasi */
        .nav-dropdown {
          position: relative;
        }

        .dropdown-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 400;
          font-size: 1rem;
          font-family: inherit;
          color: white;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: #1a2642;
          min-width: 180px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-top: 0;
          padding-top: 8px;
          z-index: 1;
        }

        .nav-dropdown:hover .dropdown-content {
          display: block;
        }

        .dropdown-content a {
          color: white;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
          transition: all 0.3s ease;
        }

        .dropdown-content a:hover {
          background: #2563eb;
          color: white;
        }

        .dropdown-content a:first-child {
          border-radius: 8px 8px 0 0;
        }

        .dropdown-content a:last-child {
          border-radius: 0 0 8px 8px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 48px;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 400;
          font-size: 1rem;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
        }

        .nav-link:hover {
          color: #f7941d;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
          padding: 64px 0;
        }

        .brand-logos {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .brand-logo {
          height: 50px;
          width: auto;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .hero-highlight {
          color: #2563eb;
        }

        .hero-content-wrapper {
          margin-top: 48px;
          margin-left: auto;
          margin-right: 0;
          max-width: 1100px;
          padding-left: 100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .hero-text {
          color: #495057;
          line-height: 1.8;
          margin-bottom: 24px;
        }

        .hero-image-container {
          margin-top: 68px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .hero-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          object-position: bottom;
        }

        /* Mission Section */
        .mission-section {
          padding: 80px 0;
          background: rgba(184, 184, 184, 0.15);
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 24px;
        }

        .section-intro {
          font-size: 1.125rem;
          color: #495057;
          line-height: 1.8;
          margin-bottom: 48px;
          max-width: 900px;
          text-align: justify
        }

        .mission-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: stretch;
        }

        .mission-cards {
          display: contents;
        }

        .mission-card {
          background: transparent;
          padding: 24px;
          transition: all 0.3s ease;
          min-height: 320px;
          display: flex;
          flex-direction: column;
        }

        .mission-icon {
          background: #2563eb;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          color: white;
        }

        .mission-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .mission-card-text {
          font-size: 0.875rem;
          color: #495057;
          line-height: 1.6;
        }

        .engineer-image-container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          min-height: 320px;
          height: 100%;
        }

        .engineer-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 160% center; 
          transform: scale(1.5); 
        }

        .mission-button-container {
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
        }

        .btn-read-more {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 6px 16px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.3s ease;
          white-space: nowrap;
          text-decoration: none;
        }

        .btn-read-more:hover {
          background: #2563eb;
          color: white;
        }

        .btn-read-more svg {
          transition: transform 0.3s ease;
        }

        .btn-read-more:hover svg {
          transform: translateX(4px);
        }

        /* Services Section */
        .services-section {
          padding: 80px 0;
          background: ##ffffff;
        }
        
        .services-intro-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 48px;
          margin-bottom: 48px;
          align-items: start;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 32px;
        }

        .services-intro-grid .section-title {
          margin-top: 0;
          font-size: 2.5rem;
          line-height: 1.2;
        }

        .services-intro-grid .section-intro {
          font-size: 1rem;
          margin-top: 0;
        }
          
        .services-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 32px;
          margin-top: 64px;
        }

        .service-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          width: calc(33.333% - 22px);
          max-width: 380px;
          min-width: 300px;
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }

        .service-card:hover .service-title,
        .service-card:hover .service-text {
          color: white;
        }

        .service-card:hover .service-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .service-icon {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: white;
          transition: transform 0.3s ease;
        }

        .service-card:hover .service-icon {
          transform: scale(1.1);
        }

        .service-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .service-text {
          font-size: 0.9375rem;
          color: #495057;
          line-height: 1.6;
        }

        /* Quality Section */
        .quality-section {
          padding: 80px 0;
          background: linear-gradient(to bottom, #ffffff, #ffffff);
        }

        .quality-intro-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 48px;
          margin-bottom: 48px;
          align-items: start;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 32px;
        }

        .quality-intro-grid .section-title {
          margin-top: 0;
          font-size: 2.5rem;
          line-height: 1.2;
        }

        .quality-intro-grid .section-intro {
          font-size: 1rem;
          margin-top: 0;
        }

        .quality-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 64px;
          text-align: justify
        }

        .quality-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .quality-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
        }

        .quality-image-container {
          height: 320px;
          overflow: hidden;
        }

        .quality-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .quality-card:hover .quality-image {
          transform: scale(1.1);
        }

        .quality-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .quality-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 15px;
          min-height: 70px
        }

        .quality-description {
          font-size: 0.9375rem;
          color: #495057;
          line-height: 1.6;
          margin-bottom: 16px;
          flex: 1;
        }

        .btn-quality-read-more {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 6px 16px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.3s ease;
          margin-top: auto;
          align-self: flex-start;
          white-space: nowrap;
          text-decoration: none;
        }

        .btn-quality-read-more:hover {
          background: #2563eb;
          color: white;
        }

        .btn-quality-read-more svg {
          transition: transform 0.3s ease;
        }

        .btn-quality-read-more:hover svg {
          transform: translateX(4px);
        }

       /* Sampling Section */
      .sampling-section {
        padding: 80px 0;
        background: #f8f9fa;
      }

      .sampling-intro-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 48px;
        margin-bottom: 48px;
        align-items: start;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 32px;
      }

      .sampling-intro-grid .section-title {
        margin-top: 0;
        font-size: 2.5rem;
        line-height: 1.2;
      }

      .sampling-intro-grid .section-intro {
        font-size: 1rem;
        margin-top: 0;
      }

      .sampling-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
        margin-top: 64px;
        text-align: justify;
      }

      .sampling-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
      }

      .sampling-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
      }

      .sampling-image-container {
        height: 320px;
        overflow: hidden;
      }

      .sampling-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .sampling-card:hover .sampling-image {
        transform: scale(1.1);
      }

      .sampling-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }

      .sampling-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 15px;
        min-height: 70px;
      }

      .sampling-description {
        font-size: 0.9375rem;
        color: #495057;
        line-height: 1.6;
        margin-bottom: 16px;
        flex: 1;
      }
      .btn-sampling-read-more {
        background: white;
        color: #2563eb;
        border: 2px solid #2563eb;
        padding: 6px 16px;
        border-radius: 50px;
        font-weight: 600;
        font-size: 0.75rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.3s ease;
        margin-top: auto;
        align-self: flex-start;
        white-space: nowrap;
        text-decoration: none;
      }

      .btn-sampling-read-more:hover {
        background: #2563eb;
        color: white;
      }

      .btn-sampling-read-more svg {
        transition: transform 0.3s ease;
      }

      .btn-sampling-read-more:hover svg {
        transform: translateX(4px);
      }


        /* PLTP Works Section */
        .pltp-works-section {
          padding: 80px 0;
          background: #f8f9fa;
        }

        .pltp-works-intro-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 48px;
          align-items: start;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 32px;
          margin-bottom: 48px;
        }

        .pltp-works-intro-grid .section-title {
          margin-top: 0;
          font-size: 2.5rem;
          line-height: 1.2;
          margin-bottom: 24px;
        }

        .pltp-works-image-container {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-height: 250px;
          margin-top: 16px;
        }

        .pltp-works-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .pltp-works-intro-grid .section-intro {
          font-size: 1rem;
          margin-top: 0;
          margin-bottom: 24px;
          text-align: justify;
        }

        .btn-pltp-guide {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          text-decoration: none;
          white-space: nowrap;
        }

        .btn-pltp-guide:hover {
          background: #2563eb;
          color: white;
        }

        .btn-pltp-guide svg {
          transition: transform 0.3s ease;
        }

        .btn-pltp-guide:hover svg {
          transform: translateX(4px);
        }

        .btn-pltp-guide {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-top: 16px;
          text-decoration: none;
          white-space: nowrap;
        }

        .btn-pltp-guide:hover {
          background: #2563eb;
          color: white;
        }

        .btn-pltp-guide svg {
          transition: transform 0.3s ease;
        }

        .btn-pltp-guide:hover svg {
          transform: translateX(4px);
        }

        .pltp-work-image-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
        }

        .pltp-work-image-card:hover .pltp-work-image {
          transform: scale(1.1);
        }

        /* AI Monitoring Section */
        .ai-section {
          padding: 80px 0;
          background: ##ffffff;
        }

        .ai-intro-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 48px;
          margin-bottom: 48px;
          align-items: start;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 32px;
        }

        .ai-intro-grid .section-title {
          margin-top: 0;
          font-size: 2.5rem;
          line-height: 1.2;
        }

        .ai-intro-grid .section-intro {
          font-size: 1rem;
          margin-top: 0;
        }

        .ai-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 64px;
        }

        .ai-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .ai-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
        }

        .ai-image-container {
          height: 320px;
          overflow: hidden;
        }

        .ai-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .ai-card:hover .ai-image {
          transform: scale(1.1);
        }

        .ai-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          text-align: justify
        }

        .ai-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .ai-description {
          font-size: 0.9375rem;
          color: #495057;
          line-height: 1.6;
          margin-bottom: 16px;
          flex: 1;
        }

        .btn-ai-read-more {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 6px 16px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.3s ease;
          margin-top: auto;
          align-self: flex-start;
          white-space: nowrap;
          text-decoration: none;
        }

        .btn-ai-read-more:hover {
          background: #2563eb;
          color: white;
        }

        .btn-ai-read-more svg {
          transition: transform 0.3s ease;
        }

        .btn-ai-read-more:hover svg {
          transform: translateX(4px);
        }

        /* Collaboration Section */
        .collaboration-section {
          padding: 80px 0;
          background: #1a2642;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .collaboration-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></svg>');
          opacity: 0.3;
        }

        .collaboration-header {
          text-align: center;
          margin-bottom: 48px;
          position: relative;
          z-index: 1;
        }

        .collaboration-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .collaboration-header .section-title {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 0;
        }

        .collaboration-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin-bottom: 64px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .collaboration-text .section-intro {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          line-height: 1.8;
          margin: 0;
          text-align: justify;
        }

        .collaboration-map {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .map-image {
          width: 100%;
          max-width: 500px;
          height: auto;
          filter: brightness(0) invert(1);
          opacity: 0.9;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        .partner-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          min-height: 200px;
        }

        .partner-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          background: white;
        }

        .partner-logo-container {
          width: 120px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .partner-logo {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .partner-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a1a;
          text-align: center;
          margin: 0;
        }

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

        .footer-text {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          text-align: justify
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

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-content-wrapper {
            padding-left: 0;
            max-width: 100%;
            grid-template-columns: 1fr;
          }
            .pltp-works-content-grid {
            grid-template-columns: 1fr;
            gap: 32px;

          .mission-grid {
            grid-template-columns: 1fr;
          }

          .services-intro-grid,
          .quality-intro-grid,
          .pltp-works-intro-grid,
          .ai-intro-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .services-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .service-card {
            width: 100%;
            max-width: 100%;
          }

          .quality-cards,
          .pltp-works-images{
          width: 100%;
          height: auto;
          display: block;}
          .ai-cards {
            grid-template-columns: 1fr;
          }

          .collaboration-content {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .partners-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 16px;
          }

          .nav {
            flex-wrap: wrap;
            gap: 16px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .service-card {
            width: 100%;
            max-width: 100%;
          }

          .collaboration-header .section-title {
            font-size: 2rem;
          }

          .partners-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .partner-card {
            padding: 24px 16px;
            min-height: 160px;
          }

          .partner-logo-container {
            width: 100px;
            height: 60px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .partners-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
