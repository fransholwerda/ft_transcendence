import React, { useState, useEffect } from 'react';
import './index.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import LoginPage from './LoginPage/LoginPage';
import MainGrid from './mainGrid/MainGrid';
import { Constants } from '../shared/constants';

// --- DEBUG --- //
import { randomDebug, createRandomUser } from "./randomUser"
// --- DEBUG --- //

const pSock = io(`${Constants.BACKEND_HOST_URL}/ft_transcendence`, {
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
    console.log('PageManager: Logging in', intraUser);
    const response = await fetch(`${Constants.BACKEND_HOST_URL}/user/${intraUser.id}`, {
      method:  'GET'
    });
    let user = await response.json();
    if (user.statusCode === 404) {
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

    // --- DEBUG --- //
    if (randomDebug) {
      user = createRandomUser();
      console.log('PageManager: Random User created', user);
    }
    // --- DEBUG --- //
  
    setUser({
      id: user.id,
      username: user.username,
      avatarURL:  user.avatarURL
    });
  };

  const handleLogout = () => {
    console.log('PageManager: Logging out');
    setUser(null);
  };

  // special case for switching out the content
  const leaveQueue = () => {
    console.log('PageManager: Leaving Queue');
    pSock.emit('leaveQueue');
  };

  const leaveGame = () => {
    console.log('PageManager: Leaving Game');
    pSock.emit('leaveGame');
  };

  useEffect(() => {
    return () => {
      console.log('PageManager: standalone useEffect return');
      console.log('Disconnecting socket:', pSock, user?.username);
      pSock.disconnect();
    };
  }, []);

  const LocationHandler: React.FC = () => {
    console.log('PageManager: LocationHandler');
    const location = useLocation();

    useEffect(() => {
      console.log('PageManager: LocationHandler useEffect');
      if (!location.pathname.includes('/pong')) {
        console.log('PageManager: Not at pong page', user?.username);
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
