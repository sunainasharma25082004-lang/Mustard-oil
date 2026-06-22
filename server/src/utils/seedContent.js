const Certificate = require('../models/Certificate');
const Recipe = require('../models/Recipe');

const defaultCertificates = [
  {
    title: 'FSSAI Certified',
    description: 'Licensed and compliant with Food Safety and Standards Authority of India regulations.',
    image: '/logo.jpeg',
    sortOrder: 1,
  },
  {
    title: 'ISO Certified',
    description: 'Quality management aligned with international ISO standards for food production.',
    image: '/logo.jpeg',
    sortOrder: 2,
  },
  {
    title: 'Organic Certification',
    description: 'Naturally processed mustard oil — no chemical refining, bleaching or adulteration.',
    image: '/logo.jpeg',
    sortOrder: 3,
  },
];

const defaultRecipes = [
  {
    title: 'Sarson Ka Saag with Karyor Mustard Oil',
    slug: 'sarson-ka-saag',
    description: 'Classic Punjabi winter dish made richer with cold pressed mustard oil tadka.',
    image: '/bottle.png',
    prepTime: '20 mins',
    cookTime: '45 mins',
    servings: '4 people',
    ingredients: [
      '500g mustard greens (sarson), washed and chopped',
      '200g spinach, washed and chopped',
      '2 green chillies',
      '1 inch ginger',
      '4 cloves garlic',
      '3 tbsp Karyor Cold Pressed Mustard Oil',
      '1 tsp cornmeal or makki ka atta',
      'Salt to taste',
    ],
    steps: [
      'Pressure cook mustard greens, spinach, ginger, garlic and chillies with a little water until soft.',
      'Blend into a coarse paste and simmer on low heat for 15 minutes.',
      'Stir in cornmeal and cook until the saag thickens.',
      'Heat Karyor mustard oil in a small pan, add chopped garlic and dried red chilli for tadka.',
      'Pour the sizzling tadka over the saag and serve hot with makki di roti.',
    ],
    isActive: true,
  },
  {
    title: 'Aloo Posto',
    slug: 'aloo-posto',
    description: 'Bengali potato curry finished with a fragrant mustard oil tempering.',
    image: '/bottle.png',
    prepTime: '15 mins',
    cookTime: '25 mins',
    servings: '3 people',
    ingredients: [
      '4 medium potatoes, cubed',
      '3 tbsp poppy seeds, soaked and ground',
      '2 green chillies, slit',
      '1 tsp nigella seeds (kalonji)',
      '3 tbsp Karyor Cold Pressed Mustard Oil',
      '1/2 tsp turmeric powder',
      'Salt to taste',
    ],
    steps: [
      'Heat 2 tbsp Karyor mustard oil and lightly fry potato cubes until golden. Set aside.',
      'In the same pan, add remaining oil, nigella seeds and green chillies.',
      'Add poppy seed paste, turmeric, salt and a splash of water. Cook for 5 minutes.',
      'Return potatoes to the pan, cover and simmer until tender.',
      'Serve with steamed rice.',
    ],
    isActive: true,
  },
  {
    title: 'Crispy Mustard Oil Fish Fry',
    slug: 'mustard-oil-fish-fry',
    description: 'Coastal-style fish fry where mustard oil brings depth and crispness.',
    image: '/bottle.png',
    prepTime: '20 mins',
    cookTime: '15 mins',
    servings: '2 people',
    ingredients: [
      '4 fish fillets (pomfret or bhetki)',
      '2 tbsp Karyor Cold Pressed Mustard Oil for marinade',
      '4 tbsp Karyor mustard oil for shallow frying',
      '1 tsp turmeric powder',
      '1 tsp red chilli powder',
      '1/2 tsp cumin powder',
      'Juice of 1 lemon',
      'Salt to taste',
      'Rice flour for coating',
    ],
    steps: [
      'Marinate fish with turmeric, chilli powder, cumin, lemon juice, salt and 2 tbsp mustard oil for 20 minutes.',
      'Lightly coat each fillet in rice flour.',
      'Heat mustard oil in a flat pan until it shimmers.',
      'Shallow fry fish on medium heat, 4–5 minutes per side, until crisp and golden.',
      'Drain on kitchen paper and serve with onion rings and lemon wedges.',
    ],
    isActive: true,
  },
];

const seedContent = async () => {
  const certCount = await Certificate.countDocuments();
  if (certCount === 0) {
    await Certificate.insertMany(defaultCertificates);
    console.log('Default certificates seeded');
  }

  const recipeCount = await Recipe.countDocuments();
  if (recipeCount === 0) {
    await Recipe.insertMany(defaultRecipes);
    console.log('Default recipes seeded');
  }
};

module.exports = seedContent;