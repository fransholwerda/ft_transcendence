import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatUser, ChatRoom } from './chat.types'

@WebSocketGateway({ namespace: '/ft_transcendence', cors: { origin: '*'} })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private rooms = new Set<string>();
  private clients = new Set<string>();
  private ChatUsers = new Map<string, ChatUser>();
  private ChatRooms = new Map<string, ChatRoom>();

  afterInit(server: Server) {
    this.server = server;
    console.log('NestJS Chat Gateway Init');
  }

// CHECK THIS OUT FOR PROPER SECURITY https://github.com/Bde-meij/Codam_Transcendence/blob/development/api/src/game/game.gateway.ts
// async handleConnection(client: Socket)
// 	{
// 		try 
// 		{
// 			// console.log("Game connection: " + client.id);
// 			var cookies = client.handshake.headers.cookie?.split('; ');
// 			if (!cookies)
// 				throw new NotAcceptableException();
// 			var token: string;
// 			for (var cookie of cookies)
// 			{
// 				var [key, value] = cookie.split('=');
// 				if (key === 'access_token')
// 				{
// 					token = value;
// 					break;
// 				}
// 			}
// 			if (!token)
// 				throw new NotAcceptableException();
// 			var payload = await this.authService.verifyJwtAccessToken(token);
// 			var user = await this.userService.findUserById(payload.id);
// 			if (!user)
// 				throw new NotAcceptableException();
// 			client.data.userid = user.id;
// 			client.data.nick = user.nickname;
// 			client.data.key = user.roomKey;
// 			await this.userService.updateStatus(client.data.userid, "in game");

// 			client.emit("connectSignal");
// 		}
// 		catch
// 		{
// 			// console.log(client.id, "Game connection refused"); 
// 			client.disconnect();
// 			return;
// 		}
// 	}

  handleConnection(client: Socket, ...args: any[]) {
    const username = client.handshake.query.username as string;

    console.log(`NestJS Chat Gateway Username is: ${username}`);
    this.clients.add(client.id);
    client.join('@' + username);
    if (!this.rooms.has('@' + username))
      this.rooms.add('@' + username);
    console.log(`NestJS Chat Gateway Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(client.rooms.has("abc"));
    this.clients.delete(client.id);
    console.log(`NestJS Chat Gateway Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, payload: { userId: string, username: string }) {
    // Username validation?
    const { userId, username } = payload;
    if (!this.ChatUsers.has(userId)) {
      // User is connecting for the first time
      this.ChatUsers.set(userId, new ChatUser(userId, username));
    }
    const user = this.ChatUsers.get(userId);
    if (user) {
        user.addClientID(client.id);
    }
    client.join('@' + username);
    client.emit('chatJoined');
  }

  @SubscribeMessage('createChannel')
  handleCreateChannel(client: Socket, payload: { channel: string }) {
    const { channel } = payload;
    if (this.rooms.has(channel)) {
      client.emit('chatError', { message: 'Channel already exists' });
    } else {
      this.rooms.add(channel);
      client.join(channel);
      client.emit('channelCreated', { channel });
    }
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket, payload: { channel: string }) {
    const { channel } = payload;
    // DOES CHANNEL EXIST WITH PASSWORD?
    // DOES CHANNEL EXIST AS PRIVATE AND INVITE ONLY?
    if (this.rooms.has(channel)) {
      if (client.rooms.has(channel))   {
        client.emit('chatError', { message: 'Already joined channel' });
      } else {
        client.join(channel);
        client.emit('channelJoined', { channel: channel });
      }
    } else {
      client.join(channel);
      this.rooms.add(channel);
      client.emit('channelCreated', { channel: channel });
    }
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(client: Socket, payload: { channel: string }) {
    const { channel } = payload;
    // IS THE CHANNEL EMPTY? -> DELETE CHANNEL
    if (this.rooms.has(channel)) {
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
    // if (this.server.sockets.adapter.rooms.has('@' + targetUser)) {
    this.server.to('@' + user).emit('dmCreated', { dm: '@' + targetUser });
    // SEND EMIT TO OTHER USER USING THEIR USER ID
  }

  // LOOK AT https://github.com/Bde-meij/Codam_Transcendence/blob/development/api/src/chat/chatRoom.dto.ts#L98
  // @UseFilters(WsExceptionFilter)
  @UsePipes(new ValidationPipe({ transform: true }))
  @SubscribeMessage('sendMessage')
  // @MessageBody() data: messageDto,
  handleMessage(client: Socket, payload: { channel: string, message: string, username: string }) {
    const { channel, message, username } = payload;
    if ( channel[0] === '@' ) {
      this.server.to('@' + username).emit('dmJoined', { dm: channel });
      this.server.to('@' + username).emit('message', { channel, message, username });
      this.server.to(channel).emit('dmJoined', { dm: '@' + username });
      this.server.to(channel).emit('message', { channel: '@' + username, message, username })
    } else {
      this.server.to(channel).emit('message', { channel, message, username })
    }
  }
}

