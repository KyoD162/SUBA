# 🚀 Inicio Rápido - SUBA

## ⚡ Setup Inicial (Primera vez)

### 1. Clonar y preparar el repositorio

```bash
cd SUBA
```

### 2. Configurar Backend (API)

```bash
cd api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Generar claves JWT seguras
node generate-jwt-secrets.js
# Copia las claves generadas a tu archivo .env

# Editar .env y configurar:
# - MONGO_URI (tu conexión a MongoDB)
# - JWT_SECRET (clave generada)
# - JWT_REFRESH_SECRET (clave generada)
```

### 3. Configurar Frontend (Mobile)

```bash
cd ../mobile

# Instalar dependencias
npm install

# Encontrar tu IP local
# Windows: ipconfig
# Mac/Linux: ifconfig

# Editar mobile/src/services/auth.ts y mobile/src/services/api.ts
# Actualizar DEV_API_URL con tu IP:
# const DEV_API_URL = 'http://TU_IP:4000/api';
```

### 4. Iniciar MongoDB

```bash
# Si tienes MongoDB local
mongod

# O usa MongoDB Atlas (cloud)
# https://www.mongodb.com/cloud/atlas
```

### 5. Iniciar el Backend

```bash
cd api
npm run dev
```

Deberías ver:
```
API listening on http://localhost:4000
```

### 6. Iniciar el Frontend

```bash
cd mobile
npm start
```

## 🔧 Variables de Entorno Requeridas

### Backend (.env)

```env
# Base de datos
MONGO_URI=mongodb://localhost:27017/suba

# JWT (generar con: node generate-jwt-secrets.js)
JWT_SECRET=tu-clave-super-secreta-de-64-caracteres
JWT_REFRESH_SECRET=otra-clave-diferente-de-64-caracteres

# Opcional
PORT=4000
NODE_ENV=development
ORIGIN=http://localhost:19006
```

### Frontend

No requiere archivo .env. Configurar URL en:
- `mobile/src/services/auth.ts`
- `mobile/src/services/api.ts`

## 📱 Testing

### 1. Probar el backend directamente

```bash
# Health check
curl http://localhost:4000/health

# Registro de usuario
curl -X POST http://localhost:4000/api/auth/register/rider \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Juan Perez",
    "phone": "04121234567"
  }'

# Login (unificado - detecta rol automáticamente)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Probar desde el móvil

1. Abre la app Expo Go en tu dispositivo
2. Escanea el QR del metro bundler
3. Navega a la pantalla de registro
4. Completa el formulario

## 🛡️ Seguridad Implementada

✅ **Validaciones**
- Frontend: Validación en tiempo real de formularios
- Backend: Validación de todos los inputs antes de procesar

✅ **Rate Limiting**
- Login/Register: 5 intentos cada 15 minutos
- API general: 100 requests cada 15 minutos
- Refresh token: 20 requests cada 15 minutos

✅ **Protección de datos**
- Contraseñas hasheadas con bcrypt
- JWT para autenticación
- Refresh tokens para sesiones largas
- Sanitización de inputs (prevención XSS)
- CORS configurado
- Helmet para headers de seguridad

## 📝 Comandos Útiles

### Backend

```bash
# Desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Tests
npm test

# Generar nuevas claves JWT
node generate-jwt-secrets.js
```

### Frontend

```bash
# Iniciar metro bundler
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios

# Limpiar cache
npx expo start -c
```

## 🐛 Problemas Comunes

### "Missing required environment variables"
```bash
cd api
cp .env.example .env
# Edita .env y configura las variables
```

### "Cannot connect to MongoDB"
- Verifica que MongoDB esté corriendo: `mongod`
- Verifica MONGO_URI en .env

### "Network request failed" en la app
- Verifica que el backend esté corriendo
- Verifica que la IP en `DEV_API_URL` sea correcta
- Verifica que estés en la misma red WiFi

### "Too many requests"
- Espera 15 minutos
- O aumenta los límites en .env (solo desarrollo)

## 📚 Documentación

- [ENV_SETUP.md](./ENV_SETUP.md) - Guía detallada de variables de entorno
- [SECURITY.md](./SECURITY.md) - Seguridad y validaciones
- [api/README.md](./api/README.md) - Documentación del backend
- [mobile/README.md](./mobile/README.md) - Documentación del frontend

## 🎯 Próximos Pasos

1. ✅ Configuración básica
2. ✅ Validaciones y seguridad
3. ⏳ Recuperación de contraseña
4. ⏳ Verificación de email
5. ⏳ Tests automatizados
6. ⏳ Deployment

## 💡 Tips de Desarrollo

- Usa `npm run dev` en el backend para hot reload
- El access token expira en 15 minutos
- El refresh token expira en 7 días
- Revisa la consola del backend para ver requests y errores
- Usa React DevTools para debugging del frontend

## 🤝 Ayuda

Si tienes problemas:
1. Revisa los logs del backend
2. Revisa la consola del navegador/app
3. Verifica que todas las dependencias estén instaladas
4. Verifica las variables de entorno

---

**¡Listo para desarrollar! 🎉**
