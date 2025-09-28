// models/TrainingSession.js
const mongoose = require('mongoose');

const trainingSessionSchema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true, index: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', index: true }, // optional
  date: { type: Date, required: true, index: true },
  type: {
    type: String,
    enum: ['sparring','strength','cardio','technique','other'],
    default: 'other'
  },
  durationMinutes: { type: Number, default: 60 },
  metrics: { type: mongoose.Schema.Types.Mixed, default: {} }, // flexible
  notes: { type: String, default: '' },
}, { timestamps: true });

// indexes to speed queries by athlete/date/coach
trainingSessionSchema.index({ athlete: 1, date: -1 });
trainingSessionSchema.index({ coach: 1, date: -1 });

module.exports = mongoose.model('TrainingSession', trainingSessionSchema);
