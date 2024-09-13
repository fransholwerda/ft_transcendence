import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

import { Constants } from '../../shared/constants';
import { User } from '../PageManager.tsx';

interface LoginProps {
  onLogin: (user_id: number) => Promise<User>;
}

function authorize(client_id: string, redirect_uri: string, scope: string, response_type: string) {
  const url = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=${scope}`;

  window.location.replace(url);
}

async function requestToken(grant_type: string, client_id: string, auth_code: string, redirect_uri: string) {
  const response = await fetch(`${Constants.FRONTEND_HOST_URL}/auth/token`, {
    method:  'POST',
    headers:
    {
      "Content-Type":  "application/json"
    },
    body:  JSON.stringify({grant_type, client_id, auth_code, redirect_uri})
  });
  const result = await response.json();
  return (result);
}

async function requestIntraUser(access_token: object) {
  const response = await fetch(`${Constants.FRONTEND_HOST_URL}/auth/intra_user`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json'
    },
    body:  JSON.stringify(access_token)
  });
  const result = await response.json();
  return (result);
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const client_id = import.meta.env.VITE_CLIENT_ID;
  console.log(`LoginPage client_id: ${client_id}`);
  const redirect_uri = `http%3A%2F%2F${Constants.FRONTEND_HOST_HOSTNAME}%3A8080`;
  const scope = "profile public";
  const response_type = "code";

  const url_params = new URLSearchParams(window.location.search);

  async function load_user() {
    const access_token = await requestToken("authorization_code", client_id, url_params.get("code") || "", redirect_uri);
    const intra_user = await requestIntraUser(access_token);
    window.history.pushState({}, document.title, "/");
    const user = await onLogin(intra_user);
    if (user.TwoFactorEnabled) {
      navigate("/auth");
    } else {
      navigate('/pong');
    }
  }

  if (url_params.has("code")) {
    load_user();
  }

  return (
    <div className="login-container">
      <h2>ft_transcendance</h2>
      <button onClick={() => authorize(client_id, redirect_uri, scope, response_type)}>
        Login
      </button>
    </div>
  );
};

export default LoginPage;
