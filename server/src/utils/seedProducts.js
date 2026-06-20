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

  let added = 0;

  for (const product of defaultProducts) {
    const exists = await Product.findOne({ slug: product.slug });

    if (!exists) {
      // Only create defaults on first run — never overwrite admin edits on restart/deploy.
      await Product.create({ ...product, isActive: true });
      added += 1;
    }
  }

  if (added > 0) {
    console.log(`Default products seeded (${added} new) — admin changes are kept on future restarts`);
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
};

module.exports = seedProducts;