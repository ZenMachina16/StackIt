import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
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
        console.error('Profile fetch failed:', error);
        setError('Failed to load profile. Please try again.');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container">
        <div className="text-center">
          <h2>Loading profile...</h2>
          <p>Please wait while we load your profile information.</p>
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
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      {user && (
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="profile-info">
              <h2>{user.username}</h2>
              <p className="user-email">{user.email}</p>
              <p className="user-role">Role: {user.role}</p>
              <p className="user-since">Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="profile-stats">
            <h3>Your Activity</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{user.notifications ? user.notifications.length : 0}</span>
                <span className="stat-label">Notifications</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Questions Asked</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Answers Given</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Reputation</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <h3>Account Actions</h3>
            <div className="actions-grid">
              <button className="btn btn-secondary">Edit Profile</button>
              <button className="btn btn-secondary">Change Password</button>
              <button className="btn btn-secondary">Notification Settings</button>
              <button className="btn btn-outline">Download Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 