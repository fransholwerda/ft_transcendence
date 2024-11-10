import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { useParams } from 'react-router-dom';
import { Constants } from '../../shared/constants';
import { Socket } from 'socket.io-client';
import { ActionType } from '../chat/chat.enum';
import { User } from '../PageManager';

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
	achievement: Achievement
	name: string;
}

interface Friend {
	id: number;
	username: string;
	online: boolean;
}

interface Block {
	id: number;
	username: string;
	online: boolean;
}

interface ProfileProps {
  user: User;
  socket: Socket;
}

const ProfilePage: React.FC<ProfileProps> = ({ user, socket }) => {
  const { id } = useParams<{ id: string }>();
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [blockList, setBlockList] = useState<Block[]>([]);
  const [achievementList, setAchievementList] = useState<Achievement[]>([]);
  const [userAvatar, setUserAvatar] = useState<string>(user.avatarURL);
  const [userRank, setUserRank] = useState<number | null>(null);

  async function fetchUserRankings() {
    const response = await fetch(`${Constants.FRONTEND_HOST_URL}/match/rankings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    return result;
  }

  async function fetchMatchHistory(playerID: string) {
    console.log('Fetching match history for player:', playerID);
    const response = await fetch(`${Constants.FRONTEND_HOST_URL}/match/${playerID}/matchHistory`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    socket.emit('getFriendlist', { userID: parseInt(playerID) });
    socket.emit('getBlocklist', { userID: parseInt(playerID) });
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

    async function loadUserRankings() {
      console.log('Loading rank for player:', id);
      if (id) {
        try {
          console.log('Trying to fetch rank for: ', id);
          const ranking = await fetchUserRankings();
          setUserRank(ranking);
        } catch (error) {
          console.error('Error fetching rank:', error);
        }
      }
    }
    
    socket.on('friendlistStatus', (data: Friend[]) => {
      setFriendList(data);
    });
    socket.on('blocklistStatus', (data: Block[]) => {
      setBlockList(data);
    });

    loadMatchHistory();
    loadUserRankings();
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

  async function fetchUser(playerID: string) {
    console.log('fetching user object from:', playerID);
    const response = await fetch(`${Constants.FRONTEND_HOST_URL}/user/${playerID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    return result;
  }

  const handleRemoveFriend = (friendName: string) => {
    const tempFriendList = friendList.filter(friend => friend.username !== friendName);
    setFriendList(tempFriendList);
    socket.emit('actionUser', { targetUser: friendName, action: ActionType.RemoveFriend });
  };

  const handleRemoveBlock = (blockName: string) => {
    const tempBlockList = blockList.filter(block => block.username !== blockName);
    setBlockList(tempBlockList);
    socket.emit('actionUser', { targetUser: blockName, action: ActionType.RemoveBlock });
  };
	
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

    async function loadUserAvatar() {
      if (id) {
        try {
          console.log('Loading user avatar for player:', id);
          const user = await fetchUser(id);
          setUserAvatar(user.avatarURL);
        } catch (error) {
          console.error('Error fetching user avatar:', error);
        }
      }
    }

		loadAchievementList();
    loadUserAvatar();
	}, [id]);
	
  return (
    <div className="profile_container">
      <div className="profile_header">
        <div className="profile_header_item user_avatar">
          <img src={userAvatar} alt="avatar" />
        </div>
        <div className="profile_header_item">
          <h1>Profile of {id}</h1>
        </div>
        <div className="profile_header_item">
          {userRank !== null && <h1>Ladder: {userRank}</h1>}
          {userRank === null && <h1>Ladder: none</h1>}
        </div>
      </div>
      <div className="profile_content">
        <div className="profile_section profile_friends">
          <div className="friends_display">
            <h2>Friends</h2>
            <ul>
              {friendList.map(friend => (
                <li key={friend.id}>
                  <div className="friend_item">
                    <span className={`status_circle ${friend.online ? 'online' : 'offline'}`}></span>
                    <h3>{friend.username}</h3>
                    {user.id === Number(id) && (
                      <button onClick={() => handleRemoveFriend(friend.username)} className="remove_button">
                        X
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="blocked_display">
            <h2>Blocked</h2>
            <ul>
              {blockList.map(block => (
                <li key={block.id}>
                  <div className="block_item">
                    <span className={`status_circle ${block.online ? 'online' : 'offline'}`}></span>
                    <h3>{block.username}</h3>
                    {user.id === Number(id) && (
                      <button onClick={() => handleRemoveBlock(block.username)} className="remove_button">
                        X
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="profile_section profile_av">
		{achievementList.length > 0 ? (
			achievementList.map((achievement) => (
				<div key={achievement.id}>
					<p>ID: {achievement.achievement.id}</p>
					<p>Name: {achievement.achievement.name}</p>
					<p> --------------------</p>
				</div>
			))
			) : (
			<p>No achievements earned.</p>
			)}
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
