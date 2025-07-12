import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const res = await axios.post('/api/auth/login', JSON.stringify(formData), config);

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setMessage(errorMessage);
    }

    setIsLoading(false);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #fff7f0, #ffe0c7)',
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
          maxWidth: 420,
          padding: 4,
          borderRadius: '30px',
          background: 'rgba(255, 255, 255, 0.75)',
          boxShadow: '0 8px 32px rgba(255, 165, 0, 0.25)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 165, 0, 0.25)',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Sign In
        </Typography>

        {message && (
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              borderRadius: '12px',
              padding: '10px',
              textAlign: 'center',
              backgroundColor: message.includes('successful') ? '#e6ffed' : '#ffe6e6',
              color: message.includes('successful') ? '#2e7d32' : '#c62828',
              border: `1px solid ${
                message.includes('successful') ? '#81c784' : '#ef5350'
              }`,
            }}
          >
            {message}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={handleChange}
            margin="normal"
            required
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: '15px',
                color: '#333',
              },
            }}
            InputLabelProps={{
              sx: { color: '#666' },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={handleChange}
            margin="normal"
            required
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: '15px',
                color: '#333',
              },
            }}
            InputLabelProps={{
              sx: { color: '#666' },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.4,
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: '25px',
              backgroundColor: '#ffa726',
              boxShadow: '0 4px 12px rgba(255, 167, 38, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#fb8c00',
                boxShadow: '0 6px 18px rgba(251, 140, 0, 0.5)',
              },
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Box mt={3} textAlign="center">
          <Typography variant="body2">
            Don’t have an account?{' '}
            <MuiLink component={Link} to="/signup" underline="hover" color="primary">
              Sign Up
            </MuiLink>
          </Typography>
          <Typography variant="body2" mt={1}>
            <MuiLink component={Link} to="/" underline="hover" color="primary">
              Back to Home
            </MuiLink>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default SignIn;
