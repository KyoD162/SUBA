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

      // Validar y tipar el rol correctamente
      const validRoles = ['rider', 'driver', 'admin'] as const;
      const role = validRoles.includes(payload.role as typeof validRoles[number]) 
        ? payload.role as 'rider' | 'driver' | 'admin' 
        : undefined;
      
      req.user = {
        id: payload.userId || payload.id || '',
        email: payload.email,
        role,
      };
      
      return next();
    } catch (error: unknown) {
      // Distinguir entre token expirado y token inválido
      const errorName = error instanceof Error ? error.name : '';
      if (errorName === 'TokenExpiredError') {
        if (required) return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      } else if (errorName === 'JsonWebTokenError') {
        if (required) return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
      } else {
        if (required) return res.status(401).json({ error: 'Token verification failed' });
      }
      
      if (!required) return next();
    }
  };
}

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * Debe usarse DESPUÉS del middleware auth()
 * 
 * @param allowedRoles - Array de roles permitidos
 * @returns Middleware que verifica el rol del usuario
 * 
 * @example
 * // Solo admins pueden acceder
 * router.post('/admin-only', auth(true), requireRole(['admin']), handler)
 * 
 * // Admins y drivers pueden acceder
 * router.get('/staff', auth(true), requireRole(['admin', 'driver']), handler)
 */
export function requireRole(allowedRoles: ('rider' | 'driver' | 'admin')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      console.warn('[AUTH] requireRole: No hay rol en el usuario autenticado');
      return res.status(403).json({ 
        error: 'Acceso denegado', 
        code: 'NO_ROLE' 
      });
    }

    const validRole = userRole as 'rider' | 'driver' | 'admin';
    if (!allowedRoles.includes(validRole)) {
      console.warn(`[AUTH] requireRole: Rol '${userRole}' no tiene permiso. Requeridos: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción', 
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles
      });
    }

    return next();
  };
}
