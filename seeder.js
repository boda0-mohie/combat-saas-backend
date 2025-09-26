const mongoose = require('mongoose');
const dotenv = require('dotenv');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;


// Models
const User = require('./models/User');
const Coach = require('./models/Coach');
const Athlete = require('./models/Athlete');

dotenv.config();

// Connect DB
mongoose.connect(uri)
  .then(() => console.log('MongoDB Connected for Seeding...'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // 1) Clear old data
    await User.deleteMany();
    await Coach.deleteMany();
    await Athlete.deleteMany();

    // 2) Create Users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin'
    });

    const coachUser = await User.create({
      name: 'Coach User',
      email: 'coach@test.com',
      password: '123456',
      role: 'coach'
    });

    const athleteUser = await User.create({
      name: 'Athlete User',
      email: 'athlete@test.com',
      password: '123456',
      role: 'athlete'
    });

    // 3) Create Coach
    const coach = await Coach.create({
      user: coachUser._id,
      bio: 'Professional Judo Coach',
      athletes: []
    });

    // 4) Create Athlete linked to coach
    const athlete = await Athlete.create({
      user: athleteUser._id,
      sport: 'Judo',
      coach: coach._id
    });

    // 5) Link athlete to coach
    coach.athletes.push(athlete._id);
    await coach.save();

    console.log('✅ Data Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedData();
