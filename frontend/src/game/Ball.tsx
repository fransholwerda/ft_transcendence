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
	score(canvas: HTMLCanvasElement, score: Score) {
		if (this.x < 0) {
			score.right += 1;
			this.reset(canvas);
		} else if (this.x + this.width > canvas.width) {
			score.left += 1;
			this.reset(canvas);
		}
	}
	check_collision(r1x: number, r1y: number, r1w: number, r1h: number, r2x: number, r2y: number, r2w: number, r2h: number) {
		if (r1x < r2x + r2w &&
			r1x + r1w > r2x &&
			r1y < r2y + r2h &&
			r1y + r1h > r2y) {
			return true;
		}
		return false;
	}
	// bounce_helper(p: Paddle) {
	// 	let direction = this.speedX > 0 ? -1 : 1;

	// }
	bounce_back(lPad: Paddle, rPad: Paddle) {
		if (this.check_collision(this.x, this.y, this.width, this.height, lPad.x, lPad.y, lPad.width, lPad.height)) {
			this.speedX = -this.speedX;
			// Check if the ball is hitting the top half or bottom half of the left paddle
			if (this.y + this.height / 2 < lPad.y + lPad.height / 2) {
				// if (this.speedY > 0) return; // If ball is moving downwards, don't reverse direction
				this.speedY = -Math.abs(this.speedY); // Bounce the ball upwards
			} else {
				// if (this.speedY < 0) return; // If ball is moving upwards, don't reverse direction
				this.speedY = Math.abs(this.speedY); // Bounce the ball downwards
			}
		}
		else if (this.check_collision(this.x, this.y, this.width, this.height, rPad.x, rPad.y, rPad.width, rPad.height)) {
			this.speedX = -this.speedX;
			// Check if the ball is hitting the top half or bottom half of the right paddle
			if (this.y + this.height / 2 < rPad.y + rPad.height / 2) {
				// if (this.speedY > 0) return; // If ball is moving downwards, don't reverse direction
				this.speedY = -Math.abs(this.speedY); // Bounce the ball upwards
			} else {
				// if (this.speedY < 0) return; // If ball is moving upwards, don't reverse direction
				this.speedY = Math.abs(this.speedY); // Bounce the ball downwards
			}
		}
	}
	update(canvas: HTMLCanvasElement, lPad: Paddle, rPad: Paddle, score: Score) {
		this.x += this.speedX;
		this.y += this.speedY;
		if (this.y < 0 || this.y + this.height > canvas.height) {
			this.speedY = -this.speedY;
		}
		this.bounce_back(lPad, rPad);
		this.score(canvas, score);
	}
	reset(canvas: HTMLCanvasElement) {
		this.x = canvas.width / 2;
		this.y = canvas.height / 2;
		this.speedX = -this.speedX;
	}
}
