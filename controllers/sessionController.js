const TrainingSession = require('../models/TrainingSession');
const Athlete = require('../models/Athlete');
const Coach = require('../models/Coach');
const User = require('../models/User');

// helper to get requester id and role (works whether protect middleware sets req.user as decoded or full user doc)
const getRequester = async (req) => {
  let requesterId = null;
  let requesterRole = null;

  if (!req.user) return { requesterId: null, requesterRole: null };

  // if middleware set decoded object { id, role }
  if (req.user.id) {
    requesterId = req.user.id;
    requesterRole = req.user.role;
  } else if (req.user._id) {
    requesterId = req.user._id.toString();
    requesterRole = req.user.role;
  } else {
    // fallback (rare)
    requesterId = String(req.user);
  }

  if (!requesterRole) {
    const u = await User.findById(requesterId).select('role');
    requesterRole = u ? u.role : null;
  }

  return { requesterId, requesterRole };
};

// POST /api/sessions
const createSession = async (req, res) => {
  try {
    const { athleteId, type, durationMinutes, metrics, notes, date } = req.body;
    if (!athleteId) return res.status(400).json({ message: 'athleteId is required' });

    const athlete = await Athlete.findById(athleteId).populate('user');
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' });

    const { requesterId, requesterRole } = await getRequester(req);

    // Authorization:
    if (requesterRole === 'athlete' || requesterRole === 'player') {
      // athlete must create for own profile
      if (!athlete.user || athlete.user._id.toString() !== requesterId) {
        return res.status(401).json({ message: 'Not authorized to create session for this athlete' });
      }
    } else if (requesterRole === 'coach') {
      // coach must have athlete in his list
      const coach = await Coach.findOne({ user: requesterId });
      if (!coach) return res.status(401).json({ message: 'Coach profile not found' });
      if (!coach.athletes.map(a => a.toString()).includes(athlete._id.toString())) {
        return res.status(401).json({ message: 'Coach not assigned to this athlete' });
      }
    } else if (requesterRole === 'admin') {
      // allowed
    } else {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // set coach id if requester is coach
    let coachRef = null;
    if (requesterRole === 'coach') {
      const coachDoc = await Coach.findOne({ user: requesterId });
      if (coachDoc) coachRef = coachDoc._id;
    }

    const session = new TrainingSession({
      athlete: athlete._id,
      coach: coachRef,
      date: date ? new Date(date) : undefined,
      type,
      durationMinutes,
      metrics,
      notes,
    });

    await session.save();
    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/sessions/athlete/:athleteId
const getSessionsByAthlete = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    const athlete = await Athlete.findById(athleteId).populate('user');
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' });

    const { requesterId, requesterRole } = await getRequester(req);

    // allow athlete himself or coach of athlete or admin
    let allowed = false;
    if (requesterRole === 'admin') allowed = true;
    if (requesterRole === 'athlete' || requesterRole === 'player') {
      if (athlete.user && athlete.user._id.toString() === requesterId) allowed = true;
    }
    if (requesterRole === 'coach') {
      const coach = await Coach.findOne({ user: requesterId });
      if (coach && coach.athletes.map(a => a.toString()).includes(athlete._id.toString())) allowed = true;
    }

    if (!allowed) return res.status(401).json({ message: 'Not authorized to view these sessions' });

    const sessions = await TrainingSession.find({ athlete: athleteId })
      .sort({ date: -1 })
      .populate({ path: 'coach', populate: { path: 'user', select: 'name email' } });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/sessions/my  (sessions for current authenticated user)
const getMySessions = async (req, res) => {
  try {
    const { requesterId, requesterRole } = await getRequester(req);

    if (requesterRole === 'athlete' || requesterRole === 'player') {
      const athlete = await Athlete.findOne({ user: requesterId });
      if (!athlete) return res.status(404).json({ message: 'Athlete profile not found' });
      const sessions = await TrainingSession.find({ athlete: athlete._id }).sort({ date: -1 });
      return res.json(sessions);
    }

    if (requesterRole === 'coach') {
      const coach = await Coach.findOne({ user: requesterId });
      if (!coach) return res.status(404).json({ message: 'Coach profile not found' });
      // sessions where coach is the coach OR sessions for athletes in coach.athletes
      const sessions = await TrainingSession.find({
        $or: [
          { coach: coach._id },
          { athlete: { $in: coach.athletes } }
        ]
      }).sort({ date: -1 }).populate({ path: 'athlete', populate: { path: 'user', select: 'name email' } });
      return res.json(sessions);
    }

    return res.status(401).json({ message: 'Not authorized' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/sessions/:id
const updateSession = async (req, res) => {
  try {
    const session = await TrainingSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const athlete = await Athlete.findById(session.athlete).populate('user');
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' });

    const { requesterId, requesterRole } = await getRequester(req);

    // permission: session can be updated by the athlete (owner) or the coach assigned to it
    let allowed = false;
    if (requesterRole === 'admin') allowed = true;
    if (requesterRole === 'athlete' || requesterRole === 'player') {
      if (athlete.user && athlete.user._id.toString() === requesterId) allowed = true;
    }
    if (requesterRole === 'coach') {
      const coach = await Coach.findOne({ user: requesterId });
      if (coach && (session.coach && session.coach.toString() === coach._id.toString())) allowed = true;
      // also allow if coach manages the athlete
      if (coach && coach.athletes.map(a => a.toString()).includes(athlete._id.toString())) allowed = true;
    }

    if (!allowed) return res.status(401).json({ message: 'Not authorized to update this session' });

    // fields to update
    const { type, durationMinutes, metrics, notes, date } = req.body;
    if (type) session.type = type;
    if (durationMinutes !== undefined) session.durationMinutes = durationMinutes;
    if (metrics !== undefined) session.metrics = metrics;
    if (notes !== undefined) session.notes = notes;
    if (date) session.date = new Date(date);

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/sessions/:id
const deleteSession = async (req, res) => {
  try {
    const session = await TrainingSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const athlete = await Athlete.findById(session.athlete).populate('user');

    const { requesterId, requesterRole } = await getRequester(req);

    // allow athlete (owner), coach assigned to athlete, or admin
    let allowed = false;
    if (requesterRole === 'admin') allowed = true;
    if (requesterRole === 'athlete' || requesterRole === 'player') {
      if (athlete.user && athlete.user._id.toString() === requesterId) allowed = true;
    }
    if (requesterRole === 'coach') {
      const coach = await Coach.findOne({ user: requesterId });
      if (coach && (session.coach && session.coach.toString() === coach._id.toString())) allowed = true;
      if (coach && coach.athletes.map(a => a.toString()).includes(athlete._id.toString())) allowed = true;
    }

    if (!allowed) return res.status(401).json({ message: 'Not authorized to delete this session' });

    await session.remove();
    res.json({ message: 'Session deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createSession,
  getSessionsByAthlete,
  getMySessions,
  updateSession,
  deleteSession
};
