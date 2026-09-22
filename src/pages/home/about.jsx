import ArticleBody from 'components/landing/article/ArticleBody';
import Mission from 'components/landing/about/Mission';
import PageHero from 'components/landing/about/PageHero';
import Partners from 'components/landing/about/Partners';
import Team from 'components/landing/about/Team';
import SiteLayout from 'components/landing/SiteLayout';

const sections = [
  { id: 'misi', label: 'Tujuan' },
  { id: 'tim', label: 'Tim riset' },
  { id: 'mitra', label: 'Mitra' }
];

// ==============================|| PUBLIC - ABOUT ||============================== //
//
// Holds what used to stretch the landing page past its welcome: the mission
// narrative, the full research roster, and the partner detail. The landing
// page now links here instead of carrying all three.
//
// The three blocks sit inside ArticleBody rather than carrying a Section each,
// so the page gets the same contents rail the articles have. That trades the
// alternating background bands for a way to see the page's structure and jump
// through it, which matters more on a page this long.
export default function About() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Tentang"
        title="Penerapan hasil riset pada operasi pembangkit panas bumi"
        lead="PertaSmart dikembangkan melalui kerja sama PT Pertamina dan Universitas Padjadjaran untuk memantau kualitas dan kemurnian uap PLTP secara kontinu."
      />
      <ArticleBody sections={sections} chapters>
        <Mission />
        <Team />
        <Partners />
      </ArticleBody>
    </SiteLayout>
  );
}
