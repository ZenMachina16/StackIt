import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>StackIt</h1>
            </Link>
          </div>
          
          <nav className="header-nav">
            {isAuthenticated ? (
              <div className="auth-nav">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={handleLogout} className="btn btn-outline">Logout</button>
              </div>
            ) : (
              <div className="guest-nav">
                <Link to="/login" className="btn">Login</Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 