// src/index.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import matchRoutes from './routes/matches';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';

// Swagger imports
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// Database initializer
import { initializeDatabase } from './config/initDatabase';

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// --- Swagger setup --------------------------------------------------
const PORT = process.env.PORT || 3000;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Social4Sports API',
    version: '1.0.0',
    description: 'Interactive API documentation for the Social4Sports backend',
  },
  servers: [
    {
      url: `/`,
      description: 'Local development server (IPv4)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT authorization header',
      },
    },
     security: [
    {
     bearerAuth: []
    }
    ],
  },
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/**/*.ts', './src/models/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);
// --------------------------------------------------------------------

app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send('Social4Sports API Running 🚀');
});

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://admin:admin@mongo:27017/social4sports?authSource=admin';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Run index creation + data seeding
    await initializeDatabase();

    app.listen(PORT, () =>
      console.log(
        `🚀 Server running on port ${PORT} — docs: http://127.0.0.1:${PORT}/api-docs`
      )
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
