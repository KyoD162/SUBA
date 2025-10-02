# SUBA Monorepo

A scalable monorepo for the SUBA public transport app.

- API: Node.js + TypeScript + Express + MongoDB (Mongoose) + JWT + WebSockets + Jest
- Mobile: React Native + Expo + TypeScript + React Navigation
- Monorepo: npm workspaces, ESLint + Prettier, coordinated scripts

## Prerequisites

- Node.js LTS (>= 18)
- npm (>= 9)
- MongoDB (local or connection string)
- Expo CLI (optional; installed automatically by Expo)

## Structure

- api/ — backend service
- mobile/ — Expo app

## Quick start

Install dependencies (root and workspaces):

- `npm install`

Development (API + Mobile in parallel):

- `npm run dev`

API only:

- `npm run dev:api` (alias for `npm run --workspace=api dev`)

Mobile only:

- `npm run dev:mobile` (alias for `npm run --workspace=mobile start`)

Build API:

- `npm run build`

Test API:

- `npm test`

## Environment

Create `api/.env` based on `api/.env.example`:

PORT=4000
MONGO_URI=mongodb://localhost:27017/suba
JWT_SECRET=supersecret
ORIGIN=http://localhost:8081

## Docker (API)

Build and run the API with MongoDB:

- Using Compose from the repo root:

	- `docker compose up --build`

- Or build/run just the API image:

	- `npm run --workspace=api docker:build`
	- `npm run --workspace=api docker:run`

## Notes

- Mobile connects to API using `API_URL` from `mobile/app.config.ts` (adjust for device/emulator). You can also set `EXPO_PUBLIC_API_URL` before starting Expo.
- WebSocket endpoint: `ws://<API_HOST>/ws`.

## Scripts

- dev: run API + Mobile concurrently
- build: build API (tsc)
- test: run Jest on API
- lint/format: repo-wide linting and formatting

## License

MIT