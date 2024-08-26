import React, { useEffect, useRef, useState } from 'react';
import { GameSession } from './PongTypes';
import { Socket } from 'socket.io-client';
import './Pong.css';
import { PongC } from '../../shared/constants';
import { pongPrint } from './PongUtils';

interface PongGameProps {
	pSock: Socket;
	gameSession: GameSession;
}

const PongGame: React.FC<PongGameProps> = ({ pSock, gameSession }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [gameState, setGameState] = useState<GameSession>(gameSession);
	const gameStateRef = useRef<GameSession>(gameSession);

	useEffect(() => {
		pongPrint(`PongGame: useEffect()`);
		const handleGameStateUpdate = (sesh: GameSession) => {
			// console.log(`PongGame: handleGameStateUpdate()`);
			// console.log(sesh);
			setGameState(sesh);
			gameStateRef.current = sesh;
		};
		pSock.on('gameStateUpdate', handleGameStateUpdate);
		return () => {
			pSock.off('gameStateUpdate', handleGameStateUpdate);
		};
	}, [pSock]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			console.log(`PongGame: canvas is null`);
			return;
		}
		const context = canvas.getContext('2d');
		if (!context) {
			console.log(`PongGame: context is null`);
			return;
		}
		const cw = canvas.width;
		const ch = canvas.height;
		// game area
		context.fillStyle = 'black';
		context.fillRect(0, 0, cw, ch);
		// game title
		context.fillStyle = 'white';
		const fontSize = ch / 10;
		context.font = `${fontSize}px sans-serif`;
		context.fillText('Pong', (cw / 2) - (cw / 10), (ch / 10));
		// ball
		context.fillStyle = 'white';
		context.fillRect(gameState.ball.x, gameState.ball.y, gameState.ball.width, gameState.ball.height);

		let lastFrameTime = 0;
		const frameInterval = 1000 / 60;

		const gameLoop = (timestamp: number) => {
			if (timestamp - lastFrameTime >= frameInterval) {
				lastFrameTime = timestamp;

				// reset the canvas back to black
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = 'black';
				context.fillRect(0, 0, canvas.width, canvas.height);

				// draw the ball
				const curState = gameStateRef.current;
				context.fillStyle = 'white';
				context.fillRect(curState.ball.x, curState.ball.y, curState.ball.width, curState.ball.height);
			}
			requestAnimationFrame(gameLoop);
		};
		requestAnimationFrame(gameLoop);
	}, []);

	return (
		<div className="game-screen">
			<h6>Game room: {gameState.roomId}</h6>
			<canvas ref={canvasRef} width={PongC.CANVAS_WIDTH} height={PongC.CANVAS_HEIGHT} />
		</div>
	);
};

export default PongGame;
