const SiteImages = require('../models/SiteImages');
const { DEFAULT_SITE_IMAGES, mergeSiteImages } = require('./siteImagesDefaults');

const SITE_IMAGES_KEY = 'site-images';

const getSiteImagesDoc = async () => {
  let doc = await SiteImages.findOne({ key: SITE_IMAGES_KEY });
  if (!doc) {
    doc = await SiteImages.create({ key: SITE_IMAGES_KEY, ...DEFAULT_SITE_IMAGES });
  }
  return doc;
};

const formatSiteImages = (doc) => mergeSiteImages(doc?.toObject?.() || doc);

module.exports = {
  SITE_IMAGES_KEY,
  getSiteImagesDoc,
  formatSiteImages,
};