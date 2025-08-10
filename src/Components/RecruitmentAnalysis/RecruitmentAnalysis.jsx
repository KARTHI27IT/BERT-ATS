import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, 
  Users, 
  BarChart3, 
  FileText, 
  Target, 
  TrendingUp,
  Award,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import './RecruitmentAnalysis.css';

function RecruitmentAnalysis() {
  const [files, setFiles] = useState([]);
  const [role, setRole] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSort = (criteria) => {
    setSortBy(criteria);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'needs-improvement';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle size={16} />;
    if (score >= 60) return <Clock size={16} />;
    return <AlertCircle size={16} />;
  };

  const filteredAndSortedResults = results
    .filter(result => {
      const matchesSearch = result.name.toLowerCase().includes(searchTerm.toLowerCase());
      const score = result.ats?.ensemble_score || 0;
      
      if (filterBy === 'excellent') return matchesSearch && score >= 80;
      if (filterBy === 'good') return matchesSearch && score >= 60 && score < 80;
      if (filterBy === 'needs-improvement') return matchesSearch && score < 60;
      return matchesSearch;
    })
    .sort((a, b) => {
      const scoreA = a.ats?.ensemble_score || 0;
      const scoreB = b.ats?.ensemble_score || 0;
      const confidenceA = a.ats?.confidence || 0;
      const confidenceB = b.ats?.confidence || 0;
      
      if (sortBy === 'score') return scoreB - scoreA;
      if (sortBy === 'confidence') return confidenceB - confidenceA;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role || files.length === 0) {
      setError('Please select a role and upload at least one resume.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    const formData = new FormData();
    for (let file of files) {
      formData.append('resumes', file);
    }
    formData.append('role', role);

    try {
      const response = await axios.post('http://localhost:5000/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.results) {
        setResults(response.data.results);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to process resumes.');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const csvContent = [
      ['Candidate', 'ATS Score', 'Confidence', 'Median Score', 'Status'],
      ...filteredAndSortedResults.map(result => [
        result.name,
        result.ats?.ensemble_score?.toFixed(2) || 'N/A',
        result.ats?.confidence?.toFixed(2) || 'N/A',
        result.ats?.median_score?.toFixed(2) || 'N/A',
        result.ats?.ensemble_score >= 80 ? 'Excellent' : 
        result.ats?.ensemble_score >= 60 ? 'Good' : 'Needs Improvement'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="recruitment-container">
      <div className="container">
        {/* Header */}
        <div className="recruitment-header">
          <div className="header-content">
            <div className="header-icon">
              <Users size={32} />
            </div>
            <div>
              <h1 className="header-title">Recruitment Analysis</h1>
              <p className="header-subtitle">
                Analyze multiple resumes simultaneously with AI-powered ATS scoring
              </p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-value">{results.length}</div>
              <div className="stat-label">Candidates Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {results.length > 0 ? 
                  Math.round(results.reduce((acc, r) => acc + (r.ats?.ensemble_score || 0), 0) / results.length) : 0}
              </div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <p className="loading-text">Analyzing {files.length} resumes...</p>
                <div className="loading-progress">
                  <div className="progress-bar"></div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Upload size={16} />
                  Upload Resumes
                </label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    className="file-input"
                    accept=".pdf,.docx"
                    multiple
                    onChange={handleFileChange}
                    required
                    disabled={loading}
                  />
                  <div className="file-input-content">
                    <Upload className="file-input-icon" size={32} />
                    <p className="file-input-text">
                      {files.length > 0 ? `${files.length} files selected` : 'Choose Resume Files'}
                    </p>
                    <p className="file-input-subtext">
                      PDF, DOCX supported • Multiple files allowed
                    </p>
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="selected-files">
                    <p className="files-count">{files.length} files ready for analysis</p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Target size={16} />
                  Target Role
                </label>
                <select 
                  className="form-control" 
                  value={role} 
                  onChange={handleRoleChange}
                  required
                  disabled={loading}
                >
                  <option value="">-- Select Role --</option>
                  <option value="full_stack">Full Stack Developer</option>
                  <option value="data_analyst">Data Analyst</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`}
              disabled={loading || !role || files.length === 0}
            >
              {loading ? (
                'Analyzing Resumes...'
              ) : (
                <>
                  <BarChart3 size={20} />
                  Analyze {files.length} Resume{files.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-card">
            <div className="error-content">
              <AlertCircle className="error-icon" size={20} />
              <p className="error-text">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">Analysis Results</h2>
              <div className="results-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={exportResults}
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="filters-section">
              <div className="search-box">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-controls">
                <div className="filter-group">
                  <Filter size={16} />
                  <select 
                    value={filterBy} 
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Candidates</option>
                    <option value="excellent">Excellent (80+)</option>
                    <option value="good">Good (60-79)</option>
                    <option value="needs-improvement">Needs Improvement (&lt;60)</option>
                  </select>
                </div>
                
                <div className="sort-group">
                  <TrendingUp size={16} />
                  <select 
                    value={sortBy} 
                    onChange={(e) => handleSort(e.target.value)}
                    className="sort-select"
                  >
                    <option value="score">Sort by Score</option>
                    <option value="confidence">Sort by Confidence</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="results-grid">
              {filteredAndSortedResults.map((result, index) => {
                const ats = result.ats || {};
                const score = ats.ensemble_score || 0;
                const scoreColor = getScoreColor(score);
                
                return (
                  <div key={index} className="candidate-card">
                    <div className="candidate-header">
                      <div className="candidate-info">
                        <h3 className="candidate-name">
                          {result.name || `Candidate ${index + 1}`}
                        </h3>
                        <div className={`candidate-status status-${scoreColor}`}>
                          {getScoreIcon(score)}
                          <span>
                            {score >= 80 ? 'Excellent Match' : 
                             score >= 60 ? 'Good Match' : 'Needs Improvement'}
                          </span>
                        </div>
                      </div>
                      <div className="candidate-score">
                        <div className={`score-circle score-${scoreColor}`}>
                          <span className="score-value">{Math.round(score)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="candidate-metrics">
                      <div className="metric-item">
                        <div className="metric-label">ATS Score</div>
                        <div className="metric-value">
                          {score ? score.toFixed(1) : 'N/A'} / 100
                        </div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-label">Confidence</div>
                        <div className="metric-value">
                          {ats.confidence ? ats.confidence.toFixed(1) + '%' : 'N/A'}
                        </div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-label">Median Score</div>
                        <div className="metric-value">
                          {ats.median_score ? ats.median_score.toFixed(1) : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="candidate-actions">
                      <button className="btn btn-outline btn-sm">
                        <Eye size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredAndSortedResults.length === 0 && (
              <div className="no-results">
                <FileText size={48} />
                <h3>No candidates match your criteria</h3>
                <p>Try adjusting your search or filter settings</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruitmentAnalysis;
