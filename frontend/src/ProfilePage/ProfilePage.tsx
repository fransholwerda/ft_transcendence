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

interface Achievement {
	id: number;
	name: string;
}

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [achievementList, setAchievementList] = useState<Achievement[]>([]);

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

	async function fetchAchievementList(playerID: string) {
		console.log('fetching achievements for player:', playerID);
		const response = await fetch(`${Constants.FRONTEND_HOST_URL}/achievement/${playerID}/AchievementSync`, {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			},
		  });
		  const result = await response.json();
		  return result;
	}
	
	useEffect(() => {
		async function loadAchievementList() {
			console.log('Loading achievemnt history for player:', id);
			if (id) {
				try {
					console.log('Trying to achievements for: ', id);
					const history = await fetchAchievementList(id);
					setAchievementList(history);
				} catch (error) {
					console.error('Error fetching achievements:', error);
				}
			}
		}

		loadAchievementList();
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
		<div className="profile_section profile_achievements">
          <h2>Achievements</h2>
          {achievementList.length > 0 ? (
            achievementList.map((achievement) => (
              <div>
				<p> {achievement.id} </p>
              </div>
            ))
          ) : (
            <p>No achievements earned.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
