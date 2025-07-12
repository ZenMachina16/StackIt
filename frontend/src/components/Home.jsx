import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Questions.css';

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
        let url = `/api/questions?page=${currentPage}&limit=${limit}`;
        
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
      <div className="container">
        {/* Top Action Bar */}
        <div className="top-action-bar">
          <button 
            className="btn btn-primary ask-question-btn"
            onClick={handleAskQuestion}
          >
            Ask New Question
          </button>
          
          <div className="filter-search-container">
            <div className="filter-controls">
              <button 
                className={`filter-btn ${filter === 'newest' ? 'active' : ''}`}
                onClick={() => handleFilterChange('newest')}
              >
                Newest
              </button>
              <button 
                className={`filter-btn ${filter === 'unanswered' ? 'active' : ''}`}
                onClick={() => handleFilterChange('unanswered')}
              >
                Unanswered
              </button>
              <div className="dropdown">
                <button className="filter-btn dropdown-btn">
                  More ▼
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </form>
          </div>
        </div>

        {/* Questions List */}
        <div className="questions-container">
          {questions.length === 0 ? (
            <div className="no-questions">
              <h3>No questions found</h3>
              <p>Be the first to ask a question!</p>
              <button className="btn btn-primary" onClick={handleAskQuestion}>
                Ask the First Question
              </button>
            </div>
          ) : (
            questions.map(question => (
              <div key={question._id} className="question-item">
                <div className="question-main">
                  <h3 className="question-title">
                    <Link to={`/questions/${question._id}`}>
                      {question.title}
                    </Link>
                  </h3>
                  
                  <p className="question-excerpt">
                    {createExcerpt(question.description)}
                  </p>
                  
                  <div className="question-footer">
                    <div className="question-tags">
                      {question.tags.map(tag => (
                        <span key={tag._id} className="tag">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    
                    <div className="question-author">
                      <span className="author-name">{question.author?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="question-stats">
                  <div className="answer-count">
                    <span className="count">{question.answers.length}</span>
                    <span className="label">ans</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
              >
                ‹
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(7, pagination.totalPages) }, (_, i) => {
                const startPage = Math.max(1, pagination.currentPage - 3);
                const page = startPage + i;
                
                if (page <= pagination.totalPages) {
                  return (
                    <button 
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`pagination-btn ${page === pagination.currentPage ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              })}
              
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions; 