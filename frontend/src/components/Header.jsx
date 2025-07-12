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
                  <IconButton 
                    onClick={handleBellClick}
                    sx={{
                      color: '#333',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(255, 111, 0, 0.3)',
                      },
                    }}
                  >
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -2,
                          right: -2,
                          background: 'linear-gradient(135deg, #ff6f00, #ff8f00)',
                          color: 'white',
                          borderRadius: '50%',
                          width: 18,
                          height: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 2px 8px rgba(255, 111, 0, 0.4)',
                          animation: 'pulse 2s infinite',
                        }}
                      >
                        {unreadCount}
                      </Box>
                    )}
                  </IconButton>
                  {showDropdown && (
                    <Box 
                      className="notification-dropdown"
                      sx={{ 
                        position: 'absolute',
                        right: 0, 
                        top: 55, 
                        minWidth: 320,
                        maxHeight: 400,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        zIndex: 1400,
                        animation: 'slideDown 0.3s ease-out',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -8,
                          right: 20,
                          width: 16,
                          height: 16,
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderBottom: 'none',
                          borderRight: 'none',
                          transform: 'rotate(45deg)',
                          backdropFilter: 'blur(20px)',
                        }
                      }}
                    >
                      <Box sx={{ 
                        padding: '16px 20px 12px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'linear-gradient(135deg, rgba(255, 111, 0, 0.1), rgba(255, 143, 0, 0.05))',
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#333',
                          fontWeight: 600,
                          fontSize: '1rem',
                          margin: 0,
                        }}>
                          Notifications
                        </Typography>
                      </Box>
                      <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <Box sx={{ 
                            padding: '40px 20px',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.5)',
                            fontSize: '0.9rem',
                          }}>
                            <FiBell size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
                            <div>No notifications yet</div>
                          </Box>
                        ) : (
                          notifications.slice(0, 10).map((n, idx) => (
                            <Box 
                              key={idx} 
                              sx={{
                                padding: '16px 20px',
                                borderBottom: idx < notifications.length - 1 ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                                backgroundColor: n.isRead ? 'transparent' : 'rgba(255, 111, 0, 0.05)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 111, 0, 0.08)',
                                  transform: 'translateX(4px)',
                                },
                                position: 'relative',
                                '&::before': n.isRead ? {} : {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 3,
                                  background: 'linear-gradient(135deg, #ff6f00, #ff8f00)',
                                  borderRadius: '0 2px 2px 0',
                                }
                              }}
                            >
                              <Typography sx={{ 
                                color: '#333',
                                fontSize: '0.9rem',
                                lineHeight: 1.4,
                                fontWeight: n.isRead ? 400 : 500,
                                marginBottom: '6px',
                              }}>
                                {n.message}
                              </Typography>
                              <Typography sx={{ 
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontSize: '0.75rem',
                                fontWeight: 400,
                              }}>
                                {new Date(n.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          ))
                        )}
                      </Box>
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