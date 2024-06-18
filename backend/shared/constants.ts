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