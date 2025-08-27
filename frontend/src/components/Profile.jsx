import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Link as LinkIcon, LocationOn as LocationIcon } from '@mui/icons-material';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
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
          setFormData({
            name: res.data.user.name || '',
            avatar: res.data.user.avatar || '',
            bio: res.data.user.bio || '',
            location: res.data.user.location || '',
            website: res.data.user.website || ''
          });
        }
      } catch (error) {
        console.error('Profile fetch failed:', error);
        setError('Failed to load profile. Please try again.');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setUpdateSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const res = await axios.put('/api/auth/profile', formData, config);
      
      if (res.data.success) {
        setUser(res.data.user);
        setUpdateSuccess(true);
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date properly to avoid "Invalid Date"
  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Date unavailable';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Date unavailable';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Date unavailable';
    }
  };

  if (loading && !user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="60vh"
          flexDirection="column"
          sx={{ color: '#FFFFFF' }}
        >
          <CircularProgress color="warning" size={60} thickness={4} sx={{ color: '#FF6600' }} />
          <Typography variant="h6" sx={{ mt: 3, color: '#B3B3B3', fontWeight: 500 }}>
            Loading profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && !user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, color: '#FFFFFF' }}>
      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {user && (
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper 
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                background: 'linear-gradient(to right, #1E1E1E, #2A2A2A)',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                My Profile
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                sx={{
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  bgcolor: '#FF6600',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    bgcolor: '#FF8533',
                    boxShadow: '0 0 10px rgba(255, 102, 0, 0.8)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                Edit Profile
              </Button>
            </Paper>
          </Grid>
          
          {/* Left Column - User Info */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                background: '#1E1E1E',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
              }}
            >
              <Box 
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  background: 'linear-gradient(to bottom, #1E1E1E, #2A2A2A)'
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#FF6600',
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    mb: 2,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {user.name}
                </Typography>
                <Typography variant="body1" color="#B3B3B3">
                  {user.email}
                </Typography>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                {user.bio && (
                  <Box mb={2}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#FFFFFF' }}>
                      {user.bio}
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#B3B3B3' }} gutterBottom>
                    Member since
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                    {formatMemberSince(user.createdAt)}
                  </Typography>
                </Box>
                
                {user.location && (
                  <Box mt={2} display="flex" alignItems="center">
                    <LocationIcon fontSize="small" sx={{ mr: 1, color: '#FF6600' }} />
                    <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                      {user.location}
                    </Typography>
                  </Box>
                )}
                
                {user.website && (
                  <Box mt={1} display="flex" alignItems="center">
                    <LinkIcon fontSize="small" sx={{ mr: 1, color: '#FF6600' }} />
                    <Typography variant="body2">
                      <a 
                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#FF6600', textDecoration: 'none', transition: 'color 0.3s ease' }}
                        onMouseOver={(e) => e.target.style.color = '#FF8533'}
                        onMouseOut={(e) => e.target.style.color = '#FF6600'}
                      >
                        {user.website}
                      </a>
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right Column - Activity */}
          <Grid item xs={12} md={8}>
            <Card 
              elevation={3} 
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                background: '#1E1E1E',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      py: 2,
                      color: '#B3B3B3',
                      transition: 'all 0.3s ease'
                    },
                    '& .Mui-selected': {
                      color: '#FF6600'
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#FF6600',
                      height: 3
                    }
                  }}
                >
                  <Tab label="QUESTIONS" />
                  <Tab label="ANSWERS" />
                  <Tab label="ACTIVITY" />
                </Tabs>
              </Box>
              
              <Box sx={{ p: 3 }}>
                {/* Questions Tab */}
                {tabValue === 0 && (
                  <>
                    {user.questions && user.questions.length > 0 ? (
                      <List>
                        {user.questions.map((question) => (
                          <ListItem 
                            key={question._id}
                            alignItems="flex-start"
                            sx={{
                              mb: 1,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'rgba(255,255,255,0.05)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: 'rgba(255,102,0,0.1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography 
                                  variant="h6" 
                                  component="a" 
                                  href={`/questions/${question._id}`}
                                  sx={{ 
                                    color: '#FFFFFF',
                                    textDecoration: 'none',
                                    transition: 'color 0.3s ease',
                                    '&:hover': { color: '#FF6600' }
                                  }}
                                >
                                  {question.title}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" sx={{ mt: 1, color: '#B3B3B3' }}>
                                    {question.description && question.description.length > 150 
                                      ? `${question.description.substring(0, 150)}...` 
                                      : question.description}
                                  </Typography>
                                  <Box sx={{ mt: 1 }}>
                                    {question.tags && question.tags.map((tag) => (
                                      <Chip 
                                        key={tag._id || tag}
                                        label={tag.name || tag}
                                        size="small"
                                        sx={{ 
                                          mr: 0.5, 
                                          mb: 0.5,
                                          backgroundColor: 'rgba(255,102,0,0.2)',
                                          color: '#FF6600'
                                        }} 
                                      />
                                    ))}
                                  </Box>
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        px: 2,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" sx={{ color: '#B3B3B3', mb: 2 }}>
                          You haven't asked any questions yet.
                        </Typography>
                        <Button 
                          variant="contained" 
                          href="/ask-question"
                          sx={{ 
                            mt: 2, 
                            borderRadius: 8,
                            px: 3,
                            fontWeight: 'bold',
                            bgcolor: '#FF6600',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#FF8533',
                              boxShadow: '0 0 10px rgba(255, 102, 0, 0.8)'
                            }
                          }}
                        >
                          ASK YOUR FIRST QUESTION
                        </Button>
                      </Box>
                    )}
                  </>
                )}
                
                {/* Answers Tab */}
                {tabValue === 1 && (
                  <>
                    {user.answers && user.answers.length > 0 ? (
                      <List>
                        {user.answers.map((answer) => (
                          <ListItem 
                            key={answer._id}
                            alignItems="flex-start"
                            sx={{
                              mb: 1,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'rgba(255,255,255,0.05)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: 'rgba(255,102,0,0.1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography 
                                  variant="h6" 
                                  component="a" 
                                  href={`/questions/${answer.question}`}
                                  sx={{ 
                                    color: '#FFFFFF',
                                    textDecoration: 'none',
                                    transition: 'color 0.3s ease',
                                    '&:hover': { color: '#FF6600' }
                                  }}
                                >
                                  {answer.question && answer.question.title ? answer.question.title : 'Question'}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ mt: 1, color: '#B3B3B3' }}>
                                  {answer.description && answer.description.length > 150 
                                    ? `${answer.description.substring(0, 150)}...` 
                                    : answer.description}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        px: 2,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" sx={{ color: '#B3B3B3', mb: 2 }}>
                          You haven't answered any questions yet.
                        </Typography>
                        <Button 
                          variant="contained" 
                          href="/"
                          sx={{ 
                            mt: 2, 
                            borderRadius: 8,
                            px: 3,
                            fontWeight: 'bold',
                            bgcolor: '#FF6600',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#FF8533',
                              boxShadow: '0 0 10px rgba(255, 102, 0, 0.8)'
                            }
                          }}
                        >
                          BROWSE QUESTIONS
                        </Button>
                      </Box>
                    )}
                  </>
                )}
                
                {/* Activity Tab */}
                {tabValue === 2 && (
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center', 
                    py: 6,
                    px: 2,
                    height: '200px',
                    bgcolor: 'rgba(0,0,0,0.1)',
                    borderRadius: 2
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#FF6600',
                        fontWeight: 'bold',
                        mb: 2,
                        opacity: 0.6,
                        fontStyle: 'italic'
                      }}
                    >
                      Activity tracking coming soon!
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', opacity: 0.6 }}>
                      We're working on tracking your reputation, badges, and other activities.
                      Check back soon for updates!
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1E1E1E',
            color: '#FFFFFF',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 2 }}>
          Edit Profile
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)', p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                InputLabelProps={{ sx: { color: '#B3B3B3' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,102,0,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF6600' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Avatar URL"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                helperText="Enter a URL to your profile image"
                InputLabelProps={{ sx: { color: '#B3B3B3' } }}
                FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,102,0,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF6600' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                multiline
                rows={4}
                helperText={`${formData.bio.length}/500 characters`}
                InputLabelProps={{ sx: { color: '#B3B3B3' } }}
                FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,102,0,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF6600' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                InputLabelProps={{ sx: { color: '#B3B3B3' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,102,0,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF6600' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                InputLabelProps={{ sx: { color: '#B3B3B3' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,102,0,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF6600' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<CancelIcon />}
            sx={{ 
              mr: 1, 
              color: '#B3B3B3',
              transition: 'all 0.3s ease',
              '&:hover': { color: '#FFFFFF' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 'bold',
              bgcolor: '#FF6600',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#FF8533',
                boxShadow: '0 0 10px rgba(255, 102, 0, 0.8)'
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;