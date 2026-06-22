import { HOME_ASSETS } from '../utils/homeAssets';

const GALLERY_ITEMS = [
  {
    image: HOME_ASSETS.mustardFarm,
    title: 'From Mustard Fields',
    text: 'Premium seeds sourced for rich oil and natural pungency.',
    tag: 'Farm Fresh',
  },
  {
    image: HOME_ASSETS.product1L,
    title: '1 Litre Home Pack',
    text: 'Everyday kitchen size with full Karyor labelling on bottle.',
    tag: 'Best Seller',
  },
  {
    image: HOME_ASSETS.product5L,
    title: '5 Litre Family Pack',
    text: 'More oil for larger families and regular cooking needs.',
    tag: 'Family Size',
  },
  {
    image: HOME_ASSETS.mustardAbout,
    title: 'Cold Pressed Goodness',
    text: 'Single pressed mustard oil — pure, aromatic, and nutrient-rich.',
    tag: 'Pure Oil',
  },
];

function HomeGallerySection() {
  return (
    <section className="home-gallery-section">
      <div className="container">
        <div className="section-title home-gallery-header">
          <span>SEE THE DIFFERENCE</span>
          <h1>Pure Mustard Oil, Beautifully Crafted</h1>
          <p>
            Real product photography and kitchen moments that show what Karyor stands for —
            tradition, purity, and trust in every drop.
          </p>
        </div>

        <div className="home-gallery-grid">
          {GALLERY_ITEMS.map((item) => (
            <article className="home-gallery-card" key={item.title}>
              <div className="home-gallery-media">
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                <span className="home-gallery-tag">{item.tag}</span>
              </div>
              <div className="home-gallery-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="home-gallery-banner">
          <img
            src={HOME_ASSETS.bannerBrand}
            alt="Karyor mustard oil brand banner"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

export default HomeGallerySection;