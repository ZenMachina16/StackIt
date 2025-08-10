import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Avatar, Box } from '@mui/material';

const ProfileLink = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check various localStorage keys for user authentication
    const token = localStorage.getItem('token');
    const profile = localStorage.getItem('profile');
    const userProfile = localStorage.getItem('userProfile');
    const authUser = localStorage.getItem('user');
    const jwt = localStorage.getItem('jwt');
    
    // If any authentication data exists, consider user logged in
    if (token || profile || userProfile || authUser || jwt) {
      setIsLoggedIn(true);
      
      // Try to get user data from various possible sources
      let userData = null;
      try {
        if (profile) userData = JSON.parse(profile);
        else if (userProfile) userData = JSON.parse(userProfile);
        else if (authUser) userData = JSON.parse(authUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
      
      setUser(userData);
    }
  }, []);

  // If not logged in, render nothing
  if (!isLoggedIn) return null;

  // Get first letter of name for Avatar, if available
  const getAvatarLetter = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'P'; // Default to 'P' for Profile
  };

  return (
    <Button
      component={Link}
      to="/profile"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: '#333',
        fontWeight: 600,
        fontSize: '1rem',
        px: 2,
        py: 1,
        borderRadius: '8px',
        textTransform: 'none',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.4)',
        },
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: 'warning.main',
          fontSize: '0.9rem',
          fontWeight: 'bold',
        }}
      >
        {getAvatarLetter()}
      </Avatar>
      <Box component="span" sx={{ ml: 1 }}>
        {user?.name || user?.username || 'Profile'}
      </Box>
    </Button>
  );
};

export default ProfileLink;