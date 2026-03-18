const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Make sure path is correct

const app = express();
const port = 3000;

// Import routes
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');
const roomsRoutes = require('./routes/roomsRoutes');

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/rooms', roomsRoutes);

// Test route
app.get('/api', (req, res) => {
  res.send('Hello World!');
});

// Connect to MongoDB and create admin
mongoose.connect('mongodb://localhost:27017/azure_haven_hotelhehe')
  .then(() => {
    console.log('MongoDB connected');
    createAdmin();
  })
  .catch(err => console.error(err));

// Pre-create admin function
async function createAdmin() {
  try {
    const admin = await User.findOne({ username: 'aryan gadhiya' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('aryan3101', 10);
      await User.create({
        username: 'aryan gadhiya',
        password: hashedPassword,
        email: 'admin@example.com',
        phone: '0000000000',
        city: 'AdminCity',
        role: 'admin'
      });
      // console.log('Admin user created: aryan gadhiya');
    } else {
      // console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  }
}

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
