import React, { useState, useRef, useEffect } from 'react';
import './Pong.css';
import { User } from '../PageManager';
import { Socket } from 'socket.io-client';
import { GameSession } from './PongTypes';
import { pongPrint } from './PongUtils';
import { PongC } from '../../shared/constants';

interface PongProps {
	user: User;
	pSock: Socket;
}

const Pong: React.FC<PongProps> = ({ user, pSock }) => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [gameSession, setGameSession] = useState<GameSession | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

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
		const handleLeaveGame = ({ sesh }: { sesh: GameSession }) => {
			pongPrint(`pong.tsx leaveGame: received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx leaveGame: No game session found`);
				return;
			}
			pongPrint(`pong.tsx leaveGame: ${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			alert(`${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			setInGame(false);
			setInQueue(false);
			setGameSession(null);
		};

		pSock.on('leaveGame', handleLeaveGame);
		return () => {
			pongPrint(`pong.tsx: leaveGame useEffect return ${user.username}`);
			pSock.off('leaveGame', handleLeaveGame);
		};
	}, [pSock, user]);

	// const leaveGame = () => {
	// 	pongPrint(`pong.tsx: ${user.username} Leaving game ${gameSession?.roomId ?? 'N/A'}`);
	// 	pSock.emit('leaveGame');
	// 	setInQueue(false);
	// 	setInGame(false);
	// 	setGameSession(null);
	// };

	useEffect(() => {
		const handleGameUpdate = (updatedSession: GameSession) => {
			setGameSession(updatedSession);
		};
	
		// Listen for game state updates from the server
		pSock.on('gameUpdate', handleGameUpdate);
	
		return () => {
			// Clean up the listener when the component unmounts
			pSock.off('gameUpdate', handleGameUpdate);
		};
	}, [pSock]);
	
	useEffect(() => {
		let lastKeyPressTime = 0;
		const keyPressInterval = 10;
	
		const handleKeyDown = (event: KeyboardEvent) => {
			const currentTime = Date.now();
			if (currentTime - lastKeyPressTime > keyPressInterval) {
				lastKeyPressTime = currentTime;
				if (event.key === 'w' || event.key === 's') {
					pSock.emit('movePaddle', { direction: event.key });
				}
			}
		};
	
		window.addEventListener('keydown', handleKeyDown);
	
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [pSock]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext('2d');
		if (!context) return;
	
		const renderGame = () => {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = 'black';
			context.fillRect(0, 0, canvas.width, canvas.height);
	
			// Draw the ball
			const gs = gameSession;
			if (!gs) return;
			context.fillStyle = 'white';
			context.fillRect(gs.ball.x, gs.ball.y, gs.ball.width, gs.ball.height);
	
			// Draw paddles
			context.fillRect(gs.p1.paddle.x, gs.p1.paddle.y, gs.p1.paddle.width, gs.p1.paddle.height);
			context.fillRect(gs.p2.paddle.x, gs.p2.paddle.y, gs.p2.paddle.width, gs.p2.paddle.height);
		};
	
		renderGame();
	
		return () => renderGame();
	}, [gameSession]);

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
				<div className="game-screen">
					<h6>Game room: {gameSession.roomId}</h6>
					<canvas ref={canvasRef} width={PongC.CANVAS_WIDTH} height={PongC.CANVAS_HEIGHT} />
					<button onClick={pongLeaveGame}>
						Leave Game
					</button>
				</div>
			)}
		</div>
	);
};

export default Pong;
