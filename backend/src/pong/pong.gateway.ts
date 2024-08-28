import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MAX_SCORE, pongPrint, PongC } from './pong.constants';
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

		// Start the game loop for the new game session
		this.startGameLoop(gameSession);
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

	// ----------------- GAMESTATE UPDATE -----------------
	@SubscribeMessage('gameStateUpdate')
	handleGameStateUpdate(client: Socket, data: { sesh: GameSession }) {
		pongPrint(`NestJS pong gameStateUpdate : emit received from ${client.id}`);
		const sesh = findGameSessionByClientId(this.games, client.id);
		if (!sesh) {
			pongPrint(`NestJS pong gameStateUpdate: ${client.id} gameStateUpdate !sesh`);
			return;
		}
		sesh.ball = data.sesh.ball;

		this.server.to(sesh.roomId).emit('gameStateUpdate', { sesh });
	}
	// ----------------- GAMESTATE UPDATE -----------------

	private startGameLoop(gameSession: GameSession) {
		// Set up a game loop running at 60 FPS (1000 ms / 60 = ~16.67 ms)
		const intervalId = setInterval(() => {
			// Update the ball position based on its velocity
			gameSession.ball.x += gameSession.ball.speedX;
			gameSession.ball.y += gameSession.ball.speedY;
	
			// Check for collisions with the walls
			if (gameSession.ball.x <= 0 || gameSession.ball.x + gameSession.ball.width >= PongC.CANVAS_WIDTH) {
				gameSession.ball.speedX *= -1; // Reverse direction on X-axis
			}
			if (gameSession.ball.y <= 0 || gameSession.ball.y + gameSession.ball.height >= PongC.CANVAS_HEIGHT) {
				gameSession.ball.speedY *= -1; // Reverse direction on Y-axis
			}
	
			// Emit the updated game state to the clients
			this.server.to(gameSession.roomId).emit('gameStateUpdate', gameSession);
	
		}, 1000 / 60); // 60 FPS
	
		// Store the interval ID in the game session for future reference
		gameSession.intervalId = intervalId;
	}
	
	private stopGameLoop(gameSession: GameSession) {
		// Clear the interval when the game ends
		if (gameSession.intervalId) {
			clearInterval(gameSession.intervalId);
		}
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

		const paddleSpeed = 5; // Adjust the speed as needed
		if (data.direction === 'w') {
			paddle.y = Math.max(0, paddle.y - paddleSpeed); // Move up
		} else if (data.direction === 's') {
			paddle.y = Math.min(PongC.CANVAS_HEIGHT - paddle.height, paddle.y + paddleSpeed); // Move down
		}

		this.server.to(sesh.roomId).emit('gameStateUpdate', sesh);
	}

}

