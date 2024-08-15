import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*'} })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private channels = new Set<string>();
  private clients = new Set<string>();

  afterInit(server: Server) {
    this.server = server;
    console.log('Chat Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const username = client.handshake.query.username as string;

    console.log(`Username is: ${username}`);
    this.clients.add(client.id);
    client.join('@' + username);
    console.log(`Chat Client connected: ${client.id}`);
    console.log(args[1]);
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    console.log(`Chat Client disconnected: ${client.id}`);
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
      if (client.rooms.has(channel))   {
        client.emit('channelError', { message: 'Already joined channel' });
      } else {
        client.join(channel);
        client.emit('channelJoined', { channel: channel });
      }
    } else {
      client.join(channel);
      this.channels.add(channel);
      client.emit('channelCreated', { channel: channel });
      // client.emit('channelError', { message: 'Channel does not exist' });
    }
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(client: Socket, payload: {channel: string }) {
    const { channel } = payload;
    // IS THE CHANNEL EMPTY? -> DELETE CHANNEL
    if (this.channels.has(channel)) {
      client.leave(channel);
    }
  }

  @SubscribeMessage('joinDM')
  handleJoinDM(client: Socket, payload: { user: string, targetUser: string }) {
    const { user, targetUser } = payload;
    // ADD USER CHECK TO DATABASE
    // IS TARGETUSER BLOCKED?
    // DID TARGETUSER BLOCK YOU?
    // IS TARGETUSER ONLINE?
    client.emit('dmCreated', { dm: '@' + user + '@' + targetUser });
    // SEND EMIT TO OTHER USER USING THEIR USER ID
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, payload: { channel: string, message: string, username: string }) {
    const { channel, message, username } = payload;
    this.server.to(channel).emit('message', { channel, message, username });
  }
}

