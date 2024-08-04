import React, { useState } from 'react';
import './index.css'

import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

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
      <Switch>
        <Route path="/" exact component={LoginPage onLogin={handleLogin}} />
        <Route path="/pong" exact>
          <MainGrid initialComponent="Pong" user={user} onLogout={handleLogout} />
        </Route>
        <Route path="/settings" exact>
          <MainGrid initialComponent="SettingsPage" user={user} onLogout={handleLogout} />
        </Route>
        <Route path="/profile" exact>
          <MainGrid initialComponent="ProfilePage" user={user} onLogout={handleLogout} />
        </Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
};

export default PageManager;

/*
<div>
  {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
  {currentPage === 'main' && user && (
    <MainGrid user={user} onLogout={handleLogout} />
  )}
</div>
*/

/*
<div>
  <Route path="/" exact>
    <LoginPage onLogin={handleLogin} />
  </Route>
  <Route path="/main">
    {user && <MainGrid user={user} onLogout={handleLogout} />}
  </Route>
  <Route path="/pong">
    {user && <Pong />}
  </Route>
  <Route path="/profile">
    {user && <ProfilePage user={user} />}
  </Route>
  <Route path="/settings">
    {user && <SettingsPage />}
  </Route>
</div>
*/
