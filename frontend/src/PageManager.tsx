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
  display_name: string;
}

const PageManager: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (user_id: number) => {
    setUser({display_name: user_id.toString()});
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
