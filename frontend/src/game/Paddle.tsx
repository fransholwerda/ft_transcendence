// Paddle.tsx
export class Paddle {
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number;
	dy: number;
	constructor(x: number, y: number, width: number, height: number, speed: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.dy = 0;
	}
	moveUp() {
		this.dy = -this.speed;
	}
	moveDown() {
		this.dy = this.speed;
	}
	stop() {
		this.dy = 0;
	}
	update(canvas: HTMLCanvasElement) {
		this.y += this.dy;
		if (this.y < 0) this.y = 0;
		if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
	}
	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = 'white';
		context.fillRect(this.x, this.y, this.width, this.height);
	}
}
