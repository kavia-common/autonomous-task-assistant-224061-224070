# Routing and Theme Setup

This app now uses:
- react-router-dom v6 for client-side routing
- A lightweight ThemeProvider with CSS variable tokens (Ocean Professional)

Key files:
- src/theme/tokens.css — design tokens and colors for light/dark
- src/theme/ThemeProvider.jsx — manages theme (light/dark/system)
- src/layouts/DashboardLayout.jsx — app shell with Sidebar + Topbar
- src/components/common/* — Button, StatusPill, Sidebar, Topbar
- src/App.js — route definitions
- src/index.js — wraps app with ThemeProvider and BrowserRouter

Environment variables supported (see .env.example):
- REACT_APP_FRONTEND_URL is used for BrowserRouter basename when available.
- Other REACT_APP_* variables reserved for future backend integration.

To run:
1. npm install
2. npm start

```sh
npm install
npm start
```
