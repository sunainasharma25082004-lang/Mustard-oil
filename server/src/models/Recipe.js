const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    image: { type: String, default: '/bottle.png' },
    ingredients: [{ type: String, trim: true }],
    steps: [{ type: String, trim: true }],
    prepTime: { type: String, trim: true, default: '' },
    cookTime: { type: String, trim: true, default: '' },
    servings: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);