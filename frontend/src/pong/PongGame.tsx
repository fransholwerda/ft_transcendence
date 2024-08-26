import React, { useEffect, useRef, useState } from 'react';
import { GameSession } from './PongTypes';
import { Socket } from 'socket.io-client';
import './Pong.css';
import { PongC } from '../../shared/constants';

// interface PongGameProps {
//     gameSession: GameSession;
//     pongLeaveGame: () => void;
//     testIncrement: () => void;
// }

interface PongGameProps {
    pSock: Socket;
    gameSession: GameSession;
}

// const PongGame: React.FC<PongGameProps> = ({ gameSession, pongLeaveGame, testIncrement}) => {
// const PongGame: React.FC = () => {
const PongGame: React.FC<PongGameProps> = ({ pSock, gameSession }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameSession>(gameSession);

    useEffect(() => {
        const handleGameStateUpdate = (sesh: GameSession) => {
            setGameState(sesh);
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

        const gameLoop = () => {
            // reset the canvas back to black
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'black';
			context.fillRect(0, 0, canvas.width, canvas.height);

            // draw the ball
            context.fillStyle = 'white';
            context.fillRect(gameState.ball.x, gameState.ball.y, gameState.ball.width, gameState.ball.height);
            requestAnimationFrame(gameLoop);
		};
		gameLoop();
	}, []);

    return (
        <div className="game-screen">
           <canvas ref={canvasRef} width={PongC.CANVAS_WIDTH} height={PongC.CANVAS_HEIGHT} />
        </div>
    );
};

export default PongGame;
