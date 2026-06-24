export const PROCESS_STEP_CONTENT = [
  {
    key: 'sourcing',
    icon: '🌱',
    title: 'Sourcing',
    text:
      'We source bold mustard seeds directly from farmers known for high oil content and strong pungency.',
    alt: 'Golden mustard fields and fresh mustard seeds',
  },
  {
    key: 'cold-pressing',
    icon: '⚙️',
    title: 'Cold Pressing',
    text:
      'Seeds are pressed slowly at low temperature. One press only, keeping natural nutrients intact.',
    alt: 'Cold pressed mustard oil poured into a traditional kadhai',
  },
  {
    key: 'natural-filtering',
    icon: '✨',
    title: 'Natural Filtering',
    text:
      "Oil is naturally filtered and clarified. No chemicals, no unnecessary processing — only by traditional methods 'cloth, plates'.",
    alt: 'Pure Karyor mustard oil after natural filtering',
  },
  {
    key: 'lab-testing',
    icon: '🧪',
    title: 'Lab Testing',
    text: 'Every batch is tested for purity and quality before bottling.',
    alt: 'Karyor mustard oil tested for purity and quality',
  },
  {
    key: 'sealed-shipped',
    icon: '📦',
    title: 'Sealed & Shipped',
    text: 'Packed carefully and delivered fresh to your home.',
    alt: 'Karyor mustard oil sealed and delivered to your home',
  },
];

export const DEFAULT_PROCESS_STEP_IMAGES = {
  sourcing: '',
  'cold-pressing': '',
  'natural-filtering':
    'https://t4.ftcdn.net/jpg/04/28/39/13/360_F_428391329_rhOO1cHy4gIFlUCvBfq0md0Mzefn0dJi.jpg',
  'lab-testing':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU1jZQpq6-adv87fSgdI7IyvAaSaF_jk9gbxcxQzTnTQ&s=10',
  'sealed-shipped':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUFE0qHUYux6BhcmCn3Mmbj1ZEIOS3KDmbFeU8HEmAoQ&s=10',
};

export function buildDefaultProcessSteps() {
  return PROCESS_STEP_CONTENT.map((step) => ({
    key: step.key,
    image: DEFAULT_PROCESS_STEP_IMAGES[step.key] || '',
  }));
}