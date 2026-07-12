import { TechShowcaseProvider } from '../context/TechShowcaseContext';
import Hero from '../components/Hero';
import BrandMarquee from '../components/BrandMarquee';
import FeaturedWorks from '../components/FeaturedWorks';
import HowIWorkWithAgents from '../components/HowIWorkWithAgents';
import OlderWorks from '../components/OlderWorks';
import Contact from '../components/Contact';
import PageTour from '../components/PageTour/PageTour';

export default function HomePage() {
  return (
    <TechShowcaseProvider>
      <main>
        <Hero />
        <BrandMarquee />
        <FeaturedWorks />
        <HowIWorkWithAgents />
        <OlderWorks />
        <Contact />
      </main>
      <PageTour />
    </TechShowcaseProvider>
  );
}
