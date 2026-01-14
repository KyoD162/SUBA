import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';

import { requireAuth } from '../middlewares/auth';
import { Ticket, TicketType } from '../models/Ticket';
import { User } from '../models/User';

export const ticketRouter = Router();

// Get all ticket types (public - for purchase screen)
ticketRouter.get('/types', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOnly = req.query.active === 'true';
    const query = activeOnly ? { isActive: true } : {};
    const types = await TicketType.find(query).sort({ priceUSD: 1 });
    res.json({ ticketTypes: types });
  } catch (error) {
    next(error);
  }
});

// Get user's tickets
ticketRouter.get('/my-tickets', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const tickets = await Ticket.find({ userId })
      .sort({ purchasedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Ticket.countDocuments({ userId });

    res.json({
      tickets: tickets.map(t => ({
        id: t._id,
        ticketNumber: t.ticketNumber,
        qrCode: t.qrCode,
        qrData: t.qrData,
        name: t.name,
        category: t.category,
        color: t.color,
        priceUSD: t.priceUSD,
        maxUses: t.maxUses,
        remainingUses: t.remainingUses,
        durationMinutes: t.durationMinutes,
        expiresAt: t.expiresAt,
        activatedAt: t.activatedAt,
        status: t.status,
        timeRemaining: t.timeRemaining,
        purchasedAt: t.purchasedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Purchase a ticket
ticketRouter.post('/purchase', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { ticketTypeId } = req.body;

    if (!ticketTypeId) {
      res.status(400).json({ message: 'ticketTypeId is required' });
      return;
    }

    // Get ticket type
    const ticketType = await TicketType.findById(ticketTypeId);
    if (!ticketType || !ticketType.isActive) {
      res.status(404).json({ message: 'Ticket type not found or inactive' });
      return;
    }

    // Create ticket
    const ticket = new Ticket({
      userId,
      name: ticketType.name,
      category: ticketType.category,
      color: ticketType.color,
      priceUSD: ticketType.priceUSD,
      maxUses: ticketType.maxUses,
      remainingUses: ticketType.maxUses,
      durationMinutes: ticketType.durationMinutes,
    });

    await ticket.save();

    res.status(201).json({
      message: 'Ticket purchased successfully',
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        qrCode: ticket.qrCode,
        qrData: ticket.qrData,
        name: ticket.name,
        category: ticket.category,
        color: ticket.color,
        priceUSD: ticket.priceUSD,
        maxUses: ticket.maxUses,
        remainingUses: ticket.remainingUses,
        durationMinutes: ticket.durationMinutes,
        status: ticket.status,
        purchasedAt: ticket.purchasedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Validate/Redeem a ticket (called by driver when scanning QR)
ticketRouter.post('/redeem', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.user?.id;
    const { qrData, tripId } = req.body;

    if (!qrData || !tripId) {
      res.status(400).json({ message: 'qrData and tripId are required' });
      return;
    }

    // Find ticket by QR data
    const ticket = await Ticket.findOne({ qrData });
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found', valid: false });
      return;
    }

    // Check ticket status
    if (ticket.status !== 'active') {
      res.status(400).json({
        message: `Ticket is ${ticket.status}`,
        valid: false,
        status: ticket.status,
      });
      return;
    }

    // Check remaining uses
    if (ticket.remainingUses <= 0) {
      ticket.status = 'used';
      await ticket.save();
      res.status(400).json({
        message: 'Ticket has no remaining uses',
        valid: false,
        status: 'used',
      });
      return;
    }

    // Check expiration for time-based tickets
    if (ticket.category === 'time_based' && ticket.activatedAt && ticket.durationMinutes) {
      const expiresAt = new Date(ticket.activatedAt.getTime() + ticket.durationMinutes * 60 * 1000);
      if (new Date() > expiresAt) {
        ticket.status = 'expired';
        await ticket.save();
        res.status(400).json({
          message: 'Ticket has expired',
          valid: false,
          status: 'expired',
        });
        return;
      }
    }

    // Activate time-based ticket if first use
    if (ticket.category === 'time_based' && !ticket.activatedAt) {
      ticket.activatedAt = new Date();
      if (ticket.durationMinutes) {
        ticket.expiresAt = new Date(Date.now() + ticket.durationMinutes * 60 * 1000);
      }
    }

    // Redeem the ticket
    ticket.remainingUses -= 1;
    ticket.usedInTrips.push({
      tripId,
      usedAt: new Date(),
      driverId,
    });

    // Mark as used if no remaining uses
    if (ticket.remainingUses <= 0) {
      ticket.status = 'used';
    }

    await ticket.save();

    // Get passenger info
    const passenger = await User.findById(ticket.userId).select('name email');

    res.json({
      valid: true,
      message: 'Ticket redeemed successfully',
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        name: ticket.name,
        category: ticket.category,
        remainingUses: ticket.remainingUses,
        status: ticket.status,
      },
      passenger: passenger ? {
        name: passenger.name || 'Pasajero',
        email: passenger.email,
      } : null,
      fareUSD: ticket.priceUSD / ticket.maxUses, // Fare per ride
    });
  } catch (error) {
    next(error);
  }
});

// Seed default ticket types (admin/dev)
ticketRouter.post('/types/seed', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const defaultTypes = [
      {
        name: 'Pasaje Único',
        description: 'Un viaje en cualquier ruta',
        category: 'single',
        color: '#1976D2',
        priceUSD: 0.50,
        maxUses: 1,
      },
      {
        name: 'Bono 10 Viajes',
        description: '10 viajes con descuento',
        category: 'multi',
        color: '#4CAF50',
        priceUSD: 4.00,
        maxUses: 10,
      },
      {
        name: 'Pase Diario',
        description: 'Viajes ilimitados por 24 horas',
        category: 'time_based',
        color: '#FF9800',
        priceUSD: 2.00,
        maxUses: 999,
        durationMinutes: 1440,
      },
      {
        name: 'Pase Semanal',
        description: 'Viajes ilimitados por 7 días',
        category: 'time_based',
        color: '#9C27B0',
        priceUSD: 10.00,
        maxUses: 999,
        durationMinutes: 10080,
      },
    ];

    for (const type of defaultTypes) {
      await TicketType.findOneAndUpdate(
        { name: type.name },
        type,
        { upsert: true, new: true }
      );
    }

    const types = await TicketType.find({ isActive: true });
    res.json({ message: 'Ticket types seeded', ticketTypes: types });
  } catch (error) {
    next(error);
  }
});
