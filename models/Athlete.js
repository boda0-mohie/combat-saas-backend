const mongoose = require("mongoose");

const athleteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // رابط بين اللاعب و الـ user اللي مسجل
    required: true,
  },
  sport: {
    type: String,
    enum: ["judo", "wrestling", "boxing", "karate", "MMA", "other"],
    default: "judo",
  },
  weight: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  experienceLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "professional"],
    default: "beginner",
  },
  goals: {
    type: [String], // ممكن يحط أكتر من هدف: ["lose fat", "gain muscle", "improve stamina"]
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Athlete = mongoose.model("Athlete", athleteSchema);

module.exports = Athlete;
