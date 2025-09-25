const User = require('../models/User');

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
};
