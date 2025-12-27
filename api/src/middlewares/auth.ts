import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function auth(required = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    
    if (!header) {
      if (required) return res.status(401).json({ error: 'No authorization header' });
      return next();
    }
    
    // Validar formato Bearer
    if (!header.startsWith('Bearer ')) {
      if (required) return res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
      return next();
    }
    
    const token = header.replace('Bearer ', '');
    
    if (!token || token.trim() === '') {
      if (required) return res.status(401).json({ error: 'Token is empty' });
      return next();
    }
    
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        if (required) return res.status(500).json({ error: 'Server configuration error' });
        return next();
      }
      const payload = jwt.verify(token, secret) as { userId?: string; id?: string; email?: string; role?: string; type?: string };
      
      // Asegurarse de que NO es un refresh token
      if (payload.type === 'refresh') {
        if (required) return res.status(401).json({ error: 'Cannot use refresh token as access token' });
        return next();
      }
      
      // Validar que tenga userId
      if (!payload.userId && !payload.id) {
        if (required) return res.status(401).json({ error: 'Invalid token payload' });
        return next();
      }
      
      req.user = {
        id: payload.userId || payload.id || '',
        email: payload.email,
        role: payload.role,
      };
      
      return next();
    } catch (error: any) {
      // Distinguir entre token expirado y token inválido
      if (error.name === 'TokenExpiredError') {
        if (required) return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      } else if (error.name === 'JsonWebTokenError') {
        if (required) return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
      } else {
        if (required) return res.status(401).json({ error: 'Token verification failed' });
      }
      
      if (!required) return next();
    }
  };
}
