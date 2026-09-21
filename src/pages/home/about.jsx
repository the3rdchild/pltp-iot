import Mission from 'components/landing/about/Mission';
import PageHero from 'components/landing/about/PageHero';
import Partners from 'components/landing/about/Partners';
import Team from 'components/landing/about/Team';
import SiteLayout from 'components/landing/SiteLayout';

// ==============================|| PUBLIC - ABOUT ||============================== //
//
// Holds what used to stretch the landing page past its welcome: the mission
// narrative, the full research roster, and the partner detail. The landing
// page now links here instead of carrying all three.
export default function About() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Tentang"
        title="Penerapan hasil riset pada operasi pembangkit panas bumi"
        lead="PertaSmart dikembangkan melalui kerja sama PT Pertamina dan Universitas Padjadjaran untuk memantau kualitas dan kemurnian uap PLTP secara kontinu."
      />
      <Mission />
      <Team />
      <Partners />
    </SiteLayout>
  );
}
