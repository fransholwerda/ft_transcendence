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

    private clients: { [key: string]: number } = {};
    private order: number = 1;
    private queue: string[] = []; // Queue property to keep track of clients in the queue

    handleConnection(client: Socket) {
        this.clients[client.id] = this.order++;
        this.server.emit('pong', this.formatPong());
    }

    handleDisconnect(client: Socket) {
        delete this.clients[client.id];
        this.server.emit('pong', this.formatPong());
        this.handleLeaveQueue(client); // Remove from queue on disconnect
    }

    @SubscribeMessage('request-Pong')
    handleRequestPong(client: Socket) {
        client.emit('pong', this.formatPong());
    }

    @SubscribeMessage('join-queue') // Handler for clients joining the queue
    handleJoinQueue(client: Socket) {
        if (!this.queue.includes(client.id)) {
            this.queue.push(client.id);
            this.server.emit('queue-update', this.queue); // Emit updated queue to all clients
        }
    }

    @SubscribeMessage('leave-queue') // Handler for clients leaving the queue
    handleLeaveQueue(client: Socket) {
        this.queue = this.queue.filter(id => id !== client.id);
        this.server.emit('queue-update', this.queue); // Emit updated queue to all clients
    }

    private formatPong() {
        return Object.entries(this.clients).map(([id, order]) => ({ id, order }));
    }
}

