import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const body = JSON.stringify({ email, password });
      const res = await axios.post('/api/auth/login', body, config);

      if (res.data.success) {
        // Store JWT token in localStorage
        localStorage.setItem('token', res.data.token);
        
        setMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setMessage(errorMessage);
    }

    setIsLoading(false);
  };

  return (
    <div className="container">
      <h2>Sign In</h2>
      
      {message && (
        <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center mt-3">
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
        <p>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn; 