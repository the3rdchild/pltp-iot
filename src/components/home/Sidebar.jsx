import { navLinks } from './homeData';

const Sidebar = ({ isOpen, onOpenHamburger, onCloseSidebar }) => (
  <>
    {/* Hamburger Menu */}
    <div className="hamburger-menu" onMouseEnter={onOpenHamburger}>
      <div className="hamburger-line"></div>
      <div className="hamburger-line"></div>
      <div className="hamburger-line"></div>
    </div>

    {/* Sidebar Navigation */}
    <div className={`sidebar ${isOpen ? 'open' : ''}`} onMouseLeave={onCloseSidebar}>
      <div className="sidebar-content">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} className="sidebar-link">
            {link.label}
          </a>
        ))}
      </div>
    </div>
  </>
);

export default Sidebar;
