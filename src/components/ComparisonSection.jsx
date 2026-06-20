import '../styles/testimonials.css';

const COMPARISON_ROWS = [
  ['Health Benefits', 'Rich Omega-3 & MUFA intact', 'Nutrients stripped during refining'],
  ['Processing Method', 'Single cold press — no heat', 'High heat + chemical solvents'],
  ['Nutritional Value', 'Full natural profile preserved', 'Significantly reduced'],
  ['Chemical-Free Advantages', 'No hexane, bleach or deodoriser', 'Chemical refining standard'],
  ['Cold Pressed Benefits', 'Natural aroma, colour & pungency', 'Artificially lightened & neutralised'],
];

function ComparisonSection() {
  return (
    <section className="comparison-section" id="comparison">
      <div className="container">
        <span className="small-heading">PURE VS REFINED</span>
        <h2>Karyor Mustard Oil vs Refined Oil</h2>
        <p className="comparison-intro">
          See why Cold Pressed & Single Pressed Mustard Oil is the healthier choice for your kitchen.
        </p>

        <div className="comparison-table">
          <div className="table-head">
            <div>Parameter</div>
            <div>Karyor Mustard Oil</div>
            <div>Refined Oil</div>
          </div>

          {COMPARISON_ROWS.map((row) => (
            <div className="table-row" key={row[0]}>
              <div>{row[0]}</div>
              <div>{row[1]}</div>
              <div>{row[2]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComparisonSection;