import React, { useState } from 'react';
import './index.css'

import LoginPage from './LoginPage/LoginPage'
import './LoginPage/LoginPage.css'

import './ProfilePage/ProfilePage.css'

import MainGrid from './mainGrid/MainGrid'
import './mainGrid/MainGrid.css'

export interface User {
  display_name: string;
}

const PageManager: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'login' | 'main' | 'profile'>('login');

  const handleLogin = async (user_id: number) => {
    setUser({display_name: user_id.toString()});
    setCurrentPage('main');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const goToProfile = () => {
    setCurrentPage('profile');
  };

  return (
    <div>
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentPage === 'main' && user && (
        <MainGrid user={user} onProfile={goToProfile} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default PageManager;

