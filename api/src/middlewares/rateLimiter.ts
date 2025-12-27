import rateLimit from 'express-rate-limit';

/**
 * Rate limiter general para toda la API
 * Previene abuso general de endpoints
 */
export const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por ventana
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Store en memoria por defecto, considerar Redis en producción
});

/**
 * Rate limiter estricto para endpoints de autenticación
 * Previene ataques de fuerza bruta en login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: Number(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS) || 5, // 5 intentos por ventana
  message: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.',
  skipSuccessfulRequests: false, // No skip successful requests
  standardHeaders: true,
  legacyHeaders: false,
  // Considera usar Redis store para múltiples instancias:
  // store: new RedisStore({ client: redisClient })
});

/**
 * Rate limiter moderado para operaciones sensibles
 * Para endpoints como cambio de contraseña, actualización de perfil, etc.
 */
export const sensitiveOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 requests por hora
  message: 'Demasiadas operaciones sensibles. Por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para refresh token
 * Previene abuso del endpoint de refresh
 */
export const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 refreshes por ventana (más permisivo que auth)
  message: 'Demasiadas solicitudes de refresh. Por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
