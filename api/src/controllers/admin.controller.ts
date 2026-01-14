import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { User } from '../models/User';
import { Rider } from '../models/Rider';
import { Driver } from '../models/Driver';
import { Ticket } from '../models/Ticket';
import { TicketType } from '../models/TicketType';
import { sanitizeString, validateEmail, validateFullName, validatePhone } from '../utils/validation';

// Define interfaces for type safety - using Partial for optional fields from Mongoose
interface UserLike {
  _id: mongoose.Types.ObjectId;
  id?: string;
  email?: string;
  role?: string;
  name?: string;
  phone?: string;
  city?: string;
  documentId?: string;
  bio?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  specialDiscount?: string;
  loyaltyPoints?: number;
  licenseNumber?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  isAvailable?: boolean;
  rating?: number;
}

interface QueryFilter {
  role: string;
  isActive?: boolean;
  specialDiscount?: string;
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
}

// Helper to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Transform user to safe response object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toSafeUser = (user: UserLike | any) => ({
  id: user._id || user.id,
  email: user.email,
  role: user.role,
  name: user.name,
  phone: user.phone,
  city: user.city,
  documentId: user.documentId,
  bio: user.bio,
  status: user.isActive !== false ? 'Activo' : 'Inactivo',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  // Rider specific
  specialDiscount: user.specialDiscount,
  loyaltyPoints: user.loyaltyPoints,
  // Driver specific
  licenseNumber: user.licenseNumber,
  vehiclePlate: user.vehiclePlate,
  vehicleModel: user.vehicleModel,
  isAvailable: user.isAvailable,
  rating: user.rating,
});

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const [
      totalUsers,
      totalRiders,
      totalDrivers,
      totalAdmins,
      activeDrivers,
      totalTickets,
      activeTickets,
      totalRevenue,
      recentUsers,
      recentTickets
    ] = await Promise.all([
      User.countDocuments(),
      Rider.countDocuments(),
      Driver.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Driver.countDocuments({ isAvailable: true }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'active' }),
      Ticket.aggregate([
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Ticket.find().sort({ purchasedAt: -1 }).limit(5).populate('userId', 'name email')
    ]);

    // Get user distribution by type
    const userDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get daily revenue for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyRevenue = await Ticket.aggregate([
      { 
        $match: { 
          purchasedAt: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$purchasedAt' } },
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalRiders,
        totalDrivers,
        totalAdmins,
        activeDrivers,
        totalTickets,
        activeTickets,
        totalRevenue: totalRevenue[0]?.total || 0,
        userDistribution: userDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        dailyRevenue
      },
      recentActivity: {
        users: recentUsers.map(toSafeUser),
        tickets: recentTickets.map(t => ({
          id: t._id,
          ticketNumber: t.ticketNumber,
          name: t.name,
          price: t.price,
          status: t.status,
          purchasedAt: t.purchasedAt,
          user: t.userId
        }))
      }
    });
  } catch (error: unknown) {
    console.error('[ADMIN] Error fetching dashboard stats:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

// ==========================================
// USERS MANAGEMENT (Riders)
// ==========================================

export async function getAllUsers(req: Request, res: Response) {
  try {
    const { 
      page = '1', 
      limit = '20', 
      search = '', 
      type = ''
    } = req.query;

    const filter: QueryFilter = { role: 'rider' };

    // Search filter
    if (search) {
      const searchRegex = (search as string);
      filter.$or = [
        { name: { $regex: searchRegex, $options: 'i' } },
        { email: { $regex: searchRegex, $options: 'i' } },
        { phone: { $regex: searchRegex, $options: 'i' } }
      ];
    }

    // Type filter (specialDiscount for riders)
    if (type && type !== 'all') {
      const typeMap: Record<string, string> = {
        'Estudiante': 'student',
        'Estudiantes': 'student',
        'Adulto': 'none',
        'Adultos': 'none',
        'Tercera Edad': 'senior',
        'Especial': 'disabled',
        'Especiales': 'disabled'
      };
      const typeStr = String(type);
      filter.specialDiscount = typeMap[typeStr] || typeStr;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      Rider.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Rider.countDocuments(filter)
    ]);

    // Get ticket counts for each user
    const userIds = users.map(u => u._id);
    const ticketCounts = await Ticket.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    
    const ticketCountMap = ticketCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Map special discount to user-friendly type
    const typeReverseMap: Record<string, string> = {
      'student': 'Estudiante',
      'none': 'Adulto',
      'senior': 'Tercera Edad',
      'disabled': 'Especial'
    };

    const usersWithStats = users.map(user => ({
      ...toSafeUser(user),
      type: typeReverseMap[user.specialDiscount || 'none'] || 'Adulto',
      trips: ticketCountMap[user._id.toString()] || 0,
      balance: user.loyaltyPoints || 0
    }));

    return res.json({
      users: usersWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: unknown) {
    console.error('[ADMIN] Error fetching users:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { email, name, phone, city, documentId, bio, type } = req.body;

    const errors: { field: string; message: string }[] = [];

    if (email !== undefined) {
      const emailError = validateEmail(email);
      if (emailError) errors.push(emailError);
    }

    if (name !== undefined && name !== null && name !== '') {
      const nameError = validateFullName(name);
      if (nameError) errors.push(nameError);
    }

    if (phone !== undefined && phone !== null && phone !== '') {
      const phoneError = validatePhone(phone);
      if (phoneError) errors.push(phoneError);
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors });
    }

    // Update fields
    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: user.id } 
      });
      if (existing) {
        return res.status(409).json({ error: 'Email en uso' });
      }
      user.email = sanitizeString(email.toLowerCase());
    }

    if (name) user.name = sanitizeString(name);
    if (phone) user.phone = sanitizeString(phone);
    if (city !== undefined) user.city = city ? sanitizeString(city) : undefined;
    if (documentId !== undefined) user.documentId = documentId ? sanitizeString(documentId) : undefined;
    if (bio !== undefined) user.bio = bio ? sanitizeString(bio) : undefined;

    // Update rider-specific fields
    if (user.role === 'rider' && type) {
      const typeMap: Record<string, string> = {
        'Estudiante': 'student',
        'Adulto': 'none',
        'Tercera Edad': 'senior',
        'Especial': 'disabled'
      };
      (user as unknown as { specialDiscount: string }).specialDiscount = typeMap[type] || 'none';
    }

    await user.save();

    const fresh = await User.findById(user.id).select('-password');
    if (!fresh) {
      return res.status(404).json({ error: 'Usuario no encontrado después de actualizar' });
    }
    return res.json({ user: toSafeUser(fresh) });
  } catch (error: unknown) {
    console.error('[ADMIN] Error updating user:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Don't allow deleting admins
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'No se puede eliminar administradores' });
    }

    // Check if user has active tickets
    const activeTickets = await Ticket.countDocuments({ 
      userId: id, 
      status: 'active' 
    });

    if (activeTickets > 0) {
      return res.status(400).json({ 
        error: 'El usuario tiene tickets activos. Cancele los tickets primero.',
        activeTickets 
      });
    }

    await User.findByIdAndDelete(id);
    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error: unknown) {
    console.error('[ADMIN] Error deleting user:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
}

// ==========================================
// DRIVERS MANAGEMENT
// ==========================================

export async function getAllDrivers(req: Request, res: Response) {
  try {
    const { 
      page = '1', 
      limit = '20', 
      search = '', 
      vehicle = '',
      status = ''
    } = req.query;

    const filter: QueryFilter & { vehicleModel?: { $regex: string; $options: string }; isAvailable?: boolean } = { role: 'driver' };

    // Search filter
    if (search) {
      const searchRegex = (search as string);
      filter.$or = [
        { name: { $regex: searchRegex, $options: 'i' } },
        { email: { $regex: searchRegex, $options: 'i' } },
        { phone: { $regex: searchRegex, $options: 'i' } },
        { vehiclePlate: { $regex: searchRegex, $options: 'i' } }
      ];
    }

    // Vehicle filter
    if (vehicle && vehicle !== 'all' && vehicle !== 'Todos los tipos') {
      filter.vehicleModel = { $regex: vehicle as string, $options: 'i' };
    }

    // Status filter
    if (status === 'Activo') {
      filter.isAvailable = true;
    } else if (status === 'Inactivo') {
      filter.isAvailable = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [drivers, total] = await Promise.all([
      Driver.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Driver.countDocuments(filter)
    ]);

    // Get trip counts for each driver
    const driverIds = drivers.map(d => d._id);
    const tripCounts = await Ticket.aggregate([
      { $unwind: '$usageHistory' },
      { $match: { 'usageHistory.driverId': { $in: driverIds } } },
      { $group: { _id: '$usageHistory.driverId', count: { $sum: 1 } } }
    ]);
    
    const tripCountMap = tripCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const driversWithStats = drivers.map(driver => ({
      ...toSafeUser(driver),
      vehicle: driver.vehicleModel || 'No especificado',
      trips: tripCountMap[driver._id.toString()] || 0,
      salary: 0, // This could be calculated based on trips
      status: driver.isAvailable ? 'Activo' : 'Inactivo'
    }));

    return res.json({
      drivers: driversWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: unknown) {
    console.error('[ADMIN] Error fetching drivers:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al obtener conductores' });
  }
}

export async function createDriver(req: Request, res: Response) {
  try {
    const { email, password, name, phone, licenseNumber, vehiclePlate, vehicleModel } = req.body;

    // Validation
    const errors: { field: string; message: string }[] = [];

    if (!email) errors.push({ field: 'email', message: 'Email es requerido' });
    if (!password) errors.push({ field: 'password', message: 'Contraseña es requerida' });
    if (!name) errors.push({ field: 'name', message: 'Nombre es requerido' });
    if (!licenseNumber) errors.push({ field: 'licenseNumber', message: 'Número de licencia es requerido' });
    if (!vehiclePlate) errors.push({ field: 'vehiclePlate', message: 'Placa del vehículo es requerida' });

    if (email) {
      const emailError = validateEmail(email);
      if (emailError) errors.push(emailError);
    }

    if (name) {
      const nameError = validateFullName(name);
      if (nameError) errors.push(nameError);
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors });
    }

    // Check if email exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }

    const driver = await Driver.create({
      email: sanitizeString(email.toLowerCase()),
      password,
      name: sanitizeString(name),
      phone: phone ? sanitizeString(phone) : undefined,
      licenseNumber: sanitizeString(licenseNumber),
      vehiclePlate: sanitizeString(vehiclePlate),
      vehicleModel: vehicleModel ? sanitizeString(vehicleModel) : undefined,
      role: 'driver',
      isAvailable: true
    });

    return res.status(201).json({ 
      driver: toSafeUser(driver),
      message: 'Conductor creado correctamente' 
    });
  } catch (error: unknown) {
    console.error('[ADMIN] Error creating driver:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al crear conductor' });
  }
}

export async function updateDriver(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    const { 
      email, name, phone, licenseNumber, vehiclePlate, vehicleModel, 
      isAvailable, status 
    } = req.body;

    const errors: { field: string; message: string }[] = [];

    if (email !== undefined) {
      const emailError = validateEmail(email);
      if (emailError) errors.push(emailError);
    }

    if (name !== undefined && name !== null && name !== '') {
      const nameError = validateFullName(name);
      if (nameError) errors.push(nameError);
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors });
    }

    // Update fields
    if (email && email.toLowerCase().trim() !== driver.email) {
      const existing = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: driver.id } 
      });
      if (existing) {
        return res.status(409).json({ error: 'Email en uso' });
      }
      driver.email = sanitizeString(email.toLowerCase());
    }

    if (name) driver.name = sanitizeString(name);
    if (phone !== undefined) driver.phone = phone ? sanitizeString(phone) : undefined;
    if (licenseNumber) driver.licenseNumber = sanitizeString(licenseNumber);
    if (vehiclePlate) driver.vehiclePlate = sanitizeString(vehiclePlate);
    if (vehicleModel !== undefined) driver.vehicleModel = vehicleModel ? sanitizeString(vehicleModel) : undefined;
    if (isAvailable !== undefined) driver.isAvailable = isAvailable;
    if (status !== undefined) driver.isAvailable = status === 'Activo';

    await driver.save();

    const fresh = await Driver.findById(driver.id).select('-password');
    if (!fresh) {
      return res.status(404).json({ error: 'Conductor no encontrado después de actualizar' });
    }
    return res.json({ 
      driver: toSafeUser(fresh),
      message: 'Conductor actualizado correctamente' 
    });
  } catch (error: unknown) {
    console.error('[ADMIN] Error updating driver:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al actualizar conductor' });
  }
}

export async function deleteDriver(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    await Driver.findByIdAndDelete(id);
    return res.json({ message: 'Conductor eliminado correctamente' });
  } catch (error: unknown) {
    console.error('[ADMIN] Error deleting driver:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al eliminar conductor' });
  }
}

// ==========================================
// PRICING MANAGEMENT
// ==========================================

export async function getPricing(req: Request, res: Response) {
  try {
    // Get all ticket types to derive pricing
    const ticketTypes = await TicketType.find({ isActive: true }).sort({ price: 1 });
    
    // Base price is the cheapest single ticket
    const singleTicket = ticketTypes.find(t => t.category === 'single');
    const basePrice = singleTicket?.price || 1.00;

    // Discounts configuration (could be stored in a separate collection)
    // For now, we'll calculate from ticket types or use defaults
    const discounts = {
      adult: { active: true, discount: 0 },
      student: { active: true, discount: 30 },
      senior: { active: true, discount: 50 },
      disability: { active: true, discount: 50 }
    };

    // Exchange rate (this should come from a configuration or external service)
    const exchangeRate = 36.50;

    return res.json({
      pricing: {
        basePrice,
        bsPrice: basePrice * exchangeRate,
        exchangeRate,
        discounts,
        ticketTypes: ticketTypes.map(t => ({
          id: t._id,
          name: t.name,
          price: t.price,
          category: t.category
        }))
      }
    });
  } catch (error: unknown) {
    console.error('[ADMIN] Error fetching pricing:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al obtener precios' });
  }
}

export async function updatePricing(req: Request, res: Response) {
  try {
    const { basePrice, exchangeRate, discounts } = req.body;

    // Update all single ticket types with new base price
    if (basePrice !== undefined) {
      await TicketType.updateMany(
        { category: 'single' },
        { $set: { price: Number(basePrice) } }
      );
    }

    // Note: Discounts and exchange rate should be stored in a configuration collection
    // For now, we'll just return success
    
    return res.json({ 
      message: 'Precios actualizados correctamente',
      pricing: {
        basePrice,
        exchangeRate,
        discounts
      }
    });
  } catch (error: unknown) {
    console.error('[ADMIN] Error updating pricing:', getErrorMessage(error));
    return res.status(500).json({ error: 'Error al actualizar precios' });
  }
}
