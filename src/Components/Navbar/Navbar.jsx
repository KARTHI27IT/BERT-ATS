import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Brain, 
  Edit2,
  Settings,
  BarChart3,
  Users,
  Bell
} from 'lucide-react';
import './Navbar.css';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [githubId, setGithubId] = useState('');
  const [leetcodeId, setLeetcodeId] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGithub, setEditGithub] = useState('');
  const [editLeetcode, setEditLeetcode] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      const payLoad = {
    email: email
  };
  console.log(payLoad);
      axios.post(`http://localhost:5000/user/details`,payLoad)
        .then((res) => {
          console.log(res.data);
          setUserName(res.data.user.name);
          setGithubId(res.data.user.githubId);
          setLeetcodeId(res.data.user.leetcodeId);
        })
        .catch(err => console.error('Error fetching user data:', err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserEmail('');
    setMenuOpen(false);
    setShowUserMenu(false);
    setTimeout(() => navigate('/dashboard'), 100);
  };

  const saveUserLinks = () => {
    axios.post('http://localhost:5000/updateuserlinks', {
      email: userEmail,
      githubId: editGithub,
      leetcodeId: editLeetcode
    })
    .then(() => {
      setGithubId(editGithub);
      setLeetcodeId(editLeetcode);
      setShowEditModal(false);
    })
    .catch(err => console.error('Error updating links:', err));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/dashboard" className="navbar-brand">
              <div className="brand-icon">
                <Brain size={24} />
              </div>
              <div className="brand-text">
                <div className="brand-name">BERT ATS</div>
                <div className="brand-tagline">AI-Powered</div>
              </div>
            </Link>

            <button 
              className="mobile-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="desktop-nav">
              <Link 
                to="/personalAnalysis" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <BarChart3 size={16} />
                Personal Analysis
              </Link>
              <Link 
                to="/recruitmentAnalysis" 
                className={`nav-link ${isActive('/recruitmentAnalysis') ? 'active' : ''}`}
              >
                <Users size={16} />
                Recruitment Analysis
              </Link>

              {!isLoggedIn ? (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-outline">
                    <User size={16} />
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn btn-primary">
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="user-section">
                  <button className="notification-btn">
                    <Bell size={16} />
                    <span className="notification-badge">2</span>
                  </button>
                  
                  <div className="user-menu-container">
                    <button 
                      className="user-menu-trigger"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <div className="user-avatar">
                        {userEmail.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{userName || userEmail.split('@')[0]}</div>
                        <div className="user-email">{userEmail}</div>
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`chevron ${showUserMenu ? 'rotated' : ''}`} 
                      />
                    </button>
                    
                    {showUserMenu && (
                      <>
                        <div className="user-menu-overlay" onClick={() => setShowUserMenu(false)} />
                        <div className="user-dropdown">
                          <div className="dropdown-header">
                            <div className="user-avatar large">
                              {userEmail.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                              <div className="dropdown-name">{userName || userEmail.split('@')[0]}</div>
                              <div className="dropdown-email">{userEmail}</div>
                            </div>
                          </div>
                          <div className="dropdown-divider" />
                          <div className="dropdown-menu">
                            <button 
                              className="dropdown-item"
                              onClick={() => setShowProfileModal(true)}
                            >
                              <User size={16} />
                              View Profile
                            </button>
                            <button className="dropdown-item">
                              <Settings size={16} />
                              Settings
                            </button>
                            <div className="dropdown-divider" />
                            <button 
                              onClick={handleLogout} 
                              className="dropdown-item logout"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className={`mobile-nav ${menuOpen ? 'mobile-nav-open' : ''}`}>
          {menuOpen && <div className="mobile-nav-overlay" onClick={() => setMenuOpen(false)} />}
          <div className="mobile-nav-content">
            <Link 
              to="/personalAnalysis" 
              className={`mobile-nav-link ${isActive('/personalAnalysis') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <BarChart3 size={16} />
              Personal Analysis
            </Link>
            <Link 
              to="/recruitmentAnalysis" 
              className={`mobile-nav-link ${isActive('/recruitmentAnalysis') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Users size={16} />
              Recruitment Analysis
            </Link>
            
            {!isLoggedIn ? (
              <div className="mobile-auth-section">
                <Link 
                  to="/login" 
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={16} />
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <div className="user-avatar">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="mobile-user-name">{userName || userEmail.split('@')[0]}</div>
                    <div className="mobile-user-email">{userEmail}</div>
                  </div>
                </div>
                <div className="mobile-user-actions">
                  <button 
                    className="mobile-nav-link"
                    onClick={() => {
                      setShowProfileModal(true);
                      setMenuOpen(false);
                    }}
                  >
                    <User size={16} />
                    View Profile
                  </button>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }} 
                    className="mobile-nav-link logout-link"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowProfileModal(false)} />
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-title">
                  <User size={20} />
                  User Profile
                </div>
                <button 
                  className="modal-close"
                  onClick={() => setShowProfileModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="profile-section">
                  <div className="profile-avatar">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h3 className="profile-name">{userName || 'User'}</h3>
                    <p className="profile-email">{userEmail}</p>
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="detail-item">
                    <div className="detail-label">Full Name</div>
                    <div className="detail-value">{userName || 'Not set'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Email Address</div>
                    <div className="detail-value">{userEmail}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">GitHub Username</div>
                    <div className="detail-value">{githubId || 'Not set'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">LeetCode Username</div>
                    <div className="detail-value">{leetcodeId || 'Not set'}</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowProfileModal(false)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setEditGithub(githubId);
                    setEditLeetcode(leetcodeId);
                    setShowEditModal(true);
                    setShowProfileModal(false);
                  }}
                >
                  <Edit2 size={16} />
                  Edit Links
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowEditModal(false)} />
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-title">
                  <Edit2 size={20} />
                  Edit Profile Links
                </div>
                <button 
                  className="modal-close"
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">GitHub Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter your GitHub username"
                    value={editGithub} 
                    onChange={(e) => setEditGithub(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LeetCode Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter your LeetCode username"
                    value={editLeetcode} 
                    onChange={(e) => setEditLeetcode(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={saveUserLinks}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;