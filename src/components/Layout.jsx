import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsappButton from './WhatsappButton';

function Layout() {
  const location = useLocation();

  // Scroll to top on every page navigation (new route render), except for hash anchors (e.g. home sections)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Small delay to ensure the target section has mounted
      const timeout = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const headerOffset = 80; // account for fixed navbar
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 80);

      return () => clearTimeout(timeout);
    } else {
      // When navigating to any other page (products, detail, cart, about, etc.),
      // always start from the top of the new page
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="site-layout">
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      <WhatsappButton />
    </div>
  );
}

export default Layout;