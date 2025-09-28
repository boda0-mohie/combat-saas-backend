// utils/getUserRole.js
const Athlete = require('../models/Athlete');
const Coach = require('../models/Coach');

// returns string: 'athlete' | 'coach' | null
const getUserRole = async (userId) => {
  // check athlete first (cheap)
  const athlete = await Athlete.findOne({ user: userId }).select('_id').lean();
  if (athlete) return 'athlete';

  const coach = await Coach.findOne({ user: userId }).select('_id').lean();
  if (coach) return 'coach';

  // could add admin logic if you keep an admin collection or a flag in User
  return null;
};

module.exports = getUserRole;
