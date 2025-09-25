const mongoose = require("mongoose");

const trainingPlanSchema = new mongoose.Schema({
  athlete: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Athlete",
    required: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coach",
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  weeks: {
    type: Number,
    default: 4,
  },
  workouts: [
    {
      day: String, // ex: "Monday"
      exercises: [
        {
          name: String,
          sets: Number,
          reps: Number,
          rest: String,
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TrainingPlan = mongoose.model("TrainingPlan", trainingPlanSchema);
module.exports = TrainingPlan;
