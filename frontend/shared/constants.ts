export class Constants {
	public static FRONTEND_HOST_PROTOCOL = 'http://';
	public static FRONTEND_HOST_HOSTNAME = '10.11.3.16';
	public static FRONTEND_HOST_PORT = '3000';

	public static BACKEND_HOST_PROTOCOL = 'http://';
	public static BACKEND_HOST_HOSTNAME = '10.11.3.16';
	public static BACKEND_HOST_PORT = '3000';

	public static FRONTEND_HOST_URL = `${Constants.FRONTEND_HOST_PROTOCOL}${Constants.FRONTEND_HOST_HOSTNAME}:${Constants.FRONTEND_HOST_PORT}`;
	public static BACKEND_HOST_URL = `${Constants.BACKEND_HOST_PROTOCOL}${Constants.BACKEND_HOST_HOSTNAME}:${Constants.BACKEND_HOST_PORT}`;
}

export class PongC {
	public static BALL_WIDTH = 10; // 10 / 800 = 1.25% of the canvas width
	public static BALL_HEIGHT = 10; // 10 / 500 = 2% of the canvas height
	public static BALL_SPEEDX = 5; // 5 / 800 = 0.625% of the canvas width
	public static BALL_SPEEDY = 5; // 5 / 500 = 1% of the canvas height

	public static PADDLE_WIDTH = 20; // 20 / 800 = 2.5% of the canvas width
	public static PADDLE_HEIGHT = 100; // 100 / 500 = 20% of the canvas height
	public static PADDLE_SPEED = 5; // 5 / 500 = 1% of the canvas height

	public static SCORE_SIZE = 50;

	public static CANVAS_WIDTH = 800;
	public static CANVAS_HEIGHT = 500;
}
