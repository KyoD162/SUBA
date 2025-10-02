import { Router } from 'express';
import { authRouter } from './auth.routes';

export const router = Router();

router.use('/auth', authRouter);

router.get('/version', (_req, res) => {
  res.json({ name: 'SUBA API', version: '0.1.0' });
});
