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
		if (!(r1x < r2x + r2w &&
			r1x + r1w > r2x &&
			r1y < r2y + r2h &&
			r1y + r1h > r2y)) {
			return "no hit";
		}
		if (r1y + r1h >= r2y) {
			return "hit on top";
		}
		if (r1y <= r2y + r2h) {
			return "hit on bottom";
		}
		return "hit on front";
	}
	bounce_back(lPad: Paddle, rPad: Paddle) {
		let hit = this.check_collision(this.x, this.y, this.width, this.height, lPad.x, lPad.y, lPad.width, lPad.height);
		
		if (hit == "hit on top" || hit == "hit on bottom") {
			this.speedY = -this.speedY;
			this.speedX = -this.speedX;
		}
		else if (hit == "hit on front") {
			this.speedX = -this.speedX;
		}
		else {
			hit = this.check_collision(this.x, this.y, this.width, this.height, rPad.x, rPad.y, rPad.width, rPad.height);
		}

		if (hit == "hit on top" || hit == "hit on bottom") {
			this.speedY = -this.speedY;
			this.speedX = -this.speedX;
		}
		else if (hit == "hit on front") {
			this.speedX = -this.speedX;
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
