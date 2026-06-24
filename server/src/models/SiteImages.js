const mongoose = require('mongoose');
const { DEFAULT_SITE_IMAGES } = require('../utils/siteImagesDefaults');

const showcaseItemSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const benefitItemSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const processStepSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const siteImagesSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true, default: 'site-images' },
    logo: { type: String, default: DEFAULT_SITE_IMAGES.logo },
    heroDesktop: { type: String, default: DEFAULT_SITE_IMAGES.heroDesktop },
    heroMobile: { type: String, default: DEFAULT_SITE_IMAGES.heroMobile },
    aboutImage: { type: String, default: DEFAULT_SITE_IMAGES.aboutImage },
    distributorHero: { type: String, default: DEFAULT_SITE_IMAGES.distributorHero },
    distributorBanner: { type: String, default: DEFAULT_SITE_IMAGES.distributorBanner },
    distributorShowcase: { type: [showcaseItemSchema], default: () => DEFAULT_SITE_IMAGES.distributorShowcase },
    distributorBenefits: { type: [benefitItemSchema], default: () => DEFAULT_SITE_IMAGES.distributorBenefits },
    processSteps: { type: [processStepSchema], default: () => DEFAULT_SITE_IMAGES.processSteps },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteImages', siteImagesSchema);