const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    image: {
      type: String,
      default: "/bottle.png",
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return !value || value.length <= 10;
        },
        message: "A product can have at most 10 images",
      },
    },
    badge: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      trim: true,
    },
    shippingWeightKg: {
      type: Number,
      default: 0.5,
      min: 0.1,
    },
    shippingLengthCm: {
      type: Number,
      default: 20,
      min: 1,
    },
    shippingBreadthCm: {
      type: Number,
      default: 15,
      min: 1,
    },
    shippingHeightCm: {
      type: Number,
      default: 10,
      min: 1,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
