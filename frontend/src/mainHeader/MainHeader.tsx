import React from 'react';
import './MainHeader.css';
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
        <div className="header-title">
          <div>
            <h1>Welcome, {user.username} : {user.id}! </h1>
          </div>
        </div>
      </div>

      <div className="header-buttons">
        <Link to={`/profile/${user.id}`}>
          <button className="header-button">
            Profile
          </button>
        </Link>
      </div>

      <div className="header-item">
        <Link to="/settings">
          <button className="header-button">
            Settings
          </button>
        </Link>
      </div>

      <div className="header-item">
        <Link to="/pong">
          <button className="header-button">
            Pong
          </button>
        </Link>
      </div>

      <div className="header-item">
        <button className="header-button" onClick={onLogout}>
          Logout
        </button>
      </div>

    </div>
  );
};

export default MainHeader;
