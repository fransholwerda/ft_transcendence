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
	const [gameSession, setGameSession] = useState<any>(null);
	const location = useLocation();

	// ------------------------------
	//CUSTOM PRINTING
	const pongPrintColors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
	let pongPrintIndex = 0;
	const allowPongPrint = true;
	const pongPrint = (message: any) => {
		if (!allowPongPrint) return ;
		const color = pongPrintColors[pongPrintIndex];
		console.log(`%c${message}`, `color: ${color};`);
		pongPrintIndex = (pongPrintIndex + 1) % pongPrintColors.length;
	};
	// ------------------------------

	useEffect(() => {
		const curUrlPath = location.pathname;
		pongPrint(`pong.tsx: Current URL Path: ${curUrlPath}`);
		const areAtPongpage = curUrlPath.includes('/pong');

		if (!areAtPongpage) {
			pongPrint(`pong.tsx: Not at pong page ${user.username}`);
			leaveQueue();
			leaveGame();
			return ;
		}

		pSock.on('gameStart', ({ sesh }) => {
			pongPrint(`pong.tsx: game start received from server`);
			console.log(sesh);
			console.log(`pong.tsx: ${sesh ?? 'N/A'}`);
			if (!sesh) {
				pongPrint(`pong.tsx: No game session found`);
				return ;
			}
			pongPrint(`pong.tsx: Game started`);
			pongPrint(`pong.tsx: Username: ${user.username} Room ID: ${sesh.roomId}`);

			setInQueue(false);
			setInGame(true);
			setGameSession(sesh);
		});

		pSock.on('gameUpdate', ({ sesh }) => {
			//handle the leavegame seperately

			pongPrint(`pong.tsx: game update received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx: No game session found`);
				return ;
			}
			pongPrint(`pong.tsx: ${sesh.p1.username} vs ${sesh.p2.username}`);
			pongPrint(`pong.tsx: ${sesh.p1.score} vs ${sesh.p2.score}`);
			setGameSession(sesh);
			if (sesh.p1.score === MAX_SCORE || sesh.p2.score === MAX_SCORE) {
				alert(`${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
				setInGame(false);
				setGameSession(null);
				// leaveQueue();
				return ;
			}
		});

		pSock.on('queueStatus', ({ success, message }) => {
			pongPrint(`pong.tsx: Queue status: ${success}, ${message}, ${user.username}`);
			if (success) {
				pongPrint(`pong.tsx: Successfully joined queue ${user.id}`);
				setInQueue(true);
			}
			else {
				pongPrint(`pong.tsx: Failed to join queue ${user.id}`);
				alert(message);
			}
		});
		return () => {
			pongPrint(`pong.tsx: useEffect return ${user.username}`);
			pSock.off('gameStart');
			pSock.off('gameUpdate');
			pSock.off('queueStatus');
		};
	}, [location.pathname, inGame]);

	// const printGameSession = (sesh: any) => {
	// 	pongPrint(`pong.tsx: Game Session:', sesh);
	// }

	const joinQueue = () => {
		pongPrint(`pong.tsx: Asking server to join queue: ${user.id}`);
		pSock.emit('joinQueue', { user: user });
	};

	const leaveQueue = () => {
		pongPrint(`pong.tsx: ${user.username} Leaving queue ${gameSession?.roomId ?? 'N/A'}`);
		pSock.emit('leaveQueue');
		setInQueue(false);
	};

	const leaveGame = () => {
		pongPrint(`pong.tsx: ${user.username} Leaving game ${gameSession?.roomId ?? 'N/A'}`);
		pSock.emit('leaveGame');
		setInQueue(false);
		setInGame(false);
		setGameSession(null);
	};

	return (
		<div className="pong-container">
			<h1>Socket id: {pSock.id}</h1>
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
				{inGame && gameSession && (
					<div className="game-info">
						<p>p1 | P2</p>
						<p>clientid: {gameSession.p1.clientid ?? 'N/A'} | {gameSession.p2.clientid ?? 'N/A'}</p>
						<p>userid: {gameSession.p1.userid ?? 'N/A'} | {gameSession.p2.userid ?? 'N/A'}</p>
						<p>username: {gameSession.p1.username ?? 'N/A'} | {gameSession.p2.username ?? 'N/A'}</p>
						<p>score: {gameSession.p1.score ?? 0} | {gameSession.p2.score ?? 'N/A'}</p>
						<p>Room ID: {gameSession.roomId ?? 'N/A'}</p>
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
