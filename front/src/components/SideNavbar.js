import React, { useState } from 'react';
import { HomeIcon, PlayIcon } from '@heroicons/react/24/solid';
import './SideNavbar.css';

const SideNavbar = ({ activeSport, onSportSelect }) => {
  const [activeNav, setActiveNav] = useState('HOME');

  const sports = [
    { icon: <HomeIcon className="nav-icon" />, text: 'HOME' },
    { icon: <PlayIcon className="nav-icon" />, text: 'IN-PLAY' },
    { image: '/events/menu-4.png', text: 'CRICKET', id: '4' },
    { image: '/events/menu-2.png', text: 'TENNIS', id: '2' },
    { image: '/events/menu-1.png', text: 'FOOTBALL', id: '1' },
    { image: '/events/menu-2378961.png', text: 'POLITICS' },
    { image: '/events/menu-7.png', text: 'HORSE RACING' },
    { image: '/events/menu-4339.png', text: 'GREYHOUND RACING' },
    { image: '/events/menu-99994.png', text: 'KABADDI' },
    { image: '/events/menu-99999.png', text: 'CASINO' },
    { image: '/events/menu-99991.png', text: 'SPORTS BOOK' },
    { image: '/events/menu-99998.png', text: 'INT CASINO' },
    { image: '/events/menu-99990.png', text: 'BINARY' },
    { image: '/events/menu-26420387.png', text: 'MIXED MARTIAL ARTS' },
    { image: '/events/menu-998917.png', text: 'VOLLEYBALL', id: '998917' },
    { image: '/events/menu-7524.png', text: 'ICE HOCKEY' },
    { image: '/events/menu-7522.png', text: 'BASKETBALL', id: '7522' },
    { image: '/events/menu-7511.png', text: 'BASEBALL', id: '7511' },
    { image: '/events/menu-3503.png', text: 'DARTS' },
    { image: '/events/menu-29.png', text: 'FUTSAL' },
  ];

  const handleNavClick = (text, id) => {
    setActiveNav(text);
    if (id && onSportSelect) {
      onSportSelect(id, text);
    }
  };

  return (
    <nav className="side-navbar">
      <div className="navbar-container">
        <div className="nav-items">
          {sports.map((item, index) => (
            <div
              key={index}
              className={`nav-item ${activeNav === item.text ? 'active' : ''} ${
                item.id && activeSport === item.id ? 'sport-active' : ''
              }`}
              onClick={() => handleNavClick(item.text, item.id)}
            >
              <div className="icon-wrapper">
                {item.icon || (
                  <img
                    src={item.image}
                    alt={item.text}
                    className="nav-icon"
                    onError={(e) => {
                      console.error(`Failed to load image for ${item.text}`);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <span className="nav-text">{item.text}</span>
            </div>
          ))}
        </div>
        <button className="menu-toggle-mobile">
          <i className="bi bi-list"></i>
        </button>
      </div>
    </nav>
  );
};

export default SideNavbar;