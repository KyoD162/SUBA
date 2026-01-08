import { Request, Response } from 'express';
import mongoose, { FilterQuery } from 'mongoose';

import { Ticket, ITicket } from '../models/Ticket';
import { TicketType } from '../models/TicketType';
import { sanitizeString } from '../utils/validation';

// Helper to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// --- TICKET TYPES (Admin) ---

// Get all ticket types (public - for displaying available tickets)
export async function getAllTicketTypes(req: Request, res: Response) {
  try {
    const { activeOnly } = req.query;
    const filter = activeOnly === 'true' ? { isActive: true } : {};
    
    const ticketTypes = await TicketType.find(filter).sort({ price: 1 });
    return res.json({ ticketTypes });
  } catch (error: unknown) {
    console.error('[TICKET_TYPES] Error fetching ticket types:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al obtener tipos de tickets' });
  }
}

// Get single ticket type
export async function getTicketType(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const ticketType = await TicketType.findById(id);
    if (!ticketType) {
      return res.status(404).json({ error: 'Tipo de ticket no encontrado' });
    }
    
    return res.json({ ticketType });
  } catch (error: unknown) {
    console.error('[TICKET_TYPES] Error fetching ticket type:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al obtener tipo de ticket' });
  }
}

// Create ticket type (Admin only)
export async function createTicketType(req: Request, res: Response) {
  try {
    const { name, description, category, price, usageLimit, durationMinutes, color, icon, isActive } = req.body;
    
    // Validate required fields
    if (!name || !description || !category || price === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos: name, description, category, price' });
    }
    
    // Validate category
    if (!['single', 'multi', 'time_based'].includes(category)) {
      return res.status(400).json({ error: 'Categoría inválida. Use: single, multi, time_based' });
    }
    
    // Validate category-specific requirements
    if (category === 'multi' && (!usageLimit || usageLimit < 2)) {
      return res.status(400).json({ error: 'Los tickets multi-uso requieren usageLimit >= 2' });
    }
    
    if (category === 'time_based' && (!durationMinutes || durationMinutes < 1)) {
      return res.status(400).json({ error: 'Los tickets por tiempo requieren durationMinutes >= 1' });
    }
    
    const ticketType = await TicketType.create({
      name: sanitizeString(name),
      description: sanitizeString(description),
      category,
      price: Number(price),
      usageLimit: category === 'single' ? 1 : (usageLimit ? Number(usageLimit) : null),
      durationMinutes: category === 'time_based' ? Number(durationMinutes) : null,
      color: color || '#0891B2',
      icon: icon || 'ticket',
      isActive: isActive !== undefined ? isActive : true
    });
    
    return res.status(201).json({ ticketType });
  } catch (error: unknown) {
    console.error('[TICKET_TYPES] Error creating ticket type:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al crear tipo de ticket' });
  }
}

// Update ticket type (Admin only)
export async function updateTicketType(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const ticketType = await TicketType.findById(id);
    if (!ticketType) {
      return res.status(404).json({ error: 'Tipo de ticket no encontrado' });
    }
    
    // Apply updates
    const allowedFields = ['name', 'description', 'category', 'price', 'usageLimit', 'durationMinutes', 'color', 'icon', 'isActive'] as const;
    type AllowedField = typeof allowedFields[number];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'name' || field === 'description') {
          (ticketType as Record<AllowedField, unknown>)[field] = sanitizeString(updates[field]);
        } else {
          (ticketType as Record<AllowedField, unknown>)[field] = updates[field];
        }
      }
    }
    
    await ticketType.save();
    return res.json({ ticketType });
  } catch (error: unknown) {
    console.error('[TICKET_TYPES] Error updating ticket type:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al actualizar tipo de ticket' });
  }
}

// Delete ticket type (Admin only - soft delete by setting isActive to false)
export async function deleteTicketType(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const ticketType = await TicketType.findById(id);
    if (!ticketType) {
      return res.status(404).json({ error: 'Tipo de ticket no encontrado' });
    }
    
    // Check if there are active tickets of this type
    const activeTickets = await Ticket.countDocuments({ 
      ticketTypeId: id, 
      status: 'active' 
    });
    
    if (activeTickets > 0) {
      // Soft delete - just deactivate
      ticketType.isActive = false;
      await ticketType.save();
      return res.json({ 
        message: 'Tipo de ticket desactivado (hay tickets activos)',
        ticketType 
      });
    }
    
    // Hard delete if no active tickets
    await TicketType.findByIdAndDelete(id);
    return res.json({ message: 'Tipo de ticket eliminado' });
  } catch (error: unknown) {
    console.error('[TICKET_TYPES] Error deleting ticket type:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al eliminar tipo de ticket' });
  }
}

// --- USER TICKETS ---

// Purchase a ticket
export async function purchaseTicket(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const { ticketTypeId } = req.body;
    
    if (!ticketTypeId || !mongoose.isValidObjectId(ticketTypeId)) {
      return res.status(400).json({ error: 'ticketTypeId inválido' });
    }
    
    // Get the ticket type
    const ticketType = await TicketType.findById(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ error: 'Tipo de ticket no encontrado' });
    }
    
    if (!ticketType.isActive) {
      return res.status(400).json({ error: 'Este tipo de ticket no está disponible' });
    }
    
    // Create the ticket with snapshot of ticket type data
    const ticket = await Ticket.create({
      userId,
      ticketTypeId: ticketType._id,
      name: ticketType.name,
      category: ticketType.category,
      price: ticketType.price,
      usageLimit: ticketType.category === 'single' ? 1 : ticketType.usageLimit,
      durationMinutes: ticketType.durationMinutes,
      color: ticketType.color,
      icon: ticketType.icon,
      status: 'active'
    });
    
    console.log('[TICKETS] Ticket purchased:', ticket.ticketNumber, 'by user:', userId);
    
    return res.status(201).json({ 
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        qrCode: ticket.qrCode,
        qrData: ticket.generateQRData(),
        name: ticket.name,
        category: ticket.category,
        price: ticket.price,
        usageLimit: ticket.usageLimit,
        durationMinutes: ticket.durationMinutes,
        color: ticket.color,
        icon: ticket.icon,
        status: ticket.status,
        usageCount: ticket.usageCount,
        remainingUses: ticket.getRemainingUses(),
        expiresAt: ticket.expiresAt,
        purchasedAt: ticket.purchasedAt
      }
    });
  } catch (error: unknown) {
    console.error('[TICKETS] Error purchasing ticket:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al comprar ticket' });
  }
}

// Get user's tickets
export async function getUserTickets(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const { status, page = '1', limit = '20' } = req.query;
    
    const filter: FilterQuery<ITicket> = { userId: new mongoose.Types.ObjectId(userId) };
    if (status && ['active', 'used', 'expired', 'cancelled'].includes(status as string)) {
      filter.status = status as string;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ purchasedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Ticket.countDocuments(filter)
    ]);
    
    // Check and update expired tickets
    const now = new Date();
    const ticketData = tickets.map(ticket => {
      // Auto-expire time-based tickets
      if (ticket.status === 'active' && ticket.expiresAt && ticket.expiresAt < now) {
        ticket.status = 'expired';
        ticket.save(); // Fire and forget
      }
      
      return {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        qrCode: ticket.qrCode,
        qrData: ticket.generateQRData(),
        name: ticket.name,
        category: ticket.category,
        price: ticket.price,
        usageLimit: ticket.usageLimit,
        durationMinutes: ticket.durationMinutes,
        color: ticket.color,
        icon: ticket.icon,
        status: ticket.status,
        usageCount: ticket.usageCount,
        remainingUses: ticket.getRemainingUses(),
        timeRemaining: ticket.getTimeRemaining(),
        expiresAt: ticket.expiresAt,
        activatedAt: ticket.activatedAt,
        purchasedAt: ticket.purchasedAt
      };
    });
    
    return res.json({ 
      tickets: ticketData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: unknown) {
    console.error('[TICKETS] Error fetching user tickets:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al obtener tickets' });
  }
}

// Get single ticket
export async function getTicket(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const ticket = await Ticket.findOne({ _id: id, userId });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    
    return res.json({ 
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        qrCode: ticket.qrCode,
        qrData: ticket.generateQRData(),
        name: ticket.name,
        category: ticket.category,
        price: ticket.price,
        usageLimit: ticket.usageLimit,
        durationMinutes: ticket.durationMinutes,
        color: ticket.color,
        icon: ticket.icon,
        status: ticket.status,
        usageCount: ticket.usageCount,
        usageHistory: ticket.usageHistory,
        remainingUses: ticket.getRemainingUses(),
        timeRemaining: ticket.getTimeRemaining(),
        expiresAt: ticket.expiresAt,
        activatedAt: ticket.activatedAt,
        purchasedAt: ticket.purchasedAt
      }
    });
  } catch (error: unknown) {
    console.error('[TICKETS] Error fetching ticket:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al obtener ticket' });
  }
}

// Validate/Redeem a ticket (for drivers)
export async function redeemTicket(req: Request, res: Response) {
  try {
    const driverId = req.user?.id;
    const driverRole = req.user?.role;
    
    if (!driverId || (driverRole !== 'driver' && driverRole !== 'admin')) {
      return res.status(403).json({ error: 'Solo conductores pueden canjear tickets' });
    }
    
    const { qrCode, tripId, location } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({ error: 'qrCode requerido' });
    }
    
    // Find ticket by QR code
    const ticket = await Ticket.findOne({ qrCode });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    
    // Check if ticket can be used
    if (!ticket.canBeUsed()) {
      let reason = 'Ticket no válido';
      if (ticket.status === 'used') reason = 'Ticket ya utilizado';
      if (ticket.status === 'expired') reason = 'Ticket expirado';
      if (ticket.status === 'cancelled') reason = 'Ticket cancelado';
      if (ticket.usageLimit && ticket.usageCount >= ticket.usageLimit) reason = 'Ticket sin usos disponibles';
      if (ticket.expiresAt && new Date() > ticket.expiresAt) reason = 'Ticket expirado';
      
      return res.status(400).json({ 
        error: reason,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
          usageCount: ticket.usageCount,
          usageLimit: ticket.usageLimit
        }
      });
    }
    
    // Redeem the ticket
    const tripObjectId = tripId && mongoose.isValidObjectId(tripId) 
      ? new mongoose.Types.ObjectId(tripId) 
      : undefined;
    
    const success = await ticket.use(
      tripObjectId,
      new mongoose.Types.ObjectId(driverId),
      location
    );
    
    if (!success) {
      return res.status(400).json({ error: 'No se pudo canjear el ticket' });
    }
    
    console.log('[TICKETS] Ticket redeemed:', ticket.ticketNumber, 'by driver:', driverId);
    
    return res.json({ 
      message: 'Ticket canjeado exitosamente',
      ticket: {
        ticketNumber: ticket.ticketNumber,
        name: ticket.name,
        status: ticket.status,
        usageCount: ticket.usageCount,
        remainingUses: ticket.getRemainingUses(),
        timeRemaining: ticket.getTimeRemaining()
      }
    });
  } catch (error: unknown) {
    console.error('[TICKETS] Error redeeming ticket:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al canjear ticket' });
  }
}

// Validate ticket without redeeming (check if valid)
export async function validateTicket(req: Request, res: Response) {
  try {
    const { qrCode } = req.params;
    
    if (!qrCode) {
      return res.status(400).json({ error: 'qrCode requerido' });
    }
    
    const ticket = await Ticket.findOne({ qrCode }).populate('userId', 'name email');
    if (!ticket) {
      return res.status(404).json({ 
        valid: false,
        error: 'Ticket no encontrado' 
      });
    }
    
    const isValid = ticket.canBeUsed();
    
    return res.json({ 
      valid: isValid,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        name: ticket.name,
        category: ticket.category,
        status: ticket.status,
        usageCount: ticket.usageCount,
        remainingUses: ticket.getRemainingUses(),
        timeRemaining: ticket.getTimeRemaining(),
        user: ticket.userId
      }
    });
  } catch (error: unknown) {
    console.error('[TICKETS] Error validating ticket:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al validar ticket' });
  }
}

// Get ticket statistics (Admin)
export async function getTicketStats(req: Request, res: Response) {
  try {
    const [
      totalTickets,
      activeTickets,
      usedTickets,
      expiredTickets,
      totalRevenue,
      ticketsByCategory
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'active' }),
      Ticket.countDocuments({ status: 'used' }),
      Ticket.countDocuments({ status: 'expired' }),
      Ticket.aggregate([
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      Ticket.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);
    
    return res.json({
      stats: {
        totalTickets,
        activeTickets,
        usedTickets,
        expiredTickets,
        totalRevenue: totalRevenue[0]?.total || 0,
        ticketsByCategory: ticketsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error: unknown) {
    console.error('[TICKETS] Error fetching stats:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}
