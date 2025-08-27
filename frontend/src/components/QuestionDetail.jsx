import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Paper, Card, Box, Typography, Button, Chip, Alert, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../index';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voteLoading, setVoteLoading] = useState(null); // answerId being voted
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [votedAnswers, setVotedAnswers] = useState({}); // {answerId: 'up'|'down'}

  // Comments state for each answer
  const [commentTexts, setCommentTexts] = useState({}); // {answerId: text}
  const [commentSubmitting, setCommentSubmitting] = useState({}); // {answerId: bool}
  const [commentsShown, setCommentsShown] = useState({}); // {answerId: number}

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/questions/${id}`);
        if (res.data.success) {
          setQuestion(res.data.question);
        } else {
          setError('Question not found.');
        }
      } catch (err) {
        setError('Failed to load question.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  // Handle answer submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginPrompt(true);
      return;
    }
    if (!answerText || answerText === '<p><br></p>') return;
    setSubmitting(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const body = JSON.stringify({ description: answerText });
      const res = await api.post(`/answers/${id}`, body, config);
      if (res.data.success) {
        setAnswerText('');
        // Refresh question to show new answer
        const updated = await api.get(`/questions/${id}`);
        setQuestion(updated.data.question);
      }
    } catch (err) {
      setError('Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle voting with instant UI update
  const handleVote = async (answerId, type) => {
    if (!isAuthenticated) {
      setLoginPrompt(true);
      return;
    }
    setVoteLoading(answerId + type);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const body = { type };
      const res = await api.post(`/answers/${answerId}/vote`, body, config);
      if (res.data.success !== false) {
        // Update the answer's vote count in local state instantly
        setQuestion(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            answers: prev.answers.map(ans => {
              if (ans._id === answerId) {
                const newVotes = { ...ans.votes };
                if (type === 'up') newVotes.upvotes = (newVotes.upvotes || 0) + 1;
                if (type === 'down') newVotes.downvotes = (newVotes.downvotes || 0) + 1;
                return { ...ans, votes: newVotes };
              }
              return ans;
            })
          };
        });
        setVotedAnswers(prev => ({ ...prev, [answerId]: type }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to vote.');
    } finally {
      setVoteLoading(null);
    }
  };

  // Add comment to answer
  const handleAddComment = async (answerId) => {
    if (!isAuthenticated) {
      setLoginPrompt(true);
      return;
    }
    const text = commentTexts[answerId];
    if (!text || text === '<p><br></p>') return;
    setCommentSubmitting(prev => ({ ...prev, [answerId]: true }));
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const body = JSON.stringify({ text });
      const res = await api.post(`/answers/${answerId}/comments`, body, config);
      if (res.data.success) {
        setQuestion(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            answers: prev.answers.map(ans => {
              if (ans._id === answerId) {
                return {
                  ...ans,
                  comments: ans.comments ? [res.data.comment, ...ans.comments] : [res.data.comment]
                };
              }
              return ans;
            })
          };
        });
        setCommentTexts(prev => ({ ...prev, [answerId]: '' }));
        setCommentsShown(prev => ({ ...prev, [answerId]: 5 }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setCommentSubmitting(prev => ({ ...prev, [answerId]: false }));
    }
  };

  // Helper to highlight @mentions in comment text
  const highlightMentions = (html) => {
    return html.replace(/@([a-zA-Z0-9_]+)/g, '<span class="mention">@$1</span>');
  };

  // Quill config
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };
  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'image'
  ];

  if (loading) return <div className="container"><h2>Loading...</h2></div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!question) return null;

  return (
    <div className="container question-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Questions</Link> &gt; <span>{question.title}</span>
      </div>

      {/* Question Info */}
      <div className="question-detail-card">
        <h2>{question.title}</h2>
        <div className="question-tags">
          {question.tags.map(tag => (
            <span key={tag._id} className="tag">{tag.name}</span>
          ))}
        </div>
        <div className="question-description" dangerouslySetInnerHTML={{ __html: question.description }} />
        <div className="question-meta">
          <Typography variant="caption">Asked by <b>{question.author?.name || 'Unknown'}</b></Typography>
        </div>
      </div>

      {/* Answers */}
      <div className="answers-section">
        <h3>Answers</h3>
        {question.answers.length === 0 && <p>No answers yet. Be the first to answer!</p>}
        {question.answers.map(answer => (
          <div key={answer._id} className="answer-card">
            <div className="vote-controls">
              <button
                className="vote-btn"
                disabled={voteLoading === answer._id + 'up' || votedAnswers[answer._id] === 'up'}
                onClick={() => handleVote(answer._id, 'up')}
                title={isAuthenticated ? 'Upvote' : 'Login to vote'}
              >▲</button>
              <div className="vote-count">{answer.votes?.upvotes || 0}</div>
              <button
                className="vote-btn"
                disabled={voteLoading === answer._id + 'down' || votedAnswers[answer._id] === 'down'}
                onClick={() => handleVote(answer._id, 'down')}
                title={isAuthenticated ? 'Downvote' : 'Login to vote'}
              >▼</button>
            </div>
            <div className="answer-content">
              <div dangerouslySetInnerHTML={{ __html: answer.description }} />
              <Typography variant="caption" display="block" mt={1}>
                By <b>{answer.author?.name || 'User'}</b>
              </Typography>
              {/* Comments Section */}
              <div className="comments-section">
                <h5>Comments</h5>
                {(answer.comments && answer.comments.length > 0) ? (
                  <>
                    {(answer.comments.slice(0, commentsShown[answer._id] || 5)).map((comment, idx) => (
                      <div key={comment._id || idx} className="comment-item">
                        <span className="comment-user">@{comment.user?.name || 'Unknown'}</span>:
                        <span className="comment-text" dangerouslySetInnerHTML={{ __html: highlightMentions(comment.text) }} />
                        <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                    {answer.comments.length > (commentsShown[answer._id] || 5) && (
                      <button className="btn btn-secondary btn-sm" onClick={() => setCommentsShown(prev => ({ ...prev, [answer._id]: (prev[answer._id] || 5) + 5 }))}>
                        Load more comments
                      </button>
                    )}
                  </>
                ) : (
                  <div className="no-comments">No comments yet.</div>
                )}
                {/* Add Comment Editor */}
                <div className="add-comment-editor">
                  <ReactQuill
                    theme="snow"
                    value={commentTexts[answer._id] || ''}
                    onChange={val => setCommentTexts(prev => ({ ...prev, [answer._id]: val }))}
                    modules={{ toolbar: [['bold', 'italic', 'underline'], ['link'] ] }}
                    formats={['bold', 'italic', 'underline', 'link']}
                    placeholder="Add a comment... Use @username to mention."
                    style={{ height: '60px', marginBottom: '10px' }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 4 }}
                    disabled={commentSubmitting[answer._id] || !isAuthenticated}
                    onClick={() => handleAddComment(answer._id)}
                  >
                    {commentSubmitting[answer._id] ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Submission */}
      <div className="submit-answer-section">
        <h3>Submit Your Answer</h3>
        {!isAuthenticated && loginPrompt && (
          <div className="alert alert-error">
            Please <Link to="/login">login</Link> or <Link to="/signup">sign up</Link> to submit an answer or vote.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <ReactQuill
            theme="snow"
            value={answerText}
            onChange={setAnswerText}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Write your answer..."
            style={{ height: '120px', marginBottom: '30px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={submitting || !isAuthenticated}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionDetail; 