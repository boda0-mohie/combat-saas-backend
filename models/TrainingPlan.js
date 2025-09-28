// models/TrainingPlan.js
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 8 },
  rest: { type: String, default: '60s' },
}, { _id: false });

const workoutDaySchema = new mongoose.Schema({
  day: { type: String, required: true },
  exercises: { type: [exerciseSchema], default: [] },
}, { _id: false });

const trainingPlanSchema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true, index: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  weeks: { type: Number, default: 4, min: 1 },
  workouts: { type: [workoutDaySchema], default: [] },
}, { timestamps: true });

// index to quickly find plans for athlete
trainingPlanSchema.index({ athlete: 1, createdAt: -1 });

module.exports = mongoose.model('TrainingPlan', trainingPlanSchema);
