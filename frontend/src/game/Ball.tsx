import { Paddle } from './Paddle';
import { Score } from './Score';

export class Ball {
	x: number;
	y: number;
	width: number;
	height: number;
	speedX: number;
	speedY: number;

	constructor(x: number, y: number, width: number, height: number, speedX: number, speedY: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.speedX = speedX;
		this.speedY = speedY;
	}

	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = 'white';
		context.fillRect(this.x, this.y, this.width, this.height);
	}

	update(canvas: HTMLCanvasElement, lPad: Paddle, rPad: Paddle, score: Score) {
		this.x += this.speedX;
		this.y += this.speedY;

		if (this.y < 0 || this.y + this.height > canvas.height) {
			this.speedY = -this.speedY;
		}

		if (
			this.x < lPad.x + lPad.width &&
			this.y + this.height > lPad.y &&
			this.y < lPad.y + lPad.height
		) {
			this.speedX = -this.speedX;
		}

		if (
			this.x + this.width > rPad.x &&
			this.y + this.height > rPad.y &&
			this.y < rPad.y + rPad.height
		) {
			this.speedX = -this.speedX;
		}

		if (this.x < 0) {
			score.right += 1;
			this.reset(canvas);
		} else if (this.x + this.width > canvas.width) {
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
