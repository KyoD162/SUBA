# 📁 Estructura de Archivos del Proyecto SUBA

## 🗂️ Organización General

```
SUBA/                           ← Raíz del proyecto (monorepo)
│
├── 📄 .gitignore               ← Reglas globales para todo el proyecto
├── 📄 README.md                ← Documentación principal
├── 📄 QUICKSTART.md            ← Guía de inicio rápido
├── 📄 SECURITY.md              ← Documentación de seguridad
├── 📄 ENV_SETUP.md             ← Guía de variables de entorno
├── 📄 docker-compose.yml       ← Configuración Docker
│
├── 📁 api/                     ← Backend (Node.js + Express)
│   ├── 📄 .gitignore           ← Reglas específicas del backend
│   ├── 🔒 .env                 ← Variables de entorno (NO commitear)
│   ├── 📄 .env.example         ← Template de variables (SÍ commitear)
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📁 src/
│   │   ├── index.ts
│   │   ├── 📁 controllers/
│   │   ├── 📁 models/
│   │   ├── 📁 routes/
│   │   ├── 📁 middlewares/
│   │   └── 📁 utils/
│   └── 📁 dist/                ← Build output (ignorado)
│
└── 📁 mobile/                  ← Frontend (React Native + Expo)
    ├── 📄 .gitignore           ← Reglas específicas del frontend
    ├── 📄 package.json
    ├── 📄 app.config.ts        ← Configuración de Expo
    ├── 📄 App.tsx
    ├── 📁 src/
    │   ├── 📁 components/
    │   ├── 📁 screens/
    │   ├── 📁 navigation/
    │   ├── 📁 services/
    │   ├── 📁 theme/
    │   └── 📁 utils/
    └── 📁 .expo/               ← Cache de Expo (ignorado)
```

## 🔍 Explicación de Archivos Clave

### `.gitignore` (3 archivos)

#### 1. Raíz `/.gitignore`
- **Propósito:** Reglas globales que aplican a todo el repositorio
- **Cubre:** `node_modules/`, `.env`, archivos de OS, builds, etc.
- **Usa patrones:** `**/` para aplicar en todos los subdirectorios

#### 2. Backend `/api/.gitignore`
- **Propósito:** Ignorar archivos específicos del backend
- **Enfoque:** Build outputs (`dist/`), logs, `.env`
- **Por qué separado:** Permite independencia del proyecto API

#### 3. Frontend `/mobile/.gitignore`
- **Propósito:** Ignorar archivos específicos de Expo/React Native
- **Enfoque:** `.expo/`, builds, keys de firma
- **Por qué separado:** Reglas específicas de React Native

### Variables de Entorno

#### ✅ Archivo `.env` (Backend ÚNICAMENTE)

**Ubicación correcta:**
```
/api/.env        ← ✅ AQUÍ debe estar
```

**NO debe estar en:**
```
/.env            ← ❌ NO aquí (raíz)
/mobile/.env     ← ❌ NO aquí (mobile usa app.config.ts)
```

**Contenido típico:**
```env
MONGO_URI=mongodb://localhost:27017/suba
JWT_SECRET=tu-clave-secreta
JWT_REFRESH_SECRET=otra-clave-secreta
PORT=4000
```

#### 📄 Archivo `.env.example` (Template)

**Ubicación:**
```
/api/.env.example    ← ✅ SÍ commitear este
```

**Propósito:**
- Template para que otros desarrolladores sepan qué variables configurar
- NO contiene valores reales/secretos
- SÍ se commitea a git

### Frontend (Mobile) - Configuración

El frontend **NO usa archivos `.env`**. En su lugar usa:

**Archivo:** `/mobile/app.config.ts`
```typescript
export default {
  extra: {
    apiUrl: process.env.API_URL || 'http://localhost:4000/api'
  }
}
```

**Para cambiar URL en desarrollo:**
Edita directamente en el código:
- `/mobile/src/services/auth.ts`
- `/mobile/src/services/api.ts`

```typescript
const DEV_API_URL = 'http://192.168.1.104:4000/api';
```

## 📋 Checklist de Archivos Ignorados

### ✅ SÍ ignorar (en .gitignore):

- [x] `node_modules/` - Dependencias
- [x] `.env` - Variables de entorno con secretos
- [x] `dist/`, `build/` - Builds compilados
- [x] `.expo/` - Cache de Expo
- [x] `*.log` - Archivos de log
- [x] `.DS_Store`, `Thumbs.db` - Archivos de OS
- [x] `*.keystore`, `*.jks` - Keys de firma
- [x] `coverage/` - Reportes de tests

### ❌ NO ignorar (sí commitear):

- [ ] `.env.example` - Template de variables
- [ ] `.gitignore` - Reglas de ignorar
- [ ] `package.json` - Dependencias del proyecto
- [ ] `tsconfig.json` - Configuración TypeScript
- [ ] `src/` - Código fuente
- [ ] `README.md` - Documentación

## 🔒 Archivos Críticos que NUNCA Commitear

### Prioridad ALTA (Secretos)
1. `.env` - Variables de entorno con passwords/tokens
2. `*.pem`, `*.key` - Claves privadas
3. `*.keystore`, `*.jks` - Keys de firma de apps
4. Cualquier archivo con "secret", "password", "token" en el nombre

### Prioridad MEDIA (Generados)
5. `node_modules/` - Se regenera con `npm install`
6. `dist/`, `build/` - Se regenera con `npm run build`
7. `.expo/` - Cache, se regenera automáticamente

### Prioridad BAJA (Temporales)
8. `*.log` - Logs temporales
9. `.DS_Store` - Metadata de macOS
10. `coverage/` - Reportes de tests

## 🚀 Comandos Útiles

### Verificar qué archivos están ignorados:
```bash
git status --ignored
```

### Ver qué archivos están en staging:
```bash
git status
```

### Si accidentalmente commiteaste .env:
```bash
# Remover del historial (PELIGROSO - afecta historial)
git rm --cached api/.env
git commit -m "Remove .env from repository"

# Luego cambia TODAS las claves secretas en .env
```

### Limpiar archivos ignorados:
```bash
git clean -fdX  # Remueve archivos ignorados
```

## 📚 Mejores Prácticas

1. **NUNCA** commitees archivos `.env`
2. **SIEMPRE** incluye `.env.example` con valores de ejemplo
3. **DOCUMENTA** qué variables son requeridas en ENV_SETUP.md
4. **CAMBIA** todas las claves si accidentalmente commiteaste secretos
5. **USA** diferentes claves para development y production
6. **VERIFICA** con `git status` antes de cada commit
7. **MANTÉN** los `.gitignore` simples y claros

## 🆘 ¿Qué hacer si commiteas un secreto?

1. **Inmediatamente** cambia la clave/secreto comprometido
2. Remueve el archivo del repositorio:
   ```bash
   git rm --cached archivo-secreto
   git commit -m "Remove sensitive file"
   ```
3. Si ya hiciste push, considera:
   - Reescribir la historia con `git filter-branch` (avanzado)
   - Usar BFG Repo-Cleaner
   - En casos extremos: nuevo repositorio

4. **Actualiza** todas las instancias donde se use ese secreto

---

**Resumen:** Tu estructura actual con 3 `.gitignore` y `.env` solo en `/api/` es **CORRECTA** ✅
