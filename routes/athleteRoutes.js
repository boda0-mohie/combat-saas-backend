// routes/athleteRoutes.js
const express = require('express');
const { getAthleteProfile, updateAthleteProfile, createAthleteProfile } = require('../controllers/athleteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create athlete profile
router.post("/", protect, createAthleteProfile);

// Get athlete profile
router.get('/:id', protect, getAthleteProfile);

// Update athlete profile
router.put('/:id', protect, updateAthleteProfile);

module.exports = router;
