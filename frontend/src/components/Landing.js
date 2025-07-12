import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  // Remove auto-redirect since questions page is now public

  return (
    <div className="container">
      <div className="landing-hero">
        <h1>Welcome to StackIt</h1>
        <p>A community-driven platform for asking questions and sharing knowledge</p>
        <p className="hero-subtitle">Join thousands of developers, designers, and tech enthusiasts</p>
      </div>
      
      <div className="landing-features">
        <div className="feature">
          <h3>Ask Questions</h3>
          <p>Get help from experienced developers and share your knowledge</p>
        </div>
        <div className="feature">
          <h3>Share Knowledge</h3>
          <p>Help others by answering questions and building your reputation</p>
        </div>
        <div className="feature">
          <h3>Learn Together</h3>
          <p>Discover new technologies and best practices from the community</p>
        </div>
      </div>
      
      <div className="landing-cta">
        <h2>Ready to get started?</h2>
        <div className="cta-buttons">
          <Link to="/signup" className="btn btn-primary btn-large">
            Join the Community
          </Link>
          <Link to="/login" className="btn btn-secondary btn-large">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing; 