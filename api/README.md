# SUBA API

Node.js + TypeScript + Express + MongoDB + JWT + WebSockets

## Scripts

- dev: `npm run dev`
- build: `npm run build`
- start: `npm start`
- test: `npm test`

## Environment

Copy `.env.example` to `.env` and set values.

- PORT: server port (default 4000)
- MONGO_URI: MongoDB connection string
- JWT_SECRET: secret for JWT signing
- ORIGIN: allowed CORS origin

## Endpoints

- GET /health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (Authorization: Bearer <token>)

## WebSockets

Socket.IO namespace: default

Events:
- location:update -> { lat, lng }
- location:broadcast -> { userId, lat, lng, ts }