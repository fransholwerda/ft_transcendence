import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatUser, ChatRoom } from './chat.types'
import { ChatRoomEnum, ChannelType, ActionType } from './chat.enum';
import { ActionUserDto, ChannelActionUserDto, ChannelInviteUserDto, GetFriendListDto, JoinChannelDto, JoinChatDto, JoinDmDto, LeaveChannelDto, SendMessageDto, SetChannelTypeDto } from './chat.dto';
import { WsValidationExceptionFilter } from './exception';
import { UsersModule } from 'src/users/users.module';
import { FriendsModule } from 'src/friends/friends.module';
import { UsersService } from 'src/users/users.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import * as cookie from 'cookie';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

@WebSocketGateway({ namespace: '/ft_transcendence', cors: { origin: '*', credentials: true} })
@UseFilters(new WsValidationExceptionFilter())
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private ChatUsers = new Map<string, ChatUser>();
  private ChatRooms = new Map<string, ChatRoom>();
  private SocketUsernames = new Map<string, string>();
  private ClientIDSockets = new Map<string, Socket>();
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService
  ) {}

  afterInit(server: Server) {
    this.server = server;
    console.log('NestJS Chat Gateway Init');
  }

  async handleConnection(client: Socket) {
    const cookies = client.handshake.headers.cookie;

    if (cookies) {
        const parsedCookies = cookie.parse(cookies);
        const token = parsedCookies['jwt'];

        if (token) {
            try {
                const payload = await this.authService.verifyJwtAccessToken(token);
                const user = await this.userService.findUser(payload.user);
                console.log('Authenticated user:', payload.user, 'username:', user.username);

                this.SocketUsernames.set(client.id, user.username);
                console.log('SocketID to Username: ' + client.id + ' = ' + this.SocketUsernames.get(client.id));

                if (!this.ChatUsers.has(user.username)) {
                  // User is connecting for the first time
                  this.ChatUsers.set(user.username, new ChatUser(user.id, user.username));
                }
            
                const chatuser = this.ChatUsers.get(user.username);
                if (chatuser) {
                  chatuser.addClientID(client.id);
                }
                client.join('@' + user.username);
                client.emit('chatJoined');

                // Give client the ignore list of the user
                const blockedList = await this.userService.getBlocked(chatuser.id);
                let ignoreList = blockedList.map(user => user.username);
                client.emit('updateIgnoreList', ignoreList);

                // Give client all the channels the user is in
                for (const room of chatuser.rooms) {
                  await delay(10);
                  await client.join(room.roomId);
                  client.emit('channelJoined', { channel: room.roomId });
                }
            } catch (error) {
                console.log('Invalid JWT token:', error.message);
                this.handleDisconnect(client);
            }
        } else {
            console.log('No JWT token found in cookies');
            this.handleDisconnect(client);
        }
    } else {
        console.log('No cookies found');
        this.handleDisconnect(client);
    }

    this.ClientIDSockets.set(client.id, client);
}

  handleDisconnect(client: Socket) {
    if (!this.SocketUsernames.has(client.id) ||
        !this.ChatUsers.has(this.SocketUsernames.get(client.id))) {
      return;
    }
    const chatuser = this.ChatUsers.get(this.SocketUsernames.get(client.id));
    chatuser.removeClientID(client.id);
    this.SocketUsernames.delete(client.id);
    if (chatuser.isEmptyClientIDs()) {
      chatuser.removeUserFromAllRooms();
      this.ChatUsers.delete(chatuser.username);
    }
    if (!this.ClientIDSockets.has(client.id)) {
      return;
    }
    this.ClientIDSockets.delete(client.id);
    client.disconnect();
    console.log(`NestJS Chat handleDisconnect: Client disconnected: ${client.id}`);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('joinChannel')
  handleJoinChannel(@MessageBody() joinChannelDto: JoinChannelDto, @ConnectedSocket() client: Socket) {
    const { channel, password } = joinChannelDto;
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
  handleLeaveChannel(@MessageBody() leaveChannelDto: LeaveChannelDto, @ConnectedSocket() client: Socket) {
    const { channel } = leaveChannelDto;
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
  async handleJoinDM(@MessageBody() joinDmDto: JoinDmDto, @ConnectedSocket() client: Socket) {
    const { user, targetUser } = joinDmDto;
    const cookies = client.handshake.headers.cookie;

    if (cookies) {
      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies['jwt'];

      if (token) {
        try {
          const payload = await this.authService.verifyJwtAccessToken(token);
          const user = await this.userService.findUser(payload.user);
        } catch (error) {
          console.log('Invalid JWT token:', error.message);
          client.disconnect();
        }
      }
    } else {
      client.disconnect();
    }

    if (!this.ChatUsers.has(targetUser)) {
      client.emit('chatAlert', { message: 'Target user is not online or does not exist.' });
      return;
    }
    const chatuser = this.ChatUsers.get(user);
    const target = this.ChatUsers.get(targetUser);
    const blocked = await this.userService.checkIfBlocked(target.id, chatuser.id);
    if (blocked) {
      client.emit('chatAlert', { message: 'Target has blocked you.' });
      return;
    }
    this.server.to('@' + user).emit('dmCreated', { dm: '@' + targetUser });
    this.server.to('@' + targetUser).emit('dmJoined', { dm: '@' + user });
  }

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
  handleSetChannelType(@MessageBody() setChannelTypeDto: SetChannelTypeDto, @ConnectedSocket() client: Socket) {
    const { channel, type, password } = setChannelTypeDto;

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
        client.emit('message', { channel: channel, message: 'Channel is now private.', username: '#Server' });
        break;
      case ChannelType.Protected:
        if (password == undefined) {
          if (chatroom.isPublic()) {
            client.emit('chatAlert', { message: 'Channel is already public.' });
            return;
          }
          chatroom.setPublic();
          client.emit('message', { channel: channel, message: 'Channel is now public.', username: '#Server' });
          return;
        } else if (chatroom.isProtected()) {
          chatroom.setProtected(password);
          client.emit('message', { channel: channel, message: 'Channel password has been updated.', username: '#Server' });
          return;
        }
        chatroom.setProtected(password);
        client.emit('message', { channel: channel, message: 'Channel is now password protected.', username: '#Server' });
        break;
      case ChannelType.Public:
        if (chatroom.isPublic()) {
          client.emit('chatAlert', { message: 'Channel is already public.' });
          return;
        }
        chatroom.setPublic();
        client.emit('message', { channel: channel, message: 'Channel is now public.', username: '#Server' });
        break;
      default:
        client.emit('chatAlert', { message: 'Channel type does not exist.' });
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('channelInviteUser')
  async handleChannelInviteUser(@MessageBody() channelInviteUserDto: ChannelInviteUserDto, @ConnectedSocket() client: Socket) {
    const { channel, userInvite } = channelInviteUserDto;

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

    const blocked = await this.userService.checkIfBlocked(userToInvite.id, user.id);
    if (blocked) {
      client.emit('chatAlert', { message: 'Target has blocked you.' });
      return;
    }

    chatroom.inviteUser(userToInvite);
    this.server.to('@' + userToInvite.username).emit('chatAlert', { message: user.username + ' has invited you to join channel: ' + channel });
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('channelActionUser')
  handleChannelActionUser(@MessageBody() channelActionUserDto: ChannelActionUserDto, @ConnectedSocket() client: Socket) {
    const { channel, targetUser, action } = channelActionUserDto;

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
          socket.emit('chatAlert', { message: 'You have been kicked from channel: ' + chatroom.roomId + '.' } );
        }
        break;
      case ActionType.Mute:
        chatroom.muteUser(target);
        for (const clientID of target.clientIDs) {
          const socket = this.ClientIDSockets.get(clientID);
          socket.emit('chatAlert', { message: 'You have been muted on channel: ' + chatroom.roomId + ' for 600 seconds.' } );
        }
        break;
      case ActionType.Unmute:
        chatroom.unmuteUser(target);
        for (const clientID of target.clientIDs) {
          const socket = this.ClientIDSockets.get(clientID);
          socket.emit('chatAlert', { message: 'You have been unmuted on channel: ' + chatroom.roomId + '.' } );
        }
        break;
      case ActionType.Ban:
        chatroom.banUser(target);
        for (const clientID of target.clientIDs) {
          const socket = this.ClientIDSockets.get(clientID);
          socket.emit('channelLeft', { channel: chatroom.roomId });
          socket.emit('chatAlert', { message: 'You have been banned from channel: ' + chatroom.roomId + '.' } );
        }
        break;
      case ActionType.Promote:
        if (!chatroom.isOwner(user)) {
          client.emit('chatAlert', { message: 'You do not have permission to perform this action.' });
        }
        if (chatroom.promoteUser(target)) {
          for (const clientID of target.clientIDs) {
            const socket = this.ClientIDSockets.get(clientID);
            socket.emit('chatAlert', { message: 'You have been promoted on channel: ' + chatroom.roomId + '.' });
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
            socket.emit('chatAlert', { message: 'You have been demoted on channel: ' + chatroom.roomId + '.' });
          }
        }
        break;
      default:
        client.emit('chatAlert', { message: 'Action not recognized.' });
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true}))
  @SubscribeMessage('actionUser')
  async handleActionUser(@MessageBody() actionUserDto: ActionUserDto, @ConnectedSocket() client: Socket) {
    const { targetUser, action } = actionUserDto;

    if (!this.ChatUsers.has(targetUser)) {
      client.emit('Target user is not online.');
      return;
    }
    const user = this.ChatUsers.get(this.SocketUsernames.get(client.id));
    const target = this.ChatUsers.get(targetUser);

    switch (action) {
      case ActionType.Profile:
        client.emit('profilePage', { targetUserID: target.id });
        break;
      case ActionType.AddFriend:
        try {
          await this.userService.addFriend(user.id, target.id);
          console.log(user.username + ' has added ' + target.username + ' to their friendlist.');
        } catch (error) {
          client.emit('chatAlert', { message: 'Adding friend failed.' });
        }
        break;
      case ActionType.RemoveFriend:
        try {
          await this.userService.removeFriend(user.id, target.id);
          console.log(user.username + ' has removed ' + target.username + ' to their friendlist.');
        } catch (error) {
          client.emit('chatAlert', { message: 'Removing friend failed.' });
        }
        break;
      case ActionType.Invite:
        const blocked = await this.userService.checkIfBlocked(target.id, user.id);
        if (blocked) {
          client.emit('chatAlert', { message: 'Target has blocked you.' });
          return;
        }
        this.server.to('@' + target.username).emit('inviteToGame', { player1SocketID: client.id, player1ID: user.id, player1Username: user.username });
        break;
      case ActionType.Ignore:
        try {
          await this.userService.addBlocked(user.id, target.id);
        } catch (error) {
          client.emit('chatAlert', { message: error.message });
        }
        const blockedList = await this.userService.getBlocked(user.id);
        const ignoreList = blockedList.map(user => user.username);
        client.emit('updateIgnoreList', ignoreList);
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

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @SubscribeMessage('getFriendlist')
  async handleGetFriendList(@MessageBody() getFriendListDto: GetFriendListDto, @ConnectedSocket() client: Socket) {
    const { userID } = getFriendListDto;
    try {
      const friendList = await this.userService.getFriends(userID);
      const friendListWithStatus = friendList.map(friend => {
        const isOnline = this.ChatUsers.has(friend.username);
        return {
          ...friend,
          online: isOnline
        };
      });
      console.log(friendListWithStatus);
      client.emit('friendlistStatus', friendListWithStatus);
    } catch (error) {
      console.log('Error retrieving friendlist.');
    }
  }
}
