// routes/coachRoutes.js
const express = require('express');
const {
  createCoachProfile,
  getCoachProfile,
  addAthleteToCoach,
} = require('../controllers/coachController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createCoachProfile); // create profile
router.get('/:id', protect, getCoachProfile); // get profile
router.put('/:id/add-athlete', protect, addAthleteToCoach); // add athlete

module.exports = router;
