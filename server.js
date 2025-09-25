require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const athleteRoutes = require('./routes/athleteRoutes');
const coachRoutes = require('./routes/coachRoutes');

// Create app
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());


// Test route
app.get('/', (req, res) => {
  res.send('Combat SaaS API is running...');
});

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/athletes', athleteRoutes);

app.use('/api/coaches', coachRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
