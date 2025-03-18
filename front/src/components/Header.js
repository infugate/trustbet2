// Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Heroicons import
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // New state for search active
  const isLoggedIn = false;
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      console.log(`Searching for: ${searchQuery}`);
      alert(`Searching for: ${searchQuery}`);
      // Reset border after 1 second to show search happened
      setTimeout(() => setIsSearching(false), 1000);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    window.dispatchEvent(new Event('toggleMobileSidebar')); // dispatch custom event
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-search-container">
          <div className="logo">
          <h2 className="logo-image">TRUSTBET247</h2>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search Events"
              className={`search-input ${isSearching ? 'searching' : ''}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <MagnifyingGlassIcon 
              className="search-icon"
              onClick={handleSearch}
            />
          </div>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="nav-link">Sports</Link>
          <Link to="/casino" onClick={() => setIsMobileMenuOpen(false)} className="nav-link">Casino</Link>
          <button className="rules-btn">RULES</button>
          
          <div className="auth-buttons">
            {isLoggedIn ? (
              <button className="login-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="login-btn" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUser /> Login
                </Link>
                <Link 
                  to="/signup" 
                  className="signup-btn" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;