import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PersonalAnalysis.css';
// Import Lucide Icons
import { 
  Upload, 
  FileText, 
  Target, 
  Github, 
  Code, 
  Trophy,
  AlertCircle, 
  CheckCircle, 
  FileCheck,
  Lightbulb,
  Download,
  Sparkles,
  X,
  Eye,
  Brain
} from 'lucide-react';

function PersonalAnalysis() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('full_stack');
  const [githubStats, setGithubStats] = useState(null);
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [githubId, setGithubId] = useState('');
  const [leetcodeId, setLeetcodeId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [comprehensiveScore, setComprehensiveScore] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [githubScore, setGithubScore] = useState({ score: 0 });
  const [leetcodeScore, setLeetcodeScore] = useState({ score: 0 });
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      resetOutput();
    }
  };

  const resetOutput = () => {
    setScoreData(null);
    setText('');
    setError(null);
    setGithubStats(null);
    setLeetcodeStats(null);
    setReport('');
    setComprehensiveScore(null);
    setGithubScore({ score: 0 });
    setLeetcodeScore({ score: 0 });
  };

  // Enhanced GitHub Score Calculation
  const calculateGitHubScore = (stats) => {
    if (!stats) return { score: 0, breakdown: {}, grade: 'F', level: 'Beginner' };
    const { publicRepos, followers, following } = stats;
    let score = 0;
    let breakdown = {};
    const repoScore = Math.min(publicRepos * 1.5, 30);
    breakdown.repositories = { score: repoScore, max: 30, value: publicRepos };
    score += repoScore;
    const followerScore = Math.min(followers * 0.3, 25);
    breakdown.followers = { score: followerScore, max: 25, value: followers };
    score += followerScore;
    const followingRatio = followers > 0 ? Math.min(followers / (following + 1), 3) : 0;
    const ratioScore = followingRatio * 5;
    breakdown.engagement = { score: ratioScore, max: 15, ratio: followingRatio.toFixed(2) };
    score += ratioScore;
    const activityScore = Math.min(publicRepos > 0 ? 20 : 0, 20);
    breakdown.activity = { score: activityScore, max: 20 };
    score += activityScore;
    const consistencyScore = publicRepos >= 5 ? 10 : publicRepos * 2;
    breakdown.consistency = { score: consistencyScore, max: 10 };
    score += consistencyScore;
    const finalScore = Math.min(Math.round(score), 100);
    return {
      score: finalScore,
      breakdown,
      grade: getScoreGrade(finalScore),
      level: getGitHubLevel(finalScore)
    };
  };

  // Enhanced LeetCode Score Calculation
  const calculateLeetCodeScore = (stats) => {
    if (!stats) return { score: 0, breakdown: {}, grade: 'F', level: 'Beginner' };
    const { totalSolved, easySolved, mediumSolved, hardSolved, ranking } = stats;
    let score = 0;
    let breakdown = {};
    const problemScore = Math.min(totalSolved * 0.15, 40);
    breakdown.totalProblems = { score: problemScore, max: 40, value: totalSolved };
    score += problemScore;
    const easyPoints = easySolved * 0.5;
    const mediumPoints = mediumSolved * 1.5;
    const hardPoints = hardSolved * 3;
    const difficultyScore = Math.min(easyPoints + mediumPoints + hardPoints, 30);
    breakdown.difficulty = { 
      score: difficultyScore, 
      max: 30, 
      easy: easySolved, 
      medium: mediumSolved, 
      hard: hardSolved 
    };
    score += difficultyScore;
    let rankingScore = 0;
    if (ranking && ranking > 0) {
      if (ranking <= 10000) rankingScore = 20;
      else if (ranking <= 50000) rankingScore = 15;
      else if (ranking <= 100000) rankingScore = 10;
      else if (ranking <= 500000) rankingScore = 5;
    }
    breakdown.ranking = { score: rankingScore, max: 20, value: ranking };
    score += rankingScore;
    const consistencyScore = (easySolved > 0 && mediumSolved > 0 && hardSolved > 0) ? 10 : 
                            (easySolved > 0 && mediumSolved > 0) ? 7 : 
                            (easySolved > 0) ? 4 : 0;
    breakdown.consistency = { score: consistencyScore, max: 10 };
    score += consistencyScore;
    const finalScore = Math.min(Math.round(score), 100);
    return {
      score: finalScore,
      breakdown,
      grade: getScoreGrade(finalScore),
      level: getLeetCodeLevel(finalScore)
    };
  };

  // Comprehensive Score Calculation with weighted components
  const calculateComprehensiveScore = (atsScore, githubScoreData, leetcodeScoreData) => {
    let weights = { ats: 0.5, github: 0.25, leetcode: 0.25 };
    if (!githubScoreData && !leetcodeScoreData) {
      weights = { ats: 1.0, github: 0, leetcode: 0 };
    } else if (!githubScoreData) {
      weights = { ats: 0.6, github: 0, leetcode: 0.4 };
    } else if (!leetcodeScoreData) {
      weights = { ats: 0.6, github: 0.4, leetcode: 0 };
    }
    const githubScore = githubScoreData?.score || 0;
    const leetcodeScore = leetcodeScoreData?.score || 0;
    const finalScore = (atsScore * weights.ats) + (githubScore * weights.github) + (leetcodeScore * weights.leetcode);
    return {
      finalScore: Math.round(finalScore),
      breakdown: {
        ats: { 
          score: atsScore, 
          weight: weights.ats, 
          contribution: Math.round(atsScore * weights.ats),
          grade: getScoreGrade(atsScore)
        },
        github: { 
          score: githubScore, 
          weight: weights.github, 
          contribution: Math.round(githubScore * weights.github),
          grade: getScoreGrade(githubScore),
          data: githubScoreData
        },
        leetcode: { 
          score: leetcodeScore, 
          weight: weights.leetcode, 
          contribution: Math.round(leetcodeScore * weights.leetcode),
          grade: getScoreGrade(leetcodeScore),
          data: leetcodeScoreData
        }
      },
      weights,
      grade: getScoreGrade(Math.round(finalScore)),
      level: getOverallLevel(Math.round(finalScore)),
      recommendations: generateRecommendations(atsScore, githubScore, leetcodeScore)
    };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--color-success-600)';
    if (score >= 80) return 'var(--color-success-500)';
    if (score >= 70) return 'var(--color-warning-400)';
    if (score >= 60) return 'var(--color-warning-500)';
    if (score >= 50) return 'var(--color-warning-600)';
    if (score >= 40) return 'var(--color-error-500)';
    return 'var(--color-error-600)';
  };

  const getScoreGrade = (score) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D+';
    if (score >= 45) return 'D';
    return 'F';
  };

  const getGitHubLevel = (score) => {
    if (score >= 90) return 'Expert Contributor';
    if (score >= 80) return 'Advanced Developer';
    if (score >= 70) return 'Active Contributor';
    if (score >= 60) return 'Regular User';
    if (score >= 40) return 'Casual User';
    return 'Beginner';
  };

  const getLeetCodeLevel = (score) => {
    if (score >= 90) return 'Algorithm Expert';
    if (score >= 80) return 'Advanced Problem Solver';
    if (score >= 70) return 'Skilled Programmer';
    if (score >= 60) return 'Competent Coder';
    if (score >= 40) return 'Learning Enthusiast';
    return 'Beginner';
  };

  const getOverallLevel = (score) => {
    if (score >= 90) return 'Elite Technical Professional';
    if (score >= 80) return 'Senior Technical Expert';
    if (score >= 70) return 'Experienced Developer';
    if (score >= 60) return 'Competent Professional';
    if (score >= 50) return 'Developing Professional';
    return 'Entry Level';
  };

  const generateRecommendations = (atsScore, githubScore, leetcodeScore) => {
    const recommendations = [];
    if (atsScore < 70) {
      recommendations.push({
        type: 'ats',
        priority: 'high',
        title: 'Optimize Resume for ATS',
        description: 'Your resume needs better keyword optimization and formatting for applicant tracking systems.',
        actions: [
          'Add more relevant technical keywords',
          'Use standard section headings',
          'Quantify your achievements with numbers',
          'Ensure consistent formatting'
        ]
      });
    }
    if (githubScore < 60) {
      recommendations.push({
        type: 'github',
        priority: 'medium',
        title: 'Boost GitHub Presence',
        description: 'Increase your GitHub activity to showcase your coding skills and collaboration.',
        actions: [
          'Create more public repositories',
          'Contribute to open source projects',
          'Add detailed README files',
          'Maintain consistent commit history'
        ]
      });
    }
    if (leetcodeScore < 60) {
      recommendations.push({
        type: 'leetcode',
        priority: 'medium',
        title: 'Improve Problem Solving Skills',
        description: 'Enhance your algorithmic thinking and coding interview preparation.',
        actions: [
          'Solve problems daily (start with easy)',
          'Focus on medium difficulty problems',
          'Practice different algorithm categories',
          'Participate in coding contests'
        ]
      });
    }
    return recommendations;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', role);
    setLoading(true);
    setError(null);
    setAnimationPhase(0);
    try {
      setTimeout(() => setAnimationPhase(1), 500);
      setTimeout(() => setAnimationPhase(2), 1000);
      setTimeout(() => setAnimationPhase(3), 1500);
      const API_BASE = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${API_BASE}/upload`, formData);
      setText(res.data.ResumeResult.text);
      const scoreDataObject = {
        score: res.data.ResumeResult.score,
        confidence: res.data.ResumeResult.confidence,
        scoreRange: res.data.ResumeResult.scoreRange,
        medianScore: res.data.ResumeResult.medianScore,
        stdDev: res.data.ResumeResult.stdDev,
        individualScores: res.data.ResumeResult.individualScores,
      };
      setScoreData(scoreDataObject);
      localStorage.setItem('resumeText', res.data.ResumeResult.text);
      localStorage.setItem('scoreData', JSON.stringify(scoreDataObject));
      if (githubId && leetcodeId) {
        await fetchCodingStats(scoreDataObject.score);
      } else {
        const comprehensive = calculateComprehensiveScore(scoreDataObject.score, null, null);
        setComprehensiveScore(comprehensive);
      }
    } catch (err) {
      console.error('Full error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error processing resume';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setAnimationPhase(0);
    }
  };

  const fetchCodingStats = async (atsScore = null) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${API_BASE}/codestats`, {
        githubId,
        leetcodeId,
      });
      setGithubStats(res.data.github);
      setLeetcodeStats(res.data.leetcode);
      localStorage.setItem('githubStats', JSON.stringify(res.data.github));
      localStorage.setItem('leetcodeStats', JSON.stringify(res.data.leetcode));
      const githubScoreData = calculateGitHubScore(res.data.github);
      const leetcodeScoreData = calculateLeetCodeScore(res.data.leetcode);
      setGithubScore(githubScoreData);
      setLeetcodeScore(leetcodeScoreData);
      const currentAtsScore = atsScore || scoreData?.score || 0;
      const comprehensive = calculateComprehensiveScore(currentAtsScore, githubScoreData, leetcodeScoreData);
      setComprehensiveScore(comprehensive);
    } catch (err) {
      console.error('Error fetching coding stats:', err);
    }
  };

  const handleGenerateReport = async () => {
    const resumeText = localStorage.getItem('resumeText');
    const scoreData = JSON.parse(localStorage.getItem('scoreData'));
    const githubStats = JSON.parse(localStorage.getItem('githubStats'));
    const leetcodeStats = JSON.parse(localStorage.getItem('leetcodeStats'));
    setGenerating(true);
    setReport('');
    try {
      const API_BASE = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${API_BASE}/generate-report`, {
        resumeText,
        scoreData,
        githubStats,
        leetcodeStats,
      });
      console.log(res.data);
      setReport(res.data);
    } catch (err) {
      console.error('Error generating report:', err);
      setReport('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  // --- Report Text Formatting Helper ---
  const formatReportText = (text) => {
    if (!text) return { __html: '' };

    // Basic HTML escaping (important for security if text could contain HTML-like characters)
    let processedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "<")
      .replace(/>/g, ">");

    // Convert newlines to <br> for basic line breaks
    processedText = processedText.replace(/\n/g, '<br>');

    // Pattern to match section headings like "1. Summary:", "2. Resume Strengths:", "Final Verdict:"
    // This regex looks for a line starting with (optional number + .) + space + words + colon at the end of the line
    // It correctly handles cases where the heading might be after a <br> or at the start of the string.
    const headingPattern = /(^|<br>)(\d*\.\s*)?([A-Z][\s\S]*?):(<br>|$)/g;

    // Wrap matched headings in <span class="section-heading">...</span>
    processedText = processedText.replace(headingPattern, (match, p1, p2, p3, p4) => {
       // p2 might be undefined if there's no number
       const numberPart = p2 || '';
       // Combine number part and heading text, then wrap
       return `${p1}<span class="section-heading">${numberPart}${p3}:</span>${p4}`;
    });

    return { __html: processedText };
  };
  // --- End Report Text Formatting Helper ---

  const CircularProgress = ({ score, size = 120, strokeWidth = 8, label, showPercentage = true }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    return (
      <div className="circular-progress-container">
        <svg width={size} height={size} className="circular-progress-svg">
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getScoreColor(score)} stopOpacity="1" />
              <stop offset="100%" stopColor={getScoreColor(score)} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-gray-200)"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="circular-progress-bg"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#gradient-${label})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="circular-progress-fill"
          />
        </svg>
        <div className="circular-progress-text">
          <span className="circular-progress-value" style={{ color: getScoreColor(score) }}>
            {showPercentage ? score : getScoreGrade(score)}
          </span>
          <span className="circular-progress-label">{label}</span>
        </div>
      </div>
    );
  };

  const ScoreBreakdownModal = ({ isOpen, onClose, scoreData, title }) => {
    if (!isOpen || !scoreData) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">{title} Breakdown</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-score-overview">
              <CircularProgress score={scoreData.score} size={150} label="Total Score" />
              <div className="modal-score-details">
                <div className="modal-grade">Grade: {scoreData.grade}</div>
                <div className="modal-level">{scoreData.level}</div>
              </div>
            </div>
            <div className="modal-breakdown">
              {Object.entries(scoreData.breakdown).map(([key, data]) => (
                <div key={key} className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="breakdown-label">{key}</span>
                    <span className="breakdown-score" style={{ color: getScoreColor(data.score) }}>
                      {data.score}/{data.max}
                    </span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{
                        width: `${(data.score / data.max) * 100}%`,
                        backgroundColor: getScoreColor(data.score)
                      }}
                    />
                  </div>
                  {data.value !== undefined && (
                    <div className="breakdown-value">Value: {data.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Enhanced Header */}
        <div className={`dashboard-header ${isVisible ? 'fade-in' : ''}`}>
          <div className="header-badge">
            <Sparkles size={16} className="header-badge-icon" />
            <span>AI-Powered Comprehensive Analysis</span>
            <div className="header-badge-dot"></div>
          </div>
          <h1 className="dashboard-title">
            <span className="gradient-text-animated">
              Smart Resume
            </span>
            <br />
            <span className="dashboard-title-secondary">Analyzer</span>
          </h1>
          <p className="dashboard-subtitle">
            Get a comprehensive evaluation combining ATS compatibility, GitHub activity, and LeetCode performance 
            for the complete picture of your technical profile with AI-powered insights.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-card">
            <AlertCircle size={20} className="error-icon" />
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Enhanced Upload Section */}
        <div className="upload-section">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="loading-spinner-container">
                  <div className="loading-spinner"></div>
                  <div className="loading-pulse"></div>
                </div>
                <p className="loading-text">Analyzing your resume with AI...</p>
                <div className="loading-phase-indicator">
                  {[
                    { icon: FileText, text: "Processing document", phase: 0 },
                    { icon: Sparkles, text: "AI analysis", phase: 1 },
                    { icon: Sparkles, text: "Generating insights", phase: 2 }
                  ].map((step, index) => (
                    <div key={index} className={`loading-phase-step ${animationPhase >= step.phase ? 'active' : ''}`}>
                      <div className="loading-phase-icon">
                        <step.icon size={20} />
                      </div>
                      <span className="loading-phase-text">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="upload-header">
            <div className="upload-icon">
              <Upload size={28} />
            </div>
            <div>
              <h2 className="upload-title">Upload & Analyze</h2>
              <p className="upload-description">Get comprehensive scoring across multiple platforms</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">
                  <Target size={18} className="form-label-icon" />
                  Target Role
                </label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="full_stack">Full Stack Developer</option>
                  <option value="data_analyst">Data Analyst</option>
                  <option value="aiml_engineer">Artificial Intelligence</option>
                  <option value="software_developer">Software Developer</option>
                </select>
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">
                  <FileText size={18} className="form-label-icon" />
                  Resume File
                </label>
                <div className={`file-input-wrapper ${file ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    className="file-input"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    required
                    disabled={loading}
                  />
                  <div className="file-input-content">
                    {file ? (
                      <CheckCircle className="file-input-icon" size={48} />
                    ) : (
                      <FileText className="file-input-icon" size={48} />
                    )}
                    <p className={`file-input-text ${file ? 'selected' : ''}`}>
                      {file ? 'File Selected' : 'Drop your resume here or click to browse'}
                    </p>
                    <p className="file-input-subtext">Supports PDF, PNG, JPG (Max 10MB)</p>
                  </div>
                  {file && (
                    <div className="selected-file">
                      <FileCheck size={18} />
                      <span className="selected-file-name">{file.name}</span>
                      <span className="selected-file-size">({formatFileSize(file.size)})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Links */}
            <div className="form-group">
              <label className="form-label">
                <Code size={18} className="form-label-icon" />
                Coding Profiles
              </label>
              <div className="profile-links">
                <div className="profile-input-group">
                  <div className="profile-input-icon">
                    <Github size={20} />
                  </div>
                  <input
                    type="text"
                    className="profile-input"
                    placeholder="GitHub username"
                    value={githubId}
                    onChange={(e) => setGithubId(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="profile-input-group">
                  <div className="profile-input-icon">
                    <Code size={20} />
                  </div>
                  <input
                    type="text"
                    className="profile-input"
                    placeholder="LeetCode username"
                    value={leetcodeId}
                    onChange={(e) => setLeetcodeId(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${loading || !file ? 'btn-disabled' : ''}`}
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  Start Comprehensive Analysis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Comprehensive Score Display */}
        {comprehensiveScore && (
          <div className="comprehensive-score-section">
            <div className="comprehensive-score-header">
              <div className="comprehensive-score-badge">
                <Trophy size={16} />
                <span>Comprehensive Profile Score</span>
              </div>
              <h2 className="comprehensive-score-title">Technical Profile Analysis</h2>
              <p className="comprehensive-score-level">{comprehensiveScore.level}</p>
            </div>
            <div className="comprehensive-score-content">
              <div className="comprehensive-score-overview">
                <div className="overall-score-container">
                  <CircularProgress 
                    score={comprehensiveScore.finalScore} 
                    size={180} 
                    strokeWidth={14} 
                    label="Overall" 
                    showPercentage={false}
                  />
                  <div className="overall-score-details">
                    <div className="overall-score-value">{comprehensiveScore.finalScore}/100</div>
                    <div className="overall-score-grade">{comprehensiveScore.grade} Grade</div>
                    <div className="overall-score-level">{comprehensiveScore.level}</div>
                  </div>
                </div>
              </div>
              <div className="comprehensive-score-breakdown">
                {[
                  { 
                    key: 'ats', 
                    icon: FileText, 
                    label: 'ATS Compatibility', 
                    colorClass: 'color-ats',
                    description: 'Resume optimization for applicant tracking systems'
                  },
                  { 
                    key: 'github', 
                    icon: Github, 
                    label: 'GitHub Activity', 
                    colorClass: 'color-github',
                    description: 'Open source contributions and code quality'
                  },
                  { 
                    key: 'leetcode', 
                    icon: Code, 
                    label: 'LeetCode Performance', 
                    colorClass: 'color-leetcode',
                    description: 'Algorithmic thinking and problem-solving skills'
                  }
                ].map((item, index) => {
                  const breakdown = comprehensiveScore.breakdown[item.key];
                  return (
                    <div 
                      key={item.key} 
                      className={`breakdown-card ${item.colorClass}`}
                      onClick={() => {
                        if (item.key === 'github' && githubScore.breakdown) {
                          setShowScoreBreakdown({ type: 'github', data: githubScore });
                        } else if (item.key === 'leetcode' && leetcodeScore.breakdown) {
                          setShowScoreBreakdown({ type: 'leetcode', data: leetcodeScore });
                        }
                      }}
                    >
                      <div className="breakdown-card-header">
                        <div className="breakdown-card-icon">
                          <item.icon size={24} />
                        </div>
                        <div className="breakdown-card-title">
                          <div className="breakdown-card-label">{item.label}</div>
                          <div className="breakdown-card-description">{item.description}</div>
                        </div>
                      </div>
                      <div className="breakdown-card-content">
                        <div className="breakdown-score-details">
                          <div className="breakdown-score-value">{breakdown.score}/100</div>
                          <div className="breakdown-score-meta">
                            {breakdown.grade} • {Math.round(breakdown.weight * 100)}% weight
                          </div>
                        </div>
                        <div className="breakdown-progress-bar">
                          <div 
                            className="breakdown-progress-fill"
                            style={{ 
                              width: `${breakdown.score}%`,
                              backgroundColor: `var(--color-${item.key})`
                            }}
                          ></div>
                        </div>
                        {((item.key === 'github' && githubScore.breakdown) || (item.key === 'leetcode' && leetcodeScore.breakdown)) && (
                          <Eye size={20} className="breakdown-eye-icon" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Individual Score Cards */}
        {(scoreData || githubScore.score > 0 || leetcodeScore.score > 0) && (
          <div className="score-cards-grid">
            {/* ATS Score Card */}
            {scoreData && (
              <div className="score-card score-card-ats">
                <div className="score-card-header">
                  <h3 className="score-card-title">
                    <div className="score-card-icon">
                      <FileText size={20} />
                    </div>
                    ATS Compatibility
                  </h3>
                  <div className="score-card-badge">AI Analyzed</div>
                </div>
                <div className="score-card-content">
                  <div className="score-card-circular">
                    <CircularProgress score={scoreData.score} size={120} label="ATS" />
                  </div>
                  <div className="score-card-details">
                    <div className="score-card-detail">
                      <span className="detail-label">Confidence</span>
                      <span className="detail-value">{scoreData.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="score-card-detail">
                      <span className="detail-label">Median Score</span>
                      <span className="detail-value">{scoreData.medianScore.toFixed(1)}</span>
                    </div>
                    <div className="score-card-detail">
                      <span className="detail-label">Grade</span>
                      <span className="detail-value" style={{ color: getScoreColor(scoreData.score) }}>{getScoreGrade(scoreData.score)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Score Card */}
            {githubScore.score > 0 && (
              <div className="score-card score-card-github" onClick={() => setShowScoreBreakdown({ type: 'github', data: githubScore })}>
                <div className="score-card-header">
                  <h3 className="score-card-title">
                    <div className="score-card-icon">
                      <Github size={20} />
                    </div>
                    GitHub Activity
                  </h3>
                  <div className="score-card-header-right">
                    <div className="score-card-badge">{githubScore.level}</div>
                    <Eye size={16} className="score-card-eye-icon" />
                  </div>
                </div>
                <div className="score-card-content">
                  <div className="score-card-circular">
                    <CircularProgress score={githubScore.score} size={120} label="GitHub" />
                  </div>
                  <div className="score-card-details">
                    <div className="score-card-detail">
                      <span className="detail-label">Repositories</span>
                      <span className="detail-value">{githubStats?.publicRepos || 0}</span>
                    </div>
                    <div className="score-card-detail">
                      <span className="detail-label">Followers</span>
                      <span className="detail-value">{githubStats?.followers || 0}</span>
                    </div>
                    <div className="score-card-detail">
                      <span className="detail-label">Grade</span>
                      <span className="detail-value" style={{ color: getScoreColor(githubScore.score) }}>{githubScore.grade}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LeetCode Score Card */}
            {leetcodeScore.score > 0 && (
              <div className="score-card score-card-leetcode" onClick={() => setShowScoreBreakdown({ type: 'leetcode', data: leetcodeScore })}>
                <div className="score-card-header">
                  <h3 className="score-card-title">
                    <div className="score-card-icon">
                      <Code size={20} />
                    </div>
                    LeetCode Performance
                  </h3>
                  <div className="score-card-header-right">
                    <div className="score-card-badge">{leetcodeScore.level}</div>
                    <Eye size={16} className="score-card-eye-icon" />
                  </div>
                </div>
                <div className="score-card-content">
                  <div className="score-card-circular">
                    <CircularProgress score={leetcodeScore.score} size={120} label="LeetCode" />
                  </div>
                  <div className="score-card-details">
                    <div className="score-card-detail">
                      <span className="detail-label">Problems Solved</span>
                      <span className="detail-value">{leetcodeStats?.totalSolved || 0}</span>
                    </div>
                    <div className="score-card-detail">
                      <span className="detail-label">Ranking</span>
                      <span className="detail-value">#{leetcodeStats?.ranking?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="score-card-detail">
                      <span className="detail-label">Grade</span>
                      <span className="detail-value" style={{ color: getScoreColor(leetcodeScore.score) }}>{leetcodeScore.grade}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced AI Recommendations */}
        {comprehensiveScore && comprehensiveScore.recommendations && (
          <div className="recommendations-section">
            <div className="recommendations-header">
              <div className="recommendations-icon">
                <Lightbulb size={28} />
              </div>
              <div>
                <h3 className="recommendations-title">AI-Powered Recommendations</h3>
                <p className="recommendations-subtitle">Personalized suggestions to improve your profile</p>
              </div>
            </div>
            <div className="recommendations-list">
              {comprehensiveScore.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`recommendation-card recommendation-${rec.priority}`}
                >
                  <div className="recommendation-header">
                    <div className={`recommendation-icon recommendation-icon-${rec.type}`}>
                      {rec.type === 'ats' && <FileText size={24} />}
                      {rec.type === 'github' && <Github size={24} />}
                      {rec.type === 'leetcode' && <Code size={24} />}
                    </div>
                    <div className="recommendation-title-container">
                      <h4 className="recommendation-title">{rec.title}</h4>
                      <span className={`recommendation-badge recommendation-badge-${rec.priority}`}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                  <p className={`recommendation-description recommendation-description-${rec.priority}`}>
                    {rec.description}
                  </p>
                  <ul className="recommendation-actions">
                    {rec.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="recommendation-action">
                        <CheckCircle size={16} className="action-icon" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Report Button */}
        {comprehensiveScore && (
          <div className="report-button-container">
            <button
              className={`btn btn-primary ${generating ? 'btn-disabled' : ''}`}
              onClick={handleGenerateReport}
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="btn-spinner"></div>
                  Generating Detailed Report...
                </>
              ) : (
                <>
                  <FileText size={24} />
                  Generate Comprehensive Report
                  <Sparkles size={20} className="report-button-icon" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Enhanced Report Section */}
        {report && (
          <div className="report-section">
            <div className="report-header">
              <div className="report-header-icon">
                <FileCheck size={28} />
              </div>
              <h3 className="report-title">AI-Generated Comprehensive Report</h3>
            </div>
            <div className="report-content">
              {/* Use the helper function to format and render the report safely */}
              <div className="report-text" {...formatReportText(report)} />
            </div>
            <div className="report-actions">
              <button className="btn btn-outline">
                <Download size={20} />
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={!!showScoreBreakdown}
        onClose={() => setShowScoreBreakdown(false)}
        scoreData={showScoreBreakdown?.data}
        title={showScoreBreakdown?.type === 'github' ? 'GitHub' : 'LeetCode'}
      />
    </div>
  );
}

export default PersonalAnalysis;