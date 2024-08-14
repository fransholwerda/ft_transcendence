import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// interface player {
// 	clientid: string;
// 	userid: string;
// 	username: string;
// 	score: number;
// }

// interface GameSession {
// 	p1: player;
// 	p2: player;
// }

interface User {
	id:  string,
	username: string,
	avatarURL: string
}

@WebSocketGateway({ namespace: '/pong', cors: { origin: '*' } })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private queue: { clientId: string, userId: string }[] = [];
	private rooms: Map<string, string[]> = new Map();
	// Maps userId to roomId
	private userRoomMap: Map<string, string> = new Map();
	
	// array of active games
	// private games: GameSession[] = [];

	handleConnection(client: Socket) {
		console.log(`NestJS pong: connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`NestJS pong: disconnected: ${client.id}`);
		this.removeFromQueue(client.id);
		this.removeFromRoom(client.id);
	}

	@SubscribeMessage('joinQueue')
	handleJoinQueue(client: Socket, data: { user: User }) {
		console.log(`NestJS pong: ${client.id} : ${data.user.id} trying to join queue`);
		if (this.isUserInGame(data.user.id)) {
			console.log(`NestJS pong:: ${client.id} : ${data.user.id} is already in a game`);
			client.emit('queueStatus', { success: false, message: 'You are already in a game.' });
		}
		else if (!this.queue.find((q) => q.userId === data.user.id)) {
			console.log(`NestJS pong:: ${client.id} : ${data.user.id} could not find in queue`);
			this.queue.push({ clientId: client.id, userId: data.user.id });
			this.checkQueue();
			client.emit('queueStatus', { success: true, message: 'Successfully joined the queue.' });
		}
		else {
			console.log(`NestJS pong: ${client.id} : ${data.user.id} is already in the queue`);
			client.emit('queueStatus', { success: false, message: 'You are already in the queue.' });
		}
	}

	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(client: Socket) {
		console.log(`NestJS pong: ${client.id} left the queue`);
		this.removeFromQueue(client.id);
	}

	@SubscribeMessage('leaveGame')
	handleLeaveGame(client: Socket) {
		console.log(`NestJS pong: ${client.id} left the game`);
		const roomId = this.getRoomIdByClientId(client.id);
		console.log(`Room ID: ${roomId}`);
		if (roomId) {
			console.log(`NestJS pong: ${client.id} left the game room ${roomId}`);
			this.server.to(roomId).emit('opponentLeft');
			this.removeFromRoom(client.id);
		}
		// Ensure the user is removed from the userRoomMap
		const userId = this.getUserIdByClientId(client.id);
		if (userId) {
			console.log(`NestJS pong: ${client.id} deleting user ${userId} from userRoomMap`);
			this.userRoomMap.delete(userId);
		}
	}

	private getUserIdByClientId(clientId: string): string | null {
		console.log(`NestJS pong: ${clientId} getting user ID by client ID`);
		for (const [userId, roomId] of this.userRoomMap.entries()) {
			const players = this.rooms.get(roomId);
			if (players && players.includes(clientId)) {
				console.log(`NestJS pong: ${clientId} found user ID ${userId} by client ID`);
				return userId;
			}
		}
		console.log(`NestJS pong: ${clientId} could not find user ID by client ID`);
		return null;
	}

	private checkQueue() {
		console.log(`NestJS pong: checking queue`);
		if (this.queue.length >= 2) {
			console.log('NestJS pong: Found 2 players in queue');
			const p1 = this.queue.shift();
			const p2 = this.queue.shift();
			if (!p1 || !p2) {
				console.log('NestJS pong: Could not find both players in queue');	
				return;
			}
			const roomId = `pong_${p1.userId}_${p2.userId}`;

			this.rooms.set(roomId, [p1.clientId, p2.clientId]);
			this.userRoomMap.set(p1.userId, roomId);
			this.userRoomMap.set(p2.userId, roomId);

			// update games array here
			// give them the stuff for the game session
			this.server.to(p1.clientId).emit('gameStart', { roomId, opponent: p2.userId });
			this.server.to(p2.clientId).emit('gameStart', { roomId, opponent: p1.userId });

			this.server.in(p1.clientId).socketsJoin(roomId);
			this.server.in(p2.clientId).socketsJoin(roomId);
			console.log(`NestJS pong: Created room ${roomId} for players ${p1.userId} and ${p2.userId}`);
		}
	}

	private removeFromQueue(clientId: string) {
		console.log(`NestJS pong: ${clientId} removing client from queue`);
		this.queue = this.queue.filter((q) => q.clientId !== clientId);
	}

	private removeFromRoom(clientId: string) {
		console.log(`NestJS pong: ${clientId} removing client from room`);
		for (const [roomId, players] of this.rooms.entries()) {
			if (players.includes(clientId)) {
				this.rooms.delete(roomId);
				const userId = [...this.userRoomMap.entries()]
					.find(([, id]) => id === roomId)?.[0];

				if (userId) {
					console.log(`NestJS pong: ${clientId} deleting user ${userId} from userRoomMap`);
					this.userRoomMap.delete(userId);
				}

				players.forEach(playerId => {
					if (playerId !== clientId) {
						this.server.to(playerId).emit('opponentLeft');
					}
				});
				break;
			}
		}
	}

	private getRoomIdByClientId(clientId: string): string | null {
		console.log(`NestJS pong: Getting room ID for client ${clientId}`);
		for (const [roomId, players] of this.rooms.entries()) {
			if (players.includes(clientId)) {
				console.log(`NestJS pong: Found room ID ${roomId} for client ${clientId}`);
				return roomId;
			}
		}
		console.log(`NestJS pong: Could not find room ID for client ${clientId}`);
		return null;
	}

	private isUserInGame(userId: string): boolean {
		console.log(`Checking if user ${userId} is in a game`);
		// get the room
		const roomId = this.userRoomMap.get(userId);
		// check how many players are in the room
		const players = this.rooms.get(roomId);
		// if there are two players in the room, the user is in a game
		console.log(`User ${userId} is in a game: ${players && players.length === 2}`);
		return players && players.length === 2;
	}
}
