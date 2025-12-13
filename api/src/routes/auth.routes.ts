import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { 
  loginRider, loginDriver, loginAdmin, 
  registerRider, registerDriver, registerAdmin,
  profile 
} from '../controllers/auth.controller';

export const authRouter = Router();

// Rider (User)
authRouter.post('/register/rider', registerRider);
authRouter.post('/login/rider', loginRider);

// Driver
authRouter.post('/register/driver', registerDriver);
authRouter.post('/login/driver', loginDriver);

// Admin
authRouter.post('/register/admin', registerAdmin);
authRouter.post('/login/admin', loginAdmin);

// Generic/Profile
authRouter.get('/me', auth(true), profile);

