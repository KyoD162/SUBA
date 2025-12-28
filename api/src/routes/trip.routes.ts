import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import {
  startTrip,
  updateLocation,
  loadPassengers,
  unloadPassengers,
  endTrip,
  getActiveTrip,
  getTripHistory,
  getActiveBusesOnRoute,
} from '../controllers/trip.controller';

export const tripRouter = Router();

// Driver routes (require auth)
tripRouter.post('/start', requireAuth, startTrip);
tripRouter.post('/location', requireAuth, updateLocation);
tripRouter.post('/load-passengers', requireAuth, loadPassengers);
tripRouter.post('/unload-passengers', requireAuth, unloadPassengers);
tripRouter.post('/end', requireAuth, endTrip);
tripRouter.get('/active', requireAuth, getActiveTrip);
tripRouter.get('/history', requireAuth, getTripHistory);

// Public routes (for riders to see buses)
tripRouter.get('/buses/:routeId', getActiveBusesOnRoute);
