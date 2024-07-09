// LoginForm.tsx

import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    // Add your login logic here, e.g., send a request to a server
    console.log(`Logging in with username: ${username} and password: ${password}`);
    setIsLoggedIn(true);
  };

  const handleProfile = () => {
    setUsername('');
    setPassword('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <form>
        <label>
          Username:
          <input type="text" value={username} onChange={handleUsernameChange} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={handlePasswordChange} />
        </label>
        <div className="button-group">
          <button type="button" onClick={handleLogin}>
            Login
          </button>
          <button type="button" onClick={handleProfile}>
            Profile
          </button>
          {isLoggedIn && (
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
