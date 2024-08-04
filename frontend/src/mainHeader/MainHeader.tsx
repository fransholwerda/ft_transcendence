import React from 'react';
import './MainHeader.css';
import mainHeaderImage from './mainheader.png';
import { User } from '../PageManager.tsx';

interface MainHeaderProps {
  user: User;
  onLogout: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ user, onLogout }) => {
  return (
    <div className="main-header">
      <div className="header-content">
        <div className="header-logo">
          <img src={mainHeaderImage} alt="logo" />
        </div>
        <div className="header-title">
          <h1>FT Transcendence</h1>
          <p>Welcome, {user.display_name}</p>
        </div>
      </div>
      <div className="header-profile">
        <button className="header-profile-button">
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
