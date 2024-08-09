import React, { useState } from 'react';
import './index.css'

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// components for routing
import LoginPage from './LoginPage/LoginPage'
import MainGrid from './mainGrid/MainGrid'

// and their styles
import './LoginPage/LoginPage.css'
import './mainGrid/MainGrid.css'

export interface User {
  id:  string,
  username: string,
  avatarURL: string
}

const PageManager: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (intraUser: any) => {
    const response = await fetch(`http://localhost:3003/user/get/${intraUser.id}`, {
      method:  'GET'
    });
    let user = await response.json();
    if (user.statusCode == 404) {
      const response = await fetch('http://localhost:3003/user/create', {
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
        
        <Route path="/pong" element={user ? <MainGrid initialComponent="Pong" user={user} onLogout={handleLogout} /> : <Navigate replace to="/" />} />
        
        <Route path="/settings" element={user ? <MainGrid initialComponent="SettingsPage" user={user} onLogout={handleLogout} /> : <Navigate replace to="/" />} />
        
        <Route path="/profile" element={user ? <MainGrid initialComponent="ProfilePage" user={user} onLogout={handleLogout} /> : <Navigate replace to="/" />} />
        
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Router>
  );
};

export default PageManager;
