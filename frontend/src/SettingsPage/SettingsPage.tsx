import React, { useState } from 'react';
import './SettingsPage.css';  // Import the CSS file
import { Constants } from '../../shared/constants';
import { User } from '../PageManager.tsx';

interface SettingsPageProps {
  user: User;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [currentAvatar, setCurrentAvatar] = useState<string>('https://via.placeholder.com/100');
  const [currentUsername, setCurrentUsername] = useState<string>('JohnDoe');
  const [username, setUsername] = useState<string>(currentUsername);
  const [twoStepSecret, setTwoStepSecret] = useState<any>({});
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [hasGeneratedCode, setHasGeneratedCode] = useState<boolean>(false);

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

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  const handleUsernameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentUsername(username);
  };

  

  async function generate2faSecret() {
    const response = await fetch(`${Constants.FRONTEND_HOST_URL}/twostep/secret`, {
      method:  'GET'
    });
    const result = await response.json();
    return (result);
  }

  async function loadSecret() {
    const secret = await generate2faSecret();
    setTwoStepSecret(secret);
    setHasGeneratedCode(true);
  }

  async function enable2fa(base32: string) {
    const response = await fetch(`${Constants.FRONTEND_HOST_URL}/user/${user.id}`, {
      method:  'PATCH',
      headers: {
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        TwoFactorSecret: base32,
	TwoFactorEnabled: true
      })
    });
    const result = await response.json();
    return (result);
  }

  async function disable2fa() {
      const response = await fetch(`${Constants.FRONTEND_HOST_URL}/user/${user.id}`, {
          method:  'PATCH',
          headers: {
              'Content-Type':'application/json'
          },
          body: JSON.stringify({
              TwoFactorSecret: "",
              TwoFactorEnabled: false
          })
      });
      const result = await response.json();
      return (result);
  }

  async function verify2faCode(base32: string) {
    const response = await fetch(`${Constants.FRONTEND_HOST_URL}/twostep/verify`, {
      method:  'POST',
      headers: {
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        secret: base32,
	token: verificationCode
      })
    });
    const result = await response.json();
    return (result);
  }

  async function verifyAndEnableSecret(base32: string) {
    const result = await verify2faCode(base32);
    if (result.verified === true) {
      await enable2fa(base32);
    } else {
      setTwoStepSecret({});
      setHasGeneratedCode(false);
    }
  }

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
      {!user.TwoFactorEnabled && 
      <div className="twofa-frame">
        <img src={twoStepSecret.dataURL} />
	{!hasGeneratedCode && <button type="button" onClick={loadSecret}>Generate QR Code</button>}
	{hasGeneratedCode && <input type="text" value={verificationCode} onChange={handleVerificationCodeChange} />}
	{hasGeneratedCode && <button type="button" onClick={() => verifyAndEnableSecret(twoStepSecret.base32)}>Verify and enable 2fa</button>}
      </div>}

      {user.TwoFactorEnabled && 
      <div className="twofa-frame">
        <button type="button" onClick={disable2fa}>Disable 2fa</button>
      </div>}
    </div>
  );
};

export default SettingsPage;
