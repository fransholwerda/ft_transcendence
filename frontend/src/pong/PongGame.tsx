import React, { useEffect, useRef, useState } from 'react';
import { GameSession } from './PongTypes';
import { Socket } from 'socket.io-client';
import './Pong.css';
import { PongC } from '../../shared/constants';
// import { pongPrint } from './PongUtils';

interface PongGameProps {
	pSock: Socket;
	gameSession: GameSession;
}

const PongGame: React.FC<PongGameProps> = ({ pSock, gameSession }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [gameState, setGameState] = useState<GameSession>(gameSession);
	const gameStateRef = useRef<GameSession>(gameSession);

	useEffect(() => {
		const handleGameStateUpdate = (updatedSession: GameSession) => {
			setGameState(updatedSession); // Update the game state in the component
			gameStateRef.current = updatedSession; // Also update the ref for the latest game state
		};
	
		// Listen for game state updates from the server
		pSock.on('gameStateUpdate', handleGameStateUpdate);
	
		return () => {
			// Clean up the listener when the component unmounts
			pSock.off('gameStateUpdate', handleGameStateUpdate);
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
			const curState = gameStateRef.current;
			context.fillStyle = 'white';
			context.fillRect(curState.ball.x, curState.ball.y, curState.ball.width, curState.ball.height);
	
			// Draw paddles
			context.fillRect(curState.p1.paddle.x, curState.p1.paddle.y, curState.p1.paddle.width, curState.p1.paddle.height);
			context.fillRect(curState.p2.paddle.x, curState.p2.paddle.y, curState.p2.paddle.width, curState.p2.paddle.height);
		};
	
		renderGame();
	
		return () => renderGame();
	}, [gameState]);
	
	return (
		<div className="game-screen">
			<h6>Game room: {gameState.roomId}</h6>
			<canvas ref={canvasRef} width={PongC.CANVAS_WIDTH} height={PongC.CANVAS_HEIGHT} />
		</div>
	);
};

export default PongGame;
