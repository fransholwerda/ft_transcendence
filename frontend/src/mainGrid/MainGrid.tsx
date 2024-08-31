import React from 'react';
import './MainGrid.css';
import { User } from '../PageManager.tsx';
import { Socket } from 'socket.io-client';
import Chat from '../chat/Chat.tsx';

// import GameManager from '../gameManager/GameManager';
// <GameManager />
// import Connections from '../connections/Connections';
// <Connections />

// components for routing
import MainHeader from '../mainHeader/MainHeader'
import Pong from '../pong/Pong'
import ProfilePage from '../ProfilePage/ProfilePage'
import SettingsPage from '../SettingsPage/SettingsPage'

interface MainGridProps {
  user: User;
  pSock: Socket;
  onLogout: () => void;
}

const MainGrid: React.FC<MainGridProps & { contentComponent: string }> = ({ user, pSock, onLogout, contentComponent }) => {
  const renderComponent = () => {
    switch (contentComponent) {
      case 'Pong':
        return <Pong user={user} pSock={pSock}/>;
      case 'SettingsPage':
        return <SettingsPage user={user} />;
      case 'ProfilePage':
        return <ProfilePage user={user} />;
      default:
        return <Pong user={user} pSock={pSock}/>;
    }
  }
  
  return (
    <div className="parent">
      <div className="header"><MainHeader user={user} onLogout={onLogout} /></div>
      <div className="content">{renderComponent()}</div>
      <div className="chat"><Chat user={user} socket={pSock} /></div>
    </div>
  );
};

export default MainGrid;
