import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { authLimiter, refreshTokenLimiter } from '../middlewares/rateLimiter';
import { 
  login,
  registerRider, registerDriver, registerAdmin,
  profile,
  refreshToken
} from '../controllers/auth.controller';

export const authRouter = Router();

// Login unificado (detecta rol automáticamente)
authRouter.post('/login', authLimiter, login);

// Registro por tipo de usuario
authRouter.post('/register/rider', authLimiter, registerRider);
authRouter.post('/register/driver', authLimiter, registerDriver);
authRouter.post('/register/admin', authLimiter, registerAdmin);

// Token refresh
authRouter.post('/refresh', refreshTokenLimiter, refreshToken);

// Perfil del usuario autenticado
authRouter.get('/me', auth(true), profile);

