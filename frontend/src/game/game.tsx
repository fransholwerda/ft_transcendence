import './game.css';
import React, { useEffect, useRef } from 'react';
import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { Score } from './Score';
import { PongC } from '../../shared/constants'

const Game: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const gameManager = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
		let cW = canvas.width;
		let cH = canvas.height;

		let lPadSpeed = PongC.PADDLE_SPEED;
		const lPad = new Paddle(50,
			cH / 2 - PongC.PADDLE_HEIGHT / 2,
			PongC.PADDLE_WIDTH,
			PongC.PADDLE_HEIGHT,
			lPadSpeed);

		let rPadSpeed = PongC.PADDLE_SPEED;
		const rPad = new Paddle(cW - 50 - PongC.PADDLE_WIDTH,
			cH / 2 - PongC.PADDLE_HEIGHT / 2,
			PongC.PADDLE_WIDTH,
			PongC.PADDLE_HEIGHT,
			rPadSpeed);

		let ballSpeedX = PongC.BALL_SPEEDX;
		let ballSpeedY = PongC.BALL_SPEEDY;
		const ball = new Ball(cW / 2,
			cH / 2,
			PongC.BALL_WIDTH,
			PongC.BALL_HEIGHT,
			ballSpeedX,
			ballSpeedY);

		const score = new Score();

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'w':
					lPad.moveUp();
					break;
				case 's':
					lPad.moveDown();
					break;
				case 'ArrowUp':
					rPad.moveUp();
					break;
				case 'ArrowDown':
					rPad.moveDown();
					break;
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'w':
				case 's':
					lPad.stop();
					break;
				case 'ArrowUp':
				case 'ArrowDown':
					rPad.stop();
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		const gameLoop = () => {
			context.fillStyle = 'black';
			context.fillRect(0, 0, canvas.width, canvas.height);

			lPad.update(canvas);
			rPad.update(canvas);
			lPad.draw(context);
			rPad.draw(context);
			ball.update(canvas, lPad, rPad, score);
			ball.draw(context);
			score.draw(context, canvas);

			requestAnimationFrame(gameLoop);
		};

		gameLoop();

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			// window.removeEventListener('resize', resizeCanvas);
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

		gameManager(canvas, context);
	}, []);

	return (
		<canvas ref={canvasRef} width={PongC.CANVAS_WIDTH} height={PongC.CANVAS_HEIGHT} />
	);
};

export default Game;
