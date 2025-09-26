const mongoose = require('mongoose');

const trainingSessionSchema = new mongoose.Schema({
  athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' }, // optional
  date: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['sparring','strength','cardio','technique','other'],
    default: 'other'
  },
  durationMinutes: { type: Number },
  metrics: { type: mongoose.Schema.Types.Mixed }, // flexible object: { rounds: 3, intensity: 8, reps: ... }
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingSession', trainingSessionSchema);
