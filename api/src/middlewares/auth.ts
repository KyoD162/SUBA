import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function auth(required = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) {
      if (required) return res.status(401).json({ error: 'Unauthorized' });
      return next();
    }
    const token = header.replace('Bearer ', '');
    try {
      const secret = process.env.JWT_SECRET || '';
      const payload = jwt.verify(token, secret) as { userId?: string; id?: string; email?: string; role?: string };
      req.user = {
        id: payload.userId || payload.id || '',
        email: payload.email,
        role: payload.role,
      };
      return next();
    } catch {
      if (required) return res.status(401).json({ error: 'Invalid token' });
      return next();
    }
  };
}
