export interface Paddle {
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number;
}

export interface player {
	clientid: string;
	userid: string;
	username: string;
	score: number;
	paddle: Paddle;
}

export interface Ball {
	x: number;
	y: number;
	width: number;
	height: number;
	speedX: number;
	speedY: number;
}

export interface GameSession {
	p1: player;
	p2: player;
	roomId: string;
	ball: Ball;
	timeoutId: NodeJS.Timeout;
}

export interface User {
	id:  string,
	username: string,
	avatarURL: string
}
