# 🚀 SUBA - Guía de Desarrollo

Esta guía explica cómo ejecutar el proyecto correctamente en entornos de desarrollo.

## 📋 Requisitos Previos

- **Node.js** 18+ (recomendado: 20 LTS)
- **npm** 9+
- **Docker** y **Docker Compose** (opcional, para MongoDB)
- **MongoDB** 7+ (local o Docker)
- **Expo Go** en tu dispositivo móvil (para testing)

## ⚡ Setup Rápido

### Opción 1: Setup Automático (Recomendado)

```bash
# Windows
npm run setup:win

# macOS/Linux
npm run setup
```

### Opción 2: Setup Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cd api
cp .env.example .env
# Editar .env con tu configuración

cd ../mobile
cp .env.example .env
# (Opcional) Editar .env si necesitas configuración especial

# 3. Generar claves JWT seguras
cd ../api
node generate-jwt-secrets.js
# Copiar las claves generadas a .env
```

## 🏃 Ejecutar en Desarrollo

### Opción A: Todo junto (API + Mobile)

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto inicia:
- 🔵 **API** en `http://localhost:4000`
- 🟢 **Expo** en puerto 8082

### Opción B: Por separado (Recomendado para debugging)

**Terminal 1 - MongoDB:**
```bash
# Con Docker
npm run docker:mongo

# O si tienes MongoDB instalado localmente
mongod
```

**Terminal 2 - API:**
```bash
npm run dev:api
```

**Terminal 3 - Mobile:**
```bash
# Modo por defecto (auto-detecta)
npm run dev:mobile

# Modo LAN (mejor para Expo Go en dispositivos físicos)
npm run dev:mobile:lan

# Modo Tunnel (si estás en redes diferentes)
npm run dev:mobile:tunnel

# Limpiar caché si hay problemas
npm run dev:mobile:clear
```

## 📱 Usando Expo Go

### Detección Automática de IP

La app **detecta automáticamente** la IP del servidor Expo y configura la URL del API. No necesitas configurar nada manualmente en la mayoría de los casos.

### Si la detección automática falla:

1. **Obtén tu IP local:**
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Configura la variable de entorno:**
   
   Crea/edita `mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://TU_IP:4000
   ```

3. **Reinicia Expo:**
   ```bash
   npm run dev:mobile:clear
   ```

### Modos de conexión de Expo

| Modo | Comando | Cuándo usarlo |
|------|---------|---------------|
| **Default** | `npm run dev:mobile` | Desarrollo general |
| **LAN** | `npm run dev:mobile:lan` | Dispositivo físico, misma red WiFi |
| **Tunnel** | `npm run dev:mobile:tunnel` | Redes diferentes, debugging remoto |

## 🐳 Docker

### Desarrollo con Docker

```bash
# Solo MongoDB (recomendado para desarrollo local)
npm run docker:mongo

# API + MongoDB en Docker (hot-reload incluido)
npm run docker:dev

# Ver logs
npm run docker:logs

# Detener todo
npm run docker:down
```

### Producción con Docker

```bash
npm run docker:prod
```

## 🔧 Solución de Problemas

### ❌ "Network request failed" en la app

1. **Verifica que la API esté corriendo:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Verifica que estés en la misma red WiFi**

3. **Usa modo LAN:**
   ```bash
   npm run dev:mobile:lan
   ```

4. **Configura EXPO_PUBLIC_API_URL manualmente** (ver sección anterior)

### ❌ "Cannot connect to MongoDB"

```bash
# Verificar si MongoDB está corriendo
docker ps | grep mongo

# Iniciar MongoDB
npm run docker:mongo
```

### ❌ "Missing required environment variables"

```bash
cd api
cp .env.example .env
# Editar .env y configurar MONGO_URI, JWT_SECRET
```

### ❌ Problemas de caché en Expo

```bash
# Limpiar caché y reiniciar
npm run dev:mobile:clear

# Limpiar completamente
cd mobile
npx expo start --clear
```

### ❌ La app no se conecta desde el emulador

- **Android Emulator:** Usa `10.0.2.2` en lugar de `localhost`
- **iOS Simulator:** `localhost` debería funcionar
- La app lo detecta automáticamente, pero si falla:
  ```env
  # Android
  EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
  
  # iOS
  EXPO_PUBLIC_API_URL=http://localhost:4000
  ```

### ❌ Conflicto de puertos

La API usa puerto **4000**, Expo usa puerto **8082**.

Si tienes conflictos:
```bash
# Verificar qué está usando el puerto
# Windows
netstat -ano | findstr :4000

# macOS/Linux
lsof -i :4000
```

## 📁 Estructura del Proyecto

```
SUBA/
├── api/                 # Backend Node.js/Express
│   ├── src/
│   ├── .env.example     # Variables de entorno ejemplo
│   ├── Dockerfile       # Producción
│   └── Dockerfile.dev   # Desarrollo con hot-reload
├── mobile/              # App React Native/Expo
│   ├── src/
│   ├── .env.example     # Variables de entorno ejemplo
│   └── app.config.ts    # Configuración de Expo
├── docker-compose.yml   # Orquestación de contenedores
└── package.json         # Workspace y scripts principales
```

## 🔐 Variables de Entorno

### API (`api/.env`)

```env
MONGO_URI=mongodb://localhost:27017/suba
JWT_SECRET=tu-clave-secreta
JWT_REFRESH_SECRET=tu-otra-clave-secreta
PORT=4000
NODE_ENV=development
```

### Mobile (`mobile/.env`) - Opcional

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
```

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia API + Mobile juntos |
| `npm run dev:api` | Solo API |
| `npm run dev:mobile` | Solo Mobile |
| `npm run dev:mobile:lan` | Mobile en modo LAN |
| `npm run dev:mobile:tunnel` | Mobile en modo Tunnel |
| `npm run docker:mongo` | Inicia MongoDB en Docker |
| `npm run docker:dev` | Desarrollo completo en Docker |
| `npm run docker:prod` | Producción en Docker |
| `npm run setup` | Setup inicial (macOS/Linux) |
| `npm run setup:win` | Setup inicial (Windows) |

## 💡 Tips

1. **Usa terminales separadas** para API y Mobile para mejor debugging
2. **Modo LAN** es más estable que el modo por defecto para Expo Go
3. **Docker para MongoDB** simplifica la configuración inicial
4. **Revisa los logs** del backend para errores de API
5. **Reinicia Expo** con caché limpio si hay comportamiento extraño

---

**¿Problemas?** Revisa los logs en ambos terminales (API y Mobile) para identificar el error.
