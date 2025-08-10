import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  BarChart3, 
  FileText, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';
import './Dashboard.css';

const LandingPage = () => {
  const features = [
    {
      icon: <Brain size={32} />,
      title: "AI-Powered Analysis",
      description: "Advanced BERT technology analyzes your resume with human-like understanding of context and relevance."
    },
    {
      icon: <Target size={32} />,
      title: "ATS Optimization",
      description: "Get precise compatibility scores and recommendations to pass through Applicant Tracking Systems."
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Detailed Analytics",
      description: "Comprehensive scoring with confidence intervals, median scores, and statistical analysis."
    },
    {
      icon: <FileText size={32} />,
      title: "Smart Reports",
      description: "AI-generated detailed reports with actionable insights and improvement suggestions."
    },
    {
      icon: <Users size={32} />,
      title: "Bulk Analysis",
      description: "Analyze multiple resumes simultaneously for recruitment teams and HR professionals."
    },
    {
      icon: <Shield size={32} />,
      title: "Secure & Private",
      description: "Your data is processed securely with enterprise-grade privacy protection."
    }
  ];

  const benefits = [
    "Increase interview callback rates by up to 40%",
    "Save hours of manual resume optimization",
    "Get insights from industry-leading AI technology",
    "Access professional-grade analysis tools",
    "Receive personalized improvement recommendations"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content: "BERT ATS helped me land my dream job at a Fortune 500 company. The insights were incredibly valuable!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "HR Manager",
      content: "Our recruitment process is now 3x more efficient. The bulk analysis feature is a game-changer.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Data Analyst",
      content: "The detailed analytics and recommendations helped me understand exactly what recruiters were looking for.",
      rating: 5
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <div className="nav-brand">
              <Brain className="brand-icon" size={32} />
              <span className="brand-text">BERT ATS</span>
            </div>
            <div className="nav-links">
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Optimize Your Resume with
                <span className="gradient-text"> AI-Powered ATS Analysis</span>
              </h1>
              <p className="hero-description">
                Get your resume past Applicant Tracking Systems with our advanced BERT-based AI technology. 
                Increase your chances of landing interviews with data-driven insights and recommendations.
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Accuracy Rate</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Resumes Analyzed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">40%</div>
                  <div className="stat-label">Higher Callback Rate</div>
                </div>
              </div>
              <div className="hero-actions">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Start Free Analysis
                  <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card">
                <div className="card-header">
                  <FileText size={24} />
                  <span>Resume Analysis</span>
                </div>
                <div className="card-content">
                  <div className="score-display">
                    <div className="score-circle">
                      <span className="score-value">87</span>
                      <span className="score-label">/100</span>
                    </div>
                    <div className="score-details">
                      <div className="score-item">
                        <span className="score-metric">Confidence</span>
                        <span className="score-number">94.2%</span>
                      </div>
                      <div className="score-item">
                        <span className="score-metric">Keywords</span>
                        <span className="score-number">Strong</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features for Career Success</h2>
            <p className="section-description">
              Everything you need to optimize your resume and land your dream job
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="benefits-title">Why Choose BERT ATS?</h2>
              <p className="benefits-description">
                Join thousands of professionals who have successfully optimized their resumes 
                and increased their job search success rate.
              </p>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <CheckCircle className="benefit-icon" size={20} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started Today
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="benefits-visual">
              <div className="visual-card">
                <div className="visual-header">
                  <TrendingUp size={24} />
                  <span>Success Rate</span>
                </div>
                <div className="visual-chart">
                  <div className="chart-bar" style={{ height: '60%' }}>
                    <span className="bar-label">Before</span>
                    <span className="bar-value">23%</span>
                  </div>
                  <div className="chart-bar primary" style={{ height: '95%' }}>
                    <span className="bar-label">After</span>
                    <span className="bar-value">87%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-description">
              Real success stories from professionals who transformed their careers
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Career?</h2>
            <p className="cta-description">
              Join thousands of professionals who have successfully optimized their resumes with BERT ATS
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Free Analysis
                <Zap size={20} />
              </Link>
              <p className="cta-note">No credit card required • Get results in minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Brain className="brand-icon" size={28} />
              <span className="brand-text">BERT ATS</span>
            </div>
            <div className="footer-links">
              <Link to="/login" className="footer-link">Sign In</Link>
              <Link to="/signup" className="footer-link">Get Started</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 BERT ATS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;