import drynessImage from 'assets/images/dryness.webp';
import ncgImage from 'assets/images/ncg.webp';
import tdsImage from 'assets/images/tds.webp';
import samplingDrynessImage from 'assets/images/DrynessFraction.webp';
import samplingNcgImage from 'assets/images/retractable.webp';
import samplingTdsImage from 'assets/images/SC4500.webp';
import ai1Image from 'assets/images/articles/AI1/isolation_forest_concept.jpg';
import ai2Image from 'assets/images/articles/AI2/lstm_architecture.jpg';
import kamojangImage from 'pages/home/images/kamojang.webp';
import ulubeluImage from 'pages/home/images/ulubelu.webp';
import hachLogo from 'assets/images/LOGOHach.webp';
import honeywellLogo from 'assets/images/LOGOHW.webp';
import pertaminaLogo from 'assets/images/LOGOPertamina.webp';
import pgeLogo from 'assets/images/LOGOPGE.webp';
import unpadLogo from 'assets/images/logo-unpad1.webp';

import { ClockIcon, LeafIcon, PulseIcon, ShieldIcon, UsersIcon } from '../icons';

/* --- Hero ---------------------------------------------------------------- */

export const heroStats = [
  { value: '24/7', label: 'Pengukuran berlangsung tanpa jeda' },
  { value: '3', label: 'Parameter kualitas uap yang diukur' },
  { value: '2', label: 'Lapangan panas bumi' }
];

/* --- Sampel mingguan vs pemantauan langsung ------------------------------ */

export const comparison = [
  {
    kind: 'before',
    label: 'Pengambilan sampel berkala',
    title: 'Pengukuran dilakukan satu kali dalam sepekan',
    points: [
      'Sampel uap diambil secara manual pada titik pengukuran di lapangan.',
      'Hasil pengukuran baru diperoleh setelah proses analisis laboratorium selesai.',
      'Fluktuasi kadar pengotor di antara dua waktu pengambilan tidak terekam.',
      'Uap dengan kualitas menyimpang telah melewati turbin sebelum hasil analisis tersedia.'
    ]
  },
  {
    kind: 'after',
    label: 'Pemantauan daring PertaSmart',
    title: 'Pengukuran berlangsung secara kontinu',
    points: [
      'Sensor mengukur parameter kualitas uap langsung pada jalur pipa produksi.',
      'Hasil pengukuran ditampilkan pada dashboard secara waktu nyata.',
      'Pola dan periodisitas kemunculan pengotor terekam secara utuh.',
      'Model kecerdasan buatan menandai anomali sebelum berkembang menjadi kerusakan.'
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
    summary: 'Konsentrasi zat padat terlarut yang terbawa bersama aliran uap.',
    detail: 'Konsentrasi yang tinggi menyebabkan deposisi padatan pada sudu turbin dan menurunkan efisiensi konversi energi.',
    href: '/artikel-tds'
  },
  {
    index: '02',
    name: 'Dryness Fraction',
    full: 'Fraksi kekeringan uap',
    image: drynessImage,
    alt: 'Ilustrasi pengukuran dryness fraction',
    summary: 'Proporsi fase uap terhadap keseluruhan aliran yang memasuki turbin.',
    detail: 'Butiran air yang terbawa aliran menimbulkan erosi pada permukaan sudu turbin.',
    href: '/artikel-dryness'
  },
  {
    index: '03',
    name: 'NCG',
    full: 'Non Condensable Gas',
    image: ncgImage,
    alt: 'Ilustrasi pengukuran non condensable gas',
    summary: 'Fraksi gas yang tidak terkondensasi, terutama CO₂ dan H₂S.',
    detail: 'Akumulasi gas ini menaikkan tekanan kondensor dan memicu korosi pada peralatan.',
    href: '/artikel-ncg'
  }
];

/* --- Cara kerja PLTP ----------------------------------------------------- */

export const pltpSteps = [
  {
    step: '01',
    title: 'Pembentukan uap di reservoir',
    text: 'Panas dari aktivitas magmatik memanaskan air tanah hingga terbentuk uap bertekanan tinggi.'
  },
  {
    step: '02',
    title: 'Ekspansi uap pada turbin',
    text: 'Uap dialirkan ke permukaan melalui sumur produksi, kemudian berekspansi dan memutar sudu turbin.'
  },
  {
    step: '03',
    title: 'Pembangkitan energi listrik',
    text: 'Poros turbin memutar generator sehingga energi mekanik dikonversi menjadi energi listrik.'
  },
  {
    step: '04',
    title: 'Reinjeksi kondensat',
    text: 'Uap keluaran turbin dikondensasikan, lalu kondensatnya diinjeksikan kembali ke reservoir untuk menjaga kesinambungan siklus.'
  }
];

/* --- Teknik pengambilan sampel ------------------------------------------- */

export const samplingMethods = [
  {
    title: 'Sampling TDS',
    image: samplingTdsImage,
    alt: 'Perangkat analyzer SC4500',
    text: 'Analyzer SC4500 mengukur konsentrasi padatan terlarut langsung dari aliran uap tanpa melalui tahap analisis laboratorium.',
    href: '/artikel-SamplingTDS'
  },
  {
    title: 'Sampling Dryness Fraction',
    image: samplingDrynessImage,
    alt: 'Peralatan pengukuran dryness fraction di lapangan',
    text: 'Uap dikondensasikan secara terkendali untuk menentukan proporsi fase uap sebelum memasuki turbin.',
    href: '/artikel-SamplingDryness'
  },
  {
    title: 'Sampling NCG',
    image: samplingNcgImage,
    alt: 'Pemasangan retractable probe pada jalur uap untuk pengambilan sampel non condensable gas',
    text: 'Gas dipisahkan dari aliran uap dan diukur proporsinya untuk mengetahui beban operasi kondensor.',
    href: '/artikel-SamplingNCG'
  }
];

/* --- Analisis AI --------------------------------------------------------- */

export const aiModels = [
  {
    tag: 'AI 1',
    title: 'Deteksi anomali dan klasifikasi status operasi',
    image: ai1Image,
    alt: 'Diagram konsep isolation forest untuk deteksi anomali',
    text: 'Model mengekstraksi lima ciri statistik dari 14 parameter operasi pada setiap jendela 60 menit, kemudian menilai seberapa jauh pola tersebut menyimpang dari pola operasi normal historis.',
    href: '/artikel-AI1'
  },
  {
    tag: 'AI 2',
    title: 'Sensor virtual untuk dryness fraction dan NCG',
    image: ai2Image,
    alt: 'Diagram arsitektur jaringan LSTM',
    text: 'Model mengestimasi nilai dryness fraction dan NCG dari parameter tekanan, temperatur, dan TDS. Estimasi ini berstatus penunjang: sampling laboratorium tetap menjadi acuan untuk keputusan operasi.',
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
    status: 'Tahap penyiapan',
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
    title: 'Ketersediaan data secara kontinu',
    text: 'Kondisi uap di antara dua jadwal pengambilan sampel tidak lagi menjadi bagian yang tidak terukur.'
  },
  {
    icon: <ShieldIcon size={22} />,
    title: 'Perpanjangan umur pakai turbin',
    text: 'Deteksi dini terhadap pengotor memungkinkan tindakan perawatan dilakukan sebelum kerusakan sudu meluas.'
  },
  {
    icon: <ClockIcon size={22} />,
    title: 'Respons operasi yang lebih cepat',
    text: 'Tren pengukuran dan peringatan tersaji pada satu antarmuka sehingga tindakan korektif tidak bergantung pada laporan berkala.'
  },
  {
    icon: <LeafIcon size={22} />,
    title: 'Efisiensi operasi yang berkelanjutan',
    text: 'Kualitas uap yang terjaga mempertahankan efisiensi konversi energi pada setiap satuan daya yang dibangkitkan.'
  },
  {
    icon: <UsersIcon size={22} />,
    title: 'Penerapan hasil riset di lapangan',
    text: 'Keterlibatan perguruan tinggi dan industri mengarahkan hasil penelitian pada penerapan langsung di unit pembangkit.'
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

  if (words.length === 0) return '?';
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
};
