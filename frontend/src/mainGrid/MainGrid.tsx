import React from 'react';
import './MainGrid.css';
import MainHeader from '../mainHeader/MainHeader';

// import GameManager from '../gameManager/GameManager';
// <GameManager />
<<<<<<< HEAD
import Tabs from '../chat/Tabs';
// import Connections from '../connections/Connections';
import ProfilePage from '../ProfilePage/ProfilePage';
=======
// import Connections from '../connections/Connections';
// <Connections />
import Pong from '../pong/Pong';
>>>>>>> main

interface MainGridProps {
  user: string;
  onProfile: () => void;
  onLogout: () => void;
}

const MainGrid: React.FC<MainGridProps> = ({ user, onProfile, onLogout }) => {
  return (
    <div className="parent">
      <div className="header"><MainHeader user={user} onProfile={onProfile} onLogout={onLogout} /></div>
<<<<<<< HEAD
      <div className="game"><ProfilePage user={user} onLogout={onLogout} /></div>
      <div className="chat"><Tabs /></div>
=======
      <div className="game"><Pong /></div>
      <div className="chat"><Chat /></div>
>>>>>>> main
    </div>
  );
};

export default MainGrid;
