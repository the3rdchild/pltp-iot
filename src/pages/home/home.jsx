import AiAnalysis from 'components/landing/sections/AiAnalysis';
import Collaboration from 'components/landing/sections/Collaboration';
import Comparison from 'components/landing/sections/Comparison';
import Hero from 'components/landing/sections/Hero';
import HowItWorks from 'components/landing/sections/HowItWorks';
import Parameters from 'components/landing/sections/Parameters';
import Sampling from 'components/landing/sections/Sampling';
import Sites from 'components/landing/sections/Sites';
import SiteLayout from 'components/landing/SiteLayout';

// ==============================|| PUBLIC - LANDING PAGE ||============================== //
//
// Section order follows one argument: what the visitor is looking at (hero),
// why it matters (comparison), what is actually measured (parameters), the
// background needed to read those numbers (how it works, sampling), what
// interprets them (AI), and where it runs (sites).
export default function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Comparison />
      <Parameters />
      <HowItWorks />
      <Sampling />
      <AiAnalysis />
      <Sites />
      <Collaboration />
    </SiteLayout>
  );
}
