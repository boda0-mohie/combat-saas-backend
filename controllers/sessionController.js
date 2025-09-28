// controllers/sessionController.js
const TrainingSession = require("../models/TrainingSession");
const Athlete = require("../models/Athlete");
const Coach = require("../models/Coach");
const getUserRole = require("../utils/getUserRole");
const mongoose = require("mongoose");

// POST /api/sessions
const createSession = async (req, res) => {
  try {
    const { athleteId, type, durationMinutes, metrics, notes, date } = req.body;
    if (!athleteId)
      return res.status(400).json({ message: "athleteId is required" });

    const athlete = await Athlete.findById(athleteId)
      .populate("user", "_id")
      .lean();
    if (!athlete) return res.status(404).json({ message: "Athlete not found" });

    const requesterId = req.user._id.toString();
    const requesterRole = await getUserRole(requesterId);

    // Authorization
    if (requesterRole === "athlete") {
      if (!athlete.user || athlete.user._id.toString() !== requesterId) {
        return res
          .status(401)
          .json({
            message: "Not authorized to create session for this athlete",
          });
      }
    } else if (requesterRole === "coach") {
      const coach = await Coach.findOne({ user: requesterId })
        .select("athletes _id")
        .lean();
      if (!coach)
        return res.status(401).json({ message: "Coach profile not found" });
      if (
        !coach.athletes
          .map((a) => a.toString())
          .includes(athlete._id.toString())
      ) {
        return res
          .status(401)
          .json({ message: "Coach not assigned to this athlete" });
      }
    } else {
      return res.status(401).json({ message: "Not authorized" });
    }

    // set coach id if requester is coach
    let coachRef = null;
    if (requesterRole === "coach") {
      const coachDoc = await Coach.findOne({ user: requesterId })
        .select("_id")
        .lean();
      if (coachDoc) coachRef = coachDoc._id;
    }

    const session = await TrainingSession.create({
      athlete: athlete._id,
      coach: coachRef || undefined,
      date: date ? new Date(date) : new Date(),
      type,
      durationMinutes,
      metrics,
      notes,
    });

    // return populated minimal session
    const populated = await TrainingSession.findById(session._id)
      .populate({
        path: "athlete",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "coach",
        populate: { path: "user", select: "name email" },
      })
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    console.error("createSession error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/sessions/athlete/:athleteId
const getSessionsByAthlete = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    const athlete = await Athlete.findById(athleteId)
      .populate("user", "_id")
      .lean();
    if (!athlete) return res.status(404).json({ message: "Athlete not found" });

    const requesterId = req.user._id.toString();
    const requesterRole = await getUserRole(requesterId);

    let allowed = false;
    if (
      requesterRole === "athlete" &&
      athlete.user &&
      athlete.user._id.toString() === requesterId
    )
      allowed = true;
    if (requesterRole === "coach") {
      const coach = await Coach.findOne({ user: requesterId })
        .select("athletes")
        .lean();
      if (
        coach &&
        coach.athletes.map((a) => a.toString()).includes(athlete._id.toString())
      )
        allowed = true;
    }

    if (!allowed)
      return res
        .status(401)
        .json({ message: "Not authorized to view these sessions" });

    const sessions = await TrainingSession.find({ athlete: athleteId })
      .sort({ date: -1 })
      .populate({
        path: "coach",
        populate: { path: "user", select: "name email" },
      })
      .lean();

    res.json(sessions);
  } catch (err) {
    console.error("getSessionsByAthlete error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/sessions/my
const getMySessions = async (req, res) => {
  try {
    const requesterId = req.user._id.toString();
    const requesterRole = await getUserRole(requesterId);

    if (requesterRole === "athlete") {
      const athlete = await Athlete.findOne({ user: requesterId })
        .select("_id")
        .lean();
      if (!athlete)
        return res.status(404).json({ message: "Athlete profile not found" });
      const sessions = await TrainingSession.find({ athlete: athlete._id })
        .sort({ date: -1 })
        .lean();
      return res.json(sessions);
    }

    if (requesterRole === "coach") {
      const coach = await Coach.findOne({ user: requesterId })
        .select("athletes _id")
        .lean();
      if (!coach)
        return res.status(404).json({ message: "Coach profile not found" });

      const sessions = await TrainingSession.find({
        $or: [{ coach: coach._id }, { athlete: { $in: coach.athletes } }],
      })
        .sort({ date: -1 })
        .populate({
          path: "athlete",
          populate: { path: "user", select: "name email" },
        })
        .lean();

      return res.json(sessions);
    }

    return res.status(401).json({ message: "Not authorized" });
  } catch (err) {
    console.error("getMySessions error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/sessions/:id
const updateSession = async (req, res) => {
  try {
    const session = await TrainingSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const athlete = await Athlete.findById(session.athlete)
      .populate("user", "_id")
      .lean();
    if (!athlete) return res.status(404).json({ message: "Athlete not found" });

    const requesterId = req.user._id.toString();
    const requesterRole = await getUserRole(requesterId);

    let allowed = false;
    if (
      requesterRole === "athlete" &&
      athlete.user &&
      athlete.user._id.toString() === requesterId
    )
      allowed = true;
    if (requesterRole === "coach") {
      const coach = await Coach.findOne({ user: requesterId })
        .select("athletes _id")
        .lean();
      if (
        coach &&
        session.coach &&
        session.coach.toString() === coach._id.toString()
      )
        allowed = true;
      if (
        coach &&
        coach.athletes.map((a) => a.toString()).includes(athlete._id.toString())
      )
        allowed = true;
    }

    if (!allowed)
      return res
        .status(401)
        .json({ message: "Not authorized to update this session" });

    const { type, durationMinutes, metrics, notes, date } = req.body;
    if (type) session.type = type;
    if (durationMinutes !== undefined)
      session.durationMinutes = durationMinutes;
    if (metrics !== undefined) session.metrics = metrics;
    if (notes !== undefined) session.notes = notes;
    if (date) session.date = new Date(date);

    await session.save();

    const updated = await TrainingSession.findById(session._id)
      .populate({
        path: "athlete",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "coach",
        populate: { path: "user", select: "name email" },
      })
      .lean();

    res.json(updated);
  } catch (err) {
    console.error("updateSession error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/sessions/:id
const deleteSession = async (req, res) => {
  try {
    const session = await TrainingSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const athlete = await Athlete.findById(session.athlete)
      .populate("user", "_id")
      .lean();
    const requesterId = req.user._id.toString();
    const requesterRole = await getUserRole(requesterId);

    let allowed = false;
    if (
      requesterRole === "athlete" &&
      athlete.user &&
      athlete.user._id.toString() === requesterId
    )
      allowed = true;
    if (requesterRole === "coach") {
      const coach = await Coach.findOne({ user: requesterId })
        .select("athletes _id")
        .lean();
      if (
        coach &&
        session.coach &&
        session.coach.toString() === coach._id.toString()
      )
        allowed = true;
      if (
        coach &&
        coach.athletes.map((a) => a.toString()).includes(athlete._id.toString())
      )
        allowed = true;
    }

    if (!allowed)
      return res
        .status(401)
        .json({ message: "Not authorized to delete this session" });

    await session.deleteOne();
    res.json({ message: "Session deleted" });
  } catch (err) {
    console.error("deleteSession error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createSession,
  getSessionsByAthlete,
  getMySessions,
  updateSession,
  deleteSession,
};
