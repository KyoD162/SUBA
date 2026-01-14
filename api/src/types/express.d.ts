import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email?: string;
      role?: 'rider' | 'driver' | 'admin';
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
