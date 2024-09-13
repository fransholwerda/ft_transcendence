const HOST_HOSTNAME = '10.11.3.7';

export class Constants {
	public static FRONTEND_HOST_PROTOCOL = 'http://';
	public static FRONTEND_HOST_HOSTNAME = HOST_HOSTNAME;
	public static FRONTEND_HOST_PORT = '3003';

	public static BACKEND_HOST_PROTOCOL = 'http://';
	public static BACKEND_HOST_HOSTNAME = HOST_HOSTNAME;
	public static BACKEND_HOST_PORT = '3003';

	public static FRONTEND_HOST_URL = `${Constants.FRONTEND_HOST_PROTOCOL}${Constants.FRONTEND_HOST_HOSTNAME}:${Constants.FRONTEND_HOST_PORT}`;
	public static BACKEND_HOST_URL = `${Constants.BACKEND_HOST_PROTOCOL}${Constants.BACKEND_HOST_HOSTNAME}:${Constants.BACKEND_HOST_PORT}`;
}

export class PongC {
	public static BALL_WIDTH = 20;
	public static BALL_HEIGHT = 20;
	public static BALL_SPEEDX = 400;
	public static BALL_SPEEDY = 400;
	public static BALL_MAX_SPEEDX = 800;
	public static BALL_MAX_SPEEDY = 800;

	public static PADDLE_WIDTH = 5;
	public static PADDLE_HEIGHT = 100;
	public static PADDLE_SPEED = 10;

	public static SCORE_SIZE = 50;

	public static CANVAS_WIDTH = 800;
	public static CANVAS_HEIGHT = 500;
}
