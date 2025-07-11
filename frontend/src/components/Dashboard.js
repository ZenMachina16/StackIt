import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const res = await axios.get('/api/auth/me', config);
        
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

      setLoading(false);
    };

    verifyToken();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center">
          <h2>Loading...</h2>
          <p>Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      {user && (
        <div>
          <div className="alert alert-success">
            Welcome back, {user.name}!
          </div>
          
          <div className="user-info">
            <h3>Your Account Information</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>

          <div className="text-center mt-3">
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 