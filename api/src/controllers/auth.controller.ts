import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Rider } from '../models/Rider';
import { Driver } from '../models/Driver';
import { Admin } from '../models/Admin';
import { 
  validateRiderRegistration, 
  validateDriverRegistration, 
  validateLoginData,
  sanitizeString 
} from '../utils/validation';

// --- REGISTER ---

export async function registerRider(req: Request, res: Response) {
  const { email, password, name, phone, specialDiscount } = req.body;
  
  // Validar datos de entrada
  const validationErrors = validateRiderRegistration(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      details: validationErrors 
    });
  }
  
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return res.status(409).json({ error: 'Email in use' });

  const user = await Rider.create({ 
    email: sanitizeString(email.toLowerCase()), 
    password, 
    name: name ? sanitizeString(name) : undefined, 
    phone: phone ? sanitizeString(phone) : undefined,
    specialDiscount: specialDiscount || 'none',
    role: 'rider' 
  });
  
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();
  return res.status(201).json({ 
    token, 
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, name: user.name } 
  });
}

export async function registerDriver(req: Request, res: Response) {
  const { email, password, name, phone, licenseNumber, vehiclePlate, vehicleModel } = req.body;
  
  // Validar datos de entrada
  const validationErrors = validateDriverRegistration(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      details: validationErrors 
    });
  }
  
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return res.status(409).json({ error: 'Email in use' });

  const user = await Driver.create({ 
    email: sanitizeString(email.toLowerCase()), 
    password, 
    name: sanitizeString(name), 
    phone: sanitizeString(phone),
    licenseNumber: sanitizeString(licenseNumber),
    vehiclePlate: sanitizeString(vehiclePlate),
    vehicleModel: sanitizeString(vehicleModel),
    role: 'driver' 
  });
  
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();
  return res.status(201).json({ 
    token, 
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, name: user.name } 
  });
}

export async function registerAdmin(req: Request, res: Response) {
  const { email, password, name, phone, department } = req.body;
  
  // Validaciones básicas (similar a driver)
  const validationErrors = validateDriverRegistration({ ...req.body, licenseNumber: 'temp', vehiclePlate: 'temp', vehicleModel: 'temp' });
  const relevantErrors = validationErrors.filter(e => !['licenseNumber', 'vehiclePlate', 'vehicleModel'].includes(e.field));
  
  if (relevantErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      details: relevantErrors 
    });
  }
  
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return res.status(409).json({ error: 'Email in use' });

  const user = await Admin.create({ 
    email: sanitizeString(email.toLowerCase()), 
    password, 
    name: sanitizeString(name), 
    phone: sanitizeString(phone),
    department: department ? sanitizeString(department) : undefined,
    role: 'admin' 
  });
  
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();
  return res.status(201).json({ 
    token, 
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, name: user.name } 
  });
}

// --- LOGIN ---

export async function loginRider(req: Request, res: Response) {
  return loginGeneric(req, res, 'rider');
}

export async function loginDriver(req: Request, res: Response) {
  return loginGeneric(req, res, 'driver');
}

export async function loginAdmin(req: Request, res: Response) {
  return loginGeneric(req, res, 'admin');
}

async function loginGeneric(req: Request, res: Response, expectedRole: string) {
  const { email, password } = req.body;
  
  // Validar datos de entrada
  const validationErrors = validateLoginData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      details: validationErrors 
    });
  }
  
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  // Check role matches endpoint
  if (user.role !== expectedRole) {
    return res.status(403).json({ error: `Access denied. Not a ${expectedRole} account.` });
  }

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();
  return res.json({ 
    token, 
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, name: user.name } 
  });
}

export async function profile(req: Request, res: Response) {
  const user = await User.findById(req.user?.id).select('-password');
  return res.json({ user });
}

// Endpoint para refrescar el access token usando refresh token
export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const payload = jwt.verify(refreshToken, secret) as { userId: string; role: string; type?: string };
    
    // Verificar que sea un refresh token
    if (payload.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    // Buscar usuario
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Generar nuevo access token
    const newAccessToken = user.generateToken();
    
    return res.json({ 
      token: newAccessToken,
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

