import { TechShowcaseProvider } from '../context/TechShowcaseContext';
import Hero from '../components/Hero';
import BrandMarquee from '../components/BrandMarquee';
import FeaturedWorks from '../components/FeaturedWorks';
import OlderWorks from '../components/OlderWorks';
import BlogCTA from '../components/BlogCTA';
import Contact from '../components/Contact';

export default function HomePage() {
  return (
    <TechShowcaseProvider>
      <main>
        <Hero />
        <BrandMarquee />
        <FeaturedWorks />
        <OlderWorks />
        <BlogCTA />
        <Contact />
      </main>
    </TechShowcaseProvider>
  );
}
