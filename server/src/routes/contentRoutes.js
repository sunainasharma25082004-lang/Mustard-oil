const express = require('express');
const {
  getHomeBundle,
  getActiveYouTubeVideos,
  getActiveRecipes,
  getRecipeBySlug,
  getActiveCertificates,
} = require('../controllers/contentController');
const { getPublicSiteImages } = require('../controllers/siteImagesController');
const { cachePublic, noCache } = require('../middleware/cachePublic');

const router = express.Router();

// Admin-managed content — never cache (edit/delete must reflect immediately on store)
router.get('/home', noCache, getHomeBundle);
router.get('/youtube', noCache, getActiveYouTubeVideos);
router.get('/recipes', noCache, getActiveRecipes);
router.get('/recipes/:slug', noCache, getRecipeBySlug);
router.get('/certificates', noCache, getActiveCertificates);
router.get('/site-images', noCache, getPublicSiteImages);

module.exports = router;