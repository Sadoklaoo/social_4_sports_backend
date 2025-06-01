import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './config/initDatabase';
import * as messageService from './services/messageService';
import { Server as SocketServer, Socket as BaseSocket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';

export let io: SocketServer;  // exported instance

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.MONGODB_URI_TEST!
    : process.env.MONGODB_URI!;

if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      console.log('✅ MongoDB connected');
      await initializeDatabase();

      const server = http.createServer(app);
      // assign to exported io
      io = new SocketServer(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
        pingTimeout: 60000,
      });

      interface ChatSocket extends BaseSocket { userId: string }
      interface PrivateMessage { to: string; content: string }
      interface ReadReceipt { peerId: string }

      // Authentication middleware for all namespaces
      io.use((socket: BaseSocket, next) => {
        const token = (socket.handshake.auth as { token?: string }).token;
        if (!token) return next(new Error('Auth error'));
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
          (socket as ChatSocket).userId = payload.id as string;
          next();
        } catch {
          next(new Error('Auth error'));
        }
      });

      // Default namespace: join notification room
      io.on('connection', (socket: BaseSocket) => {
        const chatSocket = socket as ChatSocket;
        console.log(`New user connected: ${chatSocket.userId}`);
        // join personal room for notifications
        socket.join(`user:${chatSocket.userId}`);

        // Notification event: emit to specific user
        socket.on('notify', (data: { to: string; message: string }) => {
          const { to, message } = data;
          io.to(`user:${to}`).emit('notification', {
            from: chatSocket.userId,
            message,
          });
        });

        // Optional: Emit a test notification when user connects
        socket.emit('notification', { from: 'System', message: 'Welcome to Social4Sports!' });
      });

      // Chat namespace for real-time messaging
      const chatNs = io.of('/chat');
      chatNs.use((socket, next) => {
        // reuse auth from default namespace
        const token = (socket.handshake.auth as { token?: string }).token;
        if (!token) return next(new Error('Auth error'));
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
          (socket as ChatSocket).userId = payload.id as string;
          next();
        } catch {
          next(new Error('Auth error'));
        }
      });

      chatNs.on('connection', (socket: BaseSocket) => {
        const chatSocket = socket as ChatSocket;
        console.log(`New chat connection: ${chatSocket.id}`);
        chatSocket.join(chatSocket.userId);

        // messaging events
        chatSocket.on('private_message', async (msg: PrivateMessage) => {
          const saved = await messageService.sendMessage({
            senderId: chatSocket.userId,
            recipientId: msg.to,
            content: msg.content,
          });
          chatNs.to(chatSocket.userId).to(msg.to).emit('new_message', saved);
        });
        chatSocket.on('typing', (peerId: string) =>
          chatNs.to(peerId).emit('typing', { from: chatSocket.userId })
        );
        chatSocket.on('stop_typing', (peerId: string) =>
          chatNs.to(peerId).emit('stop_typing', { from: chatSocket.userId })
        );
        chatSocket.on('mark_read', async (data: ReadReceipt) => {
          const count = await messageService.markConversationRead({
            userId: chatSocket.userId,
            peerId: data.peerId,
          });
          chatNs.to(data.peerId).emit('message_read', { by: chatSocket.userId, count });
        });

        chatSocket.on('disconnect', (reason) => {
          console.log(`Socket disconnected: ${chatSocket.id} (reason: ${reason})`);
        });
      });

      // Start server
      server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1);
    });
}

// no default export
