import { isatty } from 'tty';
import { ChatRoomEnum } from './chat.enum';

export class ChatUser {
  id: string;
  username: string;
  rooms: ChatRoom[];
  clientIDs: string[];

  constructor(id: string,
              username: string,
              rooms: ChatRoom[] = [],
              clientIDs: string[] = []) {
    this.id = id;
    this.username = username;
    this.rooms = rooms;
    this.clientIDs = clientIDs;
  }

  addClientID(clientID: string) {
    if (!this.clientIDs.includes(clientID)) {
      this.clientIDs.push(clientID);
    }
  }

  removeClientID(clientID: string) {
    this.clientIDs = this.clientIDs.filter(id => id !== clientID);
  }

  isEmptyClientIDs(): boolean {
    return this.clientIDs.length === 0;
  }

  addRoom(room: ChatRoom) {
    if (!this.rooms.includes(room)) {
      this.rooms.push(room);
    }
  }

  removeRoom(room: ChatRoom) {
    this.rooms = this.rooms.filter(r => r !== room);
  }

  removeUserFromAllRooms() {
    for (const room of this.rooms) {
      room.removeUser(this);
    }

    this.rooms = [];
  }
}

export class ChatRoom {
  roomId: string;
  users: ChatUser[];
  owner: ChatUser;
  admins: ChatUser[];
  privatized: boolean;
  protect: boolean;
  password: string;
  banned: string[];
  muted: string[];
  invited: string[];

  constructor(roomId: string,
              users: ChatUser[] = [],
              owner: ChatUser | null = null,
              admins: ChatUser[] = [],
              privatized: boolean = false,
              protect: boolean = false,
              password: string = '',
              banned: string[] = [],
              muted: string[] = [],
              invited: string[] = []) {
    this.roomId = roomId;
    this.users = users;
    this.owner = owner;
    this.admins = admins;
    this.privatized = privatized;
    this.protect = protect;
    this.password = password;
    this.banned = banned;
    this.muted = muted;
    this.invited = invited;
  }

  addUser(user: ChatUser, password: string | null = null): number {
    if (this.isBanned(user)) {
      return ChatRoomEnum.Banned;
    } else if (this.privatized && !this.isInvited(user)) {
      return ChatRoomEnum.NotInvited;
    } else if (this.protect && password !== this.password) {
      return ChatRoomEnum.WrongPass;
    } else if (this.isInRoom(user)) {
      return ChatRoomEnum.AlreadyInRoom;
    }

    this.users.push(user);
    user.addRoom(this);
    if (this.users.length === 1) {
      this.updateOwner();
    }
    if (this.isInvited(user)) {
      this.invited = this.invited.filter(u => u !== user.id);
    }
    return ChatRoomEnum.AddedToRoom;
  }

  isInRoom(user: ChatUser): boolean {
    return this.users.includes(user);
  }

  removeUser(user: ChatUser) {
    if (this.isOwner(user) && this.users.length > 1) {
      this.users = this.users.filter(u => u !== user);
      this.updateOwner();
    } else {
      this.users = this.users.filter(u => u !== user);
    }
    user.removeRoom(this);
  }

  removeRoomFromAllUsers() {
    for (const user of this.users) {
      user.removeRoom(this);
    }

    this.users = [];
  }

  setPrivate() {
    this.privatized = true;
    this.protect = false;
    this.password = '';
  }

  setProtected( password: string ) {
    this.privatized = false;
    this.protect = true;
    this.password = password;
  }

  setPublic() {
    this.privatized = false;
    this.protect = false;
    this.password = '';
  }

  isPrivate() {
    return this.privatized;
  }

  isProtected() {
    return this.protect;
  }

  isPublic() {
    if (!this.privatized && !this.protect) {
      return true
    }
    return false
  }

  isEmpty(): boolean {
    return this.users.length === 0;
  }

  isAdmin(user: ChatUser): boolean {
    return this.admins.includes(user);
  }

  isOwner(user: ChatUser): boolean {
    return this.owner === user;
  }

  // Oldest admin becomes owner, or oldest user if there are no admins
  updateOwner() {
    if (this.admins.length > 0) {
      this.owner = this.admins[0];
    } else if (this.users.length > 0) {
      this.owner = this.users[0];
      this.admins.push(this.owner);
    }
  }

  hasHigherPermissions(user: ChatUser, target: ChatUser) {
    if (this.isOwner(target)) {
      return false;
    } else if (this.isOwner(user)) {
      return true;
    } else if (this.isAdmin(user) && !this.isOwner(target) && !this.isAdmin(target))
      return true;
    return false;
  }

  promoteUser(target: ChatUser) {
    if (this.isAdmin(target)) {
      return false;
    }
    this.admins.push(target);
    return true;
  }

  demoteUser(target: ChatUser) {
    if (this.isOwner(target) || !this.isAdmin(target)) {
      return false;
    }
    this.admins = this.admins.filter(demote => demote !== target);
    return true;
  }

  isBanned(user: ChatUser): boolean {
    return this.banned.includes(user.id);
  }

  banUser(user: ChatUser) {
    if (!this.isBanned(user)) {
      this.banned.push(user.id);
    }
    if (this.users.includes(user)) {
      this.removeUser(user);
    }
  }

  unbanUser(user: ChatUser) {
    if (this.isBanned(user)) {
      this.banned = this.banned.filter(unban => unban !== user.id);
    }
  }

  isMuted(user: ChatUser): boolean {
    return this.muted.includes(user.id);
  }

  muteUser(user: ChatUser) {
    if (!this.isMuted(user)) {
      this.muted.push(user.id);
    }
  }

  unmuteUser(user: ChatUser) {
    if (this.isMuted(user)) {
      this.muted = this.muted.filter(unmute => unmute !== user.id);
    }
  }

  isInvited(user: ChatUser): boolean {
    return this.invited.includes(user.id);
  }

  inviteUser(user: ChatUser) {
    if (!this.isInvited(user)) {
      this.invited.push(user.id);
    }
  }
}
