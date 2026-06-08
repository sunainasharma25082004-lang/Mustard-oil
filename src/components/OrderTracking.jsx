const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'We received your order' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Order is being prepared' },
  { key: 'shipped', label: 'Shipped', desc: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your order!' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

const getStepState = (status, stepKey) => {
  const currentIdx = STATUS_ORDER.indexOf(status);
  const stepIdx = STATUS_ORDER.indexOf(stepKey);
  if (currentIdx < 0) return 'upcoming';
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'upcoming';
};

export const formatOrderDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const formatOrderDateLong = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

export const getDeliveryEtaText = (expectedDeliveryDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expected = new Date(expectedDeliveryDate);
  expected.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expected - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Delivery overdue', days: diffDays, tone: 'overdue' };
  if (diffDays === 0) return { label: 'Arriving today', days: 0, tone: 'today' };
  if (diffDays === 1) return { label: 'Arriving tomorrow', days: 1, tone: 'soon' };
  return { label: `${diffDays} days left`, days: diffDays, tone: 'normal' };
};

export const USER_CANCELLABLE_STATUSES = ['pending'];

function OrderTracking({ status, compact = false }) {
  if (status === 'cancelled') return null;

  return (
    <div className={`order-tracking ${compact ? 'order-tracking-compact' : ''}`}>
      <div className="tracking-steps">
        {TRACKING_STEPS.map((step, i) => {
          const state = getStepState(status, step.key);
          return (
            <div className={`tracking-step tracking-step-${state}`} key={step.key}>
              <div className="tracking-step-marker">
                <span className="tracking-dot" />
                {i < TRACKING_STEPS.length - 1 && <span className="tracking-line" />}
              </div>
              <div className="tracking-step-content">
                <span className="tracking-step-label">{step.label}</span>
                {!compact && <span className="tracking-step-desc">{step.desc}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTracking;