import { Link } from 'react-router-dom';
import { HOME_ASSETS } from '../utils/homeAssets';

function KitchenExperienceSection() {
  return (
    <section className="home-kitchen-section" id="kitchen-experience">
      <div className="container home-kitchen-layout">
        <div className="home-kitchen-copy">
          <span className="home-kitchen-eyebrow">IN YOUR KITCHEN</span>
          <h2>From Karyor Bottle to Your Kadhai</h2>
          <p>
            Every meal starts with the right oil. Pour Karyor Cold Pressed Black Mustard Oil
            into your kadhai or pan and bring home the natural aroma, colour, and pungency
            that refined oils can never match.
          </p>
          <ul className="home-kitchen-points">
            <li>Perfect for tadka, frying, and everyday Indian cooking</li>
            <li>Authentic mustard flavour with zero chemical processing</li>
            <li>Clearly labelled Karyor bottle — know exactly what you are using</li>
          </ul>
          <Link to="/products" className="home-kitchen-cta">
            Shop Karyor Oil
          </Link>
        </div>

        <div className="home-kitchen-visual">
          <img
            src={HOME_ASSETS.kitchenKadhai}
            alt=""
            className="home-kitchen-bg"
            loading="lazy"
            decoding="async"
          />
          <div className="home-kitchen-overlay" />
          <div className="home-kitchen-pour" />
          <div className="home-kitchen-bottle-wrap">
            <img
              src={HOME_ASSETS.product1L}
              alt="Karyor Black Mustard Oil 1 Litre bottle with label"
              className="home-kitchen-bottle"
              loading="lazy"
              decoding="async"
            />
            <span className="home-kitchen-label-badge">KARYOR • 1 L</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default KitchenExperienceSection;