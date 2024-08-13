import React, { useEffect, useState } from 'react';
import './Pong.css';
import { useLocation } from 'react-router-dom';
import { User } from '../PageManager';
import { Socket } from 'socket.io-client';

interface PongProps {
	user: User;
	pSock: Socket;
}

// add a gameover screen

// add user to this and use it to display the user's name in the game

// why does the user not get sent back to the !inQueue && !inGame when they receive 'opponentLeft'?

// in gameover window, it shows both names and their scores points under their names
// prob have winner in green and loser in red
// and have winner, loser under their names
// the names, userids, scores will be saved in an object
// that object is sent to the backend to save the game data
// add a queue button to go to the inQueue screen

const Pong: React.FC<PongProps> = ({ user, pSock }) => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [opponent, setOpponent] = useState<string | null>(null);
	const [roomId, setRoomId] = useState<string | null>(null);
	const location = useLocation();

	useEffect(() => {
		const curUrlPath = location.pathname;
		console.log('Current URL Path:', curUrlPath);
		const areAtPongpage = curUrlPath.includes('/pong');

		if (!areAtPongpage) {
			console.log('Not at pong page', user.username);
			leaveQueue();
			leaveGame();
			return ;
		}

		pSock.on('gameStart', ({ roomId, opponent }) => {
			console.log('Game started');
			console.log(`Username: ${user.username} Room ID: ${roomId}, Opponent: ${opponent}`);

			setInQueue(false);
			setInGame(true);
			setOpponent(opponent);
			setRoomId(roomId);
		});

		pSock.on('opponentLeft', () => {
			console.log('Opponent left');
			setInQueue(false);
			setInGame(false);
			setOpponent(null);
			setRoomId(null);
		});

		pSock.on('queueStatus', ({ success, message }) => {
			if (inGame) {
				// Ignore queueStatus if already in a game
				return;
			}
			console.log('Queue status:', success, message, user.username);
			if (success) {
				console.log('Successfully joined queue', user.id);
				setInQueue(true);
			} else {
				console.log('Failed to join queue', user.id);
				alert(message);
			}
		});

		return () => {
			if (!location.pathname.includes('/pong')) {
				console.log('Leaving pong page', user.username);
				leaveQueue();
				leaveGame();
			}
			pSock.off('gameStart');
			pSock.off('opponentLeft');
			pSock.off('queueStatus');
		};
	}, [location.pathname, inGame]);

	const joinQueue = () => {
		if (!inQueue && !inGame) {
			console.log('Asking server to join queue: ', user.id);
			pSock.emit('joinQueue', { userId: user.id });
		} else {
			console.log('Already in queue or game:', user.username);
			alert('You are already in the queue or game');
		}
	};

	const leaveQueue = () => {
		console.log(`${user.username} Leaving queue ${roomId}`);
		pSock.emit('leaveQueue');
		setInQueue(false);
	};

	const leaveGame = () => {
		console.log(`${user.username} Leaving game ${roomId}`);
		pSock.emit('leaveGame');
		setInQueue(false);
		setInGame(false);
		setOpponent(null);
		setRoomId(null);
	};

	return (
		<div className="pong-container">
			<h2>Pong Game</h2>
			<h3>Client ID: {pSock.id}</h3>
			<h3>User ID: {user.id}</h3>
			<div className="pong-card">
				{!inQueue && !inGame && (
					<button className="join-queue-btn" onClick={joinQueue}>Join Queue</button>
				)}
				{inQueue && !inGame && (
					<>
						<p>Waiting for opponent...</p>
						<button className="leave-queue-btn" onClick={leaveQueue}>
							Leave Queue
						</button>
					</>
				)}
				{inGame && (
					<div className="game-info">
						<p>Game started!</p>
						<p>Room ID: {roomId}</p>
						<p>Opponent: {opponent}</p>
						<p>Your User ID: {user.id}</p>
						<button className="leave-game-btn" onClick={leaveGame}>
							Leave Game
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Pong;
