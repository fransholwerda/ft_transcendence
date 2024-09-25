export interface Paddle {
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number;
}

export interface player {
	clientid: string;
	userid: number;
	username: string;
	score: number;
	paddle: Paddle;
	isKeyDown: boolean;
	key: string;
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
	lastUpdateTime: number;
	timeSinceLastScore: number;
	ballDelay: number;
	isCustom: boolean;
}

export interface User {
	id:  number,
	username: string,
	avatarURL: string
}
