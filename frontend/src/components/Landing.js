import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="container">
      <h1>Welcome to MERN Auth App</h1>
      <p>A complete authentication system built with MongoDB, Express, React, and Node.js</p>
      
      <div className="text-center mt-3">
        <Link to="/login">
          <button className="btn">Sign In</button>
        </Link>
        <Link to="/signup">
          <button className="btn btn-secondary">Sign Up</button>
        </Link>
      </div>
      
      <div className="text-center mt-3">
        <p>
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
        <p>
          New user? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Landing; 