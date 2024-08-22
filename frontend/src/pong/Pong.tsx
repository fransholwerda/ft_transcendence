import React, { useEffect, useState } from 'react';
import './Pong.css';
import { User } from '../PageManager';
import { Socket } from 'socket.io-client';

// max score
// const MAX_SCORE = 5;

interface PongProps {
	user: User;
	pSock: Socket;
}

const Pong: React.FC<PongProps> = ({ user, pSock }) => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [gameSession, setGameSession] = useState<any>(null);

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
		pSock.on('gameStart', ({ sesh }) => {
			pongPrint(`pong.tsx: game start received from server`);
			console.log(sesh);
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

		// leave game from pagemanager
		pSock.on('routeLeaveGame', ({ sesh }) => {
			pongPrint(`pong.tsx routeLeaveGame: received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx routeLeaveGame: No game session found`);
				return ;
			}
			pongPrint(`pong.tsx routeLeaveGame: ${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			alert(`${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			setInGame(false);
			setInQueue(false);
			setGameSession(null);
		});

		// leave game from pong
		pSock.on('pongLeaveGame', ({ sesh }) => {
			pongPrint(`pong.tsx pongLeaveGame: received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx pongLeaveGame: No game session found`);
				return ;
			}
			pongPrint(`pong.tsx pongLeaveGame: ${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			alert(`${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			setInGame(false);
			setInQueue(false);
			setGameSession(null);
		});

		return () => {
			pongPrint(`pong.tsx: useEffect return ${user.username}`);
			pSock.off('gameStart');
			pSock.off('queueStatus');
			pSock.off('routeLeaveGame');
			pSock.off('pongLeaveGame');
		};
	}, [inGame]);

	const joinQueue = () => {
		pongPrint(`pong.tsx: Asking server to join queue: ${user.id}`);
		pSock.emit('joinQueue', { user: user });
	};

	const pongLeaveQueue = () => {
		pongPrint(`pong.tsx: ${user.username} Leaving queue ${gameSession?.roomId ?? 'N/A'}`);
		pSock.emit('pongLeaveQueue');
		setInQueue(false);
	};

	const pongLeaveGame = () => {
		pongPrint(`pong.tsx: ${user.username} Leaving game ${gameSession?.roomId ?? 'N/A'}`);
		pSock.emit('pongLeaveGame');
		setInQueue(false);
		setInGame(false);
		setGameSession(null);
	};

	return (
		<div className="pong-container">
			<h6>Socket id: {pSock.id}</h6>
			<h6>User id: {user.id}</h6>
			<h6>Username: {user.username}</h6>
			<div className="pong-card">
				{!inQueue && !inGame && (
					<button className="join-queue-btn" onClick={joinQueue}>Join Queue</button>
				)}
				{inQueue && !inGame && (
					<>
						<p>Waiting for opponent...</p>
						<button className="leave-queue-btn" onClick={pongLeaveQueue}>
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
						<button className="leave-game-btn" onClick={pongLeaveGame}>
							Leave Game
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Pong;
