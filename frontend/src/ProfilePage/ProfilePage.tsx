import React from 'react';

interface ProfilePageProps {
  user: string;
  onMainPage: () => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onMainPage, onLogout }) => {
  return (
    <div>
      <h2>Profile Page</h2>
      <p>Username: {user}</p>
      <button onClick={onMainPage}>Back to Main</button>
      <button onClick={onLogout}>Log Out</button>
    </div>
  );
};

export default ProfilePage;
