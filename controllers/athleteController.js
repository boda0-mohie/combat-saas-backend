const User = require('../models/User');
const Athlete = require("../models/Athlete");

// Create athlete profile
const createAthleteProfile = async (req, res) => {
  try {
    const { sport, weight, height, experienceLevel, goals } = req.body;

    const existingAthlete = await Athlete.findOne({ user: req.user._id });
    if (existingAthlete) {
      return res.status(400).json({ message: "Athlete profile already exists" });
    }

    const athlete = new Athlete({
      user: req.user._id,
      sport,
      weight,
      height,
      experienceLevel,
      goals,
    });

    await athlete.save();
    res.status(201).json({ message: "Athlete profile created", athlete });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get athlete profile
const getAthleteProfile = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id).populate('user', '-password');
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    res.json(athlete);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update athlete profile
const updateAthleteProfile = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }

    if (athlete.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { weight, height, goals } = req.body;

    if (weight) athlete.weight = weight;
    if (height) athlete.height = height;
    if (goals) athlete.goals = goals;

    await athlete.save();
    res.json({ message: 'Profile updated', athlete });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createAthleteProfile,
  getAthleteProfile,
  updateAthleteProfile,
};
