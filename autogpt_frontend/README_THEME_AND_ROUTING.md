# Routing, Theme, and Client Scaffolding

This app uses:
- react-router-dom v6 for client-side routing
- A lightweight ThemeProvider with CSS variable tokens (Ocean Professional)
- Centralized configuration via env loader
- Simple logger honoring REACT_APP_LOG_LEVEL
- HTTP client wrapper and WebSocket client with auto-reconnect
- Placeholder AutoGPT API surface

Key files:
- src/theme/tokens.css — design tokens and colors for light/dark
- src/theme/ThemeProvider.jsx — manages theme (light/dark/system)
- src/layouts/DashboardLayout.jsx — app shell with Sidebar + Topbar
- src/components/common/* — Button, StatusPill, Sidebar, Topbar
- src/App.js — route definitions and minimal health check preview
- src/index.js — wraps app with ThemeProvider and BrowserRouter
- src/lib/env.js — env loader/validator for REACT_APP_* variables
- src/lib/logger.js — structured logger with level filtering and redaction
- src/lib/httpClient.js — fetch wrapper with timeout/retry/backoff
- src/lib/wsClient.js — WebSocket client with reconnect and subscriptions
- src/api/autogpt.js — placeholder AutoGPT API interface

Environment variables supported (see .env.example):
- REACT_APP_FRONTEND_URL used for BrowserRouter basename when available.
- REACT_APP_BACKEND_URL, REACT_APP_API_BASE form API root (default http://localhost:8000 + /api)
- REACT_APP_WS_URL for WebSocket connection (default ws://localhost:8000/ws)
- REACT_APP_LOG_LEVEL one of trace|debug|info|warn|error|silent (default info)
- Additional flags for healthcheck path, features, experiments.

Quick start:
1. cp .env.example .env
2. Edit .env as needed (backend URL, WS URL).
3. npm install
4. npm start

```sh
cp .env.example .env
npm install
npm start
```

Notes:
- The API endpoints in src/api/autogpt.js are placeholders. Update paths to match your backend OpenAPI once available.
- WebSocket topic names are also placeholders; align with backend protocol (e.g., run:<id>:logs).
