import '../styles/main.css';
import { HOME_ASSETS } from '../utils/homeAssets';

const PROCESS_STEPS = [
  {
    icon: '🌱',
    title: 'Sourcing',
    text:
      'We source bold mustard seeds directly from farmers known for high oil content and strong pungency.',
    image: HOME_ASSETS.processSourcing,
    alt: 'Golden mustard fields and fresh mustard seeds',
  },
  {
    icon: '⚙️',
    title: 'Cold Pressing',
    text:
      'Seeds are pressed slowly at low temperature. One press only, keeping natural nutrients intact.',
    image: HOME_ASSETS.processColdPress,
    alt: 'Cold pressed mustard oil poured into a traditional kadhai',
  },
  {
    icon: '✨',
    title: 'Natural Settling',
    text:
      "Oil is naturally filtered and clarified. No chemicals, no unnecessary processing — only by traditional methods 'cloth, plates'.",
    image: 'https://t4.ftcdn.net/jpg/04/28/39/13/360_F_428391329_rhOO1cHy4gIFlUCvBfq0md0Mzefn0dJi.jpg',
    alt: 'Pure Karyor mustard oil bottle after natural settling',
  },
  {
    icon: '🧪',
    title: 'Lab Testing',
    text: 'Every batch is tested for purity and quality before bottling.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU1jZQpq6-adv87fSgdI7IyvAaSaF_jk9gbxcxQzTnTQ&s=10',
    alt: 'Karyor 1 litre mustard oil — lab tested for purity',
  },
  {
    icon: '📦',
    title: 'Sealed & Shipped',
    text: 'Packed carefully and delivered fresh to your home.',
    image: HOME_ASSETS.processShipping,
    alt: 'Karyor mustard oil used fresh in a home kitchen',
  },
];

function AboutSection() {
  return (
    <section id="how-we-press" className="process-section">
      <div className="process-container">
        <div className="process-intro">
          <span className="process-tag">FARM TO KITCHEN</span>
          <h1>
            From field to your kitchen.
            <br />
            No shortcuts.
          </h1>
        </div>

        <div className="process-list">
          {PROCESS_STEPS.map((step, index) => (
            <article
              className={`process-card${index % 2 === 1 ? ' process-card--reverse' : ''}`}
              key={step.title}
            >
              <span className="process-card-index">{String(index + 1).padStart(2, '0')}</span>

              <div className="process-card-media">
                <img
                  src={step.image}
                  alt={step.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="process-card-body">
                <div className="process-card-head">
                  <span className="process-card-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                  <h3>{step.title}</h3>
                </div>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;