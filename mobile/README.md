# SUBA (Visual Prototype)

This repository contains a visual prototype of SUBA — an intelligent public transport app concept for Puerto Ordaz. It showcases modern mobile UI/UX flows built with Expo/React Native and TypeScript. Functionality is simulated for demo purposes; no real backend or payment processing is connected.

## Status

- Prototype level: Visual MVP (no production backend)
- Data: Mocked in-app (routes, buses, tickets, user)
- Maps: WebView + Leaflet fallback to run in Expo Go; native maps guarded for dev builds
- Auth/Payments: Simulated UI only

## Highlights

- Full-screen map background with overlays and a draggable bottom sheet (Routes)
- Leaflet-based map in WebView (Expo Go friendly) with user, stops, buses, polylines, and legend
- Tickets flow: purchase checkout with horizontal carousel (1 viaje, 10 viajes, ilimitado, personalizado), method selection, promo code, and summary
- Global tickets store for an active pass and history simulation
- Auth: redesigned Login and multi-step Register (datos personales → contacto → seguridad → verificación de documentos) with smooth progress and safe-area aware bottom action bar
- Theming: cohesive colors/typography, modern cards and iconography (Ionicons), spacing and shadows tuned for a polished feel

## Tech Stack

- Expo SDK 54, React Native, React 19, TypeScript
- React Navigation v7 (native-stack, bottom tabs)
- UI: custom theme + lightweight components; Ionicons; react-native-paper influences
- Maps: Leaflet + OSM in a React Native WebView fallback (works in Expo Go)

## What this is (and isn’t)

- ✅ A realistic visual/interaction prototype suitable for demos
- ✅ Simulated data flows for tickets and registration
- ❌ Not connected to real APIs or payment gateways
- ❌ Not hardened for production (no analytics, error reporting, or security hardening)

## Getting Started

Requirements:
- Node.js LTS, npm
- Expo CLI (via npx)

Install dependencies:

```powershell
npm install
```

Run in Expo Go (Android/iOS) or Web:

```powershell
npx expo start
```

- Scan the QR with Expo Go (Android) or use the Camera app (iOS)
- Press `a` for Android emulator or `w` for Web from the Expo terminal

Notes:
- The app uses a WebView-based Leaflet map to run smoothly in Expo Go without native modules.
- A dev build can enable native maps later if needed.

## Project Structure (partial)

```
app.json
App.tsx
package.json
src/
  components/
  navigation/
  screens/
    auth/        # Login + multi-step Register
    main/        # Home, Routes (map+sheet), Tickets, Profile
    details/     # Route detail, Payment checkout
  theme/
```

## Simulated Flows

- Tickets
  - Horizontal package carousel (1, 10, ilimitado, personalizado)
  - Payment method selection and promo code (UI only)
  - Purchase updates a global tickets store (active pass + history)
- Register
  - 4 steps with animated progress, safe-area bottom actions, and mock document verification

## Contributing / Next Steps

- Replace mock stores with an API layer (REST/GraphQL)
- Hook payments to a sandbox gateway
- Persist state via AsyncStorage or secure storage
- Add E2E tests and CI workflows before productionization

## License / Usage

This repository is for demonstration purposes only. All rights reserved. Designs, names, and assets belong to their respective owners.
