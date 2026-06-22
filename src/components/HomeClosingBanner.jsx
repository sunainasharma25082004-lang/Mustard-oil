import { Link } from 'react-router-dom';
import closingBanner from '../assets/home/home-closing-banner.jpg';

function HomeClosingBanner() {
  return (
    <section className="karyorClosingBannerSection">
      <div className="karyorClosingBannerContainer">
        <div className="karyorClosingBannerDesktop">
          <div className="karyorClosingBannerMedia">
            <img
              src={closingBanner}
              alt="Karyor mustard oil — tradition in every drop"
              className="karyorClosingBannerImg"
              loading="lazy"
              decoding="async"
            />
            <div className="karyorClosingBannerActions">
              <Link to="/products" className="karyorHeroShopBtn">
                Explore Products
              </Link>
            </div>
          </div>
        </div>

        <div className="karyorClosingBannerMobile">
          <div className="karyorClosingBannerMobileCopy">
            <span className="karyorClosingBannerEyebrow">PURE TRADITION</span>
            <h2>Every Drop Carries The Karyor Promise</h2>
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