const SiteImages = require('../models/SiteImages');
const { DEFAULT_SITE_IMAGES } = require('./siteImagesDefaults');

const SITE_IMAGES_KEY = 'site-images';

const seedSiteImages = async () => {
  const existing = await SiteImages.findOne({ key: SITE_IMAGES_KEY });
  if (existing) return;

  await SiteImages.create({
    key: SITE_IMAGES_KEY,
    ...DEFAULT_SITE_IMAGES,
  });
};

module.exports = seedSiteImages;