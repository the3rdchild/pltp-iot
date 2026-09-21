import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import pertasmartLogo from 'assets/images/Pertasmart4x1.svg';

import { navItems } from './data/navigation';
import { ChevronDownIcon, CloseIcon, MenuIcon } from './icons';
import { Button } from './ui/Button';
import styles from './SiteHeader.module.css';

/**
 * Public-site header.
 *
 * Opening is click-driven, not hover-driven: the previous header opened its
 * menu on `onMouseEnter`, which no touch device ever fires, so the whole
 * navigation was unreachable on a phone.
 */
export default function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navRef = useRef(null);

  // A route change means the visitor has arrived; nothing should stay open.
  useEffect(() => {
    setDrawerOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes whichever layer is open, outermost first.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (openMenu) setOpenMenu(null);
      else setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openMenu]);

  // Clicking anywhere outside the nav dismisses an open dropdown.
  useEffect(() => {
    if (!openMenu) return undefined;
    const onPointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) setOpenMenu(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [openMenu]);

  // Hold the page still while the drawer covers it.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const linkClass = ({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;
  const drawerLinkClass = ({ isActive }) => `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`;

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.bar}>
          <Link to="/" className={styles.brand} aria-label="Beranda PertaSmart">
            <img src={pertasmartLogo} alt="PertaSmart" className={styles.brandLogo} />
          </Link>

          <nav className={styles.nav} ref={navRef} aria-label="Navigasi utama">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className={styles.dropdown}>
                  <button
                    type="button"
                    className={`${styles.navLink} ${styles.dropdownBtn} ${openMenu === item.label ? styles.dropdownOpen : ''}`}
                    aria-expanded={openMenu === item.label}
                    onClick={() => setOpenMenu((current) => (current === item.label ? null : item.label))}
                  >
                    {item.label}
                    <ChevronDownIcon size={15} />
                  </button>

                  {openMenu === item.label && (
                    <div className={styles.menu}>
                      {item.children.map((child) => (
                        <Link key={child.href} to={child.href} className={styles.menuItem}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink key={item.href} to={item.href} end={item.href === '/'} className={linkClass}>
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <div className={styles.cta}>
            <Button href="/login">Masuk Dashboard</Button>
          </div>

          <button
            type="button"
            className={styles.toggle}
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
            aria-expanded={drawerOpen}
          >
            <MenuIcon size={22} />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <>
          <button type="button" className={styles.scrim} aria-label="Tutup menu" onClick={() => setDrawerOpen(false)} />

          <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Navigasi">
            <div className={styles.drawerHead}>
              <img src={pertasmartLogo} alt="PertaSmart" className={styles.brandLogo} />
              <button type="button" className={styles.toggle} onClick={() => setDrawerOpen(false)} aria-label="Tutup menu">
                <CloseIcon size={22} />
              </button>
            </div>

            <nav className={styles.drawerBody} aria-label="Navigasi utama">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <p className={styles.drawerGroupLabel}>{item.label}</p>
                    {item.children.map((child) => (
                      <Link key={child.href} to={child.href} className={styles.drawerSubLink}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <NavLink key={item.href} to={item.href} end={item.href === '/'} className={drawerLinkClass}>
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>

            <div className={styles.drawerFoot}>
              <Button href="/login">Masuk Dashboard</Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
