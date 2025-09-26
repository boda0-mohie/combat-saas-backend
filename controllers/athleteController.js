const User = require('../models/User');
const Athlete = require("../models/Athlete");


// @desc Create athlete profile for a user
// @route POST /api/athletes
// @access Private (athlete نفسه بعد التسجيل أو المدرب يعمل له profile)
const createAthleteProfile = async (req, res) => {
  console.log("REQ BODY:", req.body);
  try {
    const { userId, sport, weight, height, experienceLevel, goals } = req.body;

    // 1) اتأكد إن اليوزر موجود
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2) اتأكد إن مفيش Athlete profile معمول له قبل كده
    const existingAthlete = await Athlete.findOne({ user: userId });
    if (existingAthlete) {
      return res
        .status(400)
        .json({ message: "Athlete profile already exists for this user" });
    }

    // 3) اعمل Athlete جديد مربوط باليوزر
    const athlete = new Athlete({
      user: userId,
      sport,
      weight,
      height,
      experienceLevel,
      goals,
    });

    await athlete.save();

    res
      .status(201)
      .json({ message: "Athlete profile created successfully", athlete });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};


// @desc Get athlete profile
// @route GET /api/athletes/:id
// @access Private (athlete himself or coach)
const getAthleteProfile = async (req, res) => {
  try {
    const athlete = await User.findById(req.params.id).select('-password');
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    res.json(athlete);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc Update athlete profile (like weight, height, goals)
// @route PUT /api/athletes/:id
// @access Private (athlete himself)
const updateAthleteProfile = async (req, res) => {
  try {
    const athlete = await User.findById(req.params.id);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }

    if (athlete._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { weight, height, goal } = req.body;

    if (weight) athlete.weight = weight;
    if (height) athlete.height = height;
    if (goal) athlete.goal = goal;

    await athlete.save();
    res.json({ message: 'Profile updated', athlete });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAthleteProfile,
  updateAthleteProfile,
  createAthleteProfile,
};
