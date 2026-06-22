const YouTubeVideo = require('../models/YouTubeVideo');
const Recipe = require('../models/Recipe');
const Certificate = require('../models/Certificate');
const Product = require('../models/Product');
const { cached, bust } = require('../utils/memoryCache');

const HOME_CACHE_KEY = 'content:home';
const HOME_CACHE_TTL_MS = 2 * 60 * 1000;

const bustHomeCache = () => bust('content:home');
const { extractYouTubeVideoId } = require('../utils/youtubeHelpers');
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Home page bundle — single request for faster first load
const loadHomeBundle = async () => {
  const [products, certificates, youtube] = await Promise.all([
    Product.find({ isActive: true }).sort({ price: 1 }).select('-__v').lean(),
    Certificate.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).select('-__v').lean(),
    YouTubeVideo.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).select('-__v').lean(),
  ]);
  return { products, certificates, youtube };
};

const getHomeBundle = async (req, res, next) => {
  try {
    const data = await cached(HOME_CACHE_KEY, HOME_CACHE_TTL_MS, loadHomeBundle);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// YouTube
const getActiveYouTubeVideos = async (req, res, next) => {
  try {
    const videos = await YouTubeVideo.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
};

const getAllYouTubeVideosAdmin = async (req, res, next) => {
  try {
    const videos = await YouTubeVideo.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
};

const createYouTubeVideo = async (req, res, next) => {
  try {
    const { url, title, sortOrder, isActive } = req.body;
    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
    }

    const video = await YouTubeVideo.create({
      url: url.trim(),
      videoId,
      title: title?.trim() || 'Karyor Mustard Oil',
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== false,
    });

    bustHomeCache();
    res.status(201).json({ success: true, message: 'YouTube video added', data: video });
  } catch (error) {
    next(error);
  }
};

const updateYouTubeVideo = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    if (updates.url) {
      const videoId = extractYouTubeVideoId(updates.url);
      if (!videoId) {
        return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
      }
      updates.videoId = videoId;
    }

    const video = await YouTubeVideo.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    bustHomeCache();
    res.json({ success: true, message: 'YouTube video updated', data: video });
  } catch (error) {
    next(error);
  }
};

const deleteYouTubeVideo = async (req, res, next) => {
  try {
    const video = await YouTubeVideo.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    bustHomeCache();
    res.json({ success: true, message: 'YouTube video deleted' });
  } catch (error) {
    next(error);
  }
};

// Recipes
const getActiveRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: recipes });
  } catch (error) {
    next(error);
  }
};

const getRecipeBySlug = async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug, isActive: true });
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};

const getAllRecipesAdmin = async (req, res, next) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json({ success: true, data: recipes });
  } catch (error) {
    next(error);
  }
};

const createRecipe = async (req, res, next) => {
  try {
    const { title, description, image, ingredients, steps, prepTime, cookTime, servings, isActive } =
      req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Recipe title is required' });
    }

    let slug = slugify(title);
    const existing = await Recipe.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const recipe = await Recipe.create({
      title: title.trim(),
      slug,
      description: description?.trim() || '',
      image: image || '/bottle.png',
      ingredients: Array.isArray(ingredients) ? ingredients.filter(Boolean) : [],
      steps: Array.isArray(steps) ? steps.filter(Boolean) : [],
      prepTime: prepTime || '',
      cookTime: cookTime || '',
      servings: servings || '',
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, message: 'Recipe created', data: recipe });
  } catch (error) {
    next(error);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const { title, description, image, ingredients, steps, prepTime, cookTime, servings, isActive } =
      req.body;
    const updates = {};

    if (title !== undefined) {
      const trimmed = title?.trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, message: 'Recipe title is required' });
      }
      updates.title = trimmed;
    }
    if (description !== undefined) updates.description = description?.trim() || '';
    if (image !== undefined) updates.image = image?.trim() || '/bottle.png';
    if (prepTime !== undefined) updates.prepTime = prepTime || '';
    if (cookTime !== undefined) updates.cookTime = cookTime || '';
    if (servings !== undefined) updates.servings = servings || '';
    if (isActive !== undefined) updates.isActive = isActive !== false;
    if (ingredients !== undefined) {
      updates.ingredients = Array.isArray(ingredients)
        ? ingredients.map((item) => String(item).trim()).filter(Boolean)
        : [];
    }
    if (steps !== undefined) {
      updates.steps = Array.isArray(steps)
        ? steps.map((item) => String(item).trim()).filter(Boolean)
        : [];
    }

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.json({ success: true, message: 'Recipe updated', data: recipe });
  } catch (error) {
    next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    res.json({ success: true, message: 'Recipe deleted' });
  } catch (error) {
    next(error);
  }
};

// Certificates
const getActiveCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: certificates });
  } catch (error) {
    next(error);
  }
};

const getAllCertificatesAdmin = async (req, res, next) => {
  try {
    const certificates = await Certificate.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: certificates });
  } catch (error) {
    next(error);
  }
};

const createCertificate = async (req, res, next) => {
  try {
    const { title, description, image, sortOrder, isActive } = req.body;

    if (!title?.trim() || !image) {
      return res.status(400).json({ success: false, message: 'Title and image are required' });
    }

    const certificate = await Certificate.create({
      title: title.trim(),
      description: description?.trim() || '',
      image,
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== false,
    });

    bustHomeCache();
    res.status(201).json({ success: true, message: 'Certificate added', data: certificate });
  } catch (error) {
    next(error);
  }
};

const updateCertificate = async (req, res, next) => {
  try {
    const { title, description, image, sortOrder, isActive } = req.body;
    const updates = {};

    if (title !== undefined) {
      const trimmed = title?.trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, message: 'Certificate title is required' });
      }
      updates.title = trimmed;
    }
    if (description !== undefined) updates.description = description?.trim() || '';
    if (image !== undefined) {
      if (!image?.trim()) {
        return res.status(400).json({ success: false, message: 'Certificate image is required' });
      }
      updates.image = image.trim();
    }
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder) || 0;
    if (isActive !== undefined) updates.isActive = isActive !== false;

    const certificate = await Certificate.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    bustHomeCache();
    res.json({ success: true, message: 'Certificate updated', data: certificate });
  } catch (error) {
    next(error);
  }
};

const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    bustHomeCache();
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomeBundle,
  getActiveYouTubeVideos,
  getAllYouTubeVideosAdmin,
  createYouTubeVideo,
  updateYouTubeVideo,
  deleteYouTubeVideo,
  getActiveRecipes,
  getRecipeBySlug,
  getAllRecipesAdmin,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getActiveCertificates,
  getAllCertificatesAdmin,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};