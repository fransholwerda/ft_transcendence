import React, { useState, useRef, useEffect } from 'react';
import './Pong.css';
import { User } from '../PageManager';
import { Socket } from 'socket.io-client';
import { GameSession } from './PongTypes';
import { pongPrint } from './PongUtils';
import { themes } from './themes';

interface PongProps {
	user: User;
	pSock: Socket;
}

const Pong: React.FC<PongProps> = ({ user, pSock }) => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [gameSession, setGameSession] = useState<GameSession | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const keyState = useRef<{ [key: string]: boolean }>({});
	const canvasWidth = 800;
	const canvasHeight = 500;
	const [theme, setTheme] = useState('default');

	useEffect(() => {
		if (!pSock) return;
		const newTheme = themes.get(theme);
		if (!newTheme) return;
		document.documentElement.style.setProperty('--pongbg', newTheme.bg);
		document.documentElement.style.setProperty('--ponginner', newTheme.inner);
		document.documentElement.style.setProperty('--pongtext', newTheme.text);
		document.documentElement.style.setProperty('--pongextra', newTheme.extra);
	}, [theme, pSock]);

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

	useEffect(() => {
		if (!pSock) return;
		if (!inGame) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'w' || e.key === 's') {
				keyState.current[e.key] = true;
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'w' || e.key === 's') {
				keyState.current[e.key] = false;
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [pSock, inGame]);

	useEffect(() => {
		if (!pSock) return;
		if (!inGame) return;
		const intervalId = setInterval(() => {
			if (keyState.current['w']) {
				pSock.emit('movePaddle', { direction: 'w' });
			}
			if (keyState.current['s']) {
				pSock.emit('movePaddle', { direction: 's' });
			}
		}, 1000 / 60);
		return () => {
			clearInterval(intervalId);
		};
	}, [pSock, inGame]);

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
		pSock.on('gameUpdate', (data: { sesh: GameSession }) => {
			setGameSession(data.sesh);
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
			if (!context || !gameSession) return;
			const curTheme = themes.get(theme);
			if (!curTheme) return;
			pongPrint(`pong.tsx: Rendering game ${user.username}`);
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = curTheme.inner;
			context.fillRect(0, 0, canvas.width, canvas.height);
			const gs = gameSession;
			if (!gs) return;
			context.fillStyle = curTheme.text;
			context.fillRect(gs.ball.x, gs.ball.y, gs.ball.width, gs.ball.height);
			context.fillRect(gs.p1.paddle.x, gs.p1.paddle.y, gs.p1.paddle.width, gs.p1.paddle.height);
			context.fillRect(gs.p2.paddle.x, gs.p2.paddle.y, gs.p2.paddle.width, gs.p2.paddle.height);
		};
		renderGame();
	}, [gameSession]);

	useEffect(() => {
		if (!pSock || !inGame || inQueue || !gameSession) return;
		const intervalId = setInterval(() => {
			// console.log('pong.tsx: Requesting game update');
			pSock.emit('requestGameUpdate');
		}, 1000 / 60);
		return () => {
			clearInterval(intervalId);
		};
	}, [pSock, inGame, inQueue, gameSession]);

	return (
		<div className="pong-container">
			{!inQueue && !inGame && (
				<div className="pong-info">
					<h6>Socket id: {pSock.id}</h6>
					<h6>User id: {user.id}</h6>
					<h6>Username: {user.username}</h6>
					<button className="join-queue-btn" onClick={joinQueue}>Join Queue</button>
					<h6>Select your color theme</h6>
					<select onChange={(e) => setTheme(e.target.value)}>
						{Array.from(themes.keys()).map((theme) => (
							<option key={theme} value={theme}>
								{theme}
							</option>
						))}
					</select>
				</div>
			)}
			{inQueue && !inGame && (
				<div className="pong-waiting">
					<h6>Username: {user.username}</h6>
					<h6>Waiting for opponent...</h6>
					<button className="leave-queue-btn" onClick={leaveQueue}>
						Leave Queue
					</button>
				</div>
			)}
			{inGame && gameSession && (
				<div className="pong-game">
					<div className="player-score">
						<h6>{gameSession.p1.score} : {gameSession.p1.username}</h6>
						<h6>{gameSession.p2.score} : {gameSession.p2.username}</h6>
					</div>
					<canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
					<div className="below-canvas">
						<div className="p1-arrow">
							{pSock.id === gameSession.p1.clientid && <h6>/\</h6>}
						</div>
						<button onClick={leaveGame}>
							Leave Game
						</button>
						<div className="p2-arrow">
							{pSock.id === gameSession.p2.clientid && <h6>/\</h6>}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Pong;
