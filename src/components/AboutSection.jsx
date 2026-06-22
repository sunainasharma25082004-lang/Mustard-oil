import "../styles/main.css";
import { HOME_ASSETS } from '../utils/homeAssets';

function AboutSection() {
  return (
    <>
      {/* PURITY SECTION */}
      <section id="why-pure" className="purity-section">

        <div className="purity-intro-layout">
          <div className="section-title purity-intro-copy">
            <span>THE KARYOR DIFFERENCE</span>
            <h1>Why purity is not a buzzword for us.</h1>

            <p>
              Refined oil is cheap to produce and long-lasting.
              But the refining process strips everything that makes
              mustard oil beneficial. We chose the harder path.
            </p>
          </div>

          <div className="purity-intro-visual">
            <img
              src={HOME_ASSETS.mustardFarm}
              alt="Golden mustard fields and cold pressed oil"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="purity-grid">

          <div className="purity-card">
            <div>❄️</div>
            <h3>Cold Pressed & Single Pressed</h3>
            <p>
              Pressed only once at low temperature.
              Heat destroys nutrients — we never use it.
            </p>
          </div>


          <div className="purity-card active">
            <div>🌿</div>
            <h3>Zero Refining</h3>
            <p>
              No bleaching, deodorising, or chemical treatment.
              What leaves our press is what reaches you.
            </p>
          </div>


          <div className="purity-card">
            <div>💗</div>
            <h3>Rich in Omega-3 & MUFA</h3>
            <p>
              Natural fatty acid profile intact —
              supports heart health and wellness.
            </p>
          </div>


          <div className="purity-card active">
            <div>⚗️</div>
            <h3>No Hexane Extraction</h3>
            <p>
              No petroleum solvents.
              Only traditional extraction methods.
            </p>
          </div>


          <div className="purity-card">
            <div>🧂</div>
            <h3>Full Pungency</h3>
            <p>
              Natural aroma and authentic mustard
              taste preserved.
            </p>
          </div>


          <div className="purity-card active">
            <div>🏅</div>
            <h3>Lab Tested Purity</h3>
            <p>
              Every batch tested before it reaches
              your kitchen.
            </p>
          </div>


        </div>

      </section>




      {/* PROCESS SECTION */}

      <section id="how-we-press" className="process-section">

        <div className="process-container">

          <div className="process-hero-layout">
            <div className="process-hero-copy">
              <span className="process-tag">
                FARM TO KITCHEN
              </span>

              <h1>
                From field to your kitchen.
                <br/>
                No shortcuts.
              </h1>
            </div>

            <div className="process-hero-visual">
              <img
                src={HOME_ASSETS.bottle}
                alt="Karyor labelled mustard oil bottle"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div className="process-list">


            <div className="process-item">
              <span>🌱</span>

              <div>
                <h3>Sourcing</h3>
                <p>
                  We source bold mustard seeds directly from
                  farmers known for high oil content and strong pungency.
                </p>
              </div>

            </div>



            <div className="process-item">
              <span>⚙️</span>

              <div>
                <h3>Cold Pressing</h3>
                <p>
                  Seeds are pressed slowly at low temperature.
                  One press only, keeping natural nutrients intact.
                </p>
              </div>

            </div>




            <div className="process-item">

              <span>🫙</span>

              <div>

                <h3>Natural Settling</h3>

                <p>
                  Oil is naturally settled and clarified.
                  No chemicals, no unnecessary processing.
                </p>

              </div>

            </div>




            <div className="process-item">

              <span>🧪</span>

              <div>

                <h3>Lab Testing</h3>

                <p>
                  Every batch is tested for purity and quality
                  before bottling.
                </p>

              </div>

            </div>



            <div className="process-item">

              <span>📦</span>

              <div>

                <h3>Sealed & Shipped</h3>

                <p>
                  Packed carefully and delivered fresh
                  to your home.
                </p>

              </div>

            </div>



          </div>


        </div>

      </section>


    </>
  );
}

export default AboutSection;