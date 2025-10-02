import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { login, profile, register } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', auth(true), profile);
