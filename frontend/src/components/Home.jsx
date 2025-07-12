import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Questions.css';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const filter = searchParams.get('filter') || 'newest';
  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';
  const limit = 10;
  
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError('');

      try {
        let url = `/api/questions?page=${currentPage}&limit=${limit}`;
        if (filter === 'unanswered') url += `&filter=unanswered`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (tag) url += `&tag=${encodeURIComponent(tag)}`;

        const res = await axios.get(url);
        if (res.data.success) {
          setQuestions(res.data.questions);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [currentPage, filter, search, tag]);

useEffect(() => {
  const fetchTags = async () => {
    try {
      const res = await axios.get('/api/tags/popular');
      if (res.data.success) setTags(res.data.tags);
    } catch (err) {
      console.error('Error fetching tags', err);
    }
  };
  fetchTags();
}, []);


  const handleFilterChange = (newFilter) => {
    const newParams = { filter: newFilter, page: '1' };
    if (search) newParams.search = search;
    if (tag) newParams.tag = tag;
    setSearchParams(newParams);
  };

  const handleTagChange = (selectedTag) => {
    const newParams = { filter, page: '1', tag: selectedTag };
    if (search) newParams.search = search;
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { filter, page: '1' };
    if (searchQuery.trim()) newParams.search = searchQuery.trim();
    if (tag) newParams.tag = tag;
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = { filter, page: page.toString() };
    if (search) newParams.search = search;
    if (tag) newParams.tag = tag;
    setSearchParams(newParams);
  };

  const handleAskQuestion = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/ask-question' : '/login');
  };

  const createExcerpt = (html, maxLength = 150) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  };

  return (
    <div className="questions-page-container">
      <aside className="questions-sidebar">
        <h3>Filters</h3>
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

<h3>Top Tags</h3>
<div className="tags-list">
  {tags.length > 0 ? (
    tags.map((t) => (
      <button
        key={t._id}
        className={`tag-button ${tag === t.name ? 'active' : ''}`}
        onClick={() => handleTagChange(t.name)}
      >
        #{t.name} <span className="tag-count">({t.count})</span>
      </button>
    ))
  ) : (
    <p>No tags found.</p>
  )}
</div>


      </aside>

      <main className="questions-main-content">
        <div className="questions-top-bar">
          <h2>All Questions</h2>
          <button className="ask-btn" onClick={handleAskQuestion}>Ask a Question</button>
        </div>

        <form onSubmit={handleSearch} className="questions-search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
          />
          <button type="submit">Search</button>
        </form>

        {error && <div className="error-message">{error}</div>}

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
                <div className="question-title">
                  <Link to={`/questions/${q._id}`}>{q.title}</Link>
                </div>
                <div className="question-excerpt">{createExcerpt(q.description)}</div>
                <div className="question-tags">
                  {q.tags.map((tag) => (
                    <span key={tag._id} className="tag">{tag.name}</span>
                  ))}
                </div>
                <div className="question-meta">
                  <span>{q.answers.length} answers</span>
                  <span>by {q.author?.name || 'Unknown'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="questions-pagination">
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
      </main>
    </div>
  );
};

export default Questions;
