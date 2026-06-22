import { Link } from 'react-router-dom';
import { HOME_ASSETS } from '../utils/homeAssets';

function HomeClosingBanner() {
  return (
    <section className="home-collage-section">
      <div className="home-collage-container">
        <div className="home-collage-intro">
          <span className="home-collage-eyebrow">KARYOR COLLECTION</span>
          <h2>Pure Mustard Oil, Crafted With Care</h2>
          <p>
            From mustard fields and seeds to cold pressing and golden oil —
            every step reflects the purity behind Karyor.
          </p>
        </div>

        <div className="home-collage-banner-wrap">
          <img
            src={HOME_ASSETS.homeCollage}
            alt="Mustard oil process collage — pressing, plant, seeds, and golden oil"
            className="home-collage-banner-img"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="home-collage-actions">
          <Link to="/products" className="karyorHeroShopBtn">
            Explore Products
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomeClosingBanner;