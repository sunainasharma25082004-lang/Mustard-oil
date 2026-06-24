const { getSiteImagesDoc, formatSiteImages } = require('../utils/siteImagesHelpers');

const getPublicSiteImages = async (req, res, next) => {
  try {
    const doc = await getSiteImagesDoc();
    res.json({
      success: true,
      data: formatSiteImages(doc),
    });
  } catch (error) {
    next(error);
  }
};

const getAdminSiteImages = async (req, res, next) => {
  try {
    const doc = await getSiteImagesDoc();
    res.json({
      success: true,
      data: formatSiteImages(doc),
    });
  } catch (error) {
    next(error);
  }
};

const updateSiteImages = async (req, res, next) => {
  try {
    const {
      logo,
      heroDesktop,
      heroMobile,
      aboutImage,
      distributorHero,
      distributorBanner,
      distributorShowcase,
      distributorBenefits,
      processSteps,
    } = req.body;

    const doc = await getSiteImagesDoc();

    if (logo !== undefined) doc.logo = String(logo).trim();
    if (heroDesktop !== undefined) doc.heroDesktop = String(heroDesktop).trim();
    if (heroMobile !== undefined) doc.heroMobile = String(heroMobile).trim();
    if (aboutImage !== undefined) doc.aboutImage = String(aboutImage).trim();
    if (distributorHero !== undefined) doc.distributorHero = String(distributorHero).trim();
    if (distributorBanner !== undefined) doc.distributorBanner = String(distributorBanner).trim();

    if (Array.isArray(distributorShowcase)) {
      doc.distributorShowcase = distributorShowcase
        .filter((item) => item?.image?.trim() && item?.label?.trim())
        .map((item) => ({
          image: String(item.image).trim(),
          label: String(item.label).trim(),
        }));
    }

    if (Array.isArray(distributorBenefits)) {
      doc.distributorBenefits = distributorBenefits
        .filter((item) => item?.image?.trim() && item?.title?.trim())
        .map((item) => ({
          image: String(item.image).trim(),
          title: String(item.title).trim(),
          text: String(item.text || '').trim(),
        }));
    }

    if (Array.isArray(processSteps)) {
      doc.processSteps = processSteps
        .filter((item) => item?.key?.trim())
        .map((item) => ({
          key: String(item.key).trim(),
          image: String(item.image || '').trim(),
        }));
    }

    await doc.save();

    res.json({
      success: true,
      message: 'Site images updated successfully',
      data: formatSiteImages(doc),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicSiteImages,
  getAdminSiteImages,
  updateSiteImages,
};