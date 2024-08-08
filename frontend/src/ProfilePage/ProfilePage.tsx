import React from 'react';
import './ProfilePage.css';
import { User } from '../PageManager.tsx';

interface ProfilePageProps {
  user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  return (
    <div className="profile_container">
      <div className="profile_header">
        <h1>Welcome to profile page of "{user.display_name}"</h1>
      </div>
      <div className="profile_content">
        <div className="profile_section profile_friends">
            <h2>Profile Friends</h2>
            <div className="friend_item">
              {/* <span className={`status_circle ${user.status === 'online' ? 'online' : 'offline'}`}></span>   */}
              <span className="status_circle offline"></span>
              <h3>Friend_1</h3>
            </div>

            <div className="friend_item">
              <span className="status_circle offline"></span>
              <h3>Friend_2</h3>
            </div>

            <div className="friend_item">
              <span className="status_circle online"></span>
              <h3>Friend_3</h3>
            </div>
          </div>
        <div className="profile_section profile_av">
          <h2>Achievements</h2>
          <h3>Win_in_a_row_1</h3>
        </div>
        <div className="profile_section profile_game_history">
          <h2>Game History</h2>
          <h3>Game_1</h3>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;