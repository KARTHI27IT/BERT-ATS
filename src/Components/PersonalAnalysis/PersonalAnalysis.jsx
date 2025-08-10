import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PersonalAnalysis.css';
import { 
  Upload, 
  FileText, 
  Target, 
  Github, 
  Code, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  FileCheck,
  Lightbulb,
  Download,
  RefreshCw,
  Sparkles,
  Clock,
  Shield,
  Zap,
  Star,
  Activity,
  Users,
  GitBranch,
  ArrowRight,
  Eye,
  Brain,
  Cpu,
  Trophy,
  Target as TargetIcon,
  Layers,
  Gauge,
  X
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
  const [githubScore, setGithubScore] = useState(0);
  const [leetcodeScore, setLeetcodeScore] = useState(0);
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
    setGithubScore(0);
    setLeetcodeScore(0);
  };

  // Enhanced GitHub Score Calculation
  const calculateGitHubScore = (stats) => {
    if (!stats) return 0;
    const { publicRepos, followers, following } = stats;
    let score = 0;
    let breakdown = {};

    // Repository Score (0-30 points)
    const repoScore = Math.min(publicRepos * 1.5, 30);
    breakdown.repositories = { score: repoScore, max: 30, value: publicRepos };
    score += repoScore;

    // Followers Score (0-25 points)
    const followerScore = Math.min(followers * 0.3, 25);
    breakdown.followers = { score: followerScore, max: 25, value: followers };
    score += followerScore;

    // Following Ratio Score (0-15 points) - Quality over quantity
    const followingRatio = followers > 0 ? Math.min(followers / (following + 1), 3) : 0;
    const ratioScore = followingRatio * 5;
    breakdown.engagement = { score: ratioScore, max: 15, ratio: followingRatio.toFixed(2) };
    score += ratioScore;

    // Activity Score (0-20 points) - Based on recent activity
    const activityScore = Math.min(publicRepos > 0 ? 20 : 0, 20);
    breakdown.activity = { score: activityScore, max: 20 };
    score += activityScore;

    // Consistency Score (0-10 points) - Regular contributions
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
    if (!stats) return 0;
    const { totalSolved, easySolved, mediumSolved, hardSolved, ranking } = stats;
    let score = 0;
    let breakdown = {};

    // Problem Solving Score (0-40 points)
    const problemScore = Math.min(totalSolved * 0.15, 40);
    breakdown.totalProblems = { score: problemScore, max: 40, value: totalSolved };
    score += problemScore;

    // Difficulty Distribution Score (0-30 points)
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

    // Ranking Score (0-20 points)
    let rankingScore = 0;
    if (ranking && ranking > 0) {
      if (ranking <= 10000) rankingScore = 20;
      else if (ranking <= 50000) rankingScore = 15;
      else if (ranking <= 100000) rankingScore = 10;
      else if (ranking <= 500000) rankingScore = 5;
    }
    breakdown.ranking = { score: rankingScore, max: 20, value: ranking };
    score += rankingScore;

    // Consistency Score (0-10 points) - Based on problem distribution
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
    // Dynamic weights based on available data
    let weights = { ats: 0.5, github: 0.25, leetcode: 0.25 };

    // Adjust weights if some data is missing
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
    if (score >= 90) return '#059669'; // emerald-600
    if (score >= 80) return '#10b981'; // emerald-500
    if (score >= 70) return '#34d399'; // emerald-400
    if (score >= 60) return '#fbbf24'; // amber-400
    if (score >= 50) return '#f59e0b'; // amber-500
    if (score >= 40) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
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
      // Animate through phases
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
        // Calculate comprehensive score with only ATS data
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

      // Calculate individual scores
      const githubScoreData = calculateGitHubScore(res.data.github);
      const leetcodeScoreData = calculateLeetCodeScore(res.data.leetcode);
      setGithubScore(githubScoreData);
      setLeetcodeScore(leetcodeScoreData);

      // Calculate comprehensive score
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
      setReport(res.data.report);
      alert("report received");
      alert(res.data.report);
      console.log(report);
    } catch (err) {
      console.error('Error generating report:', err);
      setReport('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const CircularProgress = ({ score, size = 120, strokeWidth = 8, label, showPercentage = true }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="circular-progress-container position-relative d-inline-flex align-items-center justify-content-center group">
        <div className="circular-progress-glow position-absolute"></div>
        <svg width={size} height={size} className="transform rotate-90 drop-shadow-lg">
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getScoreColor(score)} stopOpacity="1" />
              <stop offset="100%" stopColor={getScoreColor(score)} stopOpacity="0.6" />
            </linearGradient>
            <filter id={`glow-${label}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
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
            className="transition-all duration-2000 ease-out"
            filter={`url(#glow-${label})`}
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}
          />
        </svg>
        <div className="position-absolute inset-0 d-flex flex-column align-items-center justify-content-center transition-all duration-300 group-hover-scale-105">
          <span className="fs-3 fw-bold transition-all duration-300" style={{ color: getScoreColor(score) }}>
            {showPercentage ? score : getScoreGrade(score)}
          </span>
          <span className="fs-6 text-gray-500 fw-medium">{label}</span>
        </div>
      </div>
    );
  };

  const ScoreBreakdownModal = ({ isOpen, onClose, scoreData, title }) => {
    if (!isOpen || !scoreData) return null;

    return (
      <div className="score-breakdown-modal position-fixed inset-0 bg-black/50 backdrop-blur-sm d-flex align-items-center justify-content-center z-50 p-4">
        <div className="score-breakdown-content bg-white rounded-3 shadow-xl w-100 max-w-2xl max-h-90vh overflow-auto">
          <div className="p-4 border-bottom border-gray-200">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="fs-4 fw-bold text-gray-900">{title} Breakdown</h3>
              <button
                onClick={onClose}
                className="p-2 hover-bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="text-center mb-4">
              <CircularProgress score={scoreData.score} size={150} label="Total Score" />
              <div className="mt-3">
                <div className="fs-5 fw-semibold text-gray-700">Grade: {scoreData.grade}</div>
                <div className="fs-6 text-gray-500">{scoreData.level}</div>
              </div>
            </div>
            <div className="gap-3">
              {Object.entries(scoreData.breakdown).map(([key, data]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-gray-700 text-capitalize">{key}</span>
                    <span className="fs-5 fw-bold" style={{ color: getScoreColor(data.score) }}>
                      {data.score}/{data.max}
                    </span>
                  </div>
                  <div className="w-100 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(data.score / data.max) * 100}%`,
                        backgroundColor: getScoreColor(data.score)
                      }}
                    />
                  </div>
                  {data.value !== undefined && (
                    <div className="fs-6 text-gray-600 mt-1">Value: {data.value}</div>
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
    <div className="dashboard-container min-vh-100 position-relative overflow-hidden">
      <div className="container py-5 position-relative z-10">
        {/* Enhanced Header */}
        <div className={`dashboard-header mb-5 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="header-badge d-inline-flex align-items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-2 rounded-pill fs-6 fw-medium mb-3 shadow-lg backdrop-blur-sm border border-white/20 hover-scale-105 transition-transform duration-300">
            <Sparkles size={16} className="animate-pulse" />
            <span>AI-Powered Comprehensive Analysis</span>
            <div className="w-2 h-2 bg-blue-500 rounded-circle animate-ping"></div>
          </div>
          <h1 className="dashboard-title display-4 fw-bold text-gray-900 mb-4">
            <span className="gradient-text-animated">
              Smart Resume
            </span>
            <br />
            <span className="text-gray-800">Analyzer</span>
          </h1>
          <p className="dashboard-subtitle fs-5 text-gray-600 mb-4 max-w-4xl mx-auto lead">
            Get a comprehensive evaluation combining ATS compatibility, GitHub activity, and LeetCode performance 
            for the complete picture of your technical profile with AI-powered insights.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-card mb-4 p-3 bg-red-50 border border-red-200 rounded-xl d-flex align-items-center gap-3 text-red-700 shadow-lg backdrop-blur-sm animate-slideInDown">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Enhanced Upload Section */}
        <div className="upload-section bg-white/80 backdrop-blur-xl rounded-3 shadow-xl p-4 mb-4 position-relative overflow-hidden border border-white/20">
          {loading && (
            <div className="loading-overlay position-absolute inset-0 bg-white/95 backdrop-blur-md d-flex align-items-center justify-content-center z-20 rounded-3">
              <div className="loading-content text-center max-w-md">
                <div className="position-relative mb-4">
                  <div className="w-20 h-20 border-4 border-gray-200 rounded-circle animate-spin mx-auto">
                    <div className="w-100 h-100 border-4 border-blue-600 rounded-circle border-t-transparent animate-spin"></div>
                  </div>
                  <div className="position-absolute inset-0 d-flex align-items-center justify-content-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-circle animate-pulse"></div>
                  </div>
                </div>
                <p className="loading-text fs-5 fw-semibold text-gray-800 mb-4">Analyzing your resume with AI...</p>
                <div className="loading-phase-indicator d-flex justify-content-center gap-5">
                  {[
                    { icon: FileText, text: "Processing document", phase: 0 },
                    { icon: Brain, text: "AI analysis", phase: 1 },
                    { icon: Sparkles, text: "Generating insights", phase: 2 }
                  ].map((step, index) => (
                    <div key={index} className={`loading-phase-step d-flex flex-column align-items-center gap-2 transition-all duration-500 ${animationPhase >= step.phase ? 'active' : ''}`}>
                      <div className={`loading-phase-icon d-flex align-items-center justify-content-center rounded-circle transition-all duration-500 ${animationPhase >= step.phase ? 'bg-blue-100 shadow-lg' : 'bg-gray-100'}`}>
                        <step.icon size={20} />
                      </div>
                      <span className="fs-6 fw-medium text-center">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="position-relative z-10">
            <div className="upload-header d-flex align-items-center gap-3 mb-4">
              <div className="upload-icon d-flex align-items-center justify-content-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-3 shadow-lg">
                <Upload size={28} className="text-white" />
              </div>
              <div>
                <h2 className="upload-title fs-3 fw-bold text-gray-900 mb-1">Upload & Analyze</h2>
                <p className="upload-description text-gray-600">Get comprehensive scoring across multiple platforms</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid row g-4 mb-4">
                {/* Role Selection */}
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label d-flex align-items-center gap-2 fs-6 fw-semibold text-gray-700 text-uppercase">
                      <Target size={18} className="text-blue-600" />
                      Target Role
                    </label>
                    <select
                      className="form-control form-select p-3 border-2 border-gray-200 rounded-3 focus-ring-4 focus-ring-blue-500/20 focus-border-blue-500 outline-none transition-all duration-300 bg-white shadow-sm hover-shadow-md"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={loading}
                    >
                      <option value="full_stack">Full Stack Developer</option>
                      <option value="data_analyst">Data Analyst</option>
                    </select>
                  </div>
                </div>

                {/* File Upload */}
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label d-flex align-items-center gap-2 fs-6 fw-semibold text-gray-700 text-uppercase">
                      <FileText size={18} className="text-blue-600" />
                      Resume File
                    </label>
                    <div className={`file-input-wrapper rounded-3 p-4 text-center transition-all duration-300 cursor-pointer group ${file ? 'has-file border-emerald-300 bg-emerald-50 shadow-lg transform scale-105' : 'border-gray-300 hover-border-blue-400 hover-bg-blue-50 hover-shadow-md'}`}>
                      <input
                        type="file"
                        className="file-input position-absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        required
                        disabled={loading}
                      />
                      <div className="file-input-content transition-all duration-300 group-hover-scale-105">
                        {file ? (
                          <CheckCircle className="mx-auto mb-2 text-emerald-600" size={48} />
                        ) : (
                          <FileText className="mx-auto mb-2 text-gray-400 group-hover-text-blue-500 transition-colors duration-300" size={48} />
                        )}
                        <p className={`file-input-text fw-semibold fs-5 mb-1 ${file ? 'text-emerald-700' : 'text-gray-700'}`}>
                          {file ? 'File Selected' : 'Drop your resume here or click to browse'}
                        </p>
                        <p className="file-input-subtext fs-6 text-gray-500">Supports PDF, PNG, JPG (Max 10MB)</p>
                      </div>
                      {file && (
                        <div className="selected-file d-inline-flex align-items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200 shadow-sm mt-3">
                          <FileCheck size={18} />
                          <span className="selected-file-name fw-medium">{file.name}</span>
                          <span className="selected-file-size fs-6 opacity-75">({formatFileSize(file.size)})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Links */}
              <div className="mb-4">
                <div className="form-group">
                  <label className="form-label d-flex align-items-center gap-2 fs-6 fw-semibold text-gray-700 text-uppercase">
                    <Code size={18} className="text-blue-600" />
                    Coding Profiles
                    <span className="fs-6 normal-case text-gray-500 bg-gray-100 px-2 py-1 rounded-pill">Optional - for comprehensive scoring</span>
                  </label>
                  <div className="profile-links row g-3 mt-2">
                    <div className="col-md-6">
                      <div className="profile-input-group position-relative">
                        <div className="profile-input-icon position-absolute start-0 top-50 translate-middle-y ps-3 d-flex align-items-center pointer-events-none">
                          <Github className="text-gray-400 group-focus-within-text-gray-600 transition-colors duration-200" size={20} />
                        </div>
                        <input
                          type="text"
                          className="profile-input form-control ps-5 py-3 border-2 border-gray-200 rounded-3 focus-ring-4 focus-ring-blue-500/20 focus-border-blue-500 outline-none transition-all duration-300 bg-white shadow-sm hover-shadow-md"
                          placeholder="GitHub username"
                          value={githubId}
                          onChange={(e) => setGithubId(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="profile-input-group position-relative">
                        <div className="profile-input-icon position-absolute start-0 top-50 translate-middle-y ps-3 d-flex align-items-center pointer-events-none">
                          <Code className="text-gray-400 group-focus-within-text-gray-600 transition-colors duration-200" size={20} />
                        </div>
                        <input
                          type="text"
                          className="profile-input form-control ps-5 py-3 border-2 border-gray-200 rounded-3 focus-ring-4 focus-ring-blue-500/20 focus-border-blue-500 outline-none transition-all duration-300 bg-white shadow-sm hover-shadow-md"
                          placeholder="LeetCode username"
                          value={leetcodeId}
                          onChange={(e) => setLeetcodeId(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`btn btn-lg w-100 py-3 px-4 rounded-3 text-white fw-bold fs-5 transition-all duration-300 d-flex align-items-center justify-content-center gap-2 position-relative overflow-hidden group ${loading || !file ? 'btn-secondary cursor-not-allowed' : 'btn-primary shadow-lg'}`}
                disabled={loading || !file}
              >
                <div className="position-absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-cyan-700 opacity-0 group-hover-opacity-100 transition-opacity duration-300"></div>
                <div className="position-relative z-10 d-flex align-items-center gap-2">
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={24} />
                      Start Comprehensive Analysis
                      <ArrowRight size={20} className="group-hover-translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Comprehensive Score Display */}
        {comprehensiveScore && (
          <div className="comprehensive-score-section bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3 p-4 text-white mb-4 shadow-xl position-relative overflow-hidden animate-slideInUp">
            <div className="position-absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
            <div className="position-relative z-10">
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-pill fs-6 fw-medium mb-3">
                  <Trophy size={16} />
                  <span>Comprehensive Profile Score</span>
                </div>
                <h2 className="fs-2 fw-bold mb-2">Technical Profile Analysis</h2>
                <p className="text-blue-100 fs-5">{comprehensiveScore.level}</p>
              </div>
              <div className="row g-4 align-items-center">
                <div className="col-lg-3 text-center">
                  <div className="position-relative mb-4">
                    <CircularProgress 
                      score={comprehensiveScore.finalScore} 
                      size={180} 
                      strokeWidth={14} 
                      label="Overall" 
                      showPercentage={false}
                    />
                    <div className="position-absolute inset-0 rounded-full bg-white/5 animate-pulse"></div>
                  </div>
                  <div className="gap-1">
                    <div className="display-4 fw-bold">{comprehensiveScore.finalScore}/100</div>
                    <div className="fs-5 fw-semibold text-blue-100">{comprehensiveScore.grade} Grade</div>
                    <div className="fs-6 text-blue-200">{comprehensiveScore.level}</div>
                  </div>
                </div>
                <div className="col-lg-9">
                  <div className="gap-3">
                    {[
                      { 
                        key: 'ats', 
                        icon: FileText, 
                        label: 'ATS Compatibility', 
                        color: 'from-blue-400 to-blue-600',
                        description: 'Resume optimization for applicant tracking systems'
                      },
                      { 
                        key: 'github', 
                        icon: Github, 
                        label: 'GitHub Activity', 
                        color: 'from-gray-400 to-gray-600',
                        description: 'Open source contributions and code quality'
                      },
                      { 
                        key: 'leetcode', 
                        icon: Code, 
                        label: 'LeetCode Performance', 
                        color: 'from-orange-400 to-orange-600',
                        description: 'Algorithmic thinking and problem-solving skills'
                      }
                    ].map((item, index) => {
                      const breakdown = comprehensiveScore.breakdown[item.key];
                      return (
                        <div 
                          key={item.key} 
                          className={`d-flex align-items-center justify-content-between p-3 bg-white/10 backdrop-blur-sm rounded-3 border border-white/20 hover-bg-white/20 transition-all duration-300 transform hover-scale-105 animate-slideInRight cursor-pointer`} 
                          style={{ animationDelay: `${index * 200}ms` }}
                          onClick={() => {
                            if (item.key === 'github' && githubScore.breakdown) {
                              setShowScoreBreakdown({ type: 'github', data: githubScore });
                            } else if (item.key === 'leetcode' && leetcodeScore.breakdown) {
                              setShowScoreBreakdown({ type: 'leetcode', data: leetcodeScore });
                            }
                          }}
                        >
                          <div className="d-flex align-items-center gap-3 flex-grow-1">
                            <div className={`p-2 bg-gradient-to-r ${item.color} rounded-xl shadow-lg`}>
                              <item.icon size={24} className="text-white" />
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold fs-5">{item.label}</div>
                              <div className="fs-6 text-blue-100 opacity-80">{item.description}</div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-4">
                            <div className="text-end">
                              <div className="fs-4 fw-bold">{breakdown.score}/100</div>
                              <div className="fs-6 text-blue-100">
                                {breakdown.grade} • {Math.round(breakdown.weight * 100)}% weight
                              </div>
                            </div>
                            <div className="w-25 h-2 bg-white/20 rounded-full overflow-hidden">
                              <div 
                                className="h-100 bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-2000 ease-out shadow-lg"
                                style={{ 
                                  width: `${breakdown.score}%`,
                                  animationDelay: `${index * 300 + 1000}ms`
                                }}
                              ></div>
                            </div>
                            {((item.key === 'github' && githubScore.breakdown) || (item.key === 'leetcode' && leetcodeScore.breakdown)) && (
                              <Eye size={20} className="text-white/60 hover-text-white transition-colors duration-200" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Individual Score Cards */}
        {(scoreData || githubScore.score > 0 || leetcodeScore.score > 0) && (
          <div className="row g-4 mb-4">
            {/* ATS Score Card */}
            {scoreData && (
              <div className="col-lg-4">
                <div className="score-card-enhanced bg-gradient-to-br from-blue-50 to-blue-100 rounded-3 shadow-xl p-4 border border-blue-200 hover-shadow-2xl transition-all duration-500 transform hover-translate-y-n2 animate-slideInUp group">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h3 className="fw-bold text-gray-900 d-flex align-items-center gap-2 fs-5">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg group-hover-scale-110 transition-transform duration-300">
                        <FileText size={20} className="text-white" />
                      </div>
                      ATS Compatibility
                    </h3>
                    <div className="fs-6 bg-blue-100 text-blue-700 px-2 py-1 rounded-pill fw-semibold border border-blue-200">
                      AI Analyzed
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <CircularProgress score={scoreData.score} size={120} label="ATS" />
                  </div>
                  <div className="gap-2">
                    <div className="d-flex justify-content-between align-items-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <span className="text-gray-700 fw-medium">Confidence</span>
                      <span className="fw-bold text-gray-900">{scoreData.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <span className="text-gray-700 fw-medium">Median Score</span>
                      <span className="fw-bold text-gray-900">{scoreData.medianScore.toFixed(1)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <span className="text-gray-700 fw-medium">Grade</span>
                      <span className="fw-bold text-blue-600">{getScoreGrade(scoreData.score)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Score Card */}
            {githubScore.score > 0 && (
              <div className="col-lg-4">
                <div className="score-card-enhanced bg-gradient-to-br from-gray-50 to-gray-100 rounded-3 shadow-xl p-4 border border-gray-200 hover-shadow-2xl transition-all duration-500 transform hover-translate-y-n2 animate-slideInUp group cursor-pointer"
                     onClick={() => setShowScoreBreakdown({ type: 'github', data: githubScore })}>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h3 className="fw-bold text-gray-900 d-flex align-items-center gap-2 fs-5">
                      <div className="p-2 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg shadow-lg group-hover-scale-110 transition-transform duration-300">
                        <Github size={20} className="text-white" />
                      </div>
                      GitHub Activity
                    </h3>
                    <div className="d-flex align-items-center gap-2">
                      <div className="fs-6 bg-gray-100 text-gray-700 px-2 py-1 rounded-pill fw-semibold border border-gray-200">
                        {githubScore.level}
                      </div>
                      <Eye size={16} className="text-gray-400 hover-text-gray-600 transition-colors duration-200" />
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <CircularProgress score={githubScore.score} size={120} label="GitHub" />
                  </div>
                  <div className="gap-2">
                    <div className="d-flex justify-content-between align-items-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <span className="text-gray-700 fw-medium">Repositories</span>
                      <span className="fw-bold text-gray-900">{githubStats?.publicRepos || 0}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <span className="text-gray-700 fw-medium">Followers</span>
                      <span className="fw-bold text-gray-900">{githubStats?.followers || 0}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <span className="text-gray-700 fw-medium">Grade</span>
                      <span className="fw-bold text-gray-600">{githubScore.grade}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LeetCode Score Card */}
            {leetcodeScore.score > 0 && (
              <div className="col-lg-4">
                <div className="score-card-enhanced bg-gradient-to-br from-orange-50 to-orange-100 rounded-3 shadow-xl p-4 border border-orange-200 hover-shadow-2xl transition-all duration-500 transform hover-translate-y-n2 animate-slideInUp group cursor-pointer"
                     onClick={() => setShowScoreBreakdown({ type: 'leetcode', data: leetcodeScore })}>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h3 className="fw-bold text-gray-900 d-flex align-items-center gap-2 fs-5">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg group-hover-scale-110 transition-transform duration-300">
                        <Code size={20} className="text-white" />
                      </div>
                      LeetCode Performance
                    </h3>
                    <div className="d-flex align-items-center gap-2">
                      <div className="fs-6 bg-orange-100 text-orange-700 px-2 py-1 rounded-pill fw-semibold border border-orange-200">
                        {leetcodeScore.level}
                      </div>
                      <Eye size={16} className="text-gray-400 hover-text-gray-600 transition-colors duration-200" />
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <CircularProgress score={leetcodeScore.score} size={120} label="LeetCode" />
                  </div>
                  <div className="gap-2">
                    <div className="d-flex justify-content-between align-items-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <span className="text-gray-700 fw-medium">Problems Solved</span>
                      <span className="fw-bold text-gray-900">{leetcodeStats?.totalSolved || 0}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <span className="text-gray-700 fw-medium">Ranking</span>
                      <span className="fw-bold text-gray-900">#{leetcodeStats?.ranking?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      <span className="text-gray-700 fw-medium">Grade</span>
                      <span className="fw-bold text-orange-600">{leetcodeScore.grade}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced AI Recommendations */}
        {comprehensiveScore && comprehensiveScore.recommendations && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3 shadow-xl p-4 mb-4 border border-white/50 animate-slideInUp">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg animate-bounce">
                <Lightbulb size={28} className="text-white" />
              </div>
              <div>
                <h3 className="fs-3 fw-bold text-gray-900">AI-Powered Recommendations</h3>
                <p className="text-gray-600">Personalized suggestions to improve your profile</p>
              </div>
            </div>
            <div className="row g-3">
              {comprehensiveScore.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`col-12 recommendation-card p-4 rounded-3 border-start border-4 transform hover-scale-105 transition-all duration-300 shadow-lg ${rec.priority === 'high' ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-500' : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500'} animate-fadeInLeft`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className={`p-2 rounded-xl shadow-lg ${rec.type === 'ats' ? 'bg-blue-500' : rec.type === 'github' ? 'bg-gray-700' : 'bg-orange-500'}`}>
                      {rec.type === 'ats' && <FileText size={24} className="text-white" />}
                      {rec.type === 'github' && <Github size={24} className="text-white" />}
                      {rec.type === 'leetcode' && <Code size={24} className="text-white" />}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h4 className={`fw-bold fs-4 ${rec.priority === 'high' ? 'text-red-800' : 'text-yellow-800'}`}>
                          {rec.title}
                        </h4>
                        <span className={`fs-6 px-2 py-1 rounded-pill fw-semibold ${rec.priority === 'high' ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'}`}>
                          {rec.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <p className={`mb-3 lead ${rec.priority === 'high' ? 'text-red-700' : 'text-yellow-700'}`}>
                        {rec.description}
                      </p>
                      <ul className="list-unstyled gap-1">
                        {rec.actions.map((action, actionIndex) => (
                          <li 
                            key={actionIndex} 
                            className={`d-flex align-items-center gap-2 ${rec.priority === 'high' ? 'text-red-600' : 'text-yellow-600'} animate-fadeInLeft`}
                            style={{ animationDelay: `${index * 200 + actionIndex * 100}ms` }}
                          >
                            <CheckCircle size={16} />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Report Button */}
        {comprehensiveScore && (
          <div className="text-center mb-4">
            <button
              className={`btn btn-lg position-relative py-3 px-5 rounded-3 text-white fw-bold fs-5 transition-all duration-500 d-flex align-items-center justify-content-center gap-2 mx-auto overflow-hidden ${generating ? 'btn-secondary disabled' : 'btn-primary shadow-lg'}`}
              onClick={handleGenerateReport}
              disabled={generating}
            >
              <div className="position-absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-0 group-hover-opacity-20 transition-opacity duration-500"></div>
              <div className="position-relative z-10 d-flex align-items-center gap-2">
                {generating ? (
                  <>
                    <div className="spinner-border spinner-border-sm text-light" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Generating Detailed Report...
                  </>
                ) : (
                  <>
                    <FileText size={24} />
                    Generate Comprehensive Report
                    <Sparkles size={20} className="group-hover-rotate-12 transition-transform duration-300" />
                  </>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Enhanced Report Section */}
        {report && (
          <div className="report-card bg-white/80 backdrop-blur-xl rounded-3 shadow-xl overflow-hidden border border-white/50 animate-slideInUp">
            <div className="report-header bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-bottom border-gray-200">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <FileCheck size={28} className="text-white" />
                </div>
                <h3 className="report-title fs-3 fw-bold text-gray-900">AI-Generated Comprehensive Report</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-3 border-start border-4 border-blue-500 shadow-inner">
                <p className="report-text text-gray-700 lead whitespace-pre-wrap">{report}</p>
              </div>
              <div className="mt-4 d-flex justify-content-end">
                <button className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-3 hover-from-blue-200 hover-to-blue-300 transition-all duration-300 transform hover-scale-105 shadow-lg fw-semibold">
                  <Download size={20} />
                  Download Report
                </button>
              </div>
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

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }
        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out forwards;
        }
        .animate-fadeInLeft {
          animation: fadeInLeft 0.4s ease-out forwards;
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .hover-scale-105:hover {
            transform: scale(1.05);
        }
        .hover-translate-y-n2:hover {
            transform: translateY(-0.5rem);
        }
        .group-hover-scale-110:hover {
            transform: scale(1.1);
        }
        .group-hover-opacity-100:hover {
            opacity: 1;
        }
        .group-hover-translate-x-1:hover {
            transform: translateX(0.25rem);
        }
        .group-hover-rotate-12:hover {
            transform: rotate(12deg);
        }
      `}</style>
    </div>
  );
}

export default PersonalAnalysis;