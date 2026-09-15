import unpadLogo from '../../assets/images/logo-unpad1.png';
import tdsImage from '../../assets/images/tds.png';
import drynessImage from '../../assets/images/dryness.png';
import ncgImage from '../../assets/images/ncg.png';
import SC4500 from '../../assets/images/SC4500.png';
import sampelncg from '../../assets/images/sampelncg.png';
import DrynessFraction from '../../assets/images/DrynessFraction.jpg';
import PTPGE from '../../assets/images/LOGOPGE.png';
import LogoPertamina from '../../assets/images/LOGOPertamina.png';
import Hach from '../../assets/images/LOGOHach.png';
import Honeywell from '../../assets/images/LOGOHW.png';
import { UsersIcon } from './icons';

export const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'Misi Kami' },
  { href: '#services', label: 'Layanan Kami' },
  { href: '/unit-pemantauan', label: 'Unit Pemantauan' },
  { href: '#quality', label: 'Kualitas Uap' },
  { href: '#pltp-works', label: 'Cara Kerja PLTP' },
  { href: '#sampling', label: 'Teknik Pengambilan Sampel' },
  { href: '#ai-monitoring', label: 'Sistem Monitoring & Analisis AI' },
  { href: '#research-team', label: 'Tim Riset' },
  { href: '#collaboration', label: 'Kolaborasi & Kerja Sama' }
];

export const missionCards = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
      </svg>
    ),
    title: 'Meningkatkan Efisiensi Geothermal',
    text: 'Dengan monitoring real-time terhadap kualitas uap, kami membantu mengoptimalkan performa turbin dan mengurangi downtime operasional, sehingga produktivitas PLTP meningkat secara signifikan.'
  },
  {
    icon: <UsersIcon size={24} />,
    title: 'Kolaborasi untuk Inovasi Energi',
    text: 'Sinergi antara industri dan akademisi menghasilkan riset dan pengembangan teknologi yang aplikatif, menjawab tantangan energi terbarukan dengan solusi yang inovatif dan berkelanjutan.'
  }
];

export const serviceCards = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    title: 'Memantau Kualitas Uap Real-Time',
    text: 'Sistem monitoring yang memberikan data akurat setiap saat untuk memastikan kualitas uap yang masuk ke turbin selalu dalam kondisi optimal.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ),
    title: 'Analisis Data Berbasis AI',
    text: 'Platform AI yang mengintegrasikan sensor IoT dan machine learning untuk analisis prediktif, deteksi anomali otomatis, dan pengambilan keputusan yang lebih cerdas dan akurat.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
      </svg>
    ),
    title: 'Optimisasi Kinerja Turbin',
    text: 'Membantu meningkatkan efisiensi turbin dengan monitoring parameter kritis yang mempengaruhi performa dan umur peralatan.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"></path>
      </svg>
    ),
    title: 'Solusi Digital Berkelanjutan',
    text: 'Transformasi digital PLTP melalui ekosistem IoT yang menghadirkan industri 5.0, di mana teknologi pintar, big data, dan human-centered innovation bersinergi untuk operasional yang lebih efisien.'
  },
  {
    icon: <UsersIcon size={32} />,
    title: 'Kolaborasi Riset dan Inovasi',
    text: 'Kerjasama antara industri dan akademisi dalam mengembangkan teknologi baru untuk meningkatkan efisiensi energi geothermal.'
  }
];

export const qualityCards = [
  {
    image: tdsImage,
    alt: 'TDS - Total Dissolved Solid',
    title: 'TDS (Total Dissolved Solid)',
    description:
      'TDS adalah perbandingan banyaknya zat padat dalam larutan/uap/cairan yang dinyatakan dalam persentase. TDS tinggi bisa menyebabkan carryover (terikutnya zat padat atau cairan dalam uap).',
    href: '/artikel-tds'
  },
  {
    image: drynessImage,
    alt: 'Dryness Fraction',
    title: 'Dryness Fraction',
    description:
      'Dryness fraction adalah tingkat kadar air dalam uap yang dinyatakan dalam persentase. Banyaknya air dalam uap dapat menyebabkan korosi pada turbin',
    href: '/artikel-dryness'
  },
  {
    image: ncgImage,
    alt: 'NCG - Non Condensed Gas',
    title: 'NCG (Non Condensed Gas)',
    description: 'NCG adalah gas yang tidak dapat dikondensasikan yang dinyatakan dalam persen. Contoh: CO₂, H₂S, dan gas lainnya.',
    href: '/artikel-ncg'
  }
];

export const samplingCards = [
  {
    image: SC4500,
    alt: 'TDS - Total Dissolved Solid',
    title: (
      <>
        Sampling TDS
        <br />
        (Total Dissolved Solid)
      </>
    ),
    description:
      'Proses pengambilan sampel TDS menggunakan perangkat SC4500 untuk mengukur kadar Total Dissolved Solid dalam uap secara akurat. Data sampel ini menjadi input penting untuk sistem monitoring dan validasi prediksi AI.',
    href: '/artikel-SamplingTDS'
  },
  {
    image: DrynessFraction,
    alt: 'Dryness Fraction',
    title: 'Sampling Dryness Fraction',
    description:
      'Dryness fraction adalah tingkat kadar air dalam uap yang dinyatakan dalam persentase. Banyaknya air dalam uap dapat menyebabkan korosi pada turbin',
    href: '/artikel-Samplingdryness'
  },
  {
    image: sampelncg,
    alt: 'NCG - Non Condensed Gas',
    title: (
      <>
        Sampling NCG
        <br />
        (Non Condensed Gas)
      </>
    ),
    description: 'NCG adalah gas yang tidak dapat dikondensasikan yang dinyatakan dalam persen. Contoh: CO₂, H₂S, dan gas lainnya.',
    href: '/artikel-Samplingncg'
  }
];

export const aiCards = [
  {
    image: drynessImage,
    alt: 'AI1 Anomaly Detection',
    title: 'AI1 - Prediksi Anomali & Status Turbin',
    description:
      'Sistem AI1 menganalisis 12 parameter operasional secara real-time untuk mendeteksi anomali dan memprediksi risiko kerusakan turbin. AI memberikan status kondisi (Low/Medium/High) dan peringatan dini untuk tindakan preventif.',
    href: '/artikel-AI1'
  },
  {
    image: ncgImage,
    alt: 'AI2 Virtual Sensor',
    title: 'AI2 - Virtual Sensor Dryness & NCG',
    description:
      'AI2 berfungsi sebagai virtual sensor yang memprediksi nilai dryness fraction dan NCG content tanpa pengambilan sampel langsung. Teknologi ini mengurangi biaya operasional sambil tetap menjaga akurasi monitoring.',
    href: '/artikel-AI2'
  }
];

export const partners = [
  { logo: LogoPertamina, alt: 'Pertamina', name: 'PT. Pertamina' },
  { logo: PTPGE, alt: 'Pertamina Geothermal Energy', name: 'PT. Pertamina Geothermal Energy' },
  { logo: Hach, alt: 'HACH', name: 'Hach' },
  { logo: Honeywell, alt: 'Honeywell', name: 'Honeywell' }
];

export const researchTeam = [
  {
    institution: 'PT. Pertamina (Persero)',
    logo: LogoPertamina,
    logoClassName: 'team-group-logo-pertamina',
    members: [
      { name: 'Ali Sundja', role: 'VP Technology Innovation Upstream and Low Carbon' },
      { name: 'Wahyu Firmansyah', role: 'Project Leader' },
      { name: 'Hary Koestono', role: 'Anggota' },
      { name: 'Bambang Mujihardi', role: 'Anggota' },
      { name: 'Taufiq', role: 'Anggota' },
      { name: 'Lukman Nulhakim', role: 'Anggota' },
      { name: 'Adrian Tawakal', role: 'Anggota' }
    ]
  },
  {
    institution: 'Universitas Padjadjaran',
    logo: unpadLogo,
    logoClassName: 'team-group-logo-unpad',
    members: [
      { name: 'Ir. Agus Trisanto, M.T., Ph.D.', role: 'Project Leader' },
      { name: 'Prof. Dr. Eng. Darmawan Hidayat, S.Si., M.T.', role: 'Anggota' },
      { name: 'Dr. Mohammad Taufik', role: 'Anggota' },
      { name: 'Ir. Muhammad Rasyid Ramdhani, M.T.', role: 'Anggota' },
      { name: 'Ir. Septian Ari Kurniawan, S.T., M.T.', role: 'Anggota' },
      { name: 'Allyn Pramudya Sulaeman, M.T., Ph.D.', role: 'Anggota' },
      { name: 'Naufal Kholis Arrahman', role: 'Anggota' },
      { name: 'Ivan Antony', role: 'Anggota' },
      { name: 'Raditya Ahmad Arfandi', role: 'Anggota' },
      { name: 'Raden Mas Ahmad Rafi Nur Arief', role: 'Anggota' }
    ]
  }
];

// Initials from the bare name: drop trailing degrees (after the comma) and prefix titles (words ending in ".")
export const getInitials = (name) => {
  const words = name
    .split(',')[0]
    .split(' ')
    .filter((word) => word && !word.endsWith('.'));
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
};
