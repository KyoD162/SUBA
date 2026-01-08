import { Router } from 'express';

import { authRouter } from './auth.routes';
import { tripRouter } from './trip.routes';
import { routeRouter } from './route.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/trips', tripRouter);
router.use('/routes', routeRouter);

router.get('/version', (_req, res) => {
  res.json({ name: 'SUBA API', version: '0.1.0' });
});
