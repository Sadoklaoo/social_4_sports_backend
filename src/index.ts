// src/index.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import matchRoutes from './routes/matches';
// Swagger imports
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// --- Swagger setup --------------------------------------------------
// 1) Basic Swagger definition (OpenAPI 3.0)
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Social4Sports API',
    version: '1.0.0',
    description: 'Interactive API documentation for the Social4Sports backend',
  },
  servers: [
    { url: `http://localhost:${process.env.PORT || 3000}` }
  ],
};

// 2) Options for swaggerJSDoc – point `apis` to your route & model files
const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/**/*.ts', './src/models/**/*.ts'],
};

// 3) Initialize swagger-jsdoc → produces the OpenAPI spec
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// 4) Serve Swagger UI at /api-docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);
// --------------------------------------------------------------------
app.use('/api/matches', matchRoutes);
app.get('/', (req: Request, res: Response) => {
  res.send('Social4Sports API Running 🚀');
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/social4sports';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT} — docs: http://localhost:${PORT}/api-docs`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
