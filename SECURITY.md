# Guía de Seguridad y Validación - SUBA API

## 🔒 Validaciones Implementadas

### Backend (API)

Se han implementado validaciones completas del lado del servidor en `api/src/utils/validation.ts`:

#### Funciones de Validación

1. **`validateEmail(email)`** - Valida formato de correo electrónico
2. **`validatePassword(password)`** - Valida contraseñas seguras (min 6 chars, letras/números)
3. **`validateFullName(name)`** - Valida nombre completo (mínimo 2 palabras)
4. **`validatePhone(phone)`** - Valida teléfonos venezolanos
5. **`validateRiderRegistration(data)`** - Valida registro completo de usuarios
6. **`validateDriverRegistration(data)`** - Valida registro completo de conductores
7. **`validateLoginData(data)`** - Valida datos de login
8. **`sanitizeString(input)`** - Limpia inputs para prevenir XSS

### Controladores Actualizados

Todos los endpoints de autenticación ahora validan datos antes de procesarlos:

```typescript
// Ejemplo en registerRider
const validationErrors = validateRiderRegistration(req.body);
if (validationErrors.length > 0) {
  return res.status(400).json({ 
    error: 'Datos inválidos', 
    details: validationErrors 
  });
}
```

## 🛡️ Rate Limiting

### Configuración

Se han implementado 4 niveles de rate limiting en `api/src/middlewares/rateLimiter.ts`:

#### 1. General Limiter
- **Ventana**: 15 minutos
- **Máximo**: 100 requests
- **Aplica a**: Toda la API (`/api/*`)

#### 2. Auth Limiter (Estricto)
- **Ventana**: 15 minutos
- **Máximo**: 5 requests
- **Aplica a**:
  - `/api/auth/login/*`
  - `/api/auth/register/*`
- **Previene**: Ataques de fuerza bruta

#### 3. Refresh Token Limiter
- **Ventana**: 15 minutos
- **Máximo**: 20 requests
- **Aplica a**: `/api/auth/refresh`

#### 4. Sensitive Operations Limiter
- **Ventana**: 1 hora
- **Máximo**: 10 requests
- **Uso futuro**: Cambio de contraseña, actualización de datos sensibles

### Personalización

Configura los límites en tu archivo `.env`:

```env
RATE_LIMIT_WINDOW_MS=900000          # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100          # General
RATE_LIMIT_AUTH_MAX_REQUESTS=5       # Auth endpoints
```

### Respuesta cuando se excede el límite

```json
{
  "message": "Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos."
}
```

Headers de respuesta:
- `RateLimit-Limit`: Máximo permitido
- `RateLimit-Remaining`: Requests restantes
- `RateLimit-Reset`: Timestamp cuando se resetea

## 🔐 Variables de Entorno

### Variables Críticas Requeridas

#### Backend

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/suba

# JWT Secrets - CAMBIAR EN PRODUCCIÓN
JWT_SECRET=genera-con-crypto.randomBytes(64).toString('hex')
JWT_REFRESH_SECRET=genera-otra-clave-diferente
```

### Generar Claves Seguras

```bash
cd api
node generate-jwt-secrets.js
```

O manualmente:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Validación al Iniciar

El servidor ahora valida variables de entorno críticas al iniciar:

```javascript
// En api/src/index.ts
function validateEnvVars() {
  const requiredVars = ['MONGO_URI', 'JWT_SECRET'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}
```

## 📋 Checklist de Seguridad

### Desarrollo
- [x] Validación de inputs en frontend
- [x] Validación de inputs en backend
- [x] Rate limiting en endpoints de auth
- [x] Sanitización de datos
- [x] Variables de entorno configuradas
- [x] `.env` en `.gitignore`
- [ ] Tests de validación
- [ ] Tests de rate limiting

### Antes de Producción
- [ ] Cambiar JWT_SECRET y JWT_REFRESH_SECRET
- [ ] Configurar MONGO_URI de producción
- [ ] Configurar CORS con dominios específicos
- [ ] Implementar Redis para rate limiting (multi-instancia)
- [ ] Configurar HTTPS/SSL
- [ ] Habilitar helmet con configuración estricta
- [ ] Implementar logging centralizado
- [ ] Configurar monitoreo de errores (Sentry, etc.)
- [ ] Implementar refresh token rotation
- [ ] Agregar verificación de email
- [ ] Implementar recuperación de contraseña

## 🚀 Próximas Mejoras Recomendadas

### Alta Prioridad
1. **Refresh Token en BD** - Almacenar para poder revocar
2. **Email Verification** - Verificar emails al registrarse
3. **Password Reset** - Sistema de recuperación de contraseña
4. **Captcha** - En login después de N intentos fallidos

### Media Prioridad
5. **2FA (Two-Factor Auth)** - Autenticación de dos factores
6. **Session Management** - Ver/cerrar sesiones activas
7. **Login History** - Auditoría de inicios de sesión
8. **IP Blacklisting** - Bloquear IPs sospechosas

### Baja Prioridad
9. **OAuth** - Login con Google/Facebook
10. **Device Fingerprinting** - Detectar dispositivos conocidos

## 📚 Documentación Adicional

- [ENV_SETUP.md](./ENV_SETUP.md) - Configuración de variables de entorno
- [mobile/src/utils/README.md](./mobile/src/utils/README.md) - Validaciones del frontend
- [.env.example](./api/.env.example) - Template de variables de entorno

## 🐛 Troubleshooting

### "Missing required environment variables"
```bash
cd api
cp .env.example .env
# Edita .env y configura tus variables
```

### "Too many requests"
Espera 15 minutos o aumenta los límites en desarrollo:
```env
RATE_LIMIT_AUTH_MAX_REQUESTS=20
```

### "Invalid token" / "Token expired"
El access token expira en 15 minutos. Usa el refresh token para obtener uno nuevo.
