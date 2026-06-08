const Product = require('../models/Product');

const defaultProducts = [
  {
    name: '500 ML Mustard Oil',
    slug: '500ml-mustard-oil',
    description: 'Pure Kachi Ghani Mustard Oil crafted through traditional cold-pressed single-press method for authentic aroma and nutrition.',
    price: 199,
    image: '/product-500ml.jpg',
    badge: 'Best Seller',
    size: '500 ML',
  },
  {
    name: '1 Litre Mustard Oil',
    slug: '1-litre-mustard-oil',
    description: 'Rich aroma and natural purity in every drop. Perfect for everyday cooking with the authentic taste of tradition.',
    price: 349,
    image: '/product-1l.jpg',
    badge: 'Popular',
    size: '1 Litre',
  },
  {
    name: '2 Litre Mustard Oil',
    slug: '2-litre-mustard-oil',
    description: 'Traditional cold pressed process preserving natural nutrients. Ideal family-size pack for regular kitchen use.',
    price: 649,
    image: '/product-2l.jpg',
    badge: 'Family Pack',
    size: '2 Litre',
  },
  {
    name: '5 Litre Mustard Oil',
    slug: '5-litre-mustard-oil',
    description: 'Premium economy pack for households and small businesses. Maximum value without compromising on purity.',
    price: 899,
    image: '/product-5l.jpg',
    badge: 'Premium',
    size: '5 Litre',
  },
];

const seedProducts = async () => {
  let added = 0;

  for (const product of defaultProducts) {
    const exists = await Product.findOne({ slug: product.slug });
    if (!exists) {
      await Product.create(product);
      added += 1;
    }
  }

  if (added > 0) {
    console.log(`Default products seeded (${added} new)`);
  }
};

module.exports = seedProducts;