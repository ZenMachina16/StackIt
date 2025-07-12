import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import axios from 'axios';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!token) return;
        const res = await axios.get('/api/auth/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data.notifications || []);
      } catch (err) {
        // handle error
      }
    };
    fetchNotifications();
  }, [token]);

  const hasUnread = notifications.some(n => !n.isRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleBellClick = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && hasUnread) {
      try {
        await axios.patch('/api/auth/notifications/mark-read', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        // handle error
      }
    }
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
                <div className="notification-bell" onClick={handleBellClick}>
                  <FiBell size={24} />
                  {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                  {showDropdown && (
                    <div className="notification-dropdown">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">No notifications</div>
                      ) : (
                        notifications.slice(0, 10).map((n, idx) => (
                          <div key={idx} className={`notification-item${n.isRead ? '' : ' unread'}`}>
                            {n.message}
                            <span className="notification-date">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/');
                }} className="btn btn-outline">Logout</button>
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