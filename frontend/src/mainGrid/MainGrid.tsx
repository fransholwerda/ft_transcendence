import React from 'react';
import './MainGrid.css';
import MainHeader from '../mainHeader/MainHeader';

// import GameManager from '../gameManager/GameManager';
// <GameManager />
import Tabs from '../chat/Tabs';
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
      <div className="chat"><Tabs /></div>
    </div>
  );
};

export default MainGrid;
