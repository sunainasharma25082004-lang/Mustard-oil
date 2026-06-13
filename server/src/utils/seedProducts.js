const Product = require('../models/Product');

const defaultProducts = [
  {
    name: '1 Litre Mustard Oil',
    slug: '1-litre-mustard-oil',
    description: 'Rich aroma and natural purity in every drop. Perfect for everyday cooking with the authentic taste of tradition.',
    price: 349,
    originalPrice: 500,   // Attractive crossed old price for discount display (first product)
    image: '/product-1l.jpg',
    badge: 'Popular',
    size: '1 Litre',
  },
  {
    name: '5 Litre Mustard Oil',
    slug: '5-litre-mustard-oil',
    description: 'Premium economy pack for households and small businesses. Maximum value without compromising on purity.',
    price: 899,
    originalPrice: 1299,  // Attractive crossed old price (good ~31% discount)
    image: '/product-5l.jpg',
    badge: 'Premium',
    size: '5 Litre',
  },
];

const seedProducts = async () => {
  // Permanently remove the two products user no longer wants (500ml and 2L).
  // This runs on server start so the prod DB gets cleaned on next deploy/restart.
  // Future products added via admin (with different slugs) will NOT be touched.
  const slugsToRemove = ['500ml-mustard-oil', '2-litre-mustard-oil'];
  const deleteResult = await Product.deleteMany({ slug: { $in: slugsToRemove } });
  if (deleteResult.deletedCount > 0) {
    console.log(`Removed ${deleteResult.deletedCount} unwanted products (500 ML and 2 Litre no longer seeded/shown)`);
  }

  let added = 0;
  let updated = 0;

  for (const product of defaultProducts) {
    const exists = await Product.findOne({ slug: product.slug });

    if (!exists) {
      await Product.create({ ...product, isActive: true });
      added += 1;
    } else {
      // For these two demo/default products ONLY, always force the current promotional pricing
      // defined above in defaultProducts array.
      // This lets us easily change the "old price" (e.g. 500 instead of 399) here and it will
      // reflect on UI after server restart — without touching any other products admin may have added.
      exists.price = product.price;
      exists.originalPrice = product.originalPrice;
      exists.isActive = true;

      await exists.save();
      updated += 1;
    }
  }

  if (added > 0) {
    console.log(`Default products seeded (${added} new)`);
  }
  if (updated > 0) {
    console.log(`Default products synced with promotional pricing (${updated}) — crossed old price (500/1299) + "Discounted" label + golden badges will show`);
  }
};

module.exports = seedProducts;