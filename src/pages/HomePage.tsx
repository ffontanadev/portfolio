import { TechShowcaseProvider } from '../context/TechShowcaseContext';
import Hero from '../components/Hero';
import ProofStrip from '../components/ProofStrip';
import BrandMarquee from '../components/BrandMarquee';
import FeaturedWorks from '../components/FeaturedWorks';
import OlderWorks from '../components/OlderWorks';
import Contact from '../components/Contact';

export default function HomePage() {
  return (
    <TechShowcaseProvider>
      <main id="main" tabIndex={-1}>
        <Hero />
        <ProofStrip />
        <BrandMarquee />
        <FeaturedWorks />
        <OlderWorks />
        <Contact />
      </main>
    </TechShowcaseProvider>
  );
}
