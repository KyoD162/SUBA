import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';

import { requireAuth, requireRole } from '../middlewares/auth';
import { User } from '../models/User';
import { Trip } from '../models/Trip';
import { Ticket, TicketType } from '../models/Ticket';
import { Route } from '../models/Route';

export const adminRouter = Router();

// Middleware to require admin role
const requireAdmin = [requireAuth, requireRole(['admin'])];

// Dashboard stats
adminRouter.get('/stats', ...requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalDrivers,
      totalRiders,
      activeTrips,
      totalTrips,
      totalRoutes,
      totalTicketsSold,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'rider' }),
      Trip.countDocuments({ status: 'active' }),
      Trip.countDocuments(),
      Route.countDocuments({ isActive: true }),
      Ticket.countDocuments(),
    ]);

    // Revenue calculation
    const revenueAgg = await Ticket.aggregate([
      { $group: { _id: null, total: { $sum: '$priceUSD' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      stats: {
        totalUsers,
        totalDrivers,
        totalRiders,
        activeTrips,
        totalTrips,
        totalRoutes,
        totalTicketsSold,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
adminRouter.get('/users', ...requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;

    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// Get all drivers
adminRouter.get('/drivers', ...requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json({ drivers });
  } catch (error) {
    next(error);
  }
});

// Get all trips
adminRouter.get('/trips', ...requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const query = status ? { status } : {};
    
    const trips = await Trip.find(query)
      .populate('driverId', 'name email')
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Trip.countDocuments(query);

    res.json({
      trips,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// Get all ticket types
adminRouter.get('/ticket-types', ...requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await TicketType.find().sort({ createdAt: -1 });
    res.json({ ticketTypes: types });
  } catch (error) {
    next(error);
  }
});

// Create/Update ticket type
adminRouter.post('/ticket-types', ...requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name, description, category, color, priceUSD, maxUses, durationMinutes, isActive } = req.body;

    if (id) {
      // Update existing
      const type = await TicketType.findByIdAndUpdate(
        id,
        { name, description, category, color, priceUSD, maxUses, durationMinutes, isActive },
        { new: true, runValidators: true }
      );
      res.json({ message: 'Ticket type updated', ticketType: type });
    } else {
      // Create new
      const type = new TicketType({ name, description, category, color, priceUSD, maxUses, durationMinutes });
      await type.save();
      res.status(201).json({ message: 'Ticket type created', ticketType: type });
    }
  } catch (error) {
    next(error);
  }
});

// Delete ticket type
adminRouter.delete('/ticket-types/:id', ...requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await TicketType.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket type deleted' });
  } catch (error) {
    next(error);
  }
});

// Get all routes
adminRouter.get('/routes', ...requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json({ routes });
  } catch (error) {
    next(error);
  }
});

// Create/Update route
adminRouter.post('/routes', ...requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { routeId, name, description, color, priceUSD, frequency, estimatedDuration, distance, stops, isActive } = req.body;

    const route = await Route.findOneAndUpdate(
      { routeId },
      { name, description, color, priceUSD, frequency, estimatedDuration, distance, stops, isActive },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: 'Route saved', route });
  } catch (error) {
    next(error);
  }
});
