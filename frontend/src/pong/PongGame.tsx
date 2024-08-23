import React from 'react';
// import { GameSession } from './PongTypes';
import { useEffect, useRef } from 'react';
import './Pong.css';

// interface PongGameProps {
//     gameSession: GameSession;
//     pongLeaveGame: () => void;
//     testIncrement: () => void;
// }

// const PongGame: React.FC<PongGameProps> = ({ gameSession, pongLeaveGame, testIncrement}) => {
const PongGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const gameManager = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
		const gameLoop = () => {
            canvas.width = window.innerWidth * 0.75;
            canvas.height = window.innerHeight * 0.85;
			context.fillStyle = 'black';
			context.fillRect(0, 0, canvas.width, canvas.height);
			requestAnimationFrame(gameLoop);
		};
		gameLoop();
	};

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
        
        gameManager(canvas, context);
	}, []);

    return (
        <div className="game-screen">
           <canvas ref={canvasRef} style={{ width: '75vw', height: '85vh' }} />
            {/* <p>p1 | P2</p>
            <p>clientid: {gameSession.p1.clientid ?? 'N/A'} | {gameSession.p2.clientid ?? 'N/A'}</p>
            <p>userid: {gameSession.p1.userid ?? 'N/A'} | {gameSession.p2.userid ?? 'N/A'}</p>
            <p>username: {gameSession.p1.username ?? 'N/A'} | {gameSession.p2.username ?? 'N/A'}</p>
            <p>score: {gameSession.p1.score ?? 0} | {gameSession.p2.score ?? 'N/A'}</p>
            <p>Room ID: {gameSession.roomId ?? 'N/A'}</p>
            <button className="leave-game-btn" onClick={pongLeaveGame}>
                Leave Game
            </button>
            <button className="test-increment-btn" onClick={testIncrement}>
                Test Increment
            </button> */}
        </div>
    );
};

export default PongGame;
