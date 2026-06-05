import Navbar from "../components/Navbar";
import "../styles/main.css";

function About() {
  return (
    <>
      <Navbar />

      <section className="about-hero">
        <div className="container about-hero-content">

          <div className="about-left">
            <span className="about-tag">🌿 Pure & Natural</span>

            <h1>
              Bringing The Goodness Of
              <span> Cold Pressed Mustard Oil</span>
            </h1>

            <p>
              At Karyor, we believe purity is not just a promise,
              it's a tradition. Our mustard oil is extracted using
              traditional cold pressed methods to preserve its natural
              nutrients, rich aroma, and authentic taste.
            </p>

            <button className="about-btn">
              Explore Products
            </button>
          </div>

          <div className="about-right">
            <img
              src="/mustard-about.jpg"
              alt="Mustard Oil"
            />
          </div>

        </div>

        
      </section>

      <section className="about-story">
       <div className="story-card">

  <div className="story-icon">🌿</div>

  <p>
    For generations, mustard oil has been an essential part of
    Indian kitchens and traditions. At <strong>Karyor</strong>,
    we proudly carry forward this heritage by producing premium
    cold-pressed mustard oil using traditional methods.
  </p>

  <p>
    Every drop is carefully extracted to retain its natural aroma,
    rich flavor, and nutritional goodness, ensuring purity in
    every meal and wellness in every home.
  </p>

  <div className="story-stats">

    <div className="stat-box">
      <h3>100%</h3>
      <span>Natural Oil</span>
    </div>

    <div className="stat-box">
      <h3>Pure</h3>
      <span>Cold Pressed</span>
    </div>

    <div className="stat-box">
      <h3>Fresh</h3>
      <span>Every Batch</span>
    </div>

  </div>

</div>
      </section>

      <section className="about-features">
        <div className="container">

          <div className="section-title">
            <span>WHY CHOOSE US</span>
            <h2>Premium Quality In Every Drop</h2>
          </div>

          <div className="features-grid">

            <div className="feature-card">
              <div className="icon">🌱</div>
              <h3>100% Natural</h3>
              <p>No chemicals, no preservatives.</p>
            </div>

            <div className="feature-card">
              <div className="icon">🛡️</div>
              <h3>Pure & Safe</h3>
              <p>Produced with strict quality standards.</p>
            </div>

            <div className="feature-card">
              <div className="icon">💛</div>
              <h3>Rich Aroma</h3>
              <p>Authentic mustard flavor you can trust.</p>
            </div>

            <div className="feature-card">
              <div className="icon">🏆</div>
              <h3>Premium Quality</h3>
              <p>Crafted using traditional cold press methods.</p>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}

export default About;