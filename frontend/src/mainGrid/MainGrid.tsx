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
  onLogout: () => void;
}

const MainGrid: React.FC<MainGridProps> = ({ user, onLogout }) => {
  return (
    <div className="parent">
      <div className="header"><MainHeader user={user} onLogout={onLogout} /></div>
      <div className="content"><Pong /></div>
      <div className="chat"><Tabs /></div>
    </div>
  );
};

export default MainGrid;
