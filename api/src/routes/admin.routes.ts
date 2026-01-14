import { Router } from 'express';

import { auth, requireRole } from '../middlewares/auth';
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getPricing,
  updatePricing
} from '../controllers/admin.controller';

export const adminRouter = Router();

// All admin routes require authentication and admin role
const adminAuth = [auth(true), requireRole(['admin'])];

// ==========================================
// DASHBOARD
// ==========================================

// Get dashboard statistics
adminRouter.get('/dashboard', ...adminAuth, getDashboardStats);

// ==========================================
// USERS (Riders) MANAGEMENT
// ==========================================

// Get all users with pagination and filters
adminRouter.get('/users', ...adminAuth, getAllUsers);

// Update a user
adminRouter.put('/users/:id', ...adminAuth, updateUser);
adminRouter.patch('/users/:id', ...adminAuth, updateUser);

// Delete a user
adminRouter.delete('/users/:id', ...adminAuth, deleteUser);

// ==========================================
// DRIVERS MANAGEMENT
// ==========================================

// Get all drivers with pagination and filters
adminRouter.get('/drivers', ...adminAuth, getAllDrivers);

// Create a new driver
adminRouter.post('/drivers', ...adminAuth, createDriver);

// Update a driver
adminRouter.put('/drivers/:id', ...adminAuth, updateDriver);
adminRouter.patch('/drivers/:id', ...adminAuth, updateDriver);

// Delete a driver
adminRouter.delete('/drivers/:id', ...adminAuth, deleteDriver);

// ==========================================
// PRICING MANAGEMENT
// ==========================================

// Get current pricing configuration
adminRouter.get('/pricing', ...adminAuth, getPricing);

// Update pricing configuration
adminRouter.put('/pricing', ...adminAuth, updatePricing);
adminRouter.patch('/pricing', ...adminAuth, updatePricing);
