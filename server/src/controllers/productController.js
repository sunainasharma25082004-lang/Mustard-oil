const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ price: 1 });

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
    const { name, description, price, image, badge, size, inStock, isActive } = req.body;

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
      image: image || '',
      badge,
      size,
      inStock: inStock !== false,
      isActive: isActive !== false,
    });

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

    const fields = ['name', 'description', 'price', 'image', 'badge', 'size', 'inStock', 'isActive'];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = field === 'price' ? Number(req.body[field]) : req.body[field];
      }
    });

    if (req.body.slug) {
      product.slug = req.body.slug;
    } else if (req.body.name) {
      product.slug = slugify(req.body.name);
    }

    await product.save();

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