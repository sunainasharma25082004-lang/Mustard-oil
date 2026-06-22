import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsappButton from './WhatsappButton';
import { scrollToSection } from '../utils/scrollToSection';
import { SiteImagesProvider } from '../context/SiteImagesContext';

function Layout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      return scrollToSection(id);
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    return undefined;
  }, [location.pathname, location.hash]);

  return (
    <SiteImagesProvider>
      <div className="site-layout">
        <Navbar />
        <main className="site-main">
          <Outlet />
        </main>
        <Footer />
        <WhatsappButton />
      </div>
    </SiteImagesProvider>
  );
}

export default Layout;