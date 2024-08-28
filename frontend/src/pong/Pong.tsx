import React, { useState, useEffect } from 'react';
import './Pong.css';
import { User } from '../PageManager';
import { Socket } from 'socket.io-client';
import { GameSession } from './PongTypes';
import { pongPrint } from './PongUtils';
import PongGame from './PongGame';

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

	const joinQueue = () => {
		pongPrint(`pong.tsx: Asking server to join queue: ${user.id}`);
		pSock.emit('joinQueue', { user: user });
	};

	const pongLeaveQueue = () => {
		pongPrint(`pong.tsx: ${user.username} Leaving queue ${gameSession?.roomId ?? 'N/A'}`);
		pSock.emit('pongLeaveQueue');
		setInQueue(false);
	};

	useEffect(() => {
		const handleGameStart = ({ sesh }: { sesh: GameSession }) => {
			pongPrint(`pong.tsx: game start received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx: No game session found`);
				return;
			}
			pongPrint(`pong.tsx: Game started`);
			pongPrint(`pong.tsx: Username: ${user.username} Room ID: ${sesh.roomId}`);

			setInQueue(false);
			setInGame(true);
			setGameSession(sesh);
		};

		pSock.on('gameStart', handleGameStart);
		return () => {
			pongPrint(`pong.tsx: gameStart useEffect return ${user.username}`);
			pSock.off('gameStart', handleGameStart);
		};
	}, [inGame]);

	useEffect(() => {
		const handleQueueStatus = ({ success, message }: { success: boolean; message: string }) => {
			pongPrint(`pong.tsx: Queue status: ${success}, ${message}, ${user.username}`);
			if (success) {
				pongPrint(`pong.tsx: Successfully joined queue ${user.id}`);
				setInQueue(true);
			} else {
				pongPrint(`pong.tsx: Failed to join queue ${user.id}`);
				alert(message);
			}
		};

		pSock.on('queueStatus', handleQueueStatus);
		return () => {
			pongPrint(`pong.tsx: queueStatus useEffect return ${user.username}`);
			pSock.off('queueStatus', handleQueueStatus);
		};
	}, [inQueue]);

	useEffect(() => {
		const handleRouteLeaveGame = ({ sesh }: { sesh: GameSession }) => {
			pongPrint(`pong.tsx routeLeaveGame: received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx routeLeaveGame: No game session found`);
				return;
			}
			pongPrint(`pong.tsx routeLeaveGame: ${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			alert(`${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			setInGame(false);
			setInQueue(false);
			setGameSession(null);
		};

		pSock.on('routeLeaveGame', handleRouteLeaveGame);
		return () => {
			pongPrint(`pong.tsx: routeLeaveGame useEffect return ${user.username}`);
			pSock.off('routeLeaveGame', handleRouteLeaveGame);
		};
	}, [inGame]);

	useEffect(() => {
		const handlePongLeaveGame = ({ sesh }: { sesh: GameSession }) => {
			pongPrint(`pong.tsx pongLeaveGame: received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx pongLeaveGame: No game session found`);
				return;
			}
			pongPrint(`pong.tsx pongLeaveGame: ${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			alert(`${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			setInGame(false);
			setInQueue(false);
			setGameSession(null);
		};

		pSock.on('pongLeaveGame', handlePongLeaveGame);
		return () => {
			pongPrint(`pong.tsx: pongLeaveGame useEffect return ${user.username}`);
			pSock.off('pongLeaveGame', handlePongLeaveGame);
		};
	}, [inGame]);

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
				// <PongGame pSock={pSock} />
			)}
		</div>
	);
};

export default Pong;
