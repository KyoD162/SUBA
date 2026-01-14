import { Router } from 'express';

import { auth } from '../middlewares/auth';
import { getUserById, updateUserById } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.get('/:id', auth(true), getUserById);
userRouter.patch('/:id', auth(true), updateUserById);
