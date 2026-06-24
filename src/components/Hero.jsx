import { Link } from 'react-router-dom';
import { useSiteImages } from '../context/SiteImagesContext';
import { HOME_ASSETS } from '../utils/homeAssets';
import { resolveImageUrl } from '../utils/imageUrl';

function Hero() {
  const { heroDesktop, heroMobile } = useSiteImages();

  const desktopBanner = heroDesktop || resolveImageUrl(HOME_ASSETS.bannerBrand1);
  const mobileBanner = heroMobile || resolveImageUrl(HOME_ASSETS.mobileBanner);

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
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;