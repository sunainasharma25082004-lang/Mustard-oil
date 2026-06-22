import { HOME_ASSETS } from '../utils/homeAssets';

function ProcessKitchenVisual() {
  return (
    <div className="process-kitchen-cinematic" aria-label="Karyor mustard oil being poured into a kitchen kadhai">
      <div className="process-kitchen-frame">
        <div className="process-kitchen-scene-wrap">
          <img
            src={HOME_ASSETS.kitchenPouring}
            alt="Woman pouring mustard oil into kadhai in an Indian kitchen"
            className="process-kitchen-scene"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="process-kitchen-vignette" />
        <div className="process-kitchen-shimmer" />

        <div className="process-kitchen-bottle-overlay">
          <img
            src={HOME_ASSETS.product1L}
            alt="Karyor Black Mustard Oil bottle with label"
            className="process-kitchen-bottle"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="process-kitchen-oil-stream" />
        <div className="process-kitchen-steam process-kitchen-steam-one" />
        <div className="process-kitchen-steam process-kitchen-steam-two" />

        <div className="process-kitchen-ui">
          <span className="process-kitchen-live">
            <span className="process-kitchen-live-dot" />
            Kitchen Moment
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProcessKitchenVisual;