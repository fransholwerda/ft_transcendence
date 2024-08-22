export interface player {
	clientid: string;
	userid: string;
	username: string;
	score: number;
}

export interface GameSession {
	p1: player;
	p2: player;
	roomId: string;
}

export interface User {
	id:  string,
	username: string,
	avatarURL: string
}
