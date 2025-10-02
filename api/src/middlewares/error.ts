import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(StatusCodes.NOT_FOUND).json({ error: 'Not Found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: message });
}
