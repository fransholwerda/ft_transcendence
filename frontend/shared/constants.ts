export class Constants {
	public static FRONTEND_HOST_PROTOCOL = 'http://';
	public static FRONTEND_HOST_HOSTNAME = '10.11.3.12';
	public static FRONTEND_HOST_PORT = '3003';

	public static BACKEND_HOST_PROTOCOL = 'http://';
	public static BACKEND_HOST_HOSTNAME = '10.11.3.12';
	public static BACKEND_HOST_PORT = '3003';

	public static FRONTEND_HOST_URL = `${Constants.FRONTEND_HOST_PROTOCOL}${Constants.FRONTEND_HOST_HOSTNAME}:${Constants.FRONTEND_HOST_PORT}`;
	public static BACKEND_HOST_URL = `${Constants.BACKEND_HOST_PROTOCOL}${Constants.BACKEND_HOST_HOSTNAME}:${Constants.BACKEND_HOST_PORT}`;
}

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
