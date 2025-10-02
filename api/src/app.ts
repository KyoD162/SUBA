import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router as apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error';

export function createApp(origin = '*') {
  const app = express();
  app.use(cors({ origin }));
  app.use(helmet());
  app.use(express.json());
  app.use(morgan('dev'));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
