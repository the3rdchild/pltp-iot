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
        title="Riset yang dipasang di pembangkit, bukan berhenti di laporan"
        lead="PertaSmart lahir dari kerja sama PT Pertamina dan Universitas Padjadjaran untuk memantau mutu uap PLTP secara langsung."
      />
      <Mission />
      <Team />
      <Partners />
    </SiteLayout>
  );
}
