import { Socket } from 'socket.io';
import jwtService from '../common/jwt';
import EnvData from '../common/env';
import dbInstance from '../common/dummyDb';

type DecodedTokenType = {
  userId: string;
  name: string;
  iat?: number;
  exp?: number;
};

export default {
  validate: (socket: Socket, next: (err?: Error) => void) => {
    try {
      console.log('🔒 Validating socket authentication', socket.handshake);
      const token = socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Demo validation (replace with real JWT check)
      const decoded: unknown = jwtService.verify(
        token as string,
        EnvData.JWT_KEY
      );
      console.log('Decoded token:', decoded);
      if (typeof decoded !== 'object' || decoded === null) {
        return next(new Error('Invalid token payload'));
      }

      const { userId } = decoded as DecodedTokenType;

      if (!userId) {
        return next(new Error('Invalid token payload'));
      }
      const user = dbInstance.getAllUsers().find((u) => u.id === userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user info to socket object for future use
      socket.data.user = user;

      // For demo purposes, accept a specific token value
      console.log(`✅ Authenticated socket: ${socket.id}`);
      next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  },
};
