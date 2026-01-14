import { Router } from 'express';

import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { ticketRouter } from './ticket.routes';
import { adminRouter } from './admin.routes';
import { routeRouter } from './route.routes';
import { tripRouter } from './trip.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/tickets', ticketRouter);
router.use('/admin', adminRouter);
router.use('/routes', routeRouter);
router.use('/trips', tripRouter);

router.get('/version', (_req, res) => {
  res.json({ name: 'SUBA API', version: '0.1.0' });
});
