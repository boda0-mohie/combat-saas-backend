// controllers/coachController.js
const Coach = require('../models/Coach');
const User = require('../models/User');

// @desc Create coach profile
// @route POST /api/coaches
// @access Private
const createCoachProfile = async (req, res) => {
  console.log("REQ BODY:", req.body);
  try {
    const { specialization, experienceYears, certifications, bio } = req.body;

    const coachExists = await Coach.findOne({ user: req.user.id });
    if (coachExists) {
      return res.status(400).json({ message: 'Coach profile already exists' });
    }

    const coach = new Coach({
      user: req.user.id,
      specialization,
      experienceYears,
      certifications,
      bio,
    });

    await coach.save();
    res.status(201).json(coach);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// @desc Get coach profile
// @route GET /api/coaches/:id
// @access Private
const getCoachProfile = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id)
      .populate('user', '-password')
      .populate('athletes', 'name email');

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    res.json(coach);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc Add athlete to coach
// @route PUT /api/coaches/:id/add-athlete
// @access Private
const addAthleteToCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    // فقط المدرب نفسه اللي يعدل قايمته
    if (coach.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { athleteId } = req.body;
    if (!athleteId) {
      return res.status(400).json({ message: 'Athlete ID is required' });
    }

    if (!coach.athletes.includes(athleteId)) {
      coach.athletes.push(athleteId);
      await coach.save();
    }

    res.json({ message: 'Athlete added to coach', coach });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createCoachProfile,
  getCoachProfile,
  addAthleteToCoach,
};
