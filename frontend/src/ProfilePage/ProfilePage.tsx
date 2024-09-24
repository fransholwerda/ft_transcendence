import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { useParams } from 'react-router-dom';
import { Constants } from '../../shared/constants';

interface Match {
  id: string;
  player1: string;
  player1Score: number;
  player2: string;
  player2Score: number;
  winner: string;
}

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);

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

    loadMatchHistory();
  }, [id]);

  return (
    <div className="profile_container">
      <div className="profile_header">
        <h1>Welcome to profile page of "{id}"</h1>
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
              <div key={match.id}>
                <h3>Game ID: {match.id}</h3>
                <p>Player 1: {match.player1} (Score: {match.player1Score})</p>
                <p>Player 2: {match.player2} (Score: {match.player2Score})</p>
                <p>{id === match.winner ? 'Win' : 'Loss'}</p>
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