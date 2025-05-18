// src/server.ts
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './config/initDatabase';
import * as messageService from './services/messageService';
import { Server as SocketServer, Socket as BaseSocket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
      const io = new SocketServer(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
      });

      interface ChatSocket extends BaseSocket { userId: string }
      interface PrivateMessage { to: string; content: string }
      interface ReadReceipt { peerId: string }

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

      io.on('connection', (socket: BaseSocket) => {
        const chatSocket = socket as ChatSocket;
        chatSocket.join(chatSocket.userId);

        chatSocket.on('private_message', async (msg: PrivateMessage) => {
          const saved = await messageService.sendMessage({
            senderId: chatSocket.userId,
            recipientId: msg.to,
            content: msg.content,
          });
          io.to(chatSocket.userId).to(msg.to).emit('new_message', saved);
        });
        chatSocket.on('typing', (peerId: string) =>
          io.to(peerId).emit('typing', { from: chatSocket.userId })
        );
        chatSocket.on('stop_typing', (peerId: string) =>
          io.to(peerId).emit('stop_typing', { from: chatSocket.userId })
        );
        chatSocket.on('mark_read', async (data: ReadReceipt) => {
          const count = await messageService.markConversationRead({
            userId: chatSocket.userId,
            peerId: data.peerId,
          });
          io.to(data.peerId).emit('message_read', { by: chatSocket.userId, count });
        });
      });

      server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1);
    });
}

export default app;
