import { Request, Response } from 'express';
import { User } from '../models/User';
import { sanitizeString, validateEmail, validateFullName, validatePhone } from '../utils/validation';

const toSafeUser = (user: any) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  name: user.name,
  phone: user.phone,
  city: user.city,
  documentId: user.documentId,
  bio: user.bio,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

function canAccess(req: Request, userId: string | undefined) {
  if (!req.user) return false;
  if (!userId) return false;
  return req.user.id === userId || req.user.role === 'admin';
}

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;

  if (!canAccess(req, id)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const user = await User.findById(id).select('-password');
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  return res.json({ user: toSafeUser(user) });
}

export async function updateUserById(req: Request, res: Response) {
  const { id } = req.params;

  if (!canAccess(req, id)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { email, name, phone, city, documentId, bio } = req.body || {};

  const errors = [] as { field: string; message: string }[];

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

  if (city !== undefined && typeof city === 'string' && city.trim().length > 120) {
    errors.push({ field: 'city', message: 'La ciudad es demasiado larga' });
  }

  if (documentId !== undefined && typeof documentId === 'string' && documentId.trim().length > 50) {
    errors.push({ field: 'documentId', message: 'El documento es demasiado largo' });
  }

  if (bio !== undefined && typeof bio === 'string' && bio.trim().length > 300) {
    errors.push({ field: 'bio', message: 'La biografía es demasiado larga' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos', details: errors });
  }

  if (email && email.toLowerCase().trim() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user.id } });
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

  await user.save();

  const fresh = await User.findById(user.id).select('-password');
  return res.json({ user: toSafeUser(fresh) });
}
