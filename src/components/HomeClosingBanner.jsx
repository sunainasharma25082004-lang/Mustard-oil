import { Link } from 'react-router-dom';
import { HOME_ASSETS } from '../utils/homeAssets';
import coldPressedImg from '../assets/coldpressed.jpg';
import singlePressedImg from '../assets/single pressed.jpg';

const COLLAGE_ITEMS = [
  {
    image: HOME_ASSETS.product1L,
    label: '1 Litre Pack',
    caption: 'Labelled Karyor bottle',
  },
  {
    image: coldPressedImg,
    label: 'Cold Pressed',
    caption: 'Low heat extraction',
  },
  {
    image: singlePressedImg,
    label: 'Single Pressed',
    caption: 'One press only',
  },
  {
    image: HOME_ASSETS.product5L,
    label: '5 Litre Family Pack',
    caption: 'For everyday cooking',
  },
];

function HomeClosingBanner() {
  return (
    <section className="home-collage-section">
      <div className="home-collage-container">
        <div className="home-collage-desktop">
          <div className="home-collage-intro">
            <span className="home-collage-eyebrow">KARYOR COLLECTION</span>
            <h2>Pure Mustard Oil, Crafted With Care</h2>
            <p>
              A modern look at our traditional process — from pressing to bottle,
              every detail reflects premium quality.
            </p>
          </div>

          <div className="home-collage-grid">
            {COLLAGE_ITEMS.map((item) => (
              <figure className="home-collage-item" key={item.label}>
                <div className="home-collage-media">
                  <img src={item.image} alt={item.label} loading="lazy" decoding="async" />
                </div>
                <figcaption>
                  <strong>{item.label}</strong>
                  <span>{item.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="home-collage-actions">
            <Link to="/products" className="karyorHeroShopBtn">
              Explore Products
            </Link>
          </div>
        </div>

        <div className="home-collage-mobile">
          <div className="karyorClosingBannerMobileCopy">
            <span className="karyorClosingBannerEyebrow">KARYOR COLLECTION</span>
            <h2>Pure Mustard Oil, Crafted With Care</h2>
            <p>
              Cold Pressed & Single Pressed mustard oil for Indian kitchens —
              rich aroma, natural colour, and purity you can trust in every meal.
            </p>
            <Link to="/products" className="karyorHeroShopBtn">
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeClosingBanner;