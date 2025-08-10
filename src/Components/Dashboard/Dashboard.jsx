import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  Users, 
  ArrowRight,
  Zap,
  Shield,
  FileText,
  Users as UsersIcon
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userEmail');  // simple login check

  const features = [
    {
      icon: <BarChart3 size={28} />,
      title: "Personal Analysis",
      description: "Analyze your resume with AI-powered ATS scoring and get personalized recommendations.",
      route: "/personalAnalysis",
      color: "primary"
    },
    {
      icon: <Users size={28} />,
      title: "Recruitment Analysis",
      description: "Bulk analyze multiple resumes for efficient recruitment and candidate screening.",
      route: "/recruitmentAnalysis",
      color: "secondary"
    }
  ];

  const benefits = [
    {
      icon: <Zap size={20} />,
      title: "AI-Powered",
      description: "Advanced BERT technology for accurate analysis"
    },
    {
      icon: <Shield size={20} />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: <FileText size={20} />,
      title: "Domain-Specific Training",
      description: "Models trained on industry-specific resumes for tailored feedback"
    },
    {
      icon: <UsersIcon size={20} />,
      title: "GitHub & LeetCode Integration",
      description: "Leverage your coding profiles for enriched candidate analysis"
    }
  ];

  const handleFeatureClick = (route) => {
    if (isLoggedIn) {
      navigate(route);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <Brain size={16} />
                <span>AI-Powered Resume Analysis</span>
              </div>
              <h1 className="hero-title">
                Optimize Your Resume with<br />
                <span className="gradient-text"> Smart ATS Analysis</span>
              </h1>

              <div className="hero-actions">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    if (isLoggedIn) navigate('/personalAnalysis');
                    else navigate('/signup');
                  }}
                >
                  Start Free Analysis
                  <ArrowRight size={20} />
                </button>
                <button 
                  className="btn btn-secondary btn-lg"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Choose Your Analysis Type</h2>
            <p className="section-description">
              Select the perfect tool for your needs
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card feature-card-${feature.color}`} 
                onClick={() => handleFeatureClick(feature.route)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter') handleFeatureClick(feature.route) }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">
                  <ArrowRight size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose BERT ATS?</h2>
          </div>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">
                  {benefit.icon}
                </div>
                <h4 className="benefit-title">{benefit.title}</h4>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
