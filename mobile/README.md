# @velvettray/mobile

React Native (Expo) companion app for The Velvet Tray.

## Scope
- Browse hampers
- Filter by occasion / budget
- Save & reorder
- Gifting-date reminders (local notifications)
- Order tracking
- Corporate account features (address book, invoices)

## Status
Scaffolded separately. Run `npx create-expo-app@latest .` in this folder when ready to begin,
then point `EXPO_PUBLIC_API_URL` to the same backend `/v1` the web app uses.

The API is app-ready: JWT auth works from both cookie (web) and Authorization bearer header (mobile),
and all public endpoints are unchanged across clients.
