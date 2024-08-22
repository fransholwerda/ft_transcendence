import React, { useState } from 'react';
import './Pong.css';
import { User } from '../PageManager';
import { Socket } from 'socket.io-client';
import { ufGameStart, ufQueueStatus, ufRouteLeaveGame, ufPongLeaveGame } from './PongUseEffect';
import { GameSession } from './PongTypes';
import { pongPrint } from './PongUtils';

// max score
// const MAX_SCORE = 5;

interface PongProps {
	user: User;
	pSock: Socket;
}

const Pong: React.FC<PongProps> = ({ user, pSock }) => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [gameSession, setGameSession] = useState<GameSession | null>(null);

	ufGameStart(pSock, user, setInQueue, setInGame, setGameSession);
	ufQueueStatus(pSock, user, setInQueue);
	ufRouteLeaveGame(pSock, user, setInQueue, setInGame, setGameSession);
	ufPongLeaveGame(pSock, user, setInQueue, setInGame, setGameSession);

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
