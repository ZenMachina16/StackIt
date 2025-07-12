import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';

const COLORS = ['#FF8C42', '#FFCDAB', '#FFD6A5'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalQuestions: 0,
    userQuestions: 0,
    userAnswers: 0,
    unreadNotifications: 0,
  });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const res = await axios.get('/api/auth/me', config);
        if (res.data.success) {
          setUser(res.data.user);
          const unreadNotifications = res.data.user.notifications
            ? res.data.user.notifications.filter((n) => !n.isRead).length
            : 0;
          setStats((prev) => ({ ...prev, unreadNotifications }));
        }
      } catch (err) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      }

      setLoading(false);
    };

    verifyToken();
  }, [navigate]);

  useEffect(() => {
  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setActivityLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/stats/me', config);
      if (res.data.success) {
        const stats = res.data.stats;
        setStats((prev) => ({
          ...prev,
          userQuestions: stats.questionCount,
          userAnswers: stats.answerCount,
        }));

        const mergedQuestions = stats.questions.map((desc, index) => ({
          _id: stats.questionIDs[index],
          title: desc,
        }));

        const mergedAnswers = stats.answers.map((desc, index) => ({
          _id: stats.answerIDs[index],
          description: desc,
        }));

        setQuestions(mergedQuestions);
        setAnswers(mergedAnswers);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err.message);
    }
    setActivityLoading(false);
  };
  fetchStats();
}, []);

  const stripHTML = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      setStats((prev) => ({ ...prev, userQuestions: prev.userQuestions - 1 }));
    } catch {
      alert('Failed to delete question.');
    }
  };

  const handleDeleteAnswer = async (id) => {
  if (!window.confirm('Are you sure you want to delete this answer?')) return;
  const token = localStorage.getItem('token');
  try {
    await axios.delete(`/api/answers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAnswers((prev) => prev.filter((a) => a._id !== id));
    setStats((prev) => ({ ...prev, userAnswers: prev.userAnswers - 1 }));
    toast.success('Answer deleted successfully');
  } catch {
    toast.error('Failed to delete answer');
  }
};


  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ background: 'linear-gradient(135deg, #FFF5E1, #FFD6A5)' }}
      >
        <Box textAlign="center">
          <CircularProgress sx={{ color: '#FF8C42' }} />
          <Typography mt={2}>Verifying your session...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ background: 'linear-gradient(135deg, #FFF5E1, #FFD6A5)' }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const chartData = [
    { name: 'Questions', value: stats.userQuestions },
    { name: 'Answers', value: stats.userAnswers },
    { name: 'Notifications', value: stats.unreadNotifications },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF5E1, #FFD6A5)',
        color: '#4b2e2e',
        p: 0,
      }}
    >
      <Grid container>
        {/* Left Sidebar */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.3)',
            minHeight: '100vh',
            backdropFilter: 'blur(8px)',
            p: 3,
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
              sx={{ width: 80, height: 80 }}
            />
            <Typography variant="h6">{user?.name || 'User'}</Typography>
            <Typography variant="body2">{user?.role === 'admin' ? 'Administrator' : 'Member'}</Typography>

            <Box mt={4} width="100%">
              {[{ text: 'Browse Questions', link: '/' }, { text: 'Ask Question', link: '/ask-question' }, { text: 'Profile', link: '/profile' }].map((action, i) => (
                <Button
                  key={i}
                  component={Link}
                  to={action.link}
                  fullWidth
                  sx={{
                    mb: 2,
                    background: '#ffffff66',
                    color: '#4b2e2e',
                    fontWeight: 'bold',
                    borderRadius: 3,
                    '&:hover': { background: '#ffffff99' },
                  }}
                >
                  {action.text}
                </Button>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Right Main Area */}
        <Grid item xs={12} md={9} sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Dashboard
          </Typography>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            {[{ label: 'Questions Asked', value: stats.userQuestions }, { label: 'Answers Given', value: stats.userAnswers }].map((stat, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.4)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" align="center" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography align="center" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Chart Section */}
          <Box mb={5}>
                      <Typography variant="h6" mb={2}>
                        Activity Breakdown
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

        {/* My Questions */}
        <Box mb={5}>
  <Typography variant="h6" mb={2}>
    My Questions
  </Typography>

  {activityLoading ? (
    <CircularProgress size={24} />
  ) : questions.length === 0 ? (
    <Typography variant="body2" color="#8b5d3d" mb={2}>
      You haven't asked any questions yet.
    </Typography>
  ) : (
    <Box>
      {questions.map((q, index) => (
        <Card key={q._id} sx={{ mb: 2, background: '#fffbe6', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">
              Question {index + 1}
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={1}>
              {stripHTML(q.title)}
            </Typography>

            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteQuestion(q._id)}
              aria-label="delete question"
            >
              <DeleteIcon />
            </IconButton>
          </CardContent>
        </Card>
      ))}
    </Box>
  )}
</Box>

                    {/* My Answers */}
                    <Box mb={5}>
            <Typography variant="h6" mb={2}>
              My Answers
            </Typography>
            {activityLoading ? (
              <CircularProgress size={24} />
            ) : answers.length === 0 ? (
              <Typography variant="body2" color="#8b5d3d" mb={2}>
                You haven't given any answers yet.
              </Typography>
            ) : (
              <Box>
                {answers.map((answer, index) => (
                  <Card key={index} sx={{ mb: 2, background: '#e6fff7', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Answer {index + 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {stripHTML(answer.description)}
                      </Typography>
                      <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteAnswer(answer._id)}
                                                aria-label="delete question"
                                              >
                                                <DeleteIcon />
                                              </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>

          {/* Admin Panel */}
          {user?.role === 'admin' && (
            <Box>
              <Typography variant="h6" mb={2}>
                Admin Panel
              </Typography>
              <Grid container spacing={2}>
                {['Manage Users', 'Manage Tags', 'View Reports'].map((text, i) => (
                  <Grid item key={i}>
                    <Button variant="contained" color="warning" sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                      {text}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;