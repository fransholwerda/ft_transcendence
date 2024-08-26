export interface player {
	clientid: string;
	userid: string;
	username: string;
	score: number;
}

export interface Ball {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface GameSession {
	p1: player;
	p2: player;
	roomId: string;
	ball: Ball;
}

export interface User {
	id:  string,
	username: string,
	avatarURL: string
}
