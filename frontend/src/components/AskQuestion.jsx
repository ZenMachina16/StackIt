import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const AskQuestion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { title, description, tags } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  const processTags = (tagsString) => {
    if (!tagsString.trim()) return [];
    return tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 5);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!title.trim()) {
      setMessage('Please enter a title');
      setLoading(false);
      return;
    }

    if (!description.trim() || description === '<p><br></p>') {
      setMessage('Please enter a description');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to ask a question');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const processedTags = processTags(tags);

      const body = JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        tags: processedTags,
      });

      const res = await axios.post('/api/questions', body, config);

      if (res.data.success) {
        setMessage('Question posted successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      console.error('Error creating question:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to create question';
      setMessage(errorMessage);

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'link',
    'image',
  ];

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #FFF5E1, #FFD6A5)',
        minHeight: '100vh',
        py: 4,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 800,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: 5,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Ask a Question
        </Typography>

        {message && (
          <Alert
            severity={message.includes('successfully') ? 'success' : 'error'}
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        <form onSubmit={onSubmit}>
          {/* Title */}
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="Enter a descriptive title"
            margin="normal"
            disabled={loading}
            required
          />

          {/* Description */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Description
          </Typography>
          <ReactQuill
            theme="snow"
            value={description}
            onChange={onDescriptionChange}
            modules={quillModules}
            formats={quillFormats}
            style={{
              height: '200px',
              marginBottom: '40px',
              borderRadius: '12px',
              background: '#fff',
            }}
          />

          {/* Tags */}
          <TextField
            fullWidth
            label="Tags"
            name="tags"
            value={tags}
            onChange={onChange}
            placeholder="e.g. javascript, react, api"
            margin="normal"
            disabled={loading}
            helperText={`Separate tags with commas. Max 5. (${processTags(tags).length} selected)`}
          />

          {/* Buttons */}
          <Box mt={4} display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#ffa726',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '16px',
                py: 1.4,
                boxShadow: '0 4px 12px rgba(255, 167, 38, 0.4)',
                '&:hover': {
                  backgroundColor: '#fb8c00',
                  boxShadow: '0 6px 16px rgba(251, 140, 0, 0.6)',
                },
              }}
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Question'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: '30px',
                color: '#4b2e2e',
                borderColor: '#4b2e2e',
                fontWeight: 'bold',
                py: 1.4,
                '&:hover': {
                  backgroundColor: '#f0e6da',
                },
              }}
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AskQuestion; 