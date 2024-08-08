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

	private queue: { clientId: string, username: string }[] = [];
	private rooms: Map<string, string[]> = new Map();

	handleConnection(client: Socket) {
		console.log(`Pong Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Pong Client disconnected: ${client.id}`);
		this.removeFromQueue(client.id);
		this.removeFromRoom(client.id);
	}

	@SubscribeMessage('joinQueue')
	handleJoinQueue(client: Socket, data: { username: string }) {
		console.log(`Trying to join queue, now is at ${this.queue.length}`);
		if (!this.queue.find((q) => q.username === data.username)) {
			this.queue.push({ clientId: client.id, username: data.username });
			this.checkQueue();
			console.log(`Pong Client: ${client.id} with name ${data.username} joined queue`);
		} else {
			console.log(`Pong Client: ${data.username} is already in queue`);
		}
	}

	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(client: Socket) {
		console.log(`Pong Client: ${client.id} left queue`);
		this.removeFromQueue(client.id);
	}

	@SubscribeMessage('leaveGame')
	handleLeaveGame(client: Socket) {
		console.log(`Pong Client: ${client.id} left game`);
		const roomId = this.getRoomIdByClientId(client.id);
		if (roomId) {
			this.server.to(roomId).emit('opponentLeft');
			this.removeFromRoom(client.id);
		}
	}

	private checkQueue() {
		console.log(`Queue length: ${this.queue.length}`);
		if (this.queue.length >= 2) {
			const p1 = this.queue.shift();
			const p2 = this.queue.shift();
			if (!p1 || !p2) return; // Safety check
			const roomId = `pong_${p1.clientId}_${p2.clientId}`;

			this.rooms.set(roomId, [p1.clientId, p2.clientId]);

			this.server.to(p1.clientId).emit('gameStart', { roomId, opponent: p2.username });
			this.server.to(p2.clientId).emit('gameStart', { roomId, opponent: p1.username });

			this.server.in(p1.clientId).socketsJoin(roomId);
			this.server.in(p2.clientId).socketsJoin(roomId);
			console.log(`Pong Game started: ${roomId}`);
			console.log(`Pong Game players: ${p1.username} vs ${p2.username}`);
		}
	}

	private removeFromQueue(clientId: string) {
		console.log(`removeFromQueue: ${clientId}`);
		this.queue = this.queue.filter((q) => q.clientId !== clientId);
	}

	private removeFromRoom(clientId: string) {
		console.log(`removeFromRoom: ${clientId}`);
		for (const [roomId, players] of this.rooms.entries()) {
			if (players.includes(clientId)) {
				this.rooms.delete(roomId);
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
		console.log(`getRoomIdByClientId: ${clientId}`);
		for (const [roomId, players] of this.rooms.entries()) {
			if (players.includes(clientId)) {
				return roomId;
			}
		}
		return null;
	}
}
