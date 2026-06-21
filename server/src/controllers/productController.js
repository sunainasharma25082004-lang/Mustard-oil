const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { cached, bust } = require('../utils/memoryCache');

const PRODUCTS_CACHE_KEY = 'products:active';
const PRODUCT_CACHE_TTL_MS = 2 * 60 * 1000;

const bustProductCache = () => {
  bust('products:');
  bust('content:home');
};

const fetchActiveProducts = () =>
  Product.find({ isActive: true }).sort({ price: 1 }).select('-__v').lean();

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getProducts = async (req, res, next) => {
  try {
    const products = await cached(PRODUCTS_CACHE_KEY, PRODUCT_CACHE_TTL_MS, fetchActiveProducts);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(id);

    const product = await Product.findOne({
      ...(isObjectId ? { _id: id } : { slug: id.toLowerCase() }),
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, originalPrice, image, badge, size, inStock, isActive } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required',
      });
    }

    const slug = req.body.slug || slugify(name);

    const product = await Product.create({
      name,
      slug,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      image: image || '',
      badge,
      size,
      inStock: inStock !== false,
      isActive: isActive !== false,
    });

    bustProductCache();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const fields = ['name', 'description', 'price', 'originalPrice', 'image', 'badge', 'size', 'inStock', 'isActive'];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'price' || field === 'originalPrice') {
          product[field] = req.body[field] === '' || req.body[field] == null ? undefined : Number(req.body[field]);
        } else {
          product[field] = req.body[field];
        }
      }
    });

    if (req.body.slug) {
      product.slug = req.body.slug;
    } else if (req.body.name) {
      product.slug = slugify(req.body.name);
    }

    await product.save();
    bustProductCache();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.image?.startsWith('/uploads/products/')) {
      const filePath = path.join(__dirname, '../..', product.image);
      fs.unlink(filePath, () => {});
    }

    await Product.findByIdAndDelete(req.params.id);
    bustProductCache();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
};