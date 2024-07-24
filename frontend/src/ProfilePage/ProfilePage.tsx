import React from 'react';
import './ProfilePage.css';

interface ProfilePageProps {
  user: string;
  onMainPage: () => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onMainPage, onLogout }) => {
  return (
    <div className="parent_profile">
      <div className="profile_header">
        <h2>Profile Page</h2>
        <p>Username: {user}</p>
        <button onClick={onMainPage}>Back to Main</button>
        <button onClick={onLogout}>Log Out</button>
      </div>
      <div className="profile_friends">
        <h2>Profile Friends</h2>
        <h3>Friend_1</h3>
      </div>
      <div className="profile_av">
        <h2>Profile Achievements</h2>
        <h3>Win_in_a_row_1</h3>
      </div>
      <div className="profile_game_history">
        <h2>Profile Game History</h2>
        <h3>Game_1</h3>
      </div>
    </div>
  );
};

export default ProfilePage;
