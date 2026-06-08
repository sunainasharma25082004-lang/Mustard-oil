import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Contact', to: '/contact' },
];

const SUPPORT_LINKS = [
  { label: 'Distributor', to: '/distributor' },
  { label: 'My Orders', to: '/my-orders' },
  { label: 'Cart', to: '/addcart' },
  { label: 'Checkout', to: '/checkout' },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-glow" />

      <div className="container">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link to="/" className="site-footer-logo-wrap">
              <img src="/logo.jpeg" alt="Karyor" className="site-footer-logo" />
              <span className="site-footer-title">
                <span>KAR</span>YOR
              </span>
            </Link>
            <p>
              Premium black mustard oil crafted with tradition, purity and trust in every drop.
            </p>
            <div className="site-footer-social">
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <i className="bi bi-whatsapp" />
              </a>
              <a href="mailto:info@karyor.com" aria-label="Email">
                <i className="bi bi-envelope" />
              </a>
              <a href="tel:+919876543210" aria-label="Phone">
                <i className="bi bi-telephone" />
              </a>
            </div>
          </div>

          <div className="site-footer-col">
            <h4>Quick Links</h4>
            <ul>
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-col">
            <h4>Support</h4>
            <ul>
              {SUPPORT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-col">
            <h4>Contact</h4>
            <ul className="site-footer-contact">
              <li>
                <i className="bi bi-telephone" />
                <a href="tel:+919876543210" className="footer-link">
                  +91 9876543210
                </a>
              </li>
              <li>
                <i className="bi bi-envelope" />
                <a href="mailto:info@karyor.com" className="footer-link">
                  info@karyor.com
                </a>
              </li>
              <li>
                <i className="bi bi-geo-alt" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p className="copyright">© 2026 KARYOR. All Rights Reserved.</p>
          <p className="site-footer-tag">Pure · Natural · Cold Pressed</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;