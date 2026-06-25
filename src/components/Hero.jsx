import { Link } from 'react-router-dom';
import { useSiteImages } from '../context/SiteImagesContext';
import { HOME_ASSETS } from '../utils/homeAssets';
import { resolveImageUrl } from '../utils/imageUrl';

const MOBILE_FALLBACK = '/mobile-banner.png';

function Hero() {
  const { heroMobile } = useSiteImages();

  const desktopBanner = resolveImageUrl(HOME_ASSETS.bannerBrand1);
  const mobileBanner = heroMobile || resolveImageUrl(HOME_ASSETS.mobileBanner) || MOBILE_FALLBACK;

  return (
    <section className="karyorHeroSection">
      <div className="karyorHeroContainer">
        <div className="karyorHeroDesktop">
          <div className="karyorHeroMedia">
            <img
              src={desktopBanner}
              alt="Karyor Black Mustard Oil — Every Drop Carries Tradition"
              className="karyorHeroBanner"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + DESKTOP_FALLBACK) {
                  e.currentTarget.src = DESKTOP_FALLBACK;
                }
              }}
            />
            <div className="karyorHeroActions">
              <Link to="/#products" className="karyorHeroShopBtn">
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        <div className="karyorHeroMobile">
          <div className="karyorHeroMobileMedia">
            <img
              src={mobileBanner}
              alt="Karyor Black Mustard Oil — Every Drop Carries Tradition"
              className="karyorHeroMobileBanner"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + MOBILE_FALLBACK) {
                  e.currentTarget.src = MOBILE_FALLBACK;
                }
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;