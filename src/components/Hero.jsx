import '../styles/main.css';

function Hero() {
  return (
    <section className="karyorHeroSection">
      <div className="karyorHeroContainer">
        <picture>
          <source media="(max-width: 768px)" srcSet="/banner-mobile.jpg" />
          <img
            src="/banner-img.png"
            alt="Karyor Black Mustard Oil — Every Drop Carries Tradition"
            className="karyorHeroBanner"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>
    </section>
  );
}

export default Hero;