import coldPressedImg from '../assets/coldpressed.jpg';
import singlePressedImg from '../assets/single pressed.jpg';

const PRESSING_ITEMS = [
  {
    image: coldPressedImg,
    title: 'Cold Pressed',
    text: 'Mustard seeds are pressed at low temperature so natural nutrients, aroma and colour stay intact.',
    tag: 'Low Heat',
  },
  {
    image: singlePressedImg,
    title: 'Single Pressed',
    text: 'Oil is extracted in one press only — no re-pressing, no over-processing, just pure mustard goodness.',
    tag: 'One Press',
  },
];

function PressingMethodSection() {
  return (
    <section className="pressing-method-section" id="pressing-method">
      <div className="container">
        <div className="section-title pressing-method-header">
          <span>TRADITIONAL EXTRACTION</span>
          <h1>Cold Pressed & Single Pressed</h1>
          <p>
            Two principles that define Karyor — gentle cold pressing and a single press
            that keeps mustard oil pure, aromatic, and true to tradition.
          </p>
        </div>

        <div className="pressing-method-grid">
          {PRESSING_ITEMS.map((item) => (
            <article className="pressing-method-card" key={item.title}>
              <div className="pressing-method-media">
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                <span className="pressing-method-tag">{item.tag}</span>
              </div>
              <div className="pressing-method-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PressingMethodSection;