# SUBA - Variables de Entorno

Este proyecto utiliza variables de entorno para configuración sensible y específica del entorno.

## Backend (API)

### Configuración

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cd api
   cp .env.example .env
   ```

2. Edita `.env` y configura tus variables:

### Variables Requeridas

- **`MONGO_URI`**: Conexión a MongoDB
  ```
  MONGO_URI=mongodb://localhost:27017/suba
  # O con MongoDB Atlas:
  MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/suba
  ```

- **`JWT_SECRET`**: Clave secreta para tokens de acceso
  ```bash
  # Genera una clave segura:
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- **`JWT_REFRESH_SECRET`**: Clave secreta para refresh tokens
  ```bash
  # Genera otra clave diferente:
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### Variables Opcionales

- **`PORT`**: Puerto del servidor (default: 4000)
- **`ORIGIN`**: CORS origins permitidos
- **`NODE_ENV`**: development | production
- **`JWT_ACCESS_EXPIRATION`**: Tiempo de expiración del access token (default: 15m)
- **`JWT_REFRESH_EXPIRATION`**: Tiempo de expiración del refresh token (default: 7d)
- **`RATE_LIMIT_WINDOW_MS`**: Ventana de rate limiting en ms (default: 900000 = 15min)
- **`RATE_LIMIT_MAX_REQUESTS`**: Requests máximos por ventana (default: 100)
- **`RATE_LIMIT_AUTH_MAX_REQUESTS`**: Requests máximos para auth (default: 5)

## Frontend (Mobile)

### Configuración

El frontend de Expo utiliza `app.config.ts` para variables de entorno.

Para cambiar la URL de la API:
1. Abre `mobile/src/services/auth.ts` y `mobile/src/services/api.ts`
2. Actualiza `DEV_API_URL` con la IP de tu máquina:
   ```typescript
   const DEV_API_URL = 'http://TU_IP:4000/api';
   ```

Para encontrar tu IP:
- **Windows**: `ipconfig` (busca IPv4)
- **macOS/Linux**: `ifconfig` o `ip addr`

## Seguridad

⚠️ **IMPORTANTE**:

1. **NUNCA** hagas commit de archivos `.env`
2. Los archivos `.env` están en `.gitignore`
3. En producción, usa variables de entorno del sistema o servicios como:
   - Heroku Config Vars
   - AWS Systems Manager Parameter Store
   - Azure Key Vault
   - Docker secrets

4. Cambia TODAS las claves secretas antes de deployment
5. Usa claves diferentes para development y production

## Generar Claves Seguras

```bash
# JWT Secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# JWT Refresh Secret
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

## Verificación

El servidor valida automáticamente las variables requeridas al iniciar:

```bash
npm run dev
```

Si falta alguna variable crítica, verás un error indicando cuál falta.
