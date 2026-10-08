/*
 * One nav definition for the whole public site.
 *
 * The old landing page carried two disagreeing menus -- a header nav with three
 * items and a hover-only sidebar with ten -- so a visitor saw different
 * navigation depending on where their cursor happened to be. Header and mobile
 * drawer now render this same list.
 */

export const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/about' },
  { label: 'Cara Kerja PLTP', href: '/cara-kerja-pltp' },
  { label: 'Unit Pemantauan', href: '/unit-pemantauan' },
  {
    label: 'Artikel',
    children: [
      { label: 'TDS (Total Dissolved Solid)', href: '/artikel-tds' },
      { label: 'Dryness Fraction', href: '/artikel-dryness' },
      { label: 'NCG (Non Condensable Gas)', href: '/artikel-ncg' },
      { label: 'Sampling TDS', href: '/artikel-SamplingTDS' },
      { label: 'Sampling Dryness', href: '/artikel-SamplingDryness' },
      { label: 'Sampling NCG', href: '/artikel-SamplingNCG' },
      { label: 'Overall Risk History', href: '/artikel-AI1' },
      { label: 'Dryness & NCG Prediction', href: '/artikel-AI2' }
    ]
  }
];

// Ulubelu has no dashboard yet; it is listed without a link rather than behind
// the `href="#"` the old header used, which looked clickable and went nowhere.
export const monitoringSites = [
  { label: 'Kamojang Unit 5', href: '/login' },
  { label: 'Ulubelu Unit 3', href: null }
];

export const footerColumns = [
  {
    heading: 'Jelajahi',
    links: [
      { label: 'Beranda', href: '/' },
      { label: 'Tentang PertaSmart', href: '/about' },
      { label: 'Cara Kerja PLTP', href: '/cara-kerja-pltp' },
      { label: 'Unit Pemantauan', href: '/unit-pemantauan' }
    ]
  },
  {
    heading: 'Parameter Uap',
    links: [
      { label: 'TDS', href: '/artikel-tds' },
      { label: 'Dryness Fraction', href: '/artikel-dryness' },
      { label: 'NCG', href: '/artikel-ncg' },
      { label: 'Analisis AI', href: '/artikel-AI1' }
    ]
  },
  {
    heading: 'Lokasi',
    links: [
      { label: 'PLTP Kamojang, Jawa Barat', href: null },
      { label: 'PLTP Ulubelu, Lampung', href: null }
    ]
  }
];
