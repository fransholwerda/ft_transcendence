// import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Server } from 'socket.io';

// @WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
// export class ChatGateway {
//   @WebSocketServer()
//   server: Server;

//   @SubscribeMessage('message')
//   handleMessage(@MessageBody() message: string): void {
//     this.server.emit('message', message);
//   }
// }

import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*'} })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private channels = new Set<string>();
  private clients = new Set<string>();

  afterInit(server: Server) {
    console.log('ChatInit');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.clients.add(client.id);
    console.log(`ChatClient connected: ${client.id}`);
    console.log(args[1]);
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    console.log(`ChatClient disconnected: ${client.id}`);
  }

  @SubscribeMessage('username')
  handleUserName(client: Socket, payload: { username: string }) {
    const { username } = payload;
    console.log(username);
  }

  @SubscribeMessage('createChannel')
  handleCreateChannel(client: Socket, payload: { channel: string }) {
    const { channel } = payload;
    if (this.channels.has(channel)) {
      client.emit('channelError', { message: 'Channel already exists' });
    } else {
      this.channels.add(channel);
      client.join(channel);
      client.emit('channelCreated', { channel });
    }
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket, payload: { channel: string }) {
    const { channel } = payload;
    // DOES CHANNEL EXIST WITH PASSWORD?
    // DOES CHANNEL EXIST AS PRIVATE AND INVITE ONLY?
    if (this.channels.has(channel)) {
      client.join(channel);
      client.emit('channelJoined', { channel: "#" + channel });
    } else {
      client.join(channel);
      client.emit('channelCreated', { channel: "#" + channel });
      // client.emit('channelError', { message: 'Channel does not exist' });
    }
  }

  @SubscribeMessage('joinDM')
  handleJoinDM(client: Socket, payload: { user: string, targetUser: string }) {
    const { user, targetUser } = payload;
    // ADD USER CHECK TO DATABASE
    // IS TARGETUSER BLOCKED?
    // DID TARGETUSER BLOCK YOU?
    // IS TARGETUSER ONLINE?
    client.emit('dmCreated', { dm: targetUser });
    // SEND EMIT TO OTHER USER USING THEIR USER ID
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, payload: { channel: string, message: string, username: string }) {
    const { channel, message, username } = payload;
    this.server.to(channel).emit('message', { channel, message, username });
  }
}

