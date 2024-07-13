import React from 'react';
import './MainHeader.css';
import mainHeaderImage from './mainheader.png';

interface MainHeaderProps {
  user: string;
  onProfile: () => void;
  onLogout: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ user, onProfile, onLogout }) => {
  return (
    <div className="main-header">
      <div className="header-content">
        <div className="header-logo">
          <img src={mainHeaderImage} alt="logo" />
        </div>
        <div className="header-title">
          <h1>FT Transcendence</h1>
          <p>Welcome, {user}</p>
        </div>
      </div>
      <div className="header-profile">
        <button className="header-profile-button" onClick={onProfile}>
          Profile
        </button>
      </div>
      <div className="header-logout">
        <button className="header-logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default MainHeader;
