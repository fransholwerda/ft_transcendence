import './game.css';
import React, { useEffect, useRef } from 'react';
import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { Score } from './Score';

const Game: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const initializeGame = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
		const padW = 15;
		const padH = 100;
		const padS = 5;

		const leftPaddle = new Paddle(50, canvas.height / 2 - padH / 2, padW, padH, padS);
		const rightPaddle = new Paddle(canvas.width - 50 - padW, canvas.height / 2 - padH / 2, padW, padH, padS);
		const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 10, 5, 5);
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
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		const context = canvas.getContext('2d');
		if (!context) {
			return;
		}

		initializeGame(canvas, context);
	}, []);

	return (
		<canvas ref={canvasRef} width={800} height={400} />
	);
};

export default Game;
