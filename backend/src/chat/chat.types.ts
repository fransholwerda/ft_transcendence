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

    addRoom(room: ChatRoom) {
        if (!this.rooms.includes(room)) {
            this.rooms.push(room);
        }
    }

    removeRoom(room: ChatRoom) {
        this.rooms = this.rooms.filter(r => r !== room);
    }
}

export class ChatRoom {
    roomId: string;
    users: ChatUser[];
    privatized: boolean;
    protect: boolean;
    password: string;

    constructor(roomId: string,
                users: ChatUser[] = [],
                privatized: boolean = false,
                protect: boolean = false,
                password: string = '') {
        this.roomId = roomId;
        this.users = users;
    }

    addUser(user: ChatUser) {
        if (!this.users.includes(user)) {
            this.users.push(user);
            user.addRoom(this);
        }
    }

    removeUser(user: ChatUser) {
        this.users = this.users.filter(u => u !== user);
        user.removeRoom(this);
    }

    setPrivate() {
        this.privatized = true;
        this.protect = false;
        this.password = '';
    }

    setProtect( password: string ) {
        this.privatized = false;
        this.protect = true;
        this.password = password;
    }

    setPublic() {
        this.privatized = false;
        this.protect = false;
        this.password = '';
    }
}
