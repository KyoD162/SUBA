import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { authLimiter, refreshTokenLimiter } from '../middlewares/rateLimiter';
import { 
  login,
  loginRider, loginDriver, loginAdmin, 
  registerRider, registerDriver, registerAdmin,
  profile,
  refreshToken
} from '../controllers/auth.controller';

export const authRouter = Router();

// Login unificado (detecta rol automáticamente)
authRouter.post('/login', authLimiter, login);

// Rider (User) - con rate limiting
authRouter.post('/register/rider', authLimiter, registerRider);
authRouter.post('/login/rider', authLimiter, loginRider); // Mantener por compatibilidad

// Driver - con rate limiting
authRouter.post('/register/driver', authLimiter, registerDriver);
authRouter.post('/login/driver', authLimiter, loginDriver); // Mantener por compatibilidad

// Admin - con rate limiting
authRouter.post('/register/admin', authLimiter, registerAdmin);
authRouter.post('/login/admin', authLimiter, loginAdmin); // Mantener por compatibilidad

// Token refresh - con rate limiting más permisivo
authRouter.post('/refresh', refreshTokenLimiter, refreshToken);

// Generic/Profile
authRouter.get('/me', auth(true), profile);

