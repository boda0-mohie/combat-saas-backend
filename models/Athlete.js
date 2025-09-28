const mongoose = require("mongoose");

const athleteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sport: {
    type: String,
    enum: ["judo", "wrestling", "boxing", "karate", "MMA", "other"],
    default: "judo",
  },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  experienceLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "professional"],
    default: "beginner",
  },
  goals: { type: [String], default: [] },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coach",
    default: null
  },
}, { timestamps: true });

const Athlete = mongoose.model("Athlete", athleteSchema);
module.exports = Athlete;
