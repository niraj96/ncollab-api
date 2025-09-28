import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export type userType = {
  id: string;
  name: string;
  email: string;
  socketId?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

type saveUserType = Omit<userType, 'id'>;
type chatCategory = 'personal' | 'group' | 'channel' | 'broadcast';
type chatType = {
  kind: chatCategory;
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: Date;
};

type dataType = {
  users: userType[];
  chats: chatType[];
};

type DummyDB<T, C> = {
  users: T[];
  chats: C[];

  saveUser: (user: T) => void;
  updateUser: (id: string, user: Partial<T>) => void;
  getUserById: (id: string) => T | undefined;
  removeUserById: (id: string) => void;
  getAllUsers: () => T[];

  saveCHat: (chat: C) => void;
  getChatById: (id: string) => C | undefined;
  removeChatById: (id: string) => void;
  getAllChats: () => C[];
  getChatsByUserId: (userId: string) => C[];
};

class InMemoryDB implements DummyDB<userType, chatType> {
  users: userType[] = [];
  chats: chatType[] = [];

  constructor() {
    this.readFromFile();
  }

  private readFromFile() {
    const data: dataType = JSON.parse(
      fs.readFileSync('../dummyDb.json', 'utf-8')
    );

    console.log('Data loaded from file:', data);
    this.users = data.users;
    this.chats = data.chats;

    console.log(
      'In-memory DB initialized. Users:',
      this.users.length,
      'Chats:',
      this.chats.length
    );
  }

  private saveFile() {
    const data: dataType = {
      users: this.users,
      chats: this.chats,
    };
    fs.writeFileSync('../dummyDb.json', JSON.stringify(data, null, 2));
  }

  updateUser(id: string, user: Partial<userType>): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users[index] = {
        id,
        ...this.users[index],
        ...user,
        updatedAt: new Date(),
      } as userType;
      this.saveFile();
    }
  }

  saveUser(user: saveUserType): void {
    // Generate a new UUID v4 (random)
    const id: string = uuidv4();
    const newUser: userType = { id, ...user };
    this.users.push(newUser);

    this.saveFile();
  }
  getUserById(id: string): userType | undefined {
    return this.users.find((user) => user.id === id);
  }
  removeUserById(id: string): void {
    this.users = this.users.filter((user) => user.id !== id);
    this.saveFile();
  }
  getAllUsers(): userType[] {
    console.log('Getting all users. Total:', this.users);
    return this.users;
  }

  saveCHat(chat: chatType): void {
    this.chats.push(chat);
    this.saveFile();
  }
  getChatById(id: string): chatType | undefined {
    return this.chats.find((chat) => chat.id === id);
  }
  removeChatById(id: string): void {
    this.chats = this.chats.filter((chat) => chat.id !== id);
    this.saveFile();
  }
  getAllChats(): chatType[] {
    return this.chats;
  }
  getChatsByUserId(userId: string): chatType[] {
    return this.chats.filter(
      (chat) => chat.fromUserId === userId || chat.toUserId === userId
    );
  }
}

const dbInstance = new InMemoryDB();
export default dbInstance;
