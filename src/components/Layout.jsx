import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsappButton from './WhatsappButton';

function Layout() {
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