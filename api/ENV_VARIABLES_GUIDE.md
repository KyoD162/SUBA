# 📋 Guía Completa de Variables de Entorno - SUBA API

## 🔐 Variables Requeridas (CRÍTICAS)

Estas variables **DEBEN** estar configuradas o el servidor no iniciará:

### 1. `MONGO_URI`
**Descripción:** Cadena de conexión a MongoDB

**Valores posibles:**
```env
# MongoDB Local
MONGO_URI=mongodb://localhost:27017/suba

# MongoDB Atlas (Cloud)
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/suba?retryWrites=true&w=majority

# MongoDB con autenticación
MONGO_URI=mongodb://admin:password@localhost:27017/suba?authSource=admin
```

**¿Cómo obtenerlo?**
- **Local:** Instala MongoDB localmente
- **Atlas:** Crea cuenta gratis en [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

### 2. `JWT_SECRET`
**Descripción:** Clave secreta para firmar tokens de acceso (access tokens)

**Generar:**
```bash
node generate-jwt-secrets.js
# O
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Ejemplo:**
```env
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

**⚠️ IMPORTANTE:**
- Mínimo 32 caracteres
- Usar caracteres aleatorios
- NUNCA usar palabras simples como "secret" o "password"
- Diferente para development y production
- Si se compromete, cambiar INMEDIATAMENTE

---

### 3. `JWT_REFRESH_SECRET` (Opcional pero RECOMENDADO)
**Descripción:** Clave secreta para refresh tokens (debe ser diferente de JWT_SECRET)

**Generar:** Igual que JWT_SECRET pero con valor diferente

**Ejemplo:**
```env
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8
```

**Si no se configura:**
- Usa JWT_SECRET para refresh tokens (menos seguro)
- Muestra una advertencia al iniciar

---

## ⚙️ Variables Opcionales (con valores por defecto)

### 4. `PORT`
**Descripción:** Puerto donde corre el servidor

**Default:** `4000`

**Valores comunes:**
```env
PORT=4000          # Desarrollo
PORT=3000          # Alternativa común
PORT=8080          # Producción común
```

---

### 5. `NODE_ENV`
**Descripción:** Entorno de ejecución

**Valores posibles:**
```env
NODE_ENV=development    # Desarrollo local
NODE_ENV=production     # Producción
NODE_ENV=test          # Tests
```

**Default:** `development`

**Efectos:**
- Cambia nivel de logs
- Activa/desactiva features de debug
- Influye en performance

---

### 6. `ORIGIN`
**Descripción:** Orígenes permitidos para CORS (Cross-Origin Resource Sharing)

**Formatos:**
```env
# Permitir un origen
ORIGIN=http://localhost:19006

# Permitir múltiples (separados por coma)
ORIGIN=http://localhost:19006,http://192.168.1.104:19006

# Permitir todos (solo desarrollo - INSEGURO)
ORIGIN=*
```

**¿Qué poner?**
- Desarrollo local: URL donde corre tu app Expo
- Producción: Dominio de tu app desplegada

**Encontrar tu IP para desarrollo:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
# O
ip addr show
```

---

### 7. `JWT_ACCESS_EXPIRATION`
**Descripción:** Tiempo de expiración del access token

**Default:** `15m`

**Formatos válidos:**
```env
JWT_ACCESS_EXPIRATION=60s      # 60 segundos
JWT_ACCESS_EXPIRATION=5m       # 5 minutos
JWT_ACCESS_EXPIRATION=1h       # 1 hora
JWT_ACCESS_EXPIRATION=7d       # 7 días
```

**Recomendaciones:**
- **Desarrollo:** 15m - 1h (más cómodo)
- **Producción:** 15m - 30m (más seguro)
- Muy corto = usuarios deben refrescar mucho
- Muy largo = menos seguro si el token se compromete

---

### 8. `JWT_REFRESH_EXPIRATION`
**Descripción:** Tiempo de expiración del refresh token

**Default:** `7d`

**Recomendaciones:**
```env
JWT_REFRESH_EXPIRATION=1d      # Muy estricto
JWT_REFRESH_EXPIRATION=7d      # Balanceado
JWT_REFRESH_EXPIRATION=30d     # Permisivo
JWT_REFRESH_EXPIRATION=90d     # Muy permisivo
```

**Consideraciones:**
- Debe ser mayor que JWT_ACCESS_EXPIRATION
- Determina cuánto tiempo un usuario puede estar sin iniciar sesión

---

## 🛡️ Rate Limiting (Protección contra ataques)

### 9. `RATE_LIMIT_WINDOW_MS`
**Descripción:** Ventana de tiempo para rate limiting general (en milisegundos)

**Default:** `900000` (15 minutos)

**Conversiones:**
```env
RATE_LIMIT_WINDOW_MS=60000      # 1 minuto
RATE_LIMIT_WINDOW_MS=300000     # 5 minutos
RATE_LIMIT_WINDOW_MS=900000     # 15 minutos
RATE_LIMIT_WINDOW_MS=3600000    # 1 hora
```

---

### 10. `RATE_LIMIT_MAX_REQUESTS`
**Descripción:** Requests máximos permitidos en la ventana general

**Default:** `100`

**Recomendaciones:**
```env
RATE_LIMIT_MAX_REQUESTS=50      # Estricto
RATE_LIMIT_MAX_REQUESTS=100     # Balanceado
RATE_LIMIT_MAX_REQUESTS=200     # Permisivo
RATE_LIMIT_MAX_REQUESTS=1000    # Desarrollo
```

---

### 11. `RATE_LIMIT_AUTH_WINDOW_MS`
**Descripción:** Ventana para endpoints de login/registro

**Default:** `900000` (15 minutos)

---

### 12. `RATE_LIMIT_AUTH_MAX_REQUESTS`
**Descripción:** Intentos de login/registro permitidos

**Default:** `5`

**Recomendaciones:**
```env
# Producción (estricto)
RATE_LIMIT_AUTH_MAX_REQUESTS=3

# Balanceado
RATE_LIMIT_AUTH_MAX_REQUESTS=5

# Desarrollo (permisivo)
RATE_LIMIT_AUTH_MAX_REQUESTS=20
```

---

### 13. `RATE_LIMIT_REFRESH_WINDOW_MS`
**Descripción:** Ventana para refresh token

**Default:** `900000` (15 minutos)

---

### 14. `RATE_LIMIT_REFRESH_MAX_REQUESTS`
**Descripción:** Refreshes permitidos por ventana

**Default:** `20`

---

### 15. `RATE_LIMIT_SENSITIVE_WINDOW_MS`
**Descripción:** Ventana para operaciones sensibles (cambio contraseña, etc.)

**Default:** `3600000` (1 hora)

---

### 16. `RATE_LIMIT_SENSITIVE_MAX_REQUESTS`
**Descripción:** Operaciones sensibles permitidas

**Default:** `10`

---

## 🔮 Variables Futuras (Comentadas en .env.example)

### Email (Para recuperación de contraseña)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@suba.com
```

### Redis (Para rate limiting distribuido)
```env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
```

### Logging
```env
LOG_LEVEL=debug
SENTRY_DSN=your-sentry-dsn
```

---

## 📝 Archivo .env Completo de Ejemplo

```env
# Server
NODE_ENV=development
PORT=4000
ORIGIN=http://localhost:19006

# Database
MONGO_URI=mongodb://localhost:27017/suba

# JWT
JWT_SECRET=f8e2a1c3b9d4567890abcdef1234567890abcdef1234567890abcdef12345678
JWT_REFRESH_SECRET=a9b8c7d6e5f4321098765432109876543210987654321098765432109876
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX_REQUESTS=10
RATE_LIMIT_REFRESH_WINDOW_MS=900000
RATE_LIMIT_REFRESH_MAX_REQUESTS=50
RATE_LIMIT_SENSITIVE_WINDOW_MS=3600000
RATE_LIMIT_SENSITIVE_MAX_REQUESTS=20
```

---

## ✅ Checklist de Configuración

- [ ] Copia `.env.example` a `.env`
- [ ] Genera claves JWT con `node generate-jwt-secrets.js`
- [ ] Configura `MONGO_URI` con tu base de datos
- [ ] Actualiza `ORIGIN` con tu IP local
- [ ] Verifica que `.env` esté en `.gitignore`
- [ ] NUNCA commitees `.env`
- [ ] Usa valores diferentes en producción

---

## 🚨 Errores Comunes

### "Missing required environment variables: MONGO_URI"
**Solución:** Agrega `MONGO_URI` a tu `.env`

### "Missing required environment variables: JWT_SECRET"
**Solución:** Genera y agrega `JWT_SECRET` a tu `.env`

### "Using default JWT_SECRET"
**Warning:** Estás usando un valor por defecto inseguro. Genera uno nuevo.

### "Network request failed"
**Problema:** `ORIGIN` no incluye la URL desde donde hace requests el frontend
**Solución:** Agrega la URL completa a `ORIGIN`

---

## 🔒 Seguridad

### ¿Qué pasa si commiteo el .env por error?

1. **Inmediatamente:**
   - Cambia TODOS los secretos (JWT_SECRET, passwords, etc.)
   - Rota las claves comprometidas

2. **Remueve del repositorio:**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from repository"
   ```

3. **Limpia el historial** (si es necesario):
   ```bash
   # Usa BFG Repo-Cleaner o git filter-branch
   ```

### Mejores Prácticas

✅ **SÍ hacer:**
- Usar `.env.example` como template
- Generar claves aleatorias largas
- Diferentes secretos para dev/prod
- Documentar cada variable

❌ **NO hacer:**
- Commitear `.env`
- Usar valores simples como "secret"
- Compartir secretos por email/chat
- Reutilizar claves entre proyectos
