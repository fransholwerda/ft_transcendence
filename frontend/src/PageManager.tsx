import React, { useState } from 'react';
import './index.css'

import LoginPage from './LoginPage/LoginPage'
import './LoginPage/LoginPage.css'

import ProfilePage from './ProfilePage/ProfilePage'
import './ProfilePage/ProfilePage.css'

import MainGrid from './mainGrid/MainGrid'
import './mainGrid/MainGrid.css'

const PageManager: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'login' | 'main' | 'profile'>('login');

  const handleLogin = (username: string) => {
    setUser(username);
    setCurrentPage('main');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const goToProfile = () => {
    setCurrentPage('profile');
  };

  const goToMain = () => {
    setCurrentPage('main');
  };

  return (
    <div>
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentPage === 'main' && user && (
        <MainGrid user={user} onProfile={goToProfile} onLogout={handleLogout} />
      )}
      {currentPage === 'profile' && user && (
        <ProfilePage user={user} onMainPage={goToMain} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default PageManager;

