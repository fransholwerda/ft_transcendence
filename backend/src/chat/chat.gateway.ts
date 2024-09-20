import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatUser, ChatRoom } from './chat.types'
import { ChatRoomEnum, ChannelType, ActionType } from './chat.enum';
import { JoinChatDto, SendMessageDto } from './chat.dto';
import { WsValidationExceptionFilter } from './exception';

@WebSocketGateway({ namespace: '/ft_transcendence', cors: { origin: '*'} })
@UseFilters(new WsValidationExceptionFilter())
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private ChatUsers = new Map<string, ChatUser>();
  private ChatRooms = new Map<string, ChatRoom>();
  private SocketUsernames = new Map<string, string>();
  private ClientIDSockets = new Map<string, Socket>();

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
    // this.clients.add(client.id);
    // client.join('@' + username);
    // if (!this.rooms.has('@' + username))
    //   this.rooms.add('@' + username);
    this.ClientIDSockets.set(client.id, client);
    console.log(`NestJS Chat Gateway Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`NestJS Chat handleDisconnect: Client disconnected: ${client.id}`);
    if (!this.SocketUsernames.has(client.id)) {
      return;
    }
    const chatuser = this.ChatUsers.get(this.SocketUsernames.get(client.id));
    chatuser.removeClientID(client.id);
    // DELETE LATER vvv (once cookie identification is implemented) !!!
    this.SocketUsernames.delete(client.id);
    // DELETE LATER ^^^
    if (chatuser.isEmptyClientIDs()) {
      chatuser.removeUserFromAllRooms();
      this.ChatUsers.delete(chatuser.username);
    }
    this.ClientIDSockets.delete(client.id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('joinChat')
  handleJoinChat(@MessageBody() joinChatDto: JoinChatDto, @ConnectedSocket() client: Socket) {
    // Username validation? !!!
    const { userId, username } = joinChatDto;

    // DELETE LATER vvv (once cookie identification is implemented) !!!
    this.SocketUsernames.set(client.id, username);
    console.log('SocketID to Username: ' + client.id + ' = ' + this.SocketUsernames.get(client.id));
    // DELETE LATER ^^^

    if (!this.ChatUsers.has(username)) {
      // User is connecting for the first time
      this.ChatUsers.set(username, new ChatUser(userId, username));
    }
    const chatuser = this.ChatUsers.get(username);
    console.log(chatuser);
    if (chatuser) {
      chatuser.addClientID(client.id);
      console.log(chatuser.clientIDs);
    }
    client.join('@' + username);
    client.emit('chatJoined');
    if (!this.ChatRooms.has('@' + username)) {
      this.ChatRooms.set('@' + username, new ChatRoom('@' + username, [chatuser]));
    }

    for (const room of chatuser.rooms) {
      client.join(room.roomId);
      client.emit('channelJoined', { channel: room.roomId });
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket, payload: { channel: string, password: string }) {
    const { channel, password } = payload;
    const chatuser = this.ChatUsers.get(this.SocketUsernames.get(client.id));

    if (this.ChatRooms.has(channel)) {
      const chatroom = this.ChatRooms.get(channel);
      switch (chatroom.addUser(chatuser, password)) {
        case ChatRoomEnum.AddedToRoom:
          // client.join(channel);
          for (const clientID of chatuser.clientIDs) {
            const clientSocket = this.ClientIDSockets.get(clientID);
            if (clientSocket != undefined) {
              clientSocket.join(channel);
            }
          }
          this.server.to('@' + chatuser.username).emit('channelJoined', { channel: channel });
          break;
        case ChatRoomEnum.AlreadyInRoom:
          client.emit('chatAlert', { message: 'You already joined this channel' });
          break;
        case ChatRoomEnum.Banned:
          client.emit('chatAlert', { message: 'You are banned from this channel' });
          break;
        case ChatRoomEnum.NotInvited:
          client.emit('chatAlert', { message: 'You are not invited to this channel' });
          break;
        case ChatRoomEnum.WrongPass:
          client.emit('chatAlert', { message: 'This is the wrong password for this channel' });
          break;
        default:
          break;
      }
    } else {
      const chatroom = new ChatRoom(channel);
      this.ChatRooms.set(channel, chatroom);
      chatroom.addUser(chatuser);
      // client.join(channel);
      for (const clientID of chatuser.clientIDs) {
        const clientSocket = this.ClientIDSockets.get(clientID);
        if (clientSocket != undefined) {
          clientSocket.join(channel);
        }
      }
      this.server.to('@' + chatuser.username).emit('channelCreated', { channel: channel });
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(client: Socket, payload: { channel: string }) {
    const { channel } = payload;
    const chatuser = this.ChatUsers.get(this.SocketUsernames.get(client.id));
    if (this.ChatRooms.has(channel)) {
      const chatroom = this.ChatRooms.get(channel);
      chatroom.removeUser(chatuser);
      this.server.to('@' + chatuser.username).emit('channelLeft', { channel: channel });
      if (chatroom.isEmpty()) {
        this.ChatRooms.delete(channel);
      }
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('joinDM')
  handleJoinDM(client: Socket, payload: { user: string, targetUser: string }) {
    const { user, targetUser } = payload;
    // ADD USER CHECK TO DATABASE !!!
    // IS TARGETUSER BLOCKED? !!!
    // DID TARGETUSER BLOCK YOU? !!!
    // IS TARGETUSER ONLINE? !!!
    // if (this.server.sockets.adapter.rooms.has('@' + targetUser)) {
    this.server.to('@' + user).emit('dmCreated', { dm: '@' + targetUser });
    // SEND EMIT TO OTHER USER USING THEIR USER ID
  }

  //handleJoinChannel(@MessageBody() joinChannelDto: JoinChannelDto, @ConnectedSocket() client: any) {

  // LOOK AT https://github.com/Bde-meij/Codam_Transcendence/blob/development/api/src/chat/chatRoom.dto.ts#L98
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() sendMessageDto: SendMessageDto, @ConnectedSocket() client: Socket) {
    const { channel, message, username } = sendMessageDto;
    const user = this.ChatUsers.get(this.SocketUsernames.get(client.id));

    if ( channel[0] === '@' ) {
      this.server.to('@' + username).emit('dmJoined', { dm: channel });
      this.server.to('@' + username).emit('message', { channel, message, username });
      this.server.to(channel).emit('dmJoined', { dm: '@' + username });
      this.server.to(channel).emit('message', { channel: '@' + username, message: message, username: user.username })
      return;
    }
    if (!this.ChatRooms.has(channel)) {
      client.emit('chatAlert', { message: 'This channel does not exist.' })
      return;
    }
    const chatroom = this.ChatRooms.get(channel);
    if (!chatroom.isInRoom(user)) {
      client.emit('chatAlert', { message: 'You are not in this channel.' })
      return;
    } else if (chatroom.isMuted(user)) {
      client.emit('chatAlert', { message: 'You are muted in this channel.' })
      return;
    }
    this.server.to(channel).emit('message', { channel: channel, message: message, username: user.username })
    return;
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('setChannelType')
  handleSetChannelType(client: Socket, payload: { channel: string, type: number, password: string }) {
    // Make sure channel name has proper characters in it !!!
    const { channel, type, password } = payload;

    if (!this.ChatRooms.has(channel)) {
      client.emit('chatAlert', { message: 'Channel does not exist.' });
      return;
    }

    const chatroom = this.ChatRooms.get(channel);
    const user = this.ChatUsers.get(this.SocketUsernames.get(client.id));
    if (!chatroom.isAdmin(user)) {
      client.emit('chatAlert', { message: 'You do not have permission to perform this action.' });
      return;
    }

    switch (type) {
      case ChannelType.Private:
        if (chatroom.isPrivate()) {
          client.emit('chatAlert', { message: 'Channel is already private.' });
          return;
        }
        chatroom.setPrivate();
        break;
      case ChannelType.Protected:
        if (chatroom.isProtected()) {
          client.emit('chatAlert', { message: 'Channel is already password protected.' });
          return;
        }  else if (password.length < 1 || password.length > 40) {
          client.emit('chatAlert', { message: 'Password must be between 1 and 40 characters long.' });
          return;
        }
        chatroom.setProtected(password);
        console.log(channel + " is now protected by password: " + password);
        break;
      case ChannelType.Public:
        if (chatroom.isPublic()) {
          client.emit('chatAlert', { message: 'Channel is already public.' });
          return;
        }
        chatroom.setPublic();
        break;
      default:
        client.emit('chatAlert', { message: 'Channel type does not exist.' });
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('channelInviteUser')
  handleChannelInviteUser(client: Socket, payload: { channel: string, userInvite: string }) {
    // Make sure channel name has proper characters in it !!!
    const { channel, userInvite } = payload;

    if (!this.ChatRooms.has(channel)) {
      client.emit('chatAlert', { message: 'Channel does not exist.' });
      return;
    }

    const chatroom = this.ChatRooms.get(channel);
    const user = this.ChatUsers.get(this.SocketUsernames.get(client.id));
    if (!chatroom.isAdmin(user)) {
      client.emit('chatAlert', { message: 'You do not have permission to perform this action.' });
      return;
    }

    if (!this.ChatUsers.has(userInvite)) {
      client.emit('chatAlert', { message: 'User is not online or does not exist.' });
      return;
    }
    const userToInvite = this.ChatUsers.get(userInvite);

    if (chatroom.isInRoom(userToInvite)) {
      client.emit('chatAlert', { message: 'User is already in this channel.' });
      return;
    }

    if (chatroom.isInvited(userToInvite)) {
      client.emit('chatAlert', { message: 'User is already invited to this channel.' });
      return;
    }

    if (chatroom.isBanned(userToInvite)) {
      client.emit('chatAlert', { message: 'User is banned from this channel.' });
      return;
    }

    chatroom.inviteUser(userToInvite);
    this.server.to('@' + userToInvite.username).emit('chatAlert', { message: user.username + ' has invited you to join channel: ' + channel });
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('channelActionUser')
  handleChannelActionUser(client: Socket, payload: { channel: string, targetUser: string, action: number }) {
    const { channel, targetUser, action } = payload;

    if (!this.ChatRooms.has(channel)) {
      client.emit('chatAlert', { message: 'Channel does not exist.' });
      return;
    }

    if (!this.ChatUsers.has(targetUser)) {
      client.emit('Target user is not online.');
      return;
    }

    const chatroom = this.ChatRooms.get(channel);
    const user = this.ChatUsers.get(this.SocketUsernames.get(client.id));
    const target = this.ChatUsers.get(targetUser);
    if (!chatroom.isInRoom(user)) {
      client.emit('chatAlert', { message: 'You are not in this channel.' });
      return;
    } else if (!chatroom.isInRoom(target)) {
      client.emit('chatAlert', { message: 'Target user is not in this channel.' });
      return;
    } else if (!chatroom.hasHigherPermissions(user, target)) {
      client.emit('chatAlert', { message: 'You do not have permission to perform this action.' });
      return;
    }

    switch (action) {
      case ActionType.Kick:
        chatroom.removeUser(target);
        for (const clientID of target.clientIDs) {
          const socket = this.ClientIDSockets.get(clientID);
          socket.emit('channelLeft', { channel: chatroom.roomId });
          socket.emit('chatAlert', { message: 'You have been kicked from channel: ' + chatroom.roomId } );
        }
        break;
      case ActionType.Mute:
        chatroom.muteUser(target);
        for (const clientID of target.clientIDs) {
          const socket = this.ClientIDSockets.get(clientID);
          socket.emit('chatAlert', { message: 'You have been muted on channel: ' + chatroom.roomId } );
        }
        break;
      case ActionType.Unmute:
        chatroom.unmuteUser(target);
        for (const clientID of target.clientIDs) {
          const socket = this.ClientIDSockets.get(clientID);
          socket.emit('chatAlert', { message: 'You have been unmuted on channel: ' + chatroom.roomId } );
        }
        break;
      case ActionType.Ban:
        chatroom.banUser(target);
        for (const clientID of target.clientIDs) {
          const socket = this.ClientIDSockets.get(clientID);
          socket.emit('channelLeft', { channel: chatroom.roomId });
          socket.emit('chatAlert', { message: 'You have been banned from channel: ' + chatroom.roomId } );
        }
        break;
      case ActionType.Promote:
        if (!chatroom.isOwner(user)) {
          client.emit('chatAlert', { message: 'You do not have permission to perform this action.' });
        }
        if (chatroom.promoteUser(target)) {
          for (const clientID of target.clientIDs) {
            const socket = this.ClientIDSockets.get(clientID);
            socket.emit('chatAlert', { message: 'You have been promoted on channel: ' + chatroom.roomId });
          }
        }
        break;
      case ActionType.Demote:
        if (!chatroom.isOwner(user)) {
          client.emit('chatAlert', { message: 'You do not have permission to perform this action.' });
        }
        if (chatroom.demoteUser(target)) {
          for (const clientID of target.clientIDs) {
            const socket = this.ClientIDSockets.get(clientID);
            socket.emit('chatAlert', { message: 'You have been demoted on channel: ' + chatroom.roomId });
          }
        }
        break;
      default:
        client.emit('chatAlert', { message: 'Action not recognized.' });
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('actionUser')
  handleActionUser(client: Socket, payload: { channel: string, targetUser: string, action: number }) {
    const { channel, targetUser, action } = payload;

    if (!this.ChatUsers.has(targetUser)) {
      client.emit('Target user is not online.');
      return;
    }
    const user = this.ChatUsers.get(this.SocketUsernames.get(client.id));
    const target = this.ChatUsers.get(targetUser);

    switch (action) {
      case ActionType.Invite:
        this.server.to('@' + target.username).emit('inviteToGame', { player1SocketID: client.id, player1ID: user.id, player1Username: user.username });
        break;
      case ActionType.Ignore:
        // TALK TO ALEX !!!
        break;
      default:
        client.emit('chatAlert', { message: 'Action not recognized.' });
    }
  }

  @SubscribeMessage('closeInvitationModal')
  handleCloseInviteModal(client: Socket) {
    const user = this.ChatUsers.get(this.SocketUsernames.get(client.id));
    this.server.to("@" + user.username).emit('closeInvitationModal');
  }

}
