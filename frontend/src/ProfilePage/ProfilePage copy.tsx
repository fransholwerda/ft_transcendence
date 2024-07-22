import React from 'react';

interface ProfilePageProps {
  user: string;
  onMainPage: () => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onMainPage, onLogout }) => {
  return (
    <div className="profile_grid">
      <div className="profile_header">
        <h2>Profile Page</h2>
        <p>Username: {user}</p>
        <button onClick={onMainPage}>Back to Main</button>
        <button onClick={onLogout}>Log Out</button></div>
      <div className="profile_acheivments"><h2>Profile Achievements</h2></div>
      <div className="profile_game_history"><h2>Profile Game History</h2></div>
      <div className="profile_friends"><h2>Profile friends</h2></div>
    </div>
  );
};

export default ProfilePage;
