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
        <Route path="/" exact render={(props: RouteComponentProps) => <LoginPage {...props} onLogin={handleLogin} />} />
        
        <Route path="/pong" exact>
          {user ? <MainGrid initialComponent="Pong" user={user} onLogout={handleLogout} /> : <Redirect to="/" />}
        </Route>

        <Route path="/settings" exact>
          {user ? <MainGrid initialComponent="SettingsPage" user={user} onLogout={handleLogout} /> : <Redirect to="/" />}
        </Route>

        <Route path="/profile" exact>
          {user ? <MainGrid initialComponent="ProfilePage" user={user} onLogout={handleLogout} /> : <Redirect to="/" />}
        </Route>
        
        <Redirect to="/" />
      </Switch>
    </Router>
  );
};

export default PageManager;
