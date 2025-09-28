const Coach = require('../models/Coach');
const Athlete = require('../models/Athlete');

// Create coach profile
const createCoachProfile = async (req, res) => {
  try {
    const { specialization, experienceYears, certifications, bio } = req.body;

    const coachExists = await Coach.findOne({ user: req.user._id });
    if (coachExists) {
      return res.status(400).json({ message: 'Coach profile already exists' });
    }

    const coach = new Coach({
      user: req.user._id,
      specialization,
      experienceYears,
      certifications,
      bio,
    });

    await coach.save();
    res.status(201).json({ message: "Coach profile created", coach });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get coach profile
const getCoachProfile = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id)
      .populate('user', '-password')
      .populate('athletes');

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    res.json(coach);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add athlete to coach
const addAthleteToCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    if (coach.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { athleteId } = req.body;
    if (!athleteId) {
      return res.status(400).json({ message: 'Athlete ID is required' });
    }

    if (!coach.athletes.includes(athleteId)) {
      coach.athletes.push(athleteId);
      await coach.save();

      // كمان نربط الـ Athlete بالمدرب
      const athlete = await Athlete.findById(athleteId);
      if (athlete) {
        athlete.coach = coach._id;
        await athlete.save();
      }
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
