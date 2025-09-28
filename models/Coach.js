const mongoose = require("mongoose");

const coachSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialization: {
    type: String,
    enum: ["strength", "conditioning", "judo", "wrestling", "boxing", "karate", "nutrition"],
    default: "strength",
  },
  experienceYears: { type: Number, required: true },
  certifications: { type: [String], default: [] },
  bio: { type: String, default: "" },
  athletes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Athlete"
    }
  ]
}, { timestamps: true });

const Coach = mongoose.model("Coach", coachSchema);
module.exports = Coach;
