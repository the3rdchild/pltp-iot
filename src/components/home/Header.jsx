import pertasmartLogo from '../../assets/images/Pertasmart4x1.svg';
import { ChevronDownIcon } from './icons';

const Header = () => (
  <header className="header">
    <div className="header-container">
      <div className="header-logos">
        <img src={pertasmartLogo} alt="Pertasmart" className="header-logo" />
      </div>
      <nav className="nav">
        <a href="#home" className="nav-link">
          Home
        </a>

        <div className="nav-dropdown">
          <button className="nav-link dropdown-btn">
            Lokasi
            <ChevronDownIcon />
          </button>
          <div className="dropdown-content">
            <a href="/login">Kamojang Unit 5</a>
            <a href="#">Ulubelu Unit 3</a>
          </div>
        </div>

        <a href="/unit-pemantauan" className="nav-link">
          Steam Monitoring
        </a>
      </nav>
    </div>
  </header>
);

export default Header;
