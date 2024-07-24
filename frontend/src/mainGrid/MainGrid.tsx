import React from 'react';
import './MainGrid.css';
import Chat from '../chat/Chat'
// import GameManager from '../gameManager/GameManager';
import MainHeader from '../mainHeader/MainHeader';
import Connections from '../connections/Connections';

interface MainGridProps {
  user: string;
  onProfile: () => void;
  onLogout: () => void;
}

const MainGrid: React.FC<MainGridProps> = ({ user, onProfile, onLogout }) => {
  return (
    <div className="parent">
      <div className="header"><MainHeader user={user} onProfile={onProfile} onLogout={onLogout} /></div>
      <div className="game"><Connections /></div>
      <div className="chat"><Chat /></div>
    </div>
  );
};

export default MainGrid;
