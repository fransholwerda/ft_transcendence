import React, { useEffect, useState } from 'react';
import './Pong.css';
import { useLocation } from 'react-router-dom';
import { User } from '../PageManager';
import { Socket } from 'socket.io-client';

// max score
const MAX_SCORE = 5;

interface PongProps {
	user: User;
	pSock: Socket;
}

const Pong: React.FC<PongProps> = ({ user, pSock }) => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const location = useLocation();

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

		pSock.on('gameStart', ({ sesh }) => {
			console.log(`pong.tsx: ${sesh ?? 'N/A'}`);
			if (!sesh) {
				console.log('pong.tsx: No game session found');
				return ;
			}
			console.log('pong.tsx: Game started');
			console.log(`pong.tsx: Username: ${user.username} Room ID: ${sesh.roomId}`);

			setInQueue(false);
			setInGame(true);
		});

		pSock.on('gameUpdate', ({ sesh }) => {
			console.log('pong.tsx: game update received from server');
			if (!sesh) {
				console.log('pong.tsx: No game session found');
				return ;
			}
			console.log(`pong.tsx: ${sesh.p1.username} vs ${sesh.p2.username}`);
			console.log(`pong.tsx: ${sesh.p1.score} vs ${sesh.p2.score}`);
			if (sesh.p1.score === MAX_SCORE || sesh.p2.score === MAX_SCORE) {
				alert('Game Over');
				alert(`${sesh.p1.username} ${sesh.p1.score} vs ${sesh.p2.username} ${sesh.p2.score}`);
				setInGame(false);
				return ;
			}
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

	// const findUserInGame = (sesh: GameSession, clientId: string): player | null => {
	// 	if (sesh.p1.clientid === clientId) {
	// 		return sesh.p1;
	// 	}
	// 	else if (sesh.p2.clientid === clientId) {
	// 		return sesh.p2;
	// 	}
	// 	return null;
	// }

	// const findEnemyInGame = (sesh: GameSession, clientId: string): player | null => {
	// 	if (sesh.p1.clientid === clientId) {
	// 		return sesh.p2;
	// 	}
	// 	else if (sesh.p2.clientid === clientId) {
	// 		return sesh.p1;
	// 	}
	// 	return null;
	// }

	// const findGameSessionByClientId = (clientId: string): GameSession | null => {
	// 	if (gameSession) {
	// 		if (gameSession.p1.clientid === clientId || gameSession.p2.clientid === clientId) {
	// 			return gameSession;
	// 		}
	// 	}
	// 	return null;
	// }

	const joinQueue = () => {
		if (!inQueue && !inGame) {
			console.log('pong.tsx: Asking server to join queue: ', user.id);
			pSock.emit('joinQueue', { user: user });
		} else {
			console.log('pong.tsx: Already in queue or game:', user.username);
			alert('You are already in the queue or game');
		}
	};

	const leaveQueue = () => {
		console.log(`pong.tsx: ${user.username} Leaving queue ${gameSession?.roomId ?? 'N/A'}`);
		pSock.emit('leaveQueue');
		setInQueue(false);
	};

	const leaveGame = () => {
		console.log(`pong.tsx: ${user.username} Leaving game ${gameSession?.roomId ?? 'N/A'}`);
		pSock.emit('leaveGame');
		setInQueue(false);
		setInGame(false);
	};

	return (
		<div className="pong-container">
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
						<p>p1 | P2</p>
						<p>clientid: {gameSession?.p1.clientid ?? 'N/A'} | {gameSession?.p2.clientid ?? 'N/A'}</p>
						<p>userid: {gameSession?.p1.userid ?? 'N/A'} | {gameSession?.p2.userid ?? 'N/A'}</p>
						<p>username: {gameSession?.p1.username ?? 'N/A'} | {gameSession?.p2.username ?? 'N/A'}</p>
						<p>score: {gameSession?.p1.score ?? 0} | {gameSession?.p2.score ?? 'N/A'}</p>
						<p>Room ID: {gameSession?.roomId ?? 'N/A'}</p>
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
