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
      this.io.emit('message', msg); // broadcast
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  }
}
