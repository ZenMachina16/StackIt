import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalQuestions: 0,
    userQuestions: 0,
    userAnswers: 0,
    unreadNotifications: 0
  });

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
          // Count unread notifications
          const unreadNotifications = res.data.user.notifications ? 
            res.data.user.notifications.filter(n => !n.isRead).length : 0;
          setStats(prev => ({ ...prev, unreadNotifications }));
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
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        {user && (
          <div className="welcome-message">
            <h2>Welcome back, {user.username}!</h2>
            <p>Ready to explore and share knowledge?</p>
          </div>
        )}
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/" className="btn btn-primary">
              Browse Questions
            </Link>
            <Link to="/ask-question" className="btn btn-success">
              Ask New Question
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              View Profile
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="dashboard-stats">
          <h3>Your Activity</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.userQuestions}</div>
              <div className="stat-label">Questions Asked</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.userAnswers}</div>
              <div className="stat-label">Answers Given</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.unreadNotifications}</div>
              <div className="stat-label">Notifications</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user?.role === 'admin' ? 'Admin' : 'Member'}</div>
              <div className="stat-label">Role</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-feed">
            <p className="no-activity">No recent activity to show.</p>
            <Link to="/" className="btn btn-outline">
              Explore Questions
            </Link>
          </div>
        </div>

        {/* Admin Panel */}
        {user?.role === 'admin' && (
          <div className="admin-panel">
            <h3>Admin Panel</h3>
            <div className="admin-actions">
              <button className="btn btn-warning">Manage Users</button>
              <button className="btn btn-warning">Manage Tags</button>
              <button className="btn btn-warning">View Reports</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 