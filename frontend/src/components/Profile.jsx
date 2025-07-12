import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  Avatar,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    location: '',
    profileVisibility: 'public',
    profilePicture: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const { data } = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
        setForm({
          bio: data.user.bio || '',
          location: data.user.location || '',
          profileVisibility: data.user.profileVisibility || 'public',
          profilePicture: data.user.profilePicture || '',
        });
      } catch (err) {
        console.error(err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.put('/api/auth/me', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
      setEditMode(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      setMessage('Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" color="textSecondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #fff6ea, #ffe0c7)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 600,
          padding: 5,
          borderRadius: '36px',
          background: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 10px 30px rgba(255, 165, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 165, 0, 0.25)',
        }}
      >
        <Box display="flex" alignItems="center" mb={4} gap={3}>
          <Avatar
            src={form.profilePicture}
            alt="Profile"
            sx={{ width: 72, height: 72, fontSize: 30 }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" fontWeight="bold">{user.name}</Typography>
            <Typography variant="body1" color="textSecondary">{user.email}</Typography>
            <Typography variant="body2" color="textSecondary">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Button
            onClick={() => setEditMode(!editMode)}
            variant="contained"
            size="medium"
            sx={{
              borderRadius: '24px',
              fontWeight: 600,
              backgroundColor: '#ffa726',
              textTransform: 'none',
              px: 3,
              '&:hover': { backgroundColor: '#fb8c00' },
            }}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
        </Box>

        {message && (
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              borderRadius: '14px',
              padding: '12px',
              textAlign: 'center',
              backgroundColor: message.includes('success') ? '#e6ffed' : '#ffe6e6',
              color: message.includes('success') ? '#2e7d32' : '#c62828',
              border: `1px solid ${message.includes('success') ? '#81c784' : '#ef5350'}`,
            }}
          >
            {message}
          </Typography>
        )}

        {editMode ? (
          <>
            <TextField
              label="Bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
              margin="normal"
              variant="outlined"
              InputProps={{ sx: { borderRadius: '20px', fontSize: '16px' } }}
            />
            <TextField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{ sx: { borderRadius: '20px', fontSize: '16px' } }}
            />
            <TextField
              select
              label="Profile Visibility"
              name="profileVisibility"
              value={form.profileVisibility}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{ sx: { borderRadius: '20px', fontSize: '16px' } }}
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </TextField>

            <Button
              onClick={handleSave}
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '16px',
                borderRadius: '30px',
                backgroundColor: '#66bb6a',
                '&:hover': {
                  backgroundColor: '#43a047',
                },
              }}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <Box mt={3} sx={{ fontSize: '17px', color: '#444', pl: 1 }}>
            <Typography variant="body1" mb={1}><strong>Bio:</strong> {user.bio || '—'}</Typography>
            <Typography variant="body1" mb={1}><strong>Location:</strong> {user.location || '—'}</Typography>
            <Typography variant="body1" mb={1}><strong>Visibility:</strong> {user.profileVisibility}</Typography>
            <Typography variant="body1"><strong>Role:</strong> {user.role}</Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default Profile;
