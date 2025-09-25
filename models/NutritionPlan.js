const mongoose = require("mongoose");

const nutritionPlanSchema = new mongoose.Schema({
  athlete: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Athlete",
    required: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coach",
  },
  calories: {
    type: Number,
    required: true,
  },
  macros: {
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  meals: [
    {
      name: String, // Breakfast, Lunch, Dinner, Snack
      items: [
        {
          food: String,
          quantity: String,
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NutritionPlan = mongoose.model("NutritionPlan", nutritionPlanSchema);
module.exports = NutritionPlan;
