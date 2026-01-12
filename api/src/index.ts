import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { StatusCodes } from 'http-status-codes';

import { router as apiRouter } from './routes';
import { notFoundHandler, errorHandler } from './middlewares/error';
import { generalLimiter } from './middlewares/rateLimiter';
import { initSocket } from './ws/socket';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const ORIGIN = process.env.ORIGIN || '*';
const MONGO_URI = process.env.MONGO_URI || '';

// Verificar variables de entorno críticas
function validateEnvVars() {
  const requiredVars = ['MONGO_URI', 'JWT_SECRET'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please create a .env file based on .env.example');
    process.exit(1);
  }
  
  // Advertencias para variables opcionales pero recomendadas
  if (!process.env.JWT_REFRESH_SECRET) {
    console.warn('WARNING: JWT_REFRESH_SECRET not set, using JWT_SECRET for refresh tokens');
  }
  
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    console.warn('WARNING: Using default JWT_SECRET. Please change it in production!');
  }
}

// Función para conectar a MongoDB con reintentos
async function connectWithRetry(uri: string, maxRetries = 5, delay = 5000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[MongoDB] Intento de conexión ${attempt}/${maxRetries}...`);
      await mongoose.connect(uri);
      console.log('[MongoDB] ✅ Conectado exitosamente');
      return;
    } catch (error) {
      console.warn(`[MongoDB] ❌ Intento ${attempt} fallido:`, (error as Error).message);
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`[MongoDB] Reintentando en ${delay / 1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function start() {
  // Validar variables de entorno
  validateEnvVars();
  
  if (!MONGO_URI) {
    console.error('MONGO_URI not provided');
    process.exit(1);
  }

  // Conectar a MongoDB con reintentos
  await connectWithRetry(MONGO_URI);

  const app = express();
  const server = http.createServer(app);
  
  // En desarrollo, permitir todos los orígenes. En producción, usar ORIGIN específico
  const corsOrigin = process.env.NODE_ENV === 'production' ? ORIGIN : '*';
  
  const io = new Server(server, { path: '/ws', cors: { origin: corsOrigin } });

  initSocket(io);

  app.use(cors({ origin: corsOrigin }));
  app.use(helmet());
  app.use(express.json());
  app.use(morgan('dev'));

  // Rate limiting general para toda la API
  app.use('/api', generalLimiter);

  app.get('/health', (_req, res) => {
    res.status(StatusCodes.OK).json({ status: 'ok' });
  });

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  server.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
