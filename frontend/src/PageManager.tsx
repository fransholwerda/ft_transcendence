import React, { useState, useEffect } from 'react';
import './index.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import LoginPage from './LoginPage/LoginPage';
import MainGrid from './mainGrid/MainGrid';
import { Constants } from '../shared/constants';

const pSock = io(`${Constants.BACKEND_HOST_URL}/pong`, {
  transports: ['websocket'],
});

export interface User {
  id:  string,
  username: string,
  avatarURL: string
}

const PageManager: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (intraUser: any) => {
    const response = await fetch(`${Constants.BACKEND_HOST_URL}/user/get/${intraUser.id}`, {
      method:  'GET'
    });
    let user = await response.json();
    if (user.statusCode == 404) {
      const response = await fetch(`${Constants.BACKEND_HOST_URL}/user/create`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          id:  intraUser.id,
          username:  intraUser.login,
          avatarURL:  intraUser.image.link
        })
      });
      user = await response.json();
    }
    setUser({
      id: user.id,
      username: user.username,
      avatarURL:  user.avatarURL
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const leaveQueue = () => {
    console.log('Leaving queue');
    pSock.emit('leaveQueue');
  };

  const leaveGame = () => {
    console.log('Leaving Game');
    pSock.emit('leaveGame');
  };

  useEffect(() => {
    return () => {
      console.log('Disconnecting socket:', pSock, user?.username);
      pSock.disconnect();
    };
  }, []);

  const LocationHandler: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
      if (!location.pathname.includes('/pong')) {
        leaveQueue();
        leaveGame();
      }
    }, [location.pathname]);

    return null;
  };

  return (
    <Router>
      <LocationHandler />
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        
        <Route path="/pong" element={user ? <MainGrid contentComponent="Pong" user={user} pSock={pSock} onLogout={handleLogout} /> : <Navigate replace to="/" />} />
        
        <Route path="/settings" element={user ? <MainGrid contentComponent="SettingsPage" user={user} pSock={pSock} onLogout={handleLogout} /> : <Navigate replace to="/" />} />
        
        <Route path="/profile" element={user ? <MainGrid contentComponent="ProfilePage" user={user} pSock={pSock} onLogout={handleLogout} /> : <Navigate replace to="/" />} />
        
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Router>
  );
};

export default PageManager;
