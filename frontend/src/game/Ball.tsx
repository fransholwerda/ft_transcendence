// Ball.tsx
import { Paddle } from './Paddle';
import { Score } from './Score';

export class Ball {
	x: number;
	y: number;
	radius: number;
	speedX: number;
	speedY: number;

	constructor(x: number, y: number, radius: number, speedX: number, speedY: number) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.speedX = speedX;
		this.speedY = speedY;
	}

	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = 'white';
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		context.fill();
	}

	update(canvas: HTMLCanvasElement, leftPaddle: Paddle, rightPaddle: Paddle, score: Score) {
		this.x += this.speedX;
		this.y += this.speedY;

		if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
			this.speedY = -this.speedY;
		}

		if (
			this.x - this.radius < leftPaddle.x + leftPaddle.width &&
			this.y > leftPaddle.y &&
			this.y < leftPaddle.y + leftPaddle.height
		) {
			this.speedX = -this.speedX;
		}

		if (
			this.x + this.radius > rightPaddle.x &&
			this.y > rightPaddle.y &&
			this.y < rightPaddle.y + rightPaddle.height
		) {
			this.speedX = -this.speedX;
		}

		if (this.x - this.radius < 0) {
			score.right += 1;
			this.reset(canvas);
		} else if (this.x + this.radius > canvas.width) {
			score.left += 1;
			this.reset(canvas);
		}
	}

	reset(canvas: HTMLCanvasElement) {
		this.x = canvas.width / 2;
		this.y = canvas.height / 2;
		this.speedX = -this.speedX;
	}
}
