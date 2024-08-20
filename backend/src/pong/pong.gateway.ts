import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// max score
const MAX_SCORE = 5;

interface player {
	clientid: string;
	userid: string;
	username: string;
	score: number;
}

interface GameSession {
	p1: player;
	p2: player;
	roomId: string;
}

interface User {
	id:  string,
	username: string,
	avatarURL: string
}

@WebSocketGateway({ namespace: '/pong', cors: { origin: '*' } })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	// players queueing for a game
	private queue: { clientId: string, user: User }[] = [];	
	// array of active games
	private games: GameSession[] = [];

	handleConnection(client: Socket) {
		console.log(`NestJS pong: connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`NestJS pong: disconnected: ${client.id}`);
		this.removeFromQueue(client.id);
		this.disconnectFromGame(client.id);
	}

	@SubscribeMessage('joinQueue')
	handleJoinQueue(client: Socket, data: { user: User }) {
		console.log(`NestJS pong: ${client.id} : ${data.user.id} trying to join queue`);
		if (this.isUserInGame(data.user.id)) {
			console.log(`NestJS pong: ${client.id} : ${data.user.id} is already in a game`);
			client.emit('queueStatus', { success: false, message: 'You are already in a game.' });
		}
		else if (!this.queue.find((q) => q.user.id === data.user.id)) {
			console.log(`NestJS pong: ${client.id} : ${data.user.id} could not find in queue`);
			this.queue.push({ clientId: client.id, user: data.user });
			this.checkQueue();
			client.emit('queueStatus', { success: true, message: 'Successfully joined the queue.' });
		}
		else {
			console.log(`NestJS pong: ${client.id} : ${data.user.id} is already in the queue`);
			client.emit('queueStatus', { success: false, message: 'You are already in the queue.' });
		}
	}
	
	private checkQueue() {
		console.log(`NestJS pong: checking queue`);
		if (this.queue.length < 2) {
			console.log('NestJS pong: Not enough players in queue');
			return;
		}

		console.log('NestJS pong: Found 2 players in queue');
		this.printQueue();
		const p1 = this.queue.shift();
		const p2 = this.queue.shift();
		if (!p1 || !p2) {
			console.log('NestJS pong: Could not find both players in queue');
			return;
		}
		console.log(`NestJS pong: Found players ${p1.user.username} and ${p2.user.username}`);
		const roomId = `pong_${p1.user.id}_${p2.user.id}`;

		const gameSession = this.fillGameSession(p1, p2, roomId);
		this.games.push(gameSession);
		this.printGameSession(gameSession);
		this.server.to(p1.clientId).emit('gameStart', { gameSession });
		this.server.to(p2.clientId).emit('gameStart', { gameSession });

		this.server.in(p1.clientId).socketsJoin(roomId);
		this.server.in(p2.clientId).socketsJoin(roomId);
		console.log(`NestJS pong: Created room ${roomId} for players ${p1.user.id} and ${p2.user.id}`);
		this.printGames();
	}

	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(client: Socket) {
		console.log(`NestJS pong: ${client.id} left the queue`);
		this.removeFromQueue(client.id);
	}

	@SubscribeMessage('leaveGame')
	handleLeaveGame(client: Socket) {
		console.log(`NestJS pong: ${client.id} leaveGame`);
		const sesh = this.findGameSessionByClientId(client.id);
		if (!sesh) {
			console.log(`NestJS pong: ${client.id} leaveGame listener !sesh`);
			return;
		}
		console.log(`Room ID: ${sesh.roomId}`);
		this.disconnectFromGame(client.id);
		console.log(`NestJS pong: ${client.id} left the game room ${sesh.roomId}`);
		if (sesh.p1.clientid === client.id) {
			sesh.p2.score = MAX_SCORE;
		}
		else if (sesh.p2.clientid === client.id) {
			sesh.p1.score = MAX_SCORE;
		}
		this.server.to(sesh.roomId).emit('gameUpdate', { sesh });
	}

	private fillGameSession(p1: { clientId: string, user: User }, p2: { clientId: string, user: User }, roomId: string): GameSession {
		console.log(`NestJS pong: Filling game session for room ${roomId}`);
		const sesh: GameSession = {
			p1: {
				clientid: p1.clientId,
				userid: p1.user.id,
				username: p1.user.username,
				score: 0
			},
			p2: {
				clientid: p2.clientId,
				userid: p2.user.id,
				username: p2.user.username,
				score: 0
			},
			roomId: roomId
		};
		return sesh;
	}
	
	private printGameSession(sesh: GameSession) {
		console.log(`NestJS pong: Game session ${sesh.roomId}`);
		console.log(`NestJS pong: ${sesh.p1.username} vs ${sesh.p2.username}`);
		console.log(`NestJS pong: ${sesh.p1.score} vs ${sesh.p2.score}`);
	}

	private printQueue() {
		console.log('NestJS pong: printQueue()');
		this.queue.forEach((q) => {
			console.log(`NestJS pong: ${q.user.username}`);
		});
	}

	private printGames() {
		console.log('NestJS pong: printGames()');
		this.games.forEach((game) => {
			console.log(`NestJS pong: ${game.p1.username} vs ${game.p2.username}`);
		});
	}

	private removeFromQueue(clientId: string) {
		console.log(`NestJS pong: ${clientId} removing client from queue`);
		this.queue = this.queue.filter((q) => q.clientId !== clientId);
	}

	private findGameSessionByClientId(clientId: string): GameSession | null {
		console.log(`NestJS pong: findGameSessionByClientId ${clientId}`);
		const gameSession = this.games.find((game) => game.p1.clientid === clientId || game.p2.clientid === clientId);
		if (!gameSession) {
			console.log(`NestJS pong: Could not find game session for user ${clientId}`);
			return null;
		}
		return gameSession;
	}

	private findGameSessionByUserId(userId: string): GameSession | null {
		console.log(`NestJS pong: findGameSessionByUserId ${userId}`);
		const gameSession = this.games.find((game) => game.p1.userid === userId || game.p2.userid === userId);
		if (!gameSession) {
			console.log(`NestJS pong: Could not find game session for user ${userId}`);
			return null;
		}
		return gameSession;
	}

	private isUserInGame(userId: string): boolean {
		console.log(`NestJS pong: Checking if user ${userId} is in a game`);
		return this.findGameSessionByUserId(userId) !== null;
	}

	private getRoomIdByClientId(clientId: string): string | null {
		console.log(`NestJS pong: Getting room ID by client ID ${clientId}`);
		const gameSession = this.findGameSessionByClientId(clientId);
		if (!gameSession) {
			console.log(`NestJS pong: Could not find room ID for client ${clientId}`);
			return null;
		}
		return gameSession.roomId;
	}

	private disconnectFromGame(clientId: string) {
		console.log(`NestJS pong: ${clientId} disconnecting from game`);
		if (!this.findGameSessionByClientId(clientId)) {
			console.log(`NestJS pong: disconnectFromGame: Could not find game session for client ${clientId}`);
			return;
		}
		this.server.socketsLeave(clientId);
	}

	private removeGameSession(roomId: string) {
		console.log(`NestJS pong: Removing game session for room ${roomId}`);
		this.games = this.games.filter((game) => game.roomId !== roomId);
	}
}

/*
loop through:
- games to check for game over
- games to check for double disconnect
- games to check for signle disconnect
- games to check for double gameOver

- socket rooms to matching those cases
this.server.socketsLeave(clientId);
*/
