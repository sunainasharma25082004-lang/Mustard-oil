import { Link } from 'react-router-dom';

const MOBILE_BADGES = [
  { title: 'Cold Pressed', text: 'Traditional extraction' },
  { title: '90+ Legacy', text: 'Years of trust' },
  { title: 'No Chemicals', text: 'Pure & natural' },
];

function Hero() {
  return (
    <section className="karyorHeroSection">
      <div className="karyorHeroContainer">
        {/* Desktop / large tablet — full banner image */}
        <div className="karyorHeroDesktop">
          <div className="karyorHeroMedia">
            <img
              src="/banner-img.png"
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

        {/* Mobile — real product photo + separate CTA (no overlap) */}
        <div className="karyorHeroMobile">
          <p className="karyorHeroMobileEyebrow">Every Drop Carries Tradition</p>
          <h2 className="karyorHeroMobileTitle">
            Pure by Tradition.
            <br />
            Aged for Perfection.
          </h2>

          <div className="karyorHeroMobileStage" aria-hidden="false">
            <div className="karyorHeroMobileStageGlow" />
            <div className="karyorHeroMobileBottle">
              <img
                src="/uploads/products/mustard1ml.jpg"
                alt="Karyor 1L Cold Pressed Black Mustard Oil — plastic bottle"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>

          <div className="karyorHeroMobileBadges">
            {MOBILE_BADGES.map((badge) => (
              <div className="karyorHeroMobileBadge" key={badge.title}>
                <strong>{badge.title}</strong>
                {badge.text}
              </div>
            ))}
          </div>

          <div className="karyorHeroMobileCta">
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