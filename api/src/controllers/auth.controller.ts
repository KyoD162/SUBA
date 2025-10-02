import { Request, Response } from 'express';
import { User } from '../models/User';

export async function register(req: Request, res: Response) {
  const { email, password, role } = req.body as { email: string; password: string; role?: string };
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email in use' });
  const user = await User.create({ email, password, role });
  const token = user.generateToken();
  return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = user.generateToken();
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
}

export async function profile(req: Request, res: Response) {
  const user = await User.findById(req.user?.id).select('-password');
  return res.json({ user });
}
