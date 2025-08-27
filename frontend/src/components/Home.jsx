import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Questions.css';
const API_BASE_URL = process.env.REACT_APP_BASE_URL;
// console.log("API_BASE_URL:", API_BASE_URL);

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current filter and page from URL params
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const filter = searchParams.get('filter') || 'newest';
  const search = searchParams.get('search') || '';
  const limit = 10;

  // Initialize search query from URL
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError('');
      
      try {
        let url = `${API_BASE_URL}/api/questions?page=${currentPage}&limit=${limit}`;
        
        // Add filter parameters if needed
        if (filter === 'unanswered') {
          // This would need to be implemented in the backend
          // For now, we'll just use the existing endpoint
          url += '&filter=unanswered';
        }

        // Add search parameter if provided
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const res = await axios.get(url);
        
        if (res.data.success) {
          setQuestions(res.data.questions);
          setPagination(res.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [currentPage, filter, search]);

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    const newParams = { filter: newFilter, page: '1' };
    if (search) newParams.search = search;
    setSearchParams(newParams);
  };

  // Handle page change
  const handlePageChange = (page) => {
    const newParams = { filter, page: page.toString() };
    if (search) newParams.search = search;
    setSearchParams(newParams);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { filter, page: '1' };
    if (searchQuery.trim()) newParams.search = searchQuery.trim();
    setSearchParams(newParams);
  };

  // Handle ask question click
  const handleAskQuestion = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/ask-question');
    } else {
      navigate('/login');
    }
  };

  // Create excerpt from HTML content
  const createExcerpt = (htmlContent, maxLength = 150) => {
    // Strip HTML tags and get plain text
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get vote count (for now, we'll show a placeholder since Answer model has votes)
  const getVoteCount = (question) => {
    // This would need to be calculated based on answers' votes
    // For now, return a placeholder
    return 0;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center">
          <h2>Loading questions...</h2>
          <p>Please wait while we fetch the latest questions.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error}
        </div>
        <div className="text-center">
          <button 
            onClick={() => window.location.reload()} 
            className="btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="questions-page">
      <div className="gradient-bg">
        <div className="container">
          <div className="top-bar">
            <h2>Questions</h2>
            <button className="btn-primary" onClick={handleAskQuestion}>Ask a Question</button>
          </div>

          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
            />
            <button type="submit">Search</button>
          </form>

          <div className="filter-buttons">
            <button
              className={filter === 'newest' ? 'active' : ''}
              onClick={() => handleFilterChange('newest')}
            >
              Newest
            </button>
            <button
              className={filter === 'unanswered' ? 'active' : ''}
              onClick={() => handleFilterChange('unanswered')}
            >
              Unanswered
            </button>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="questions-list">
            {loading ? (
              <p>Loading...</p>
            ) : questions.length === 0 ? (
              <div className="no-questions">
                <p>No questions found.</p>
                <button onClick={handleAskQuestion}>Be the first to ask!</button>
              </div>
            ) : (
              questions.map((q) => (
                <div className="question-card" key={q._id}>
                  <div className="question-header">
                    <Link to={`/questions/${q._id}`}>{q.title}</Link>
                  </div>
                  <div className="question-body">
                    <p>{createExcerpt(q.description)}</p>
                    <div className="tags">
                      {q.tags.map((tag) => (
                        <span className="tag" key={tag._id}>{tag.name}</span>
                      ))}
                    </div>
                    <div className="meta">
                      <span>{q.answers.length} answers</span>
                      <span>by {q.author?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                &lt;
              </button>
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  className={pagination.currentPage === i + 1 ? 'active' : ''}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions; 