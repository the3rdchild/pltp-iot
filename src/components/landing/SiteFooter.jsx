import { Link } from 'react-router-dom';

import pertasmartLogo from 'assets/images/Pertasmart4x1.svg';

import { footerColumns } from './data/navigation';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.about}>
            <img src={pertasmartLogo} alt="PertaSmart" className={styles.logo} />
            <p className={styles.blurb}>
              Sistem pemantauan kualitas dan kemurnian uap PLTP, hasil riset bersama PT Pertamina dan Universitas Padjadjaran.
            </p>
            <p className={styles.contact}>
              PT Pertamina Geothermal Energy · Universitas Padjadjaran
              <br />
              <a href="mailto:pertasmart@unpad.ac.id">pertasmart@unpad.ac.id</a>
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h2 className={styles.heading}>{column.heading}</h2>
              <ul className={styles.list}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? <Link to={link.href}>{link.label}</Link> : <span className={styles.listText}>{link.label}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} PertaSmart. PT Pertamina dan Universitas Padjadjaran.</p>
          <p>Online Steam Quality and Purity Monitoring Smart System</p>
        </div>
      </div>
    </footer>
  );
}
