import React, { useState } from 'react';
import './SettingsPage.css';  // Import the CSS file
import { Constants } from '../../shared/constants';
import { User } from '../PageManager.tsx';
import { useNavigate } from 'react-router-dom';

interface SettingsPageProps {
  user: User;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const [currentAvatar, setCurrentAvatar] = useState<string>(user.avatarURL);
  const [currentUsername, setCurrentUsername] = useState<string>(user.username);
  const [twoStepSecret, setTwoStepSecret] = useState<any>({});
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [hasGeneratedCode, setHasGeneratedCode] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAvatar(e.target.value);
  };

  function validateUsername(str: string): boolean {
    if (!str) {
      alert('A name is required.');
      return false;
    }
    if (typeof str !== 'string') {
      alert('Name must be a string.');
      return false;
    }
    if (str.length < 2 || str.length > 30) {
      alert('Name must be between 2 and 30 characters.');
      return false;
    }
    const strPattern = /^[a-zA-Z0-9-]+$/;
    if (!strPattern.test(str)) {
      alert('str can only contain letters, numbers, and hyphens.');
      return false;
    }
    return true;
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUsername(e.target.value);
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
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

  async function applyChanges() {
    if (!validateUsername(currentUsername))
      return ;
    await fetch(`${Constants.FRONTEND_HOST_URL}/user/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            "username": currentUsername,
            "avatarURL": currentAvatar
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });
    onLogout();
    navigate('/');
  }

  return (
    <div className="settings-container">
      {/* Frame 1: Profile Avatar */}
      <div className="avatar-frame">
        <img src={currentAvatar} />
        <input type="text" value={currentAvatar} onChange={handleAvatarChange} />
        <input type="text" value={currentUsername} onChange={handleUsernameChange} />
        <button type="button" onClick={applyChanges}>Apply Changes</button>
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
