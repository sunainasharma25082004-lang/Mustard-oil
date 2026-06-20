import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="karyorHeroSection">
      <div className="karyorHeroContainer">
        <div className="karyorHeroMedia">
          <picture>
            <source media="(max-width: 768px)" srcSet="/banner-mobile.jpg" />
            <img
              src="/banner-img.png"
              alt="Karyor Black Mustard Oil — Every Drop Carries Tradition"
              className="karyorHeroBanner"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="karyorHeroActions">
            <Link to="/#products" className="karyorHeroShopBtn">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;