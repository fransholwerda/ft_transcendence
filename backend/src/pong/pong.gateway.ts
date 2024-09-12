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

import { MatchService } from '../matches/matches.service';
import { MatchModule } from '../matches/matches.module';
import { sign } from 'crypto';

@WebSocketGateway({ namespace: '/ft_transcendence', cors: { origin: '*' } })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private queue: { clientId: string, user: User, gameMode: string }[] = [];	
	private games: GameSession[] = [];

	constructor(private readonly matchService: MatchService) {}

	private async sendCreateMatch(sesh: GameSession) {
		const createMatchDto = {
			player1: sesh.p1.username,
			player1ID: Number(sesh.p1.userid),
			player1Score: sesh.p1.score,
			player2: sesh.p2.username,
			player2ID: Number(sesh.p2.userid),
			player2Score: sesh.p2.score,
			winner: sesh.p1.score === MAX_SCORE ? sesh.p1.userid : sesh.p2.userid
		};
		await this.matchService.createNewMatch(createMatchDto);
	}

	private async gameEnd(sesh: GameSession) {
		pongPrint(`NestJS pong: gameEnd: ${sesh.roomId}`);
		this.sendCreateMatch(sesh);
		this.server.to(sesh.roomId).emit('gameEnd', { sesh });
		this.games = removeGameSession(this.games, sesh.roomId);
	}

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
	handleJoinQueue(client: Socket, data: { user: User, gameMode: string }) {
		pongPrint(`NestJS pong: ${client.id} : ${data.user.id} trying to join queue`);
		if (isUserInGame(this.games, data.user.id)) {
			pongPrint(`NestJS pong: ${client.id} : ${data.user.id} is already in a game`);
			client.emit('queueStatus', { success: false, message: 'You are already in a game.' });
		}
		else if (!this.queue.find((q) => q.user.id === data.user.id)) {
			pongPrint(`NestJS pong: ${client.id} : ${data.user.id} could not find in queue`);
			this.queue.push({ clientId: client.id, user: data.user, gameMode: data.gameMode });
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
		if (sesh.p1.clientid === client.id) {
			sesh.p2.score = MAX_SCORE;
		} else if (sesh.p2.clientid === client.id) {
			sesh.p1.score = MAX_SCORE;
		}
		printGameSession(sesh);
		this.gameEnd(sesh);
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
		pongPrint('NestJS pong checkQueue: checking for two players of same gameMode');
		printQueue(this.queue);
		let p1, p2;
		let isCustom = false;
		const defaultQueue = this.queue.filter((q) => q.gameMode === 'default');
		const customQueue = this.queue.filter((q) => q.gameMode === 'Speed Surge');
		if (defaultQueue.length >= 2) {
			console.log('NestJS pong checkQueue: Found 2 default players');
			p1 = defaultQueue.shift();
			p2 = defaultQueue.shift();
		}
		else if (customQueue.length >= 2) {
			console.log('NestJS pong checkQueue: Found 2 custom players');
			p1 = customQueue.shift();
			p2 = customQueue.shift();
			isCustom = true;
		}
		else {
			console.log('NestJS pong checkQueue: Not enough players of same gameMode');
			return;
		}
		if (!p1 || !p2) return;
		this.queue = this.queue.filter((q) => q !== p1 && q !== p2);
		const roomId = `#pong_${p1.user.id}_${p2.user.id}`;
		const gameSession = fillGameSession(p1, p2, roomId, isCustom);
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
		if (data.direction === 'w') {
			paddle.y = Math.max(0, paddle.y - paddle.speed);
		} else if (data.direction === 's') {
			paddle.y = Math.min(PongC.CANVAS_HEIGHT - paddle.height, paddle.y + paddle.speed);
		}
	}

	private paddleCollisionPercentage(p: Paddle, b: Ball): number | null {
		const ballCenterY = b.y + b.height / 2;
		const paddleTopY = p.y;
		const paddleBottomY = p.y + p.height;
	
		if (b.x < p.x + p.width &&
			b.x + b.width > p.x &&
			b.y < p.y + p.height &&
			b.y + b.height > p.y) {
			
			const relativeY = ballCenterY - paddleTopY;
			const percentage = (relativeY / p.height) * 100;
			return Math.round(percentage);
		}
		return null;
	}

	private modifyBallSpeed(b: Ball, collisionPercentage: number) {
		let absSpeedX = Math.abs(b.speedX);
		let absSpeedY = Math.abs(b.speedY);
		let signY = Math.sign(b.speedY);
		let signX = Math.sign(b.speedX);
		let speedDistance = Math.sqrt(absSpeedX ** 2 + absSpeedY ** 2);

		if (collisionPercentage >= 34 && collisionPercentage <= 66) { // middle
			console.log('Ball hit paddle in the middle, no change in speed');
			return;
		}
		else if (collisionPercentage < 34) { // top
			console.log('Ball hit paddle near the top');
			if (signY === -1) { // moving up
				b.speedY = absSpeedX * 3;
			}
			else { // moving down
				b.speedY = absSpeedX / 3;
			}
		}
		else if (collisionPercentage > 66) { // bottom
			console.log('Ball hit paddle near the bottom');
			if (signY === -1) { // moving up
				b.speedY = absSpeedX / 3;
			}
			else { // moving down
				b.speedY = absSpeedX * 3;
			}
		}
		b.speedX = Math.sqrt(speedDistance ** 2 - b.speedY ** 2) * signX;
		b.speedY *= signY;
	}

	private paddleBounce(p: Paddle, b: Ball, sign: number) {
		let collisionPercentage = this.paddleCollisionPercentage(p, b);
		if (collisionPercentage !== null) {
			console.log(`Ball hit at ${b.x} ${b.y}`);
			console.log(`Ball hit paddle at ${collisionPercentage}% from the top`);
			console.log(`before SpeedX: ${b.speedX} SpeedY: ${b.speedY}`);
			if (sign === -1) b.x = p.x + p.width;
			else b.x = p.x - b.width;
			b.speedX *= -1;
			if (collisionPercentage < 0) collisionPercentage = 0;
			if (collisionPercentage > 100) collisionPercentage = 100;
			this.modifyBallSpeed(b, collisionPercentage);
			console.log(`after SpeedX: ${b.speedX} SpeedY: ${b.speedY}`);
		}
	}

	@SubscribeMessage('requestGameUpdate')
	handleRequestGameUpdate(client: Socket) {
		// pongPrint(`NestJS pong: ${client.id}: requested game update`);
		const sesh = findGameSessionByClientId(this.games, client.id);
		if (!sesh) {
			pongPrint(`NestJS pong: ${client.id}: cant find game for request`);
			return;
		}
		if (sesh.p1.score === MAX_SCORE || sesh.p2.score === MAX_SCORE) {
			this.gameEnd(sesh);
			return;
		}
		// get latest time and time since last update
		const now = Date.now();
		const deltaTime = (now - sesh.lastUpdateTime) / 1000;
		sesh.lastUpdateTime = now;
		// Update time since last score
		sesh.timeSinceLastScore += deltaTime;
		if (sesh.timeSinceLastScore < sesh.ballDelay) {
			sesh.ball.x = PongC.CANVAS_WIDTH / 2;
			sesh.ball.y = PongC.CANVAS_HEIGHT / 2;
			sesh.ball.speedX = PongC.BALL_SPEEDX * Math.sign(sesh.ball.speedX);
			sesh.ball.speedY = PongC.BALL_SPEEDY * Math.sign(sesh.ball.speedY);
			this.server.to(sesh.roomId).emit('gameUpdate', { sesh: sesh });
			return;
		}
		if (sesh.isCustom) {
			// Increase ball speed over time
			const BALL_ACCELERATION = 20;
			sesh.ball.speedX += BALL_ACCELERATION * deltaTime * Math.sign(sesh.ball.speedX);
			sesh.ball.speedY += BALL_ACCELERATION * deltaTime * Math.sign(sesh.ball.speedY);
			if (sesh.ball.speedX > PongC.BALL_MAX_SPEEDX) {
				sesh.ball.speedX = PongC.BALL_MAX_SPEEDX;
			}
			else if (sesh.ball.speedX < -PongC.BALL_MAX_SPEEDX) {
				sesh.ball.speedX = -PongC.BALL_MAX_SPEEDX;
			}
			if (sesh.ball.speedY > PongC.BALL_MAX_SPEEDY) {
				sesh.ball.speedY = PongC.BALL_MAX_SPEEDY;
			}
			else if (sesh.ball.speedY < -PongC.BALL_MAX_SPEEDY) {
				sesh.ball.speedY = -PongC.BALL_MAX_SPEEDY;
			}
		}
		// console.log(`speedX: ${sesh.ball.speedX}, speedY: ${sesh.ball.speedY}`);
		sesh.ball.x += sesh.ball.speedX * deltaTime;
		sesh.ball.y += sesh.ball.speedY * deltaTime;
		if (sesh.ball.x <= 0) {
			console.log(`${sesh.p2.username} scored`);
			sesh.p2.score++;
			sesh.timeSinceLastScore = 0;
		}
		else if (sesh.ball.x + sesh.ball.width >= PongC.CANVAS_WIDTH) {
			console.log(`${sesh.p1.username} scored`);
			sesh.p1.score++;
			sesh.timeSinceLastScore = 0;
		}
		if (sesh.ball.y <= 0) {
			sesh.ball.speedY *= -1;
			let diff = sesh.ball.y * -1;
			sesh.ball.y = 0 + diff;
		}
		else if (sesh.ball.y + sesh.ball.height >= PongC.CANVAS_HEIGHT) {
			sesh.ball.speedY *= -1;
			let diff = (sesh.ball.y + sesh.ball.height) - PongC.CANVAS_HEIGHT;
			sesh.ball.y = PongC.CANVAS_HEIGHT - sesh.ball.height - diff;
		}
		if (sesh.ball.speedX < 0) {
			this.paddleBounce(sesh.p1.paddle, sesh.ball, -1);
		} 
		else if (sesh.ball.speedX > 0) {
			this.paddleBounce(sesh.p2.paddle, sesh.ball, 1);
		}
		this.server.to(sesh.roomId).emit('gameUpdate', { sesh: sesh });
	}
}
