# SUBA Mobile (Expo)

React Native app built with Expo and TypeScript.

## Scripts

- start: `npm run --workspace=mobile start`
- android: `npm run --workspace=mobile android`
- ios: `npm run --workspace=mobile ios`
- web: `npm run --workspace=mobile web`

## API URL

Default: `http://localhost:4000` from `app.config.ts` extra.API_URL.
Alternatively set an environment variable before starting Expo:

Windows PowerShell:

`$env:EXPO_PUBLIC_API_URL="http://<your-ip>:4000"; npm run --workspace=mobile start`

## Navigation

React Navigation native stack with Home and Login screens.
