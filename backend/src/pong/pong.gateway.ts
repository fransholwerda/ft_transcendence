import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MAX_SCORE, pongPrint } from './pong.constants';
import { PongC } from '../../shared/constants';
import { Ball, GameSession, Paddle, User } from './pong.types';
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
		this.leavingGame(client);
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

	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(client: Socket) {
		pongPrint(`NestJS pong: ${client.id} left the queue`);
		this.queue = removeFromQueue(this.queue, client.id);
	}
	private leavingGame(client: Socket) {
		pongPrint(`NestJS pong leaveGame: ${client.id}`);
		const sesh = findGameSessionByClientId(this.games, client.id);
		if (!sesh) {
			pongPrint(`NestJS pong leaveGame: ${client.id} leaveGame listener !sesh`);
			return;
		}
		pongPrint(`NestJS pong leaveGame: ${sesh.roomId}`);
		pongPrint(`NestJS pong leaveGame: ${client.id} left room ${sesh.roomId}`);
		
		// Update the score of the opponent
		if (sesh.p1.clientid === client.id) {
			sesh.p2.score = MAX_SCORE;
		} else if (sesh.p2.clientid === client.id) {
			sesh.p1.score = MAX_SCORE;
		}
		
		printGameSession(sesh);
		
		this.server.to(sesh.roomId).emit('gameEnd', { sesh });
		
		pongPrint(`NestJS pong leaveGame: after send`);
		// Remove the game session
		this.games = removeGameSession(this.games, sesh.roomId);
		pongPrint(`NestJS pong leaveGame: after remove`);
	}
	
	@SubscribeMessage('leaveGame')
	handleLeaveGame(client: Socket) {
		this.leavingGame(client);
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

	@SubscribeMessage('movePaddle')
	handleMovePaddle(client: Socket, data: { direction: string  }) {
		const sesh = findGameSessionByClientId(this.games, client.id);
		if (!sesh) return;
		let paddle;
		if (sesh.p1.clientid === client.id) {
			paddle = sesh.p1.paddle;
		} else if (sesh.p2.clientid === client.id) {
			paddle = sesh.p2.paddle;
		}
		if (!paddle) return;
		const paddleSpeed = 20;
		if (data.direction === 'w') {
			paddle.y = Math.max(0, paddle.y - paddleSpeed); // Move up
		} else if (data.direction === 's') {
			paddle.y = Math.min(PongC.CANVAS_HEIGHT - paddle.height, paddle.y + paddleSpeed); // Move down
		}
	}

	private paddleCollision(p: Paddle, b: Ball) {
		if (b.x < p.x + p.width &&
			b.x + b.width > p.x &&
			b.y < p.y + p.height &&
			b.y + b.height > p.y) {
			return true;
		}
		return false;
	}

	@SubscribeMessage('requestGameUpdate')
	handleRequestGameUpdate(client: Socket) {
		pongPrint(`NestJS pong: ${client.id}: requested game update`);
		const sesh = findGameSessionByClientId(this.games, client.id);
		if (!sesh) {
			pongPrint(`NestJS pong: ${client.id}: cant find game for request`);
			return;
		}
		if (sesh.p1.score === MAX_SCORE || sesh.p2.score === MAX_SCORE) {
			pongPrint(`NestJS pong: ${client.id}: game ended`);
			this.server.to(sesh.roomId).emit('gameEnd', { sesh });
			this.games = removeGameSession(this.games, sesh.roomId);
			return;
		}
		sesh.ball.x += sesh.ball.speedX;
		sesh.ball.y += sesh.ball.speedY;
		if (sesh.ball.x <= 0) {
			sesh.p2.score++;
			sesh.ball.x = PongC.CANVAS_WIDTH / 2;
			sesh.ball.y = PongC.CANVAS_HEIGHT / 2;
		}
		else if (sesh.ball.x + sesh.ball.width >= PongC.CANVAS_WIDTH) {
			sesh.p1.score++;
			sesh.ball.x = PongC.CANVAS_WIDTH / 2;
			sesh.ball.y = PongC.CANVAS_HEIGHT / 2;
		}
		if (sesh.ball.y <= 0 || sesh.ball.y + sesh.ball.height >= PongC.CANVAS_HEIGHT) {
			sesh.ball.speedY *= -1;
		}
		// Check collision with paddles
		if (sesh.ball.speedX < 0 && this.paddleCollision(sesh.p1.paddle, sesh.ball)) {
			sesh.ball.speedX *= -1;
		}
		else if (sesh.ball.speedX > 0 && this.paddleCollision(sesh.p2.paddle, sesh.ball)) {
			sesh.ball.speedX *= -1;
		}
		this.server.to(sesh.roomId).emit('gameUpdate', { sesh: sesh });
	}
}
