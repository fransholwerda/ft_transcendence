import './game.css';
import React, { useEffect, useRef } from 'react';
import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { Score } from './Score';

const Game: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		const context = canvas.getContext('2d');
		if (!context) {
			return;
		}
		const paddleWidth = 15;
		const paddleHeight = 100;
		const paddleSpeed = 5;

		const leftPaddle = new Paddle(50, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, paddleSpeed);
		const rightPaddle = new Paddle(canvas.width - 50 - paddleWidth, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, paddleSpeed);
		const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 4);
		const score = new Score();

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'w':
					leftPaddle.moveUp();
					break;
				case 's':
					leftPaddle.moveDown();
					break;
				case 'ArrowUp':
					rightPaddle.moveUp();
					break;
				case 'ArrowDown':
					rightPaddle.moveDown();
					break;
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'w':
				case 's':
					leftPaddle.stop();
					break;
				case 'ArrowUp':
				case 'ArrowDown':
					rightPaddle.stop();
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		const gameLoop = () => {
			context.fillStyle = 'black';
			context.fillRect(0, 0, canvas.width, canvas.height);

			leftPaddle.update(canvas);
			rightPaddle.update(canvas);
			leftPaddle.draw(context);
			rightPaddle.draw(context);
			ball.update(canvas, leftPaddle, rightPaddle, score);
			ball.draw(context);
			score.draw(context, canvas);

			requestAnimationFrame(gameLoop);
		};

		gameLoop();

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	return (
		<canvas ref={canvasRef} width={800} height={400} />
	);
};

export default Game;
