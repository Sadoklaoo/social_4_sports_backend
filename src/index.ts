// src/index.ts
import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server as SocketServer, Socket as BaseSocket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import matchRoutes from './routes/matches';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import playerRoutes from './routes/player';
import messageRoutes from './routes/message';
import friendsRoutes from './routes/friends';
import reviewsRoutes from './routes/reviews';

// Swagger imports
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// Database initializer
import { initializeDatabase } from './config/initDatabase';
// Message service for real-time
import * as messageService from './services/messageService';
import { errorHandler, wrap } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(errorHandler);

// --- Swagger setup --------------------------------------------------
const PORT = Number(process.env.PORT) || 3000;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Social4Sports API',
    version: '1.0.0',
    description: 'Interactive API documentation for the Social4Sports backend',
  },
  servers: [{ url: '/', description: 'Same-origin API' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT authorization header: Bearer <token>',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/**/*.ts', './src/models/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
// --------------------------------------------------------------------

// Mount REST routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/reviews', reviewsRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send('Social4Sports API Running 🚀');
});

app.get('/boom', wrap(async () => {
  throw Object.assign(new Error('Boom!'), { status: 418 });
}));

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://admin:admin@mongo:27017/social4sports?authSource=admin';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await initializeDatabase();

    // Create HTTP server and typed Socket.IO
    const server = http.createServer(app);
    const io = new SocketServer(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    // Extend BaseSocket to include userId
    interface ChatSocket extends BaseSocket {
      userId: string;
    }

    interface PrivateMessage {
      to: string;
      content: string;
    }

    interface ReadReceipt {
      peerId: string;
    }

    // JWT auth for websockets
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

    // Handle socket connections
    io.on('connection', (socket: BaseSocket) => {
      const chatSocket = socket as ChatSocket;
      console.log(`🟢 User ${chatSocket.userId} connected`);
      chatSocket.join(chatSocket.userId);

      // Private message handler
      chatSocket.on('private_message', async (msg: PrivateMessage) => {
        const from = chatSocket.userId;
        const saved = await messageService.sendMessage({
          senderId: from,
          recipientId: msg.to,
          content: msg.content,
        });
        io.to(from).to(msg.to).emit('new_message', saved);
      });

      // Typing indicators
      chatSocket.on('typing', (peerId: string) => {
        io.to(peerId).emit('typing', { from: chatSocket.userId });
      });
      chatSocket.on('stop_typing', (peerId: string) => {
        io.to(peerId).emit('stop_typing', { from: chatSocket.userId });
      });

      // Read receipts
      chatSocket.on('mark_read', async (data: ReadReceipt) => {
        const count = await messageService.markConversationRead({
          userId: chatSocket.userId,
          peerId: data.peerId,
        });
        io.to(data.peerId).emit('message_read', { by: chatSocket.userId, count });
      });

      chatSocket.on('disconnect', () => {
        console.log(`🔴 User ${chatSocket.userId} disconnected`);
      });
    });

    // Start HTTP + WebSocket server
    server.listen(PORT, () =>
      console.log(
        `🚀 Server and Socket.IO running on port ${PORT} — docs: http://localhost:${PORT}/api-docs`
      )
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
export default app;
