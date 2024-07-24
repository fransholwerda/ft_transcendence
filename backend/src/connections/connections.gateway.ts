import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/connections', cors: { origin: '*' } })
export class ConnectionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: { [key: string]: number } = {};
  private order: number = 1;

  handleConnection(client: Socket) {
    this.clients[client.id] = this.order++;
    this.server.emit('connections', this.formatConnections());
  }

  handleDisconnect(client: Socket) {
    delete this.clients[client.id];
    this.server.emit('connections', this.formatConnections());
  }

  @SubscribeMessage('request-connections')
  handleRequestConnections(client: Socket) {
    client.emit('connections', this.formatConnections());
  }

  private formatConnections() {
    return Object.entries(this.clients).map(([id, order]) => ({ id, order }));
  }
}
