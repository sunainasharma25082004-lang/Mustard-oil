import { Link } from 'react-router-dom';
import { useSiteImages } from '../context/SiteImagesContext';

const QUICK_LINKS = [
  { label: 'Our Oil', to: '/' },
  { label: 'Why Pure', to: { pathname: '/', hash: '#why-pure' } },
  { label: 'How We Press', to: { pathname: '/', hash: '#how-we-press' } },
  { label: 'Reviews', to: { pathname: '/', hash: '#reviews' } },
];

const EXPLORE_LINKS = [
  { label: 'All Products', to: '/products' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Become Distributor', to: '/distributor' },
  { label: 'My Orders', to: '/my-orders' },
];

function Footer() {
  const { logo } = useSiteImages();

  return (
    <footer className="site-footer">
      <div className="site-footer-glow" />

      <div className="container">
        <div className="site-footer-trust">
          <span>🌿 Cold Pressed & Single Pressed</span>
          <span>🚫 No Chemicals • No Refining</span>
          <span>🇮🇳 Made for Indian Kitchens</span>
        </div>

        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link to="/" className="site-footer-logo-wrap">
              <img src={logo} alt="Karyor" className="site-footer-logo" />
              <span className="site-footer-title">KARYOR</span>
            </Link>
            <p>
              Cold Pressed & Single Pressed Mustard Oil from Karyor Farms. Traditional Kachi Ghani, rich in natural goodness for your family&apos;s kitchen.
            </p>
            <div className="site-footer-social">
              <a href="https://wa.me/918708621377" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <i className="bi bi-whatsapp" />
              </a>
              <a href="mailto:karyorfarms@gmail.com" aria-label="Email">
                <i className="bi bi-envelope" />
              </a>
              <a href="tel:+918708621377" aria-label="Phone">
                <i className="bi bi-telephone" />
              </a>
            </div>
          </div>

          <div className="site-footer-col">
            <h4>Quick Links</h4>
            <ul>
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-col">
            <h4>Explore</h4>
            <ul>
              {EXPLORE_LINKS.map((link) => (
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
                <a href="tel:+918708621377" className="footer-link">
                  +91 87086 21377
                </a>
              </li>
              <li>
                <i className="bi bi-envelope" />
                <a href="mailto:karyorfarms@gmail.com" className="footer-link">
                  karyorfarms@gmail.com
                </a>
              </li>
              <li>
                <i className="bi bi-geo-alt" />
                <span>
                  23/14, Mirzapur Rd, Vishvakarma colony, Government Colony, New Jawahar Nagar, Hisar, Haryana 125001
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p className="copyright">© 2026 KARYOR. All Rights Reserved.</p>
          <p className="site-footer-tag">Pure · Natural · Cold Pressed & Single Pressed</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;