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

	// useEffect(() => {
	// 	let lastKeyPressTime = 0;
	// 	const keyPressInterval = 100;
	// 	const handleKeyDown = (e: KeyboardEvent) => {
	// 		const cur = Date.now();
	// 		if (cur - lastKeyPressTime > keyPressInterval) {
	// 			lastKeyPressTime = cur;
	// 			if (e.key === 'w' || e.key === 's') {
	// 				pSock.emit('movePaddle', { direction: e.key });
	// 			}
	// 		}
	// 	};
	// 	window.addEventListener('keydown', handleKeyDown);
	// 	return () => {
	// 		window.removeEventListener('keydown', handleKeyDown);
	// 	};
	// }, [pSock]);

	useEffect(() => {
		if (!pSock) return;
		pSock.on('queueStatus', ({ success, message }) => {
			console.log('pong.tsx: Queue status:', success, message, user.username);
			if (success) {
				pongPrint(`pong.tsx: Successfully joined queue ${user.id}`);
				setInQueue(true);
			} else {
				pongPrint(`pong.tsx: Failed to join queue ${user.id}`);
				alert(message);
			}
		});
		return () => {
			pSock.off('queueStatus');
		};
	}, [pSock, user]);

	useEffect(() => {
		pSock.on('gameStart', (data: { sesh: GameSession }) => {
			pongPrint(`pong.tsx: game start received from server`);
			if (!data.sesh) {
				pongPrint(`pong.tsx: No game session found`);
				return;
			}
			pongPrint(`pong.tsx: Game started`);
			pongPrint(`pong.tsx: Username: ${user.username} Room ID: ${data.sesh.roomId}`);

			setInQueue(false);
			setInGame(true);
			setGameSession(data.sesh);
		});
		return () => {
			pSock.off('gameStart');
		};
	}, [pSock, user]);

	useEffect(() => {
		pSock.on('gameEnd', (data: { sesh: GameSession }) => {
			pongPrint(`pong.tsx gameEnd: received from server`);
			if (!data.sesh) {
				pongPrint(`pong.tsx gameEnd: No game session found`);
				return;
			}
			pongPrint(`pong.tsx gameEnd: ${data.sesh.p1.username}:${data.sesh.p1.score} - ${data.sesh.p2.username}:${data.sesh.p2.score}`);
			alert(`${data.sesh.p1.username}:${data.sesh.p1.score} - ${data.sesh.p2.username}:${data.sesh.p2.score}`);
			setInGame(false);
			setInQueue(false);
			setGameSession(null);
		});
		return () => {
			pSock.off('gameEnd');
		};
	}, [pSock]);

	useEffect(() => {
		pSock.on('gameUpdate', (updatedSession: GameSession) => {
			setGameSession(updatedSession);
		});
		return () => {
			pSock.off('gameUpdate');
		};
	}, [pSock]);

	useEffect(() => {
		if (!pSock) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext('2d');
		if (!context) return;
		const renderGame = () => {
			if (!context || !gameSession) return
			pongPrint(`pong.tsx: Rendering game ${user.username}`);
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = 'black';
			context.fillRect(0, 0, canvas.width, canvas.height);
			const gs = gameSession;
			if (!gs) return;
			context.fillStyle = 'white';
			context.fillRect(gs.ball.x, gs.ball.y, gs.ball.width, gs.ball.height);
			context.fillRect(gs.p1.paddle.x, gs.p1.paddle.y, gs.p1.paddle.width, gs.p1.paddle.height);
			context.fillRect(gs.p2.paddle.x, gs.p2.paddle.y, gs.p2.paddle.width, gs.p2.paddle.height);
		};
		renderGame();
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
					<button className="leave-queue-btn" onClick={leaveQueue}>
						Leave Queue
					</button>
				</>
			)}
			{inGame && gameSession && (
				<div className="game-screen">
					{/* <h6>Game room: {gameSession.roomId}</h6> */}
					<h3>{pSock.id}</h3>
					<div className="player-score">
						<h6>{gameSession.p1.username}:{gameSession.p1.score}</h6>
						<h6>{gameSession.p2.score}:{gameSession.p2.username}</h6>
					</div>
					<canvas ref={canvasRef} width={PongC.CANVAS_WIDTH} height={PongC.CANVAS_HEIGHT} />
					<button onClick={leaveGame}>
						Leave Game
					</button>
				</div>
			)}
		</div>
	);
};

export default Pong;
