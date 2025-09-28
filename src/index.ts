import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';

import socketAuthMiddleware from './middleware/auth.socket.middleware';
import SocketHandler from './common/socketHandler';
import userRouter from './routes/user.route';
import ApiResponse from './types/response';

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../env/local.env'),
});

const PORT = process.env.PORT || 3000;
console.info('Environment:', process.env.NODE_ENV);
console.info('Port:', PORT);

const app = express();

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*', // for demo, allow all
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  res.setHeader('X-Powered-By', 'nCollab');
  next();
});

// MongoDB connection (optional, comment if not needed)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
}

// Routes
app.get('/', (_: Request, res: Response) => {
  res.send('nCollab API is running 🚀');
});

app.get('/health', (_: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/chat-web', (_: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../html/chat-demo.html'));
});

app.use('/api/users', userRouter);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error handling request:', err);

  if (err instanceof SyntaxError && 'body' in err) {
    return res
      .status(400)
      .json({ message: 'Invalid JSON payload', error: err.message });
  }

  const errRes: ApiResponse<null, null> = {
    code: err.cause || 500,
    success: false,
    data: null,
    message: 'Something went wrong',
    error: err.message || err,
    meta: null,
  };
  return res.status(errRes.code).json(errRes);
});

// HTTP + Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// // Attach middleware (optional)
io.use(socketAuthMiddleware.validate);

// Socket handler
const socketHandler = new SocketHandler(io);
io.on('connection', (socket) => socketHandler.initializeSocket(socket));


// ✅ Global error handler for the whole namespace
io.engine.on("connection_error", (err) => {
  console.error("Connection error:", err.message, err.req);
});

server.listen(PORT, () => {
  console.info(`✅ Server is running on http://localhost:${PORT}`);
});
