// Create a .env file in the backend directory with these variables:

/*
MONGODB_URI=mongodb://localhost:27017/mern-auth
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
PORT=8080
*/

// Example configuration for reference
module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-auth',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  PORT: process.env.PORT || 8080
}; 