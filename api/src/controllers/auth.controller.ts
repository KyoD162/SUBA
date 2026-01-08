import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Rider } from '../models/Rider';
import { Driver } from '../models/Driver';
import { Admin } from '../models/Admin';
import { 
  validateRiderRegistration, 
  validateDriverRegistration, 
  validateAdminRegistration,
  validateLoginData,
  sanitizeString 
} from '../utils/validation';

// --- REGISTRO ---

export async function registerRider(req: Request, res: Response) {
  console.log('[REGISTER] Iniciando registro de rider...');
  console.log('[REGISTER] Body recibido:', JSON.stringify(req.body, null, 2));
  
  try {
    const { email, password, name, phone, specialDiscount } = req.body;
    
    // Validar datos de entrada
    console.log('[REGISTER] Validando datos...');
    const validationErrors = validateRiderRegistration(req.body);
    if (validationErrors.length > 0) {
      console.log('[REGISTER] Errores de validación:', validationErrors);
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validationErrors 
      });
    }
    
    console.log('[REGISTER] Buscando email existente:', email.toLowerCase().trim());
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log('[REGISTER] Email ya existe');
      return res.status(409).json({ error: 'Email in use' });
    }

    console.log('[REGISTER] Creando usuario...');
    const user = await Rider.create({ 
      email: sanitizeString(email.toLowerCase()), 
      password, 
      name: name ? sanitizeString(name) : undefined, 
      phone: phone ? sanitizeString(phone) : undefined,
      specialDiscount: specialDiscount || 'none',
      role: 'rider' 
    });
    
    console.log('[REGISTER] Usuario creado con ID:', user.id);
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();
    
    console.log('[REGISTER] Tokens generados, enviando respuesta...');
    return res.status(201).json({ 
      token, 
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, name: user.name } 
    });
  } catch (error: any) {
    console.error('[REGISTER] Error:', error.message);
    console.error('[REGISTER] Stack:', error.stack);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function registerDriver(req: Request, res: Response) {
  console.log('[REGISTER] Iniciando registro de driver...');
  
  try {
    const { email, password, name, phone, licenseNumber, vehiclePlate, vehicleModel } = req.body;
    
    // Validar datos de entrada
    const validationErrors = validateDriverRegistration(req.body);
    if (validationErrors.length > 0) {
      console.log('[REGISTER] Errores de validación:', validationErrors);
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validationErrors 
      });
    }
    
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log('[REGISTER] Email ya existe');
      return res.status(409).json({ error: 'Email in use' });
    }

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
    
    console.log('[REGISTER] Driver creado con ID:', user.id);
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();
    
    return res.status(201).json({ 
      token, 
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, name: user.name } 
    });
  } catch (error: any) {
    console.error('[REGISTER] Error:', error.message);
    console.error('[REGISTER] Stack:', error.stack);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function registerAdmin(req: Request, res: Response) {
  console.log('[REGISTER] Iniciando registro de admin...');
  
  try {
    const { email, password, name, phone, department } = req.body;
    
    // Validar datos de entrada con función específica para admin
    const validationErrors = validateAdminRegistration(req.body);
    if (validationErrors.length > 0) {
      console.log('[REGISTER] Errores de validación:', validationErrors);
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validationErrors 
      });
    }
    
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log('[REGISTER] Email ya existe');
      return res.status(409).json({ error: 'Email in use' });
    }

    const user = await Admin.create({ 
      email: sanitizeString(email.toLowerCase()), 
      password, 
      name: sanitizeString(name), 
      phone: sanitizeString(phone),
      department: department ? sanitizeString(department) : undefined,
      role: 'admin' 
    });
    
    console.log('[REGISTER] Admin creado con ID:', user.id);
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();
    
    return res.status(201).json({ 
      token, 
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, name: user.name } 
    });
  } catch (error: any) {
    console.error('[REGISTER] Error:', error.message);
    console.error('[REGISTER] Stack:', error.stack);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// --- INICIO DE SESIÓN ---

// Login unificado - detecta el rol automáticamente
export async function login(req: Request, res: Response) {
  try {
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
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();
    
    // El rol se devuelve automáticamente desde el modelo
    return res.json({ 
      token, 
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, name: user.name } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
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

// --- LOGOUT ---
// Con JWT stateless el "logout" real es que el cliente elimine tokens.
// Este endpoint existe para auditoría y para futuros refresh tokens revocables.
export async function logout(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const ip = req.ip;
    const userAgent = req.get('user-agent');
    console.log('[LOGOUT]', JSON.stringify({ userId, role, ip, userAgent }));
  } catch (e) {
    // No bloquear logout por fallas de logging
  }

  return res.status(204).send();
}

