import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Link as MuiLink,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const mobileLinks = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {isAuthenticated ? (
          <>
            <ListItem button component={Link} to="/dashboard">
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/profile">
              <ListItemText primary="Profile" />
            </ListItem>
            <Divider />
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <ListItem button component={Link} to="/login">
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'transparent !important',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
        zIndex: 1300,
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 3 }}>
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: '#ff6f00',
            fontWeight: 'bold',
            fontSize: '1.6rem',
            letterSpacing: '1px',
          }}
        >
          StackIt
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <MuiLink
                  component={Link}
                  to="/dashboard"
                  underline="none"
                  sx={{
                    color: '#333',
                    fontWeight: 600,
                    fontSize: '1rem',
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.4)',
                    },
                  }}
                >
                  Dashboard
                </MuiLink>
                <MuiLink
                  component={Link}
                  to="/profile"
                  underline="none"
                  sx={{
                    color: '#333',
                    fontWeight: 600,
                    fontSize: '1rem',
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.4)',
                    },
                  }}
                >
                  Profile
                </MuiLink>
                <Box sx={{ position: 'relative', mx: 1 }}>
                  <IconButton color="inherit" onClick={handleBellClick}>
                    <FiBell size={24} />
                    {unreadCount > 0 && (
                      <span className="notification-count">{unreadCount}</span>
                    )}
                  </IconButton>
                  {showDropdown && (
                    <Box className="notification-dropdown" sx={{ right: 0, top: 40, minWidth: 280 }}>
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
                    </Box>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleLogout}
                  sx={{
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    boxShadow: '0 3px 10px rgba(255,111,0,0.2)',
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="warning"
                component={Link}
                to="/login"
                sx={{
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(255,111,0,0.3)',
                }}
              >
                Login
              </Button>
            )}
          </Box>
        )}

        {isMobile && (
          <>
            <IconButton color="inherit" edge="end" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
              {mobileLinks}
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 