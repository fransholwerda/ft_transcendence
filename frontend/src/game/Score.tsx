import { PongC } from '../../shared/constants'

export class Score {
	left: number;
	right: number;
	constructor() {
		this.left = 0;
		this.right = 0;
	}
	draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		context.fillStyle = 'white';
		context.font = '48px sans-serif';
		context.fillText(this.left.toString(), canvas.width / 4, PongC.SCORE_SIZE);
		context.fillText(this.right.toString(), (canvas.width / 4) * 3, PongC.SCORE_SIZE);
	}
}
