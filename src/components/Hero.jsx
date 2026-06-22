import { Link } from 'react-router-dom';
import { useSiteImages } from '../context/SiteImagesContext';

function Hero() {
  const { heroDesktop, heroMobile } = useSiteImages();
  return (
    <section className="karyorHeroSection">
      <div className="karyorHeroContainer">
        {/* Desktop / large tablet — full banner image */}
        <div className="karyorHeroDesktop">
          <div className="karyorHeroMedia">
            <img
              src={heroDesktop}
              alt="Karyor Black Mustard Oil — Every Drop Carries Tradition"
              className="karyorHeroBanner"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="karyorHeroActions">
              <Link to="/#products" className="karyorHeroShopBtn">
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile — full banner image + Shop Now below bottle (like laptop) */}
        <div className="karyorHeroMobile">
          <div className="karyorHeroMobileMedia">
            <img
              src={heroMobile}
              alt="Karyor Black Mustard Oil — Every Drop Carries Tradition"
              className="karyorHeroMobileBanner"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="karyorHeroMobileActions">
              <Link to="/products" className="karyorHeroShopBtn">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;