import { Server, Socket } from 'socket.io';
import dbInstance, {userType} from '../common/dummyDb';

export default class SocketHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public initializeSocket(socket: Socket) {
    console.log(`🔌 User connected: ${socket.id}`);
    console.log('Socket user data:', socket.data.user);
    const user: userType = socket.data.user;
    if (user) {
      console.log(`User ${user.name} (${user.id}) connected with socket ID: ${socket.id}`);
      dbInstance.updateUser(user.id, { socketId: socket.id });
      socket.emit('message', `Welcome ${user.name}!`);
    } else {
      console.log('No user data found on socket.');
    }


    // Example event
    socket.on('chat message', (msg) => {
      console.log(`📩 Message from ${socket.id}:`, msg);
      const {chatId, message} = msg;
      // Broadcast the message to all clients in the same chat room
      const toUser = dbInstance.getUserById(chatId);
      if(toUser?.socketId){
        this.io.to(toUser.socketId).emit('chat message', { sender: user?.name || 'Unknown', text: message, time: new Date().toISOString() });
      }
      //socket.emit('chat message', { sender: user?.name || 'Unknown', text: message, time: new Date().toISOString() });
      dbInstance.saveCHat({ fromUserId: socket.data.user?.id , toUserId: chatId, message, timestamp: new Date(), kind: 'personal'});

    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  }
}
