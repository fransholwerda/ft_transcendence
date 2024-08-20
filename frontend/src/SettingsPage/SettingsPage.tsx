import React, { useState } from 'react';
import './SettingsPage.css';  // Import the CSS file

const SettingsPage: React.FC = () => {
  const [currentAvatar, setCurrentAvatar] = useState<string>('https://via.placeholder.com/100');
  const [currentUsername, setCurrentUsername] = useState<string>('JohnDoe');
  const [username, setUsername] = useState<string>(currentUsername);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setCurrentAvatar(fileUrl);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleUsernameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentUsername(username);
  };

  const handleTrigger2FA = () => {
    alert('2FA Triggered!');
  };

  return (
    <div className="settings-container">
      {/* Frame 1: Profile Avatar */}
      <div className="avatar-frame">
        <img src={currentAvatar} alt="Profile Avatar" />
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>

      {/* Frame 2: Username Change Form */}
      <div className="username-frame">
        <h3>Current Username: {currentUsername}</h3>
        <form onSubmit={handleUsernameSubmit}>
          <input type="text" value={username} onChange={handleUsernameChange} />
          <button type="submit">Change Username</button>
        </form>
      </div>

      {/* Frame 3: 2FA Trigger Button */}
      <div className="twofa-frame">
        <button onClick={handleTrigger2FA}>Enable 2FA</button>
      </div>
    </div>
  );
};

export default SettingsPage;