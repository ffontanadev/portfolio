import Navigation from './components/Navigation';
import Hero from './components/Hero';
import BrandMarquee from './components/BrandMarquee';
import FeaturedWorks from './components/FeaturedWorks';
import OlderWorks from './components/OlderWorks';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import { AppContextProvider } from './contexts/AppContext';

function App() {
  return (
    <AppContextProvider>
      <div className="bg-cream-50 min-h-screen text-dark-900 font-sans selection:bg-coral-500 selection:text-white">
        <Navigation />

        <main>
          <Hero />
          <BrandMarquee />
          <FeaturedWorks />
          <OlderWorks />
          <Contact />
        </main>
        <Footer />

        {/* AI Portfolio Assistant */}
        <ChatWidget />
      </div>
    </AppContextProvider>
  );
}

export default App;
