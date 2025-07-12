const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');
const answersRoutes = require('./routes/answers');
const tagsRoutes = require('./routes/tags');
const notificationsRoutes = require('./routes/notifications');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/stats', statsRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'MERN Auth API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 8080;

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer(); 