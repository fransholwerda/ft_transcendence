import React, { useState } from 'react';
import './index.css'

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// components for routing
import LoginPage from './LoginPage/LoginPage'
import MainGrid from './mainGrid/MainGrid'

import { Constants } from '../shared/constants';

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        
        <Route path="/pong" element={user ? <MainGrid contentComponent="Pong" user={user} onLogout={handleLogout} /> : <Navigate replace to="/" />} />
        
        <Route path="/settings" element={user ? <MainGrid contentComponent="SettingsPage" user={user} onLogout={handleLogout} /> : <Navigate replace to="/" />} />
        
        <Route path="/profile" element={user ? <MainGrid contentComponent="ProfilePage" user={user} onLogout={handleLogout} /> : <Navigate replace to="/" />} />
        
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Router>
  );
};

export default PageManager;
