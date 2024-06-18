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

	update(canvas: HTMLCanvasElement, lPad: Paddle, rPad: Paddle, score: Score) {
		this.x += this.speedX;
		this.y += this.speedY;

		if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
			this.speedY = -this.speedY;
		}

		if (
			this.x - this.radius < lPad.x + lPad.width &&
			this.y > lPad.y &&
			this.y < lPad.y + lPad.height
		) {
			this.speedX = -this.speedX;
		}

		if (
			this.x + this.radius > rPad.x &&
			this.y > rPad.y &&
			this.y < rPad.y + rPad.height
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
