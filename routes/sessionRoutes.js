const express = require('express');
const {
  createSession,
  getSessionsByAthlete,
  getMySessions,
  updateSession,
  deleteSession
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create session
router.post('/', protect, createSession);

// Get all sessions for an athlete (protected)
router.get('/athlete/:athleteId', protect, getSessionsByAthlete);

// Get sessions for current user (athlete's own or coach's athletes)
router.get('/my', protect, getMySessions);

// Update a session
router.put('/:id', protect, updateSession);

// Delete a session
router.delete('/:id', protect, deleteSession);

module.exports = router;
