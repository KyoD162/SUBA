import { Router } from 'express';
import { auth, requireRole } from '../middlewares/auth';
import { authLimiter, refreshTokenLimiter } from '../middlewares/rateLimiter';
import { 
  login,
  registerRider, registerDriver, registerAdmin,
  profile,
  refreshToken,
  logout
} from '../controllers/auth.controller';

export const authRouter = Router();

// Login unificado (detecta rol automáticamente)
authRouter.post('/login', authLimiter, login);

// === REGISTRO POR TIPO DE USUARIO ===

// Riders: Registro público (desde la app móvil)
authRouter.post('/register/rider', authLimiter, registerRider);

// Drivers: Solo admins pueden registrar conductores
authRouter.post('/register/driver', authLimiter, auth(true), requireRole(['admin']), registerDriver);

// Admins: Solo admins pueden crear otros admins
authRouter.post('/register/admin', authLimiter, auth(true), requireRole(['admin']), registerAdmin);

// Token refresh
authRouter.post('/refresh', refreshTokenLimiter, refreshToken);

// Logout (JWT stateless: limpia tokens en cliente; aquí solo auditoría)
authRouter.post('/logout', auth(true), logout);

// Perfil del usuario autenticado
authRouter.get('/me', auth(true), profile);

