import { Request, Response } from 'express';
import { User } from '../models/User';
import { Rider } from '../models/Rider';
import { Driver } from '../models/Driver';
import { Admin } from '../models/Admin';

// --- REGISTER ---

export async function registerRider(req: Request, res: Response) {
  const { email, password, name, phone, specialDiscount } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email in use' });

  const user = await Rider.create({ 
    email, 
    password, 
    name, 
    phone,
    specialDiscount: specialDiscount || 'none',
    role: 'rider' 
  });
  
  const token = user.generateToken();
  return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
}

export async function registerDriver(req: Request, res: Response) {
  const { email, password, name, phone, licenseNumber, vehiclePlate, vehicleModel } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email in use' });

  const user = await Driver.create({ 
    email, 
    password, 
    name, 
    phone,
    licenseNumber,
    vehiclePlate,
    vehicleModel,
    role: 'driver' 
  });
  
  const token = user.generateToken();
  return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
}

export async function registerAdmin(req: Request, res: Response) {
  const { email, password, name, phone, department, secretKey } = req.body;
  
  // Simple check for admin creation permission (in real app use better security)
  if (secretKey !== process.env.ADMIN_SECRET_KEY && secretKey !== 'admin123') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email in use' });

  const user = await Admin.create({ 
    email, 
    password, 
    name, 
    phone,
    department,
    role: 'admin' 
  });
  
  const token = user.generateToken();
  return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
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
  const user = await User.findOne({ email });
  
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  // Check role matches endpoint
  if (user.role !== expectedRole) {
    return res.status(403).json({ error: `Access denied. Not a ${expectedRole} account.` });
  }

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  
  const token = user.generateToken();
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
}

export async function profile(req: Request, res: Response) {
  const user = await User.findById(req.user?.id).select('-password');
  return res.json({ user });
}

