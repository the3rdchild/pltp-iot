import drynessImage from 'assets/images/dryness.png';
import ncgImage from 'assets/images/ncg.png';
import tdsImage from 'assets/images/tds.png';
import samplingDrynessImage from 'assets/images/DrynessFraction.jpg';
import samplingNcgImage from 'assets/images/sampelncg.png';
import samplingTdsImage from 'assets/images/SC4500.png';
import ai1Image from 'assets/images/articles/AI1/isolation_forest_concept.jpg';
import ai2Image from 'assets/images/articles/AI2/lstm_architecture.jpg';
import kamojangImage from 'pages/home/images/kamojang.webp';
import ulubeluImage from 'pages/home/images/ulubelu.jpg';
import hachLogo from 'assets/images/LOGOHach.png';
import honeywellLogo from 'assets/images/LOGOHW.png';
import pertaminaLogo from 'assets/images/LOGOPertamina.png';
import pgeLogo from 'assets/images/LOGOPGE.png';
import unpadLogo from 'assets/images/logo-unpad1.png';

import { ClockIcon, LeafIcon, PulseIcon, ShieldIcon, UsersIcon } from '../icons';

/* --- Hero ---------------------------------------------------------------- */

export const heroStats = [
  { value: '24/7', label: 'Uap dipantau tanpa jeda' },
  { value: '3', label: 'Parameter mutu uap diukur' },
  { value: '2', label: 'Lapangan panas bumi' }
];

/* --- Sampel mingguan vs pemantauan langsung ------------------------------ */

export const comparison = [
  {
    kind: 'before',
    label: 'Cara lama',
    title: 'Sampel diambil seminggu sekali',
    points: [
      'Petugas mengambil sampel uap secara manual di lapangan.',
      'Hasilnya baru diketahui setelah dianalisis di laboratorium.',
      'Naik-turun kadar pengotor di antara dua pengambilan tidak terlihat.',
      'Ketika hasilnya keluar, uap yang bermasalah sudah lama melewati turbin.'
    ]
  },
  {
    kind: 'after',
    label: 'Dengan PertaSmart',
    title: 'Uap dibaca terus-menerus',
    points: [
      'Sensor membaca mutu uap langsung di jalur pipa.',
      'Angkanya muncul di dashboard saat itu juga.',
      'Pola dan siklus kemunculan pengotor terekam utuh.',
      'AI menandai kejanggalan sebelum sempat merusak turbin.'
    ]
  }
];

/* --- Tiga parameter ------------------------------------------------------ */

export const parameters = [
  {
    index: '01',
    name: 'TDS',
    full: 'Total Dissolved Solid',
    image: tdsImage,
    alt: 'Ilustrasi pengukuran total dissolved solid',
    summary: 'Seberapa banyak zat padat yang ikut terlarut dalam uap.',
    detail: 'Kalau kadarnya tinggi, padatan itu terbawa masuk dan mengendap di sudu turbin.',
    href: '/artikel-tds'
  },
  {
    index: '02',
    name: 'Dryness Fraction',
    full: 'Kekeringan uap',
    image: drynessImage,
    alt: 'Ilustrasi pengukuran dryness fraction',
    summary: 'Seberapa kering uap yang mengalir ke turbin.',
    detail: 'Butiran air yang lolos akan menghantam sudu berulang kali dan mengikisnya.',
    href: '/artikel-dryness'
  },
  {
    index: '03',
    name: 'NCG',
    full: 'Non Condensable Gas',
    image: ncgImage,
    alt: 'Ilustrasi pengukuran non condensable gas',
    summary: 'Gas yang tidak bisa diembunkan, seperti CO₂ dan H₂S.',
    detail: 'Gas ini menurunkan kinerja kondensor dan memicu korosi pada peralatan.',
    href: '/artikel-ncg'
  }
];

/* --- Cara kerja PLTP ----------------------------------------------------- */

export const pltpSteps = [
  { step: '01', title: 'Uap naik dari reservoir', text: 'Panas magma memasak air bawah tanah menjadi uap bertekanan tinggi.' },
  { step: '02', title: 'Uap memutar turbin', text: 'Uap dialirkan ke permukaan lewat sumur produksi, lalu mendorong sudu turbin.' },
  {
    step: '03',
    title: 'Generator menghasilkan listrik',
    text: 'Putaran turbin memutar generator yang mengubahnya menjadi energi listrik.'
  },
  { step: '04', title: 'Air dikembalikan ke bumi', text: 'Uap sisa diembunkan, airnya diinjeksikan lagi agar siklusnya berkelanjutan.' }
];

/* --- Teknik pengambilan sampel ------------------------------------------- */

export const samplingMethods = [
  {
    title: 'Sampling TDS',
    image: samplingTdsImage,
    alt: 'Perangkat analyzer SC4500',
    text: 'Analyzer SC4500 mengukur kadar padatan terlarut langsung dari aliran uap, tanpa menunggu antrean laboratorium.',
    href: '/artikel-SamplingTDS'
  },
  {
    title: 'Sampling Dryness Fraction',
    image: samplingDrynessImage,
    alt: 'Peralatan pengukuran dryness fraction di lapangan',
    text: 'Uap dikondensasikan terkendali untuk menakar berapa bagian yang benar-benar kering sebelum masuk turbin.',
    href: '/artikel-SamplingDryness'
  },
  {
    title: 'Sampling NCG',
    image: samplingNcgImage,
    alt: 'Pengambilan sampel non condensable gas',
    text: 'Gas dipisahkan dari uap dan ditakar proporsinya untuk mengetahui beban kerja kondensor.',
    href: '/artikel-SamplingNCG'
  }
];

/* --- Analisis AI --------------------------------------------------------- */

export const aiModels = [
  {
    tag: 'AI 1',
    title: 'Deteksi anomali & status turbin',
    image: ai1Image,
    alt: 'Diagram konsep isolation forest untuk deteksi anomali',
    text: 'Membaca 12 parameter operasi sekaligus, mencari pola yang menyimpang, lalu menyimpulkan tingkat risikonya: rendah, sedang, atau tinggi.',
    href: '/artikel-AI1'
  },
  {
    tag: 'AI 2',
    title: 'Sensor virtual dryness & NCG',
    image: ai2Image,
    alt: 'Diagram arsitektur jaringan LSTM',
    text: 'Memperkirakan nilai dryness dan NCG dari parameter yang sudah terukur, sehingga tidak setiap angka perlu menunggu pengambilan sampel.',
    href: '/artikel-AI2'
  }
];

/* --- Lokasi -------------------------------------------------------------- */

export const sites = [
  {
    name: 'PLTP Kamojang Unit 5',
    region: 'Garut, Jawa Barat',
    image: kamojangImage,
    status: 'Dashboard aktif',
    active: true,
    href: '/login'
  },
  {
    name: 'PLTP Ulubelu Unit 3',
    region: 'Tanggamus, Lampung',
    image: ulubeluImage,
    status: 'Dalam penyiapan',
    active: false,
    href: null
  }
];

/* --- Mitra --------------------------------------------------------------- */

export const partners = [
  { name: 'PT Pertamina (Persero)', logo: pertaminaLogo },
  { name: 'PT Pertamina Geothermal Energy', logo: pgeLogo },
  { name: 'Universitas Padjadjaran', logo: unpadLogo },
  { name: 'Hach', logo: hachLogo },
  { name: 'Honeywell', logo: honeywellLogo }
];

/* --- Halaman Tentang ----------------------------------------------------- */

export const missionPillars = [
  {
    icon: <PulseIcon size={22} />,
    title: 'Data yang sampai tepat waktu',
    text: 'Operator tidak perlu menebak kondisi uap di antara dua jadwal sampling. Angkanya ada, setiap saat.'
  },
  {
    icon: <ShieldIcon size={22} />,
    title: 'Turbin yang lebih panjang umurnya',
    text: 'Pengotor yang terdeteksi lebih awal berarti perbaikan kecil hari ini, bukan penggantian sudu tahun depan.'
  },
  {
    icon: <ClockIcon size={22} />,
    title: 'Keputusan yang lebih cepat',
    text: 'Tren dan peringatan tersaji dalam satu layar, sehingga tindakan bisa diambil tanpa menunggu laporan.'
  },
  {
    icon: <LeafIcon size={22} />,
    title: 'Operasi yang berkelanjutan',
    text: 'Pembangkit yang efisien membakar lebih sedikit sumber daya untuk listrik yang sama.'
  },
  {
    icon: <UsersIcon size={22} />,
    title: 'Riset yang dipakai di lapangan',
    text: 'Kampus dan industri mengerjakannya bersama, sehingga hasilnya tidak berhenti sebagai laporan penelitian.'
  }
];

export const researchTeam = [
  {
    institution: 'PT Pertamina (Persero)',
    logo: pertaminaLogo,
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

// Initials from the bare name: drop the degrees after the comma and any prefix
// title (a word ending in "."), so "Ir. Agus Trisanto, M.T." reads as "AT".
export const getInitials = (name) => {
  const words = name
    .split(',')[0]
    .split(' ')
    .filter((word) => word && !word.endsWith('.'));

  if (words.length === 0) return '–';
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
};
