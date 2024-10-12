import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { useParams } from 'react-router-dom';
import { Constants } from '../../shared/constants';
import { User } from '../PageManager';

interface Match {
  id: string;
  player1: string;
  player1Score: number;
  player2: string;
  player2Score: number;
  winner: string;
}

interface ProfilePageProps {
  loggedInUser: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ loggedInUser }) => {
  const { id } = useParams<{ id: string }>();
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  async function fetchMatchHistory(playerID: string) {
    console.log('Fetching match history for player:', playerID);
    const response = await fetch(`${Constants.FRONTEND_HOST_URL}/match/${playerID}/matchHistory`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    return result;
  }

  async function fetchProfileUser(userID: string) {
    console.log('Fetching profile user:', userID);
    const response = await fetch(`${Constants.BACKEND_HOST_URL}/user/${userID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    return result;
  }

  useEffect(() => {
    async function loadMatchHistory() {
      console.log('Loading match history for player:', id);
      if (id) {
        try {
          console.log('Trying to fetch match history for: ', id);
          const history = await fetchMatchHistory(id);
          setMatchHistory(history);
        } catch (error) {
          console.error('Error fetching match history:', error);
        }
      }
    }

    async function loadProfileUser() {
      console.log('Loading profile user for id:', id);
      if (id) {
        try {
          const user = await fetchProfileUser(id);
          setProfileUser(user);
        } catch (error) {
          console.error('Error fetching profile user:', error);
        }
      }
    }

    loadMatchHistory();
    loadProfileUser();
  }, [id]);

  return (
    <div className="profile_container">
      <div className="profile_header">
        <div>
          <h1>Profile of "{profileUser?.username}"</h1>
        </div>
        <div>
          {loggedInUser.id !== profileUser?.id && (
            <button className="add_friend_button">Add as Friend</button>
          )}
          {loggedInUser.id !== profileUser?.id && (
            <button className="add_friend_button">Add as Friend</button>
          )}
        </div>
      </div>
      <div className="profile_content">
        <div className="profile_section profile_friends">
          <h2>Profile Friends</h2>
          <div className="friend_item">
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
          {matchHistory.length > 0 ? (
            matchHistory.map((match) => (
              <div
                key={match.id}
                className={`game_item ${id === match.winner ? 'win' : 'loss'}`}
              >
                <div id="gh_player1">
                  <p>{match.player1}</p>
                </div>
                <div id="gh_score1">
                  <p>{match.player1Score}</p>
                </div>
                <div id="gh_status">
                  <p>{id === match.winner ? 'Win' : 'Loss'}</p>
                </div>
                <div id="gh_player2">
                  <p>{match.player2}</p>
                </div>
                <div id="gh_score2">
                  <p>{match.player2Score}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No match history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;