import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MAX_SCORE, pongPrint } from './pong.constants';
import { GameSession, User } from './pong.types';
import {
	fillGameSession,
	printGameSession,
	printQueue,
	printGames,
	removeFromQueue,
	findGameSessionByClientId,
	findGameSessionByUserId,
	isUserInGame,
	getRoomIdByClientId,
	disconnectFromGame,
	removeGameSession
} from './pong.helpers';

@WebSocketGateway({ namespace: '/ft_transcendence', cors: { origin: '*' } })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private queue: { clientId: string, user: User }[] = [];	
	private games: GameSession[] = [];

	handleConnection(client: Socket) {
		pongPrint(`NestJS pong: connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		pongPrint(`NestJS pong: disconnected: ${client.id}`);
		this.queue = removeFromQueue(this.queue, client.id);
		disconnectFromGame(this.server, this.games, client.id);
	}

	@SubscribeMessage('joinQueue')
	handleJoinQueue(client: Socket, data: { user: User }) {
		pongPrint(`NestJS pong: ${client.id} : ${data.user.id} trying to join queue`);
		if (isUserInGame(this.games, data.user.id)) {
			pongPrint(`NestJS pong: ${client.id} : ${data.user.id} is already in a game`);
			client.emit('queueStatus', { success: false, message: 'You are already in a game.' });
		}
		else if (!this.queue.find((q) => q.user.id === data.user.id)) {
			pongPrint(`NestJS pong: ${client.id} : ${data.user.id} could not find in queue`);
			this.queue.push({ clientId: client.id, user: data.user });
			this.checkQueue();
			client.emit('queueStatus', { success: true, message: 'Successfully joined the queue.' });
		}
		else {
			pongPrint(`NestJS pong: ${client.id} : ${data.user.id} is already in the queue`);
			client.emit('queueStatus', { success: false, message: 'You are already in the queue.' });
		}
	}

	@SubscribeMessage('routeLeaveQueue')
	handleRouteLeaveQueue(client: Socket) {
		pongPrint(`NestJS pong: ${client.id} left the queue`);
		this.queue = removeFromQueue(this.queue, client.id);
	}

	@SubscribeMessage('pongLeaveQueue')
	handlePongLeaveQueue(client: Socket) {
		pongPrint(`NestJS pong: ${client.id} left the queue`);
		this.queue = removeFromQueue(this.queue, client.id);
	}

	@SubscribeMessage('routeLeaveGame')
	handleRouteLeaveGame(client: Socket) {
		pongPrint(`NestJS pong routeLeaveGame: ${client.id}`);
		const sesh = findGameSessionByClientId(this.games, client.id);
		if (!sesh) {
			pongPrint(`NestJS pong routeLeaveGame: ${client.id} leaveGame listener !sesh`);
			return;
		}
		pongPrint(`NestJS pong routeLeaveGame: ${sesh.roomId}`);
		pongPrint(`NestJS pong routeLeaveGame: ${client.id} left room ${sesh.roomId}`);
		if (sesh.p1.clientid === client.id) {
			sesh.p2.score = MAX_SCORE;
		}
		else if (sesh.p2.clientid === client.id) {
			sesh.p1.score = MAX_SCORE;
		}
		this.games = removeGameSession(this.games, sesh.roomId);
		this.server.to(sesh.roomId).emit('routeLeaveGame', { sesh });
	}

	@SubscribeMessage('pongLeaveGame')
	handlePongLeaveGame(client: Socket) {
		pongPrint(`NestJS pong pongLeaveGame: ${client.id}`);
		const sesh = findGameSessionByClientId(this.games, client.id);
		if (!sesh) {
			pongPrint(`NestJS pong pongLeaveGame: ${client.id} leaveGame listener !sesh`);
			return;
		}
		pongPrint(`NestJS pong pongLeaveGame: ${sesh.roomId}`);
		pongPrint(`NestJS pong pongLeaveGame: ${client.id} left room ${sesh.roomId}`);
		if (sesh.p1.clientid === client.id) {
			sesh.p2.score = MAX_SCORE;
		}
		else if (sesh.p2.clientid === client.id) {
			sesh.p1.score = MAX_SCORE;
		}
		this.games = removeGameSession(this.games, sesh.roomId);
		this.server.to(sesh.roomId).emit('pongLeaveGame', { sesh });
	}

	private checkQueue() {
		pongPrint(`NestJS pong checkQueue: checking queue`);
		if (this.queue.length < 2) {
			pongPrint('NestJS pong checkQueue: Not enough players in queue');
			return;
		}
	
		pongPrint('NestJS pong checkQueue: Found 2 players in queue');
		printQueue(this.queue);
		const p1 = this.queue.shift();
		const p2 = this.queue.shift();
		if (!p1 || !p2) {
			pongPrint('NestJS pong checkQueue: Could not find both players in queue');
			return;
		}
		pongPrint(`NestJS pong checkQueue: Found players ${p1.user.username} and ${p2.user.username}`);
		const roomId = `#pong_${p1.user.id}_${p2.user.id}`;
	
		const gameSession = fillGameSession(p1, p2, roomId);
		this.games.push(gameSession);
		printGameSession(gameSession);
		this.server.to(p1.clientId).emit('gameStart', { sesh: gameSession });
		this.server.to(p2.clientId).emit('gameStart', { sesh: gameSession });
	
		this.server.in(p1.clientId).socketsJoin(roomId);
		this.server.in(p2.clientId).socketsJoin(roomId);
		pongPrint(`NestJS pong checkQueue: Created room ${roomId} for players ${p1.user.id} and ${p2.user.id}`);
		printGames(this.games);
	}

	// ----------------- TEST SCORE INCREMENT -----------------
	@SubscribeMessage('testIncrement')
	handleTestIncrement(client: Socket) {
		pongPrint(`NestJS pong testIncrement : emit received from ${client.id}`);
		const sesh = findGameSessionByClientId(this.games, client.id);
		if (!sesh) {
			pongPrint(`NestJS pong testIncrement: ${client.id} testIncrement !sesh`);
			return;
		}
		if (sesh.p1.clientid === client.id) {
			sesh.p1.score += 1;
		}
		else if (sesh.p2.clientid === client.id) {
			sesh.p2.score += 1;
		}
		this.server.to(sesh.roomId).emit('testIncrement', { sesh });
	}
	// ----------------- TEST SCORE INCREMENT -----------------
}

