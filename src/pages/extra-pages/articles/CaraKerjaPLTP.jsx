import reservoirImg from 'assets/images/articles/geothermal-reservoir.jpg';
import productionWellImg from 'assets/images/articles/production-well.jpg';
import turbineImg from 'assets/images/articles/turbine-generator.jpg';
import coolingTowerImg from 'assets/images/articles/cooling-tower.jpg';
import powerGridImg from 'assets/images/articles/power-grid.jpg';

import ArticleBody from 'components/landing/article/ArticleBody';
import ArticleLayout from 'components/landing/article/ArticleLayout';
import prose from 'components/landing/article/Prose.module.css';
import { ClockIcon, LeafIcon, MapPinIcon, PulseIcon } from 'components/landing/icons';
import { ArrowLink } from 'components/landing/ui/Button';
import { SectionHead } from 'components/landing/ui/Section';

import styles from './CaraKerjaPLTP.module.css';

const sections = [
  { id: 'pengantar', label: 'Pengantar' },
  { id: 'tahapan', label: 'Tahapan proses' },
  { id: 'keunggulan', label: 'Keunggulan' }
];

const steps = [
  {
    number: '01',
    title: 'Reservoir panas bumi',
    image: reservoirImg,
    alt: 'Ilustrasi reservoir panas bumi di bawah permukaan',
    text: 'Aktivitas magmatik pada kedalaman tertentu memanaskan air tanah sehingga terbentuk akumulasi uap bertekanan di dalam reservoir.'
  },
  {
    number: '02',
    title: 'Produksi uap',
    image: productionWellImg,
    alt: 'Sumur produksi uap panas bumi',
    text: 'Fluida reservoir dialirkan ke permukaan melalui sumur produksi, kemudian dipisahkan agar hanya fase uap yang diteruskan ke unit pembangkit.'
  },
  {
    number: '03',
    title: 'Konversi energi pada turbin',
    image: turbineImg,
    alt: 'Turbin dan generator pembangkit panas bumi',
    text: 'Uap dialirkan melalui sistem perpipaan menuju turbin. Ekspansi uap memutar sudu turbin, dan poros turbin memutar generator sehingga dihasilkan energi listrik.'
  },
  {
    number: '04',
    title: 'Kondensasi dan reinjeksi',
    image: coolingTowerImg,
    alt: 'Menara pendingin dan sistem kondensasi',
    text: 'Uap keluaran turbin dikondensasikan menjadi air di kondensor. Kondensat kemudian diinjeksikan kembali ke reservoir melalui sumur injeksi untuk menjaga kesinambungan siklus.'
  },
  {
    number: '05',
    title: 'Penyaluran daya',
    image: powerGridImg,
    alt: 'Jaringan transmisi tenaga listrik',
    text: 'Tegangan keluaran generator dinaikkan oleh transformator, kemudian daya disalurkan ke jaringan transmisi PLN.'
  }
];

const advantages = [
  {
    icon: <LeafIcon size={21} />,
    title: 'Intensitas emisi rendah',
    text: 'Emisi karbon per satuan daya jauh lebih rendah dibandingkan pembangkit berbahan bakar fosil.'
  },
  {
    icon: <ClockIcon size={21} />,
    title: 'Siklus berkelanjutan',
    text: 'Reinjeksi kondensat menjaga kesetimbangan fluida reservoir sehingga sumber dayanya tetap terbarukan.'
  },
  {
    icon: <PulseIcon size={21} />,
    title: 'Faktor kapasitas tinggi',
    text: 'Unit dapat beroperasi secara kontinu karena tidak bergantung pada kondisi cuaca.'
  },
  {
    icon: <MapPinIcon size={21} />,
    title: 'Potensi nasional',
    text: 'Sekitar 40% potensi panas bumi dunia berada di Indonesia, dan baru 5,8% dari total 29.544 MW yang termanfaatkan.'
  }
];

// ==============================|| ARTICLE - CARA KERJA PLTP ||============================== //

export default function CaraKerjaPLTP() {
  return (
    <ArticleLayout
      eyebrow="Latar belakang"
      title="Cara kerja pembangkit listrik tenaga panas bumi"
      lead="Konversi energi termal dari reservoir panas bumi menjadi energi listrik, dari sumur produksi hingga jaringan transmisi."
    >
      <ArticleBody sections={sections} chapters>
        <section id="pengantar" className={prose.prose}>
          <p>
            Pembangkit listrik tenaga panas bumi (PLTP) mengonversi energi termal yang tersimpan di dalam bumi menjadi energi listrik.
            Proses konversi memanfaatkan uap yang terbentuk secara alami ketika air tanah dipanaskan oleh aktivitas magmatik pada sistem
            geotermal di bawah permukaan.
          </p>
          <p>
            Berbeda dengan pembangkit termal konvensional, PLTP tidak memerlukan proses pembakaran bahan bakar. Fluida kerja berasal
            langsung dari reservoir dan dikembalikan ke reservoir setelah melewati turbin, sehingga siklusnya dapat dipertahankan dalam
            jangka panjang.
          </p>
        </section>

        <section id="tahapan">
          <SectionHead
            eyebrow="Tahapan proses"
            title="Lima tahap konversi energi"
            lead="Kualitas uap pada tahap ketiga menentukan sejauh mana energi termal dapat dikonversi tanpa merusak sudu turbin."
          />

          <ol className={styles.steps}>
            {steps.map((step) => (
              <li key={step.number} className={styles.step}>
                <figure className={styles.figure}>
                  <img src={step.image} alt={step.alt} loading="lazy" />
                </figure>

                <div>
                  <p className={styles.marker}>
                    <span className={styles.markerNumber}>{step.number}</span>
                    Tahap {step.number}
                  </p>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="keunggulan">
          <SectionHead eyebrow="Karakteristik" title="Keunggulan pembangkitan panas bumi" />

          <ul className={styles.advantages}>
            {advantages.map((item) => (
              <li key={item.title} className={styles.advantage}>
                <span className={styles.advantageIcon}>{item.icon}</span>
                <h3 className={styles.advantageTitle}>{item.title}</h3>
                <p className={styles.advantageText}>{item.text}</p>
              </li>
            ))}
          </ul>

          <div className={styles.more}>
            <ArrowLink href="/">Kembali ke beranda</ArrowLink>
          </div>
        </section>
      </ArticleBody>
    </ArticleLayout>
  );
}
