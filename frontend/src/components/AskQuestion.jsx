import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AskQuestion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { title, description, tags } = formData;

  // Handle input changes
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle QuillJS editor changes
  const onDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  // Process tags from comma-separated string to array
  const processTags = (tagsString) => {
    if (!tagsString.trim()) return [];
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5); // Limit to 5 tags
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate form
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
          'Authorization': `Bearer ${token}`
        }
      };

      // Process tags into array of tag names for now
      // In a real app, you might want to create/find tag IDs
      const processedTags = processTags(tags);
      
      const body = JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        tags: processedTags
      });

      const res = await axios.post('/api/questions', body, config);

      if (res.data.success) {
        setMessage('Question posted successfully! Redirecting to home...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating question:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create question';
      setMessage(errorMessage);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // QuillJS configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'blockquote', 'code-block', 'link', 'image'
  ];

  return (
    <div className="container">
      <h2>Ask a Question</h2>
      
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
            placeholder="Enter a descriptive title for your question"
            disabled={loading}
          />
        </div>

        {/* Description Field with QuillJS */}
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <ReactQuill
            theme="snow"
            value={description}
            onChange={onDescriptionChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Describe your question in detail..."
            style={{ height: '200px', marginBottom: '50px' }}
          />
        </div>

        {/* Tags Input */}
        <div className="form-group">
          <label htmlFor="tags">Tags (Optional)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={tags}
            onChange={onChange}
            placeholder="Enter tags separated by commas (e.g., javascript, react, frontend)"
            disabled={loading}
          />
          <small className="form-text">
            Separate tags with commas. Maximum 5 tags allowed.
            {tags && ` Current: ${processTags(tags).length} tag(s)`}
          </small>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
        >
          {loading ? 'Posting Question...' : 'Post Question'}
        </button>
      </form>

      {/* Navigation Links */}
      <div className="text-center mt-3">
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AskQuestion; 