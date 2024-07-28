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

	private clients: { [key: string]: { order: number, username: string } } = {};
	private order: number = 1;
	private queue: string[] = [];

	handleConnection(client: Socket) {
		this.clients[client.id] = { order: this.order++, username: 'Unknown' };
		this.server.emit('pong', this.formatPong());
	}

	handleDisconnect(client: Socket) {
		delete this.clients[client.id];
		this.server.emit('pong', this.formatPong());
		this.handleLeaveQueue(client);
	}

	@SubscribeMessage('set-username')
	handleSetUsername(client: Socket, username: string) {
		if (this.clients[client.id]) {
			this.clients[client.id].username = username;
			this.server.emit('pong', this.formatPong());
		}
	}

	@SubscribeMessage('request-Pong')
	handleRequestPong(client: Socket) {
		client.emit('pong', this.formatPong());
	}

	@SubscribeMessage('join-queue')
	handleJoinQueue(client: Socket) {
		if (!this.queue.includes(client.id)) {
			this.queue.push(client.id);
			this.server.emit('queue-update', this.queue);
		}
	}

	@SubscribeMessage('leave-queue')
	handleLeaveQueue(client: Socket) {
		this.queue = this.queue.filter(id => id !== client.id);
		this.server.emit('queue-update', this.queue);
	}

	private formatPong() {
		return Object.entries(this.clients).map(([id, { order, username }]) => ({ id, order, username }));
	}
}

