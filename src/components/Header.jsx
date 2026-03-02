import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/userAuthSlice';
import toast from 'react-hot-toast';
import '../css/Header.css';

export default function Header({ downloadAppHeader = true }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userAuth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setDropdownOpen(false);
    toast.success('Session Logged Out');
    navigate('/');
  };

  return (
    <header className="site-header">
      {/* Top bar for Home, Contact, About as seen in your screenshots */}
      {downloadAppHeader && (
        <div className="header-top-bar">
          <div className="top-bar-content">
            <div className="app-promo">
              <span className="promo-icon">📱</span>
              <span>Download MRC App Here</span>
            </div>
            <nav className="top-nav">
              <a href="/home">Home</a>
              <a href="/contact">Contact Us</a>
              <a href="/about">About Us</a>
            </nav>
          </div>
        </div>
      )}

      <div className="header-main">
        <div className="header-container">
          {/* Logo Section */}
          <div className="logo-group" onClick={() => navigate('/home')}>
            <span className="logo-text">MRC</span>
            <div className="header-divider"></div>
          </div>

          {/* Search Bar - Center */}
          <div className="header-search">
            <input type="text" placeholder="Search" />
            <button className="search-btn">🔍</button>
          </div>

          {/* Navigation Pills - Matches your shopping cart screenshot */}
          <nav className="header-nav-center">
            <button className="nav-pill active" onClick={() => navigate('/home')}>Home</button>
            <button className="nav-pill">
              About
              <svg className="header-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="nav-pill">Services</button>
            <button className="nav-pill" onClick={() => navigate('/products')}>Menu</button>
          </nav>

          {/* User Profile & Cart Icon */}
          <div className="header-actions">
            {user ? (
              <div className="header-user-wrapper" ref={dropdownRef}>
                <div
                  className={`header-user-profile ${dropdownOpen ? 'active' : ''}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="avatar-circle"></div>
                  <span className="profile-name">
                    {user.name}
                    <svg
                      className={`header-chevron ${dropdownOpen ? 'rotate' : ''}`}
                      width="10" height="6" viewBox="0 0 10 6" fill="none"
                    >
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>

                {dropdownOpen && (
                  <div className="header-user-dropdown-menu">
                    <div className="dropdown-user-info">
                      <span className="info-name">{user.name}</span>
                      <span className="info-email">{user.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      My Profile
                    </button>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout Session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="nav-pill login-btn-header" onClick={() => navigate('/')}>Login</button>
            )}

            <div className="cart-icon-wrapper" onClick={() => navigate('/cart')}>
              <div className="cart-blue-circle">🛒</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}