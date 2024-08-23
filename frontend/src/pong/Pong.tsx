import React, { useState } from 'react';
import './Pong.css';
import { User } from '../PageManager';
import { Socket } from 'socket.io-client';
import { GameSession } from './PongTypes';
import { pongPrint } from './PongUtils';
import PongGame from './PongGame';

import {
	ufGameStart,
	ufQueueStatus,
	ufRouteLeaveGame,
	ufPongLeaveGame,
	ufTestIncrement
} from './PongUseEffect';

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
	ufTestIncrement(pSock, setGameSession);

	const joinQueue = () => {
		pongPrint(`pong.tsx: Asking server to join queue: ${user.id}`);
		pSock.emit('joinQueue', { user: user });
	};

	const pongLeaveQueue = () => {
		pongPrint(`pong.tsx: ${user.username} Leaving queue ${gameSession?.roomId ?? 'N/A'}`);
		pSock.emit('pongLeaveQueue');
		setInQueue(false);
	};

	// const pongLeaveGame = () => {
	// 	pongPrint(`pong.tsx: ${user.username} Leaving game ${gameSession?.roomId ?? 'N/A'}`);
	// 	pSock.emit('pongLeaveGame');
	// 	setInQueue(false);
	// 	setInGame(false);
	// 	setGameSession(null);
	// };

	// const testIncrement = () => {
	// 	pongPrint(`pong.tsx: testIncrement ${user.username}`);
	// 	pSock.emit('testIncrement');
	// };

	return (
		<div className="pong-container">
			{!inQueue && !inGame && (
				<>
					<h6>Socket id: {pSock.id}</h6>
					<h6>User id: {user.id}</h6>
					<h6>Username: {user.username}</h6>
					<button className="join-queue-btn" onClick={joinQueue}>Join Queue</button>
				</>
			)}
			{inQueue && !inGame && (
				<>
					<h6>Socket id: {pSock.id}</h6>
					<h6>User id: {user.id}</h6>
					<h6>Username: {user.username}</h6>
					<p>Waiting for opponent...</p>
					<button className="leave-queue-btn" onClick={pongLeaveQueue}>
						Leave Queue
					</button>
				</>
			)}
			{inGame && gameSession && (
				// <PongGame gameSession={gameSession} pongLeaveGame={pongLeaveGame}  testIncrement={testIncrement}/>
				<PongGame pSock={pSock} gameSession={gameSession}/>
			)}
		</div>
	);
};

export default Pong;
