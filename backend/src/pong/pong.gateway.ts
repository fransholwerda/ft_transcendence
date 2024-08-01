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

@WebSocketGateway({ namespace: '/pongtest', cors: { origin: '*' } })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private queue: string[] = [];
	private rooms: Map<string, string[]> = new Map();

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		this.removeFromQueue(client.id);
		this.removeFromRoom(client.id);
	}

	@SubscribeMessage('joinQueue')
	handleJoinQueue(client: Socket) {
		if (!this.queue.includes(client.id)) {
			this.queue.push(client.id);
			this.checkQueue();
		}
	}

	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(client: Socket) {
		this.removeFromQueue(client.id);
	}

	private checkQueue() {
		if (this.queue.length >= 2) {
			const p1 = this.queue.shift();
			const p2 = this.queue.shift();
			const roomId = `pong_${p1}_${p2}`;

			this.rooms.set(roomId, [p1, p2]);

			this.server.to(p1).emit('gameStart', { roomId, opponent: p2 });
			this.server.to(p2).emit('gameStart', { roomId, opponent: p1 });

			this.server.in(p1).socketsJoin(roomId);
			this.server.in(p2).socketsJoin(roomId);
		}
	}

	private removeFromQueue(clientId: string) {
		this.queue = this.queue.filter(id => id !== clientId);
	}

	private removeFromRoom(clientId: string) {
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
}