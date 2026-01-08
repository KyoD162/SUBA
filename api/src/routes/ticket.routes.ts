import { Router } from 'express';

import { auth, requireRole } from '../middlewares/auth';
import {
  // Ticket Types
  getAllTicketTypes,
  getTicketType,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  // User Tickets
  purchaseTicket,
  getUserTickets,
  getTicket,
  // Driver/Redemption
  redeemTicket,
  validateTicket,
  // Admin Stats
  getTicketStats
} from '../controllers/ticket.controller';

export const ticketRouter = Router();

// ==========================================
// PUBLIC ROUTES (with optional auth)
// ==========================================

// Get all active ticket types (for purchase display)
ticketRouter.get('/types', getAllTicketTypes);

// Get single ticket type
ticketRouter.get('/types/:id', getTicketType);

// ==========================================
// AUTHENTICATED USER ROUTES
// ==========================================

// Purchase a ticket
ticketRouter.post('/purchase', auth(true), purchaseTicket);

// Get user's tickets
ticketRouter.get('/my-tickets', auth(true), getUserTickets);

// Get single ticket
ticketRouter.get('/my-tickets/:id', auth(true), getTicket);

// ==========================================
// DRIVER ROUTES (for scanning/redeeming)
// ==========================================

// Validate a ticket (check if valid without redeeming)
ticketRouter.get('/validate/:qrCode', auth(true), validateTicket);

// Redeem a ticket
ticketRouter.post('/redeem', auth(true), requireRole(['driver', 'admin']), redeemTicket);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Create ticket type
ticketRouter.post('/types', auth(true), requireRole(['admin']), createTicketType);

// Update ticket type
ticketRouter.put('/types/:id', auth(true), requireRole(['admin']), updateTicketType);

// Delete ticket type
ticketRouter.delete('/types/:id', auth(true), requireRole(['admin']), deleteTicketType);

// Get ticket statistics
ticketRouter.get('/stats', auth(true), requireRole(['admin']), getTicketStats);
