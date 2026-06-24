import '../styles/main.css';
import { useMemo } from 'react';
import { useSiteImages } from '../context/SiteImagesContext';
import { resolveImageUrl } from '../utils/imageUrl';
import { HOME_ASSETS } from '../utils/homeAssets';
import { PROCESS_STEP_CONTENT } from '../utils/processStepsDefaults';

const PROCESS_IMAGE_FALLBACKS = {
  sourcing: HOME_ASSETS.processSourcing,
  'cold-pressing': HOME_ASSETS.processColdPress,
  'natural-filtering': HOME_ASSETS.bottle,
  'lab-testing': HOME_ASSETS.product1L,
  'sealed-shipped': HOME_ASSETS.processShipping,
};

function AboutSection() {
  const { processSteps } = useSiteImages();

  const steps = useMemo(() => {
    const imageByKey = Object.fromEntries(
      (processSteps || []).map((item) => [item.key, item.image])
    );

    return PROCESS_STEP_CONTENT.map((step) => ({
      ...step,
      image: imageByKey[step.key] || PROCESS_IMAGE_FALLBACKS[step.key] || '',
    }));
  }, [processSteps]);

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
          {steps.map((step, index) => (
            <article
              className={`process-card${index % 2 === 1 ? ' process-card--reverse' : ''}`}
              key={step.key}
            >
              <span className="process-card-index">{String(index + 1).padStart(2, '0')}</span>

              <div className="process-card-media">
                <img
                  src={resolveImageUrl(step.image)}
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