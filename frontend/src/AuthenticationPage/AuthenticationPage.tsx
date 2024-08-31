import React, { useState } from 'react';
import { Constants } from '../../shared/constants';
import { useNavigate } from 'react-router-dom';

interface AuthenticationProps {
  user: any;
}

const AuthenticationPage: React.FC<AuthenticationProps> = ({ user }) => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState<string>('');

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

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

  async function verifyAndProceed(base32: string) {
    const result = await verify2faCode(base32);
    if (result.verified === true) {
      navigate("/pong");
    }
  }

  return (
    <div className="login-container">
      <input type="text" value={verificationCode} onChange={handleVerificationCodeChange} />
      <button type="button" onClick={() => verifyAndProceed(user.TwoFactorSecret)}>Verify</button>
    </div>
  );
};

export default AuthenticationPage;
