import '../styles/main.css';

const HIGHLIGHTS = [
  { icon: 'bi-award-fill', title: 'A1 Grade Mustard Seeds', desc: 'Handpicked premium seeds with high oil content and rich pungency.' },
  { icon: 'bi-gem', title: 'Premium Mustard Seeds', desc: 'Sourced from trusted farmers known for authentic mustard quality.' },
  { icon: 'bi-flower1', title: '100% Natural', desc: 'Cold Pressed & Single Pressed Mustard Oil with zero artificial additives.' },
  { icon: 'bi-shield-check', title: 'Chemical Free', desc: 'No hexane, no bleaching, no deodorising — pure oil as nature intended.' },
];

function QualityHighlights() {
  return (
    <section className="quality-highlights-section" id="quality">
      <div className="container">
        <div className="section-title quality-highlights-header">
          <span>OUR PROMISE</span>
          <h2>Product Quality Highlights</h2>
        </div>
        <div className="quality-highlights-grid">
          {HIGHLIGHTS.map((item) => (
            <article className="quality-highlight-card" key={item.title}>
              <div className="quality-highlight-badge">
                <div className="quality-highlight-icon">
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                </div>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default QualityHighlights;