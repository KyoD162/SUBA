# Seguridad de Autenticación - SUBA API

## Sistema de Tokens JWT

La aplicación SUBA utiliza un sistema de autenticación basado en **JWT (JSON Web Tokens)** con tokens de acceso de corta duración y tokens de refresco de larga duración.

### Tipos de Tokens

#### 1. Access Token (Token de Acceso)
- **Duración**: 15 minutos
- **Propósito**: Autenticar peticiones a la API
- **Contenido**: `{ userId, role }`
- **Uso**: Se envía en el header `Authorization: Bearer <token>`

#### 2. Refresh Token (Token de Refresco)
- **Duración**: 7 días
- **Propósito**: Renovar access tokens expirados
- **Contenido**: `{ userId, role, type: 'refresh' }`
- **Uso**: Se envía al endpoint `/api/auth/refresh` para obtener un nuevo access token

### Variables de Entorno

```env
JWT_SECRET=tu-clave-secreta-muy-segura-cambiala-en-produccion
JWT_REFRESH_SECRET=tu-clave-refresh-diferente-y-mas-segura
```

**⚠️ IMPORTANTE**: Cambia estas claves en producción por valores aleatorios seguros.

## Endpoints de Autenticación

### Registro

#### Usuario Normal (Rider)
```http
POST /api/auth/register/rider
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Juan Pérez",
  "phone": "04141234567",
  "specialDiscount": "none" // "none" | "student" | "disabled" | "senior"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "role": "rider",
    "name": "Juan Pérez"
  }
}
```

#### Conductor (Driver)
```http
POST /api/auth/register/driver
Content-Type: application/json

{
  "email": "conductor@example.com",
  "password": "password123",
  "name": "María García",
  "phone": "04241234567",
  "licenseNumber": "V-12345678",
  "vehiclePlate": "ABC123",
  "vehicleModel": "Toyota Corolla 2020"
}
```

#### Administrador (Admin)
```http
POST /api/auth/register/admin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Carlos Admin",
  "phone": "04121234567",
  "department": "Operations"
}
```

### Login

```http
POST /api/auth/login/rider
POST /api/auth/login/driver
POST /api/auth/login/admin
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta:** Igual que el registro

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Respuesta:**
```json
{
  "token": "nuevo-access-token",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "role": "rider",
    "name": "Juan Pérez"
  }
}
```

### Perfil del Usuario

```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

## Validación de Tokens (Middleware)

El middleware `auth` valida automáticamente los tokens en las rutas protegidas:

### Características:
- ✅ Verifica formato `Bearer <token>`
- ✅ Valida firma JWT
- ✅ Detecta tokens expirados (código: `TOKEN_EXPIRED`)
- ✅ Detecta tokens inválidos (código: `INVALID_TOKEN`)
- ✅ Previene uso de refresh tokens como access tokens
- ✅ Valida payload del token

### Códigos de Error:
- `TOKEN_EXPIRED`: El access token expiró (usar refresh token)
- `INVALID_TOKEN`: Token malformado o firma inválida
- `No authorization header`: Falta el header de autorización
- `Cannot use refresh token as access token`: Intento de usar refresh token incorrectamente

## Flujo de Autenticación en el Frontend

```
1. Usuario se registra/login
   ↓
2. Backend retorna: { token, refreshToken, user }
   ↓
3. Frontend guarda en AsyncStorage:
   - auth_token
   - auth_refresh_token
   - auth_user
   ↓
4. Peticiones usan: Authorization: Bearer <token>
   ↓
5. Si token expira (401 TOKEN_EXPIRED):
   a. Frontend llama a /auth/refresh con refreshToken
   b. Obtiene nuevo access token
   c. Reintenta la petición original
   ↓
6. Si refresh token expira:
   - Cerrar sesión
   - Redirigir a login
```

## Seguridad Implementada

### Backend:
- ✅ Passwords hasheados con bcrypt (salt rounds: 10)
- ✅ Tokens firmados con JWT
- ✅ Separación de roles (rider, driver, admin)
- ✅ Validación de rol en cada endpoint
- ✅ Access tokens de corta duración (15min)
- ✅ Refresh tokens de larga duración (7d)
- ✅ Prevención de reutilización de refresh tokens como access tokens
- ✅ Mensajes de error específicos para debugging

### Frontend:
- ✅ Almacenamiento seguro con AsyncStorage
- ✅ Auto-refresh de tokens expirados
- ✅ Manejo automático de sesión expirada
- ✅ Redirección según rol del usuario

## Mejoras Recomendadas para Producción

1. **Rotación de Refresh Tokens**: Emitir nuevo refresh token con cada refresh
2. **Blacklist de Tokens**: Invalidar tokens al cerrar sesión
3. **Rate Limiting**: Limitar intentos de login
4. **2FA**: Autenticación de dos factores
5. **HTTPS Only**: Forzar HTTPS en producción
6. **Token Binding**: Vincular tokens a dispositivos específicos
7. **Audit Logs**: Registrar intentos de autenticación
8. **IP Whitelisting**: Para endpoints administrativos

## Testing

```bash
# Registro de usuario
curl -X POST http://localhost:4000/api/auth/register/rider \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","phone":"04141234567"}'

# Login
curl -X POST http://localhost:4000/api/auth/login/rider \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Refresh token
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh-token>"}'

# Perfil (con access token)
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <access-token>"
```
