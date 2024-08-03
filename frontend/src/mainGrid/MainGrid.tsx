import React from 'react';
import './MainGrid.css';
import MainHeader from '../mainHeader/MainHeader';
import { User } from '../PageManager.tsx';

// import GameManager from '../gameManager/GameManager';
// <GameManager />
// import Connections from '../connections/Connections';
// <Connections />
import Pong from '../pong/Pong';
import Tabs from '../chat/Tabs';

interface MainGridProps {
  user: User;
  onProfile: () => void;
  onLogout: () => void;
}

const MainGrid: React.FC<MainGridProps> = ({ user, onProfile, onLogout }) => {
  return (
    <div className="parent">
      <div className="header"><MainHeader user={user} onProfile={onProfile} onLogout={onLogout} /></div>
      <div className="content"><Pong /></div>
      <div className="chat"><Tabs /></div>
    </div>
  );
};

export default MainGrid;
