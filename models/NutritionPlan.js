// models/NutritionPlan.js
const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  food: { type: String, required: true },
  quantity: { type: String, default: '' },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: { type: [mealItemSchema], default: [] },
}, { _id: false });

const nutritionPlanSchema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true, index: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', index: true },
  calories: { type: Number, required: true },
  macros: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
  },
  meals: { type: [mealSchema], default: [] },
}, { timestamps: true });

nutritionPlanSchema.index({ athlete: 1 });

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
