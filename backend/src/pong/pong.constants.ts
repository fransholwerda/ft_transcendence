// max score
export const MAX_SCORE = 5;

// ------------------------------
// CUSTOM PRINTING
const pongPrintColors = [
    '\x1b[91m', // Bright Red
    '\x1b[92m', // Bright Green
    '\x1b[93m', // Bright Yellow
    '\x1b[94m', // Bright Blue
    '\x1b[95m', // Bright Magenta
    '\x1b[96m'  // Bright Cyan
];
const pongPrintReset = '\x1b[0m'; // Reset to default color
let pongPrintIndex = 0;
const allowPongPrint = true;

export const pongPrint = (message: any) => {
    if (!allowPongPrint) return;
    const color = pongPrintColors[pongPrintIndex];
    console.log(`${color}${message}${pongPrintReset}`);
    pongPrintIndex = (pongPrintIndex + 1) % pongPrintColors.length;
};
// ------------------------------

export class PongC {
	public static BALL_WIDTH = 10;
	public static BALL_HEIGHT = 10;
	public static BALL_SPEEDX = 5;
	public static BALL_SPEEDY = 5;

	public static PADDLE_WIDTH = 20;
	public static PADDLE_HEIGHT = 100;
	public static PADDLE_SPEED = 5;

	public static SCORE_SIZE = 50;

	public static CANVAS_WIDTH = 800;
	public static CANVAS_HEIGHT = 500;
}
