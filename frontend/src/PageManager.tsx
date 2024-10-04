import React, { useState, useEffect } from 'react';
import './index.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import LoginPage from './LoginPage/LoginPage';
import AuthenticationPage from './AuthenticationPage/AuthenticationPage';
import MainGrid from './mainGrid/MainGrid';
import { Constants } from '../shared/constants';

// --- DEBUG --- //
import { randomDebug, createRandomUser } from "./randomUser"
// --- DEBUG --- //

const pSock = io(`${Constants.BACKEND_HOST_URL}/ft_transcendence`, {
  transports: ['websocket'],
  query: {
    currentPath: window.location.pathname
  },
  withCredentials: true,
});

export interface User {
  id:  number,
  username: string,
  avatarURL: string,
  TwoFactorSecret: string,
  TwoFactorEnabled: boolean
}

const PageManager: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (intraUser: any) => {
    console.log('PageManager: Logging in', intraUser);
    const response = await fetch(`${Constants.BACKEND_HOST_URL}/user/${intraUser.id}`, {
      method:  'GET'
    });
    let user = await response.json();
    // --- DEBUG --- //
    if (randomDebug) {
      user = createRandomUser(user);
      console.log('PageManager: Random User created', user);
    }
    // --- DEBUG --- //
    if (user.statusCode === 404) {
      console.log('PageManager: User not found, creating new user');
      if (randomDebug) {
        const response = await fetch(`${Constants.BACKEND_HOST_URL}/user/create`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json'
          },
          body: JSON.stringify({
            id:   user.id,
            username:  user.username,
            avatarURL:  user.avatarURL
          })
        });
        user = await response.json();
      }
      else {
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
      console.log('PageManager: Random User created', user);
    }
    const jwt = await fetch(`${Constants.BACKEND_HOST_URL}/auth/jwt/${intraUser.id}`, {
      method: 'GET'
    });
    const jwt_result = await jwt.json();
    setUser({
      id: user.id,
      username: user.username,
      avatarURL:  user.avatarURL,
      TwoFactorSecret: user.TwoFactorSecret,
      TwoFactorEnabled: user.TwoFactorEnabled
    });
    document.cookie = `jwt=${jwt_result.token}; path=/;`;
    return user;
  };

  const handleLogout = () => {
    console.log('PageManager: Logging out');
    setUser(null);
  };

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
      console.log('PageManager: LocationHandler useEffect:', location.pathname, user?.username);
      if (!location.pathname.includes('/pong')) {
        console.log('PageManager: Not at pong page', user?.username);
        leaveQueue();
        leaveGame();
      }
      // Emit custom event to update currentPath
      pSock.emit('updateCurrentPath', { currentPath: location.pathname });
    }, [location.pathname]);
  
    return null;
  };

  return (
    <Router>
      <LocationHandler />
      <Routes>
        <Route
          path="/"
          element={<LoginPage onLogin={handleLogin} />}
        />

        <Route
          path="/auth"
          element={<AuthenticationPage user={user} />}
        />

        <Route
          path="/pong"
          element={
            user ?
              <MainGrid
                contentComponent="Pong"
                user={user}
                pSock={pSock}
                onLogout={handleLogout}
              />
            :
              <Navigate replace to="/" />
          }
        />

        <Route
          path="/settings"
          element={
            user ?
              <MainGrid
                contentComponent="SettingsPage"
                user={user}
                pSock={pSock}
                onLogout={handleLogout}
              />
            :
              <Navigate replace to="/" />
          }
        />

        <Route
          path="/profile/:id"
          element={
            user ?
              <MainGrid
                contentComponent="ProfilePage"
                user={user}
                pSock={pSock}
                onLogout={handleLogout}
              />
            :
              <Navigate replace to="/" />
          }
        />

        <Route
          path="*"
          element={<Navigate replace to="/" />} 
        />
      </Routes>
    </Router>
  );
};

export default PageManager;
// over multiple lines
// profile/id
