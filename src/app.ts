import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import matchRoutes from './routes/matches';
import playerRoutes from './routes/player';
import messageRoutes from './routes/message';
import friendsRoutes from './routes/friends';
import reviewsRoutes from './routes/reviews';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:8080',
    credentials: true,
  })
)
app.use(helmet());

// Swagger setup
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
        type: 'http', scheme: 'bearer', bearerFormat: 'JWT',
        description: 'JWT authorization header: Bearer <token>',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerOptions = { swaggerDefinition, apis: ['./src/routes/**/*.ts', './src/models/**/*.ts'] };
const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Mount REST routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/reviews', reviewsRoutes);

app.get('/', (_req: Request, res: Response) => { res.send('Social4Sports API Running 🚀'); });

// Example error route
type AsyncHandler = (req: Request, res: Response) => Promise<void>;
const wrap = (fn: AsyncHandler) => (req: Request, res: Response, next: any) => fn(req, res).catch(next);
app.get('/boom', wrap(async () => { throw Object.assign(new Error('Boom!'), { status: 418 }); }));

// Error handler
app.use(errorHandler);

export default app;
