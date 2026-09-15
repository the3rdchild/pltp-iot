import CARAPLTP from '../../assets/images/PLTPKMJ.jpg';
import { ArrowRightIcon } from './icons';

const PltpWorksSection = () => (
  <section id="pltp-works" className="pltp-works-section">
    <div className="container">
      <div className="pltp-works-intro-grid">
        <div>
          <h2 className="section-title">Cara Kerja PLTP</h2>

          <div className="pltp-works-image-container">
            <img src={CARAPLTP} alt="Cara Kerja PLTP" className="pltp-works-image" />
          </div>
        </div>

        <div>
          <p className="section-intro">
            Pembangkit Listrik Tenaga Panas Bumi (PLTP) memanfaatkan panas dari dalam bumi untuk menghasilkan listrik. Panas tersebut
            mengubah air bawah tanah menjadi uap bertekanan tinggi yang dialirkan ke permukaan untuk memutar turbin. Turbin yang berputar
            menggerakkan generator sehingga menghasilkan energi listrik. Uap sisa kemudian didinginkan dan airnya dikembalikan ke dalam bumi
            agar proses dapat berlangsung secara berkelanjutan.
          </p>
          <a href="/cara-kerja-pltp" className="btn-pltp-guide">
            Selengkapnya
            <ArrowRightIcon size={16} />
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default PltpWorksSection;
