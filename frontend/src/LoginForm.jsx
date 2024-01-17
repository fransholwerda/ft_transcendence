// LoginForm.jsx
import './LoginForm.css';
import React, { useState } from 'react';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    // Add your login logic here, e.g., send a request to a server
    console.log(`Logging in with username: ${username} and password: ${password}`);
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
  };

  return (
    <div>
      <h2>Login</h2>
      <form>
        <label>
          Username:
          <input type="text" value={username} onChange={handleUsernameChange} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={handlePasswordChange} />
        </label>
        <br />
        <button type="button" onClick={handleLogin}>
          Login
        </button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
