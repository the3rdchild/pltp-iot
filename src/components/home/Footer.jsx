import pertasmartLogo from '../../assets/images/Pertasmart4x1.svg';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-col">
          <div className="footer-logos">
            <img src={pertasmartLogo} alt="Pertasmart" className="header-logo" />
          </div>
          <p className="footer-text">
            Kolaborasi PT. Pertamina dan Universitas Padjadjaran dalam mengembangkan teknologi monitoring steam quality untuk PLTP.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Navigasi</h4>
          <ul className="footer-links">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#about">About Us</a>
            </li>
            <li>
              <a href="#services">Services</a>
            </li>
            <li>
              <a href="#monitoring">Monitoring</a>
            </li>
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
        <p>&copy; {new Date().getFullYear()} SMART System - PT. Pertamina & UNPAD. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
