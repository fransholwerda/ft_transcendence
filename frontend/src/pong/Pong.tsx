import React, { useEffect, useState } from 'react';
import './Pong.css';
import { useLocation } from 'react-router-dom';
import { User } from '../PageManager';
import { Socket } from 'socket.io-client';

interface PongProps {
	user: User;
	pSock: Socket;
}

interface GameSession {
	p1: string;
	p2: string;
	s1: number;
	s2: number;
}

const Pong: React.FC<PongProps> = ({ user, pSock }) => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [opponent, setOpponent] = useState<string | null>(null);
	const [roomId, setRoomId] = useState<string | null>(null);
	const location = useLocation();

	// add a gamesession thing here
	// knowing if they are left or right
	// and know if they are still in a game
	// const [gameSession, setGameSession] = useState<GameSession | null>(null);

	useEffect(() => {
		const curUrlPath = location.pathname;
		console.log('pong.tsx: Current URL Path:', curUrlPath);
		const areAtPongpage = curUrlPath.includes('/pong');

		if (!areAtPongpage) {
			console.log('pong.tsx: Not at pong page', user.username);
			leaveQueue();
			leaveGame();
			return ;
		}

		pSock.on('gameStart', ({ roomId, opponent }) => {
			console.log('pong.tsx: Game started');
			console.log(`pong.tsx: Username: ${user.username} Room ID: ${roomId}, Opponent: ${opponent}`);

			setInQueue(false);
			setInGame(true);
			setOpponent(opponent);
			setRoomId(roomId);
		});

		pSock.on('opponentLeft', () => {
			console.log('pong.tsx: Opponent left');
			setInQueue(false);
			setInGame(false);
			setOpponent(null);
			setRoomId(null);
		});

		pSock.on('queueStatus', ({ success, message }) => {
			console.log('pong.tsx: Queue status:', success, message, user.username);
			if (inGame) {
				console.log('pong.tsx: Already in game', user.username);
			}
			else if (success) {
				console.log('pong.tsx: Successfully joined queue', user.id);
				setInQueue(true);
			}
			else {
				console.log('pong.tsx: Failed to join queue', user.id);
				alert(message);
			}
		});

		return () => {
			console.log('pong.tsx: useEffect return', user.username);
			if (!location.pathname.includes('/pong')) {
				console.log('pong.tsx: Leaving pong page', user.username);
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
			console.log('pong.tsx: Asking server to join queue: ', user.id);
			pSock.emit('joinQueue', { userId: user.id });
		} else {
			console.log('pong.tsx: Already in queue or game:', user.username);
			alert('You are already in the queue or game');
		}
	};

	const leaveQueue = () => {
		console.log(`pong.tsx: ${user.username} Leaving queue ${roomId}`);
		pSock.emit('leaveQueue');
		setInQueue(false);
	};

	const leaveGame = () => {
		console.log(`pong.tsx: ${user.username} Leaving game ${roomId}`);
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
