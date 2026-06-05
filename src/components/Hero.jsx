import React from 'react';
import '../styles/main.css';


function Hero() {
  return (
    <section className="karyorHeroSection">
      <div className="karyorHeroContainer">
        <img
          src="/banner-img.png"
          alt="Karyor Banner"
          className="karyorHeroBanner"
        />
      </div>
    </section>
  );
}

export default Hero;