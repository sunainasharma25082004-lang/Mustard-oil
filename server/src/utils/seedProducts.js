const Product = require('../models/Product');
const Settings = require('../models/Settings');

const defaultProducts = [
  {
    name: '1 Litre Mustard Oil',
    slug: '1-litre-mustard-oil',
    description: 'Rich aroma and natural purity in every drop. Perfect for everyday cooking with the authentic taste of tradition.',
    price: 350,
    originalPrice: 422,
    image: '/uploads/products/mustard1ml.jpg',
    images: [
      '/uploads/products/mustard1ml.jpg',
      '/product-1l.jpg',
      '/bottle.png',
      '/mustard1ml.jpg',
      '/product.png',
    ],
    badge: 'Popular',
    size: '1 Litre',
  },
  {
    name: '5 Litre Mustard Oil',
    slug: '5-litre-mustard-oil',
    description: 'Premium economy pack for households and small businesses. Maximum value without compromising on purity.',
    price: 1700,
    originalPrice: 2110,
    image: '/uploads/products/mustard5ml.jpg',
    images: [
      '/uploads/products/mustard5ml.jpg',
      '/product-5l.jpg',
      '/bottle51.png',
      '/mustard5ml.jpg',
      '/product2.png',
    ],
    badge: 'Premium',
    size: '5 Litre',
  },
];

const seedProducts = async () => {
  // One-time cleanup: remove legacy products that are no longer offered.
  const slugsToRemove = ['500ml-mustard-oil', '2-litre-mustard-oil'];
  const deleteResult = await Product.deleteMany({ slug: { $in: slugsToRemove } });
  if (deleteResult.deletedCount > 0) {
    console.log(`Removed ${deleteResult.deletedCount} legacy products (500 ML and 2 Litre)`);
  }

  const INITIAL_SEED_KEY = 'initial-products-seeded';
  const initialSeedFlag = await Settings.findOne({ key: INITIAL_SEED_KEY });

  let added = 0;

  if (!initialSeedFlag) {
    for (const product of defaultProducts) {
      const exists = await Product.findOne({ slug: product.slug });

      if (!exists) {
        await Product.create({ ...product, isActive: true });
        added += 1;
      }
    }

    if (added > 0) {
      console.log(`Default products seeded (${added} new) — admin changes are kept on future restarts`);
    }

    await Settings.create({ key: INITIAL_SEED_KEY });
  }

  // One-time pricing update — runs once on deploy, then admin edits stay permanent.
  const PRICING_MIGRATION_KEY = 'product-pricing-jun-2026';
  const migrationFlag = await Settings.updateOne(
    { key: PRICING_MIGRATION_KEY },
    { $setOnInsert: { key: PRICING_MIGRATION_KEY, defaultDeliveryDays: 1 } },
    { upsert: true }
  );

  if (migrationFlag.upsertedCount > 0) {
    for (const product of defaultProducts) {
      await Product.updateOne(
        { slug: product.slug },
        { $set: { price: product.price, originalPrice: product.originalPrice } }
      );
    }
    console.log('Product pricing updated: 1L MRP ₹422 → ₹350 | 5L MRP ₹2110 → ₹1700');
  }

  const IMAGES_MIGRATION_KEY = 'product-images-gallery-jun-2026';
  const imagesMigrationFlag = await Settings.updateOne(
    { key: IMAGES_MIGRATION_KEY },
    { $setOnInsert: { key: IMAGES_MIGRATION_KEY, defaultDeliveryDays: 1 } },
    { upsert: true }
  );

  if (imagesMigrationFlag.upsertedCount > 0) {
    for (const product of defaultProducts) {
      await Product.updateOne(
        {
          slug: product.slug,
          $or: [{ images: { $exists: false } }, { images: { $size: 0 } }],
        },
        {
          $set: {
            images: product.images,
            image: product.images[0],
          },
        }
      );
    }
    console.log('Product gallery images seeded for default products');
  }
};

module.exports = seedProducts;