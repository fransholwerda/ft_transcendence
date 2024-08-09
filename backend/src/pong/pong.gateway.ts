// SubcribeMessage functionalilty: https://docs.nestjs.com/websockets/gateways#subscribing-to-messages
import { SubscribeMessage } from '@nestjs/websockets';
// WebSocketGateway functionality: https://docs.nestjs.com/websockets/gateways
import { WebSocketGateway } from '@nestjs/websockets';
// WebSocketServer functionality: https://docs.nestjs.com/websockets/gateways#server
import { WebSocketServer } from '@nestjs/websockets';
// OnGatewayConnection functionality: https://docs.nestjs.com/websockets/gateways#onconnection
import { OnGatewayConnection } from '@nestjs/websockets';
// OnGatewayDisconnect functionality: https://docs.nestjs.com/websockets/gateways#ondisconnect
import { OnGatewayDisconnect } from '@nestjs/websockets';
// Server functionality: https://socket.io/docs/v4/server-api/#Server
import { Server } from 'socket.io';
// Socket functionality: https://socket.io/docs/v4/server-api/#Socket
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/pong', cors: { origin: '*' } })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private queue: { clientId: string, userId: string }[] = [];
	private rooms: Map<string, string[]> = new Map();
	// Maps userId to roomId
	private userRoomMap: Map<string, string> = new Map();

	handleConnection(client: Socket) {
		console.log(`Pong Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Pong Client disconnected: ${client.id}`);
		this.removeFromQueue(client.id);
		this.removeFromRoom(client.id);
	}

	@SubscribeMessage('joinQueue')
	handleJoinQueue(client: Socket, data: { userId: string }) {
		if (this.isUserInGame(data.userId)) {
			console.log(`Pong Client: ${client.id} with userId ${data.userId} is already in a game`);
			client.emit('queueStatus', { success: false, message: 'You are already in a game.' });
			return;
		}

		if (!this.queue.find((q) => q.userId === data.userId)) {
			this.queue.push({ clientId: client.id, userId: data.userId });
			this.checkQueue();
			client.emit('queueStatus', { success: true });
		} else {
			client.emit('queueStatus', { success: false, message: 'You are already in the queue.' });
		}
	}

	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(client: Socket) {
		this.removeFromQueue(client.id);
	}

	@SubscribeMessage('leaveGame')
	handleLeaveGame(client: Socket) {
		const roomId = this.getRoomIdByClientId(client.id);
		if (roomId) {
			this.server.to(roomId).emit('opponentLeft');
			this.removeFromRoom(client.id);
		}
	}

	private checkQueue() {
		console.log('Checking queue');
		if (this.queue.length >= 2) {
			console.log('Found 2 players in queue');
			const p1 = this.queue.shift();
			const p2 = this.queue.shift();
			if (!p1 || !p2) return; // Safety check
			const roomId = `pong_${p1.userId}_${p2.userId}`;

			this.rooms.set(roomId, [p1.clientId, p2.clientId]);
			this.userRoomMap.set(p1.userId, roomId);
			this.userRoomMap.set(p2.userId, roomId);

			this.server.to(p1.clientId).emit('gameStart', { roomId, opponent: p2.userId });
			this.server.to(p2.clientId).emit('gameStart', { roomId, opponent: p1.userId });

			this.server.in(p1.clientId).socketsJoin(roomId);
			this.server.in(p2.clientId).socketsJoin(roomId);
			console.log(`Created room ${roomId} for players ${p1.userId} and ${p2.userId}`);
		}
	}

	private removeFromQueue(clientId: string) {
		console.log(`Removing client ${clientId} from queue`);
		this.queue = this.queue.filter((q) => q.clientId !== clientId);
	}

	private removeFromRoom(clientId: string) {
		console.log(`Removing client ${clientId} from room`);		
		for (const [roomId, players] of this.rooms.entries()) {
			if (players.includes(clientId)) {
				this.rooms.delete(roomId);
				const userId = [...this.userRoomMap.entries()]
					.find(([, id]) => id === roomId)?.[0];

				if (userId) {
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
		for (const [roomId, players] of this.rooms.entries()) {
			if (players.includes(clientId)) {
				return roomId;
			}
		}
		return null;
	}

	private isUserInGame(userId: string): boolean {
		return this.userRoomMap.has(userId);
	}
}
