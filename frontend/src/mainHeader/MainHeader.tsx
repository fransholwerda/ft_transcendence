import React from 'react';
import './MainHeader.css';
import mainHeaderImage from './mainheader.png';
import { User } from '../PageManager.tsx';
import { Link } from 'react-router-dom';

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
        <Link to="/profile">
          <button className="header-profile-button">
            Profile
          </button>
        </Link>
      </div>

      <div className="header-settings">
        <Link to="/settings">
          <button className="header-settings-button">
            Settings
          </button>
        </Link>
      </div>

      <div className="header-pong">
        <Link to="/Pong">
          <button className="header-Pong-button">
            Pong
          </button>
        </Link>
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
