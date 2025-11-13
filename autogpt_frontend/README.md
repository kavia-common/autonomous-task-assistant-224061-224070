# AutoGPT Frontend (React) — Ocean Professional

This frontend provides a modern dashboard UI for interacting with an AutoGPT-style backend. It is built with React 18 and React Router v6, a lightweight in-house state store, and an Ocean Professional theme implemented through CSS tokens. The codebase is intentionally minimal and framework-light, with thin wrappers for HTTP and WebSocket clients and placeholders for the AutoGPT API.

## Project Structure

The application is organized by concern and includes a small set of utilities for environment configuration, logging, HTTP requests, and WebSocket communication.

- src/
  - api/
    - autogpt.js — High-level API wrapper with placeholder endpoints for tasks, runs, workspace, health, and log subscriptions.
  - components/
    - common/
      - Button.jsx — Themed button component with primary/secondary/ghost variants and sizes.
      - HealthIndicator.jsx — Periodically pings backend health and displays a status pill.
      - Sidebar.jsx — Navigation sidebar for Tasks, Runs, Workspace, and Settings.
      - StatusPill.jsx — Small pill for displaying statuses (connected, disconnected, degraded, unknown).
      - Toaster.jsx — Ephemeral toast notifications driven by uiStore.
      - topbar.css, sidebar.css, button.css — Styles for core components.
    - runs/
      - RunLogViewer.jsx — Live log viewer subscribing to WebSocket topics for a given run.
  - layouts/
    - DashboardLayout.jsx — App shell wrapping the layout with Sidebar, Topbar, and Toaster. Shows an environment banner when critical variables are missing.
    - dashboard.css — Styles for layout, shells, and surfaces.
  - lib/
    - env.js — Centralized loader and validator for REACT_APP_* variables; provides derived values like API_ROOT and WS_URL.
    - httpClient.js — Fetch-based client with timeouts, retries, and JSON parsing.
    - logger.js — Namespaced logger honoring REACT_APP_LOG_LEVEL with simple redaction.
    - wsClient.js — Resilient WebSocket client with auto-reconnect and topic subscriptions.
  - pages/
    - TasksPage.jsx — Task list with error/empty states; degrades to demo list offline.
    - TaskCreatePage.jsx — Validated form creating a task via API with local fallback.
    - RunsPage.jsx — Run list with filtering by task (?task=<id>); demo fallback if offline.
    - RunDetailPage.jsx — Details for a single run plus live logs via RunLogViewer.
    - WorkspacePage.jsx — Displays workspace files and supports a mock upload action.
    - SettingsPage.jsx — Theme toggle, experiments switch, feature flag visibility, and environment details.
  - state/
    - createStore.js — Lightweight state container using Context + useReducer with a hook interface.
    - AppProviders.jsx — Wires ThemeProvider, Router, WS connection status, and env-driven flags.
    - settingsStore.js — Theme preference, experiments, and feature flags.
    - uiStore.js — UI state: connection status, loading counter, toasts.
    - tasksStore.js — Client-side tasks collection and helpers.
    - runsStore.js — Runs dictionary, log buffers, and WebSocket subscriptions per run.
    - index.js — Barrel exports for stores and providers.
  - theme/
    - tokens.css — CSS variables implementing the Ocean Professional theme (light/dark).
    - ThemeProvider.jsx — Theme switching (light, dark, system), persistence, and data-theme binding.
  - App.js — Route configuration for the application.
  - index.js, index.css — Entry point and global styles.
  - setupTests.js — Jest DOM testing setup.

## Features

The frontend emphasizes clarity and resilience:

- Routing and pages:
  - Tasks, task creation, runs, run details (with logs), workspace, and settings.
  - Not Found fallback for unknown routes.
- Ocean Professional theming:
  - CSS variable tokens for surfaces, text, borders, shadows, and color scales in light/dark modes.
  - Theme switching controls in the Topbar; persisted preference and system theme detection.
- State management:
  - Lightweight store built in-house using React Context + useReducer.
  - Slices for settings, UI, tasks, and runs with simple action factories.
- Env-driven configuration:
  - Centralized env loader to normalize URLs, parse booleans and feature flags, and provide derived values.
- HTTP and WebSocket clients:
  - HTTP client with base URL, JSON handling, timeouts, retries, and normalized errors.
  - WebSocket client with reconnect/backoff, topic subscriptions, and message dispatch.
- API and WebSocket placeholders:
  - Placeholder REST endpoints and WebSocket topics that match expected AutoGPT flows.
  - Graceful fallback to demo data when backend is unavailable.

## Routes and Pages

The main Router is defined in src/App.js and mounted by AppProviders inside a BrowserRouter. The App layout is DashboardLayout, which shows the Sidebar and Topbar across all pages.

- /tasks — Task list with creation CTA and backend health summary.
- /tasks/create — Validated create form; submits to backend or falls back to local creation.
- /runs — Lists runs, with optional filter by task (?task=<id>).
- /runs/:id — Run details and live log stream via WebSocket subscription to run:<id>:logs.
- /workspace — Workspace file list and a mock upload action.
- /settings — Theme toggle, experiments switch, and current env information.
- * — Not Found fallback.

## State Management Overview

State slices are implemented with createStore and expose action factories and hooks:

- settingsStore — Theme, resolved theme, experimentsEnabled, featureFlags.
- uiStore — connection, loadingCount, toasts with push/remove helpers.
- tasksStore — tasks array with add/update/remove/select helpers.
- runsStore — runs dictionary, logs map, subscribe/unsubscribe for run log topics.

Each slice exports a hook (e.g., useSettings, useUI, useTasks, useRuns) to read selected fields, and actions can be accessed via store.actionsFactory().

## Theming (Ocean Professional)

Theme tokens are defined in src/theme/tokens.css and applied via data-theme attribute on the html element. The ThemeProvider exposes theme, resolvedTheme, setTheme, and toggleTheme. Components rely on CSS variables for colors, borders, gradients, and shadows to maintain consistency across light and dark modes. The Topbar provides quick controls and a status zone, while the Sidebar uses a navy-themed surface for navigation.

## Environment Configuration

Configuration is centralized in src/lib/env.js. The app reads REACT_APP_* variables and derives useful values:

- FRONTEND_URL — Absolute URL for the frontend; used to set BrowserRouter basename.
- BACKEND_URL and API_BASE — Combined into an absolute API_ROOT (e.g., http://localhost:8000 + /api).
- WS_URL — WebSocket URL (e.g., ws://localhost:8000/ws).
- NODE_ENV — Environment name; displayed in Sidebar footer.
- LOG_LEVEL — Logger level for console logging: trace|debug|info|warn|error|silent.
- HEALTHCHECK_PATH — Customizable health endpoint path (default /health).
- FEATURE_FLAGS — Key/value feature toggles as JSON or comma-separated pairs (e.g., a=true,b=false).
- EXPERIMENTS_ENABLED — Boolean to turn on experimental UI paths.
- NEXT_TELEMETRY_DISABLED — Boolean; app will avoid any telemetry path (no SDK integrated).
- PORT and TRUST_PROXY — Documented for completeness but not used by CRA dev server behavior.

A banner in DashboardLayout alerts when any of the critical variables are missing, showing the current API and WS endpoints being used.

## API Placeholders and WebSocket Topics

The API interface in src/api/autogpt.js is a thin wrapper around httpClient and wsClient and uses placeholder endpoints. It is intended to be replaced or extended once the backend OpenAPI specification is available.

- REST endpoints (placeholders):
  - GET /tasks, POST /tasks, GET /tasks/:id
  - GET /runs, GET /runs/:id
  - POST /tasks/:id/runs
  - GET /workspace/files, POST /workspace/files
  - GET /health (or the configured HEALTHCHECK_PATH)
- WebSocket topics (placeholders):
  - run:<id>:logs — Streaming log lines or JSON payloads for specific runs.
  - system — System-level pings/messages used to monitor connection.

Update these paths and topics to match your backend contract. The UI degrades gracefully into demo data where possible to support local development before the backend is ready.

## Running, Building, and Testing

Prerequisites: Node.js 18+ recommended.

1) Install and run
- cp .env.example .env
- Adjust REACT_APP_BACKEND_URL, REACT_APP_API_BASE, and REACT_APP_WS_URL as needed.
- npm install
- npm start
The app runs at http://localhost:3000 by default.

2) Tests
- npm test
This uses react-scripts test with @testing-library/react and jest-dom. Tests include:
- src/App.test.js — Smoke test to ensure rendering with providers.
- src/__tests__/routing.test.jsx — Router behavior for main routes and Not Found.
- src/__tests__/taskFlow.test.jsx — Task creation flow with mocked API and WS.
- src/__tests__/runLogs.test.jsx — Run logs via WebSocket, including clear behavior.

3) Production build
- npm run build
Creates a production build in the build/ folder.

## Configuration (.env)

See .env.example for all supported variables. Notable variables include:
- REACT_APP_FRONTEND_URL — Absolute public URL of this frontend (used for Router basename).
- REACT_APP_BACKEND_URL — Backend origin (e.g., http://localhost:8000).
- REACT_APP_API_BASE — API base path (e.g., /api). Combined with BACKEND_URL to form API_ROOT.
- REACT_APP_WS_URL — WebSocket URL for streaming (e.g., ws://localhost:8000/ws).
- REACT_APP_LOG_LEVEL — One of trace|debug|info|warn|error|silent.
- REACT_APP_HEALTHCHECK_PATH — Health endpoint path (default /health).
- REACT_APP_FEATURE_FLAGS — Feature toggles as JSON or comma-sep pairs.
- REACT_APP_EXPERIMENTS_ENABLED — Boolean enabling experimental UI.
- REACT_APP_NEXT_TELEMETRY_DISABLED — Boolean to disable any telemetry paths.
- REACT_APP_NODE_ENV, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY — Documented for completeness.

## Notes and Guidance

- Security and privacy: The logger redacts likely sensitive fields and avoids dumping response bodies on HTTP errors. Do not log secrets or place credentials in the repository or client bundle.
- Source maps: Handled by Create React App; REACT_APP_ENABLE_SOURCE_MAPS is for documentation and should not be relied upon to toggle behavior in production builds.
- Backend connectivity: When missing or offline, the UI shows demo content to enable development of the UI independently.

For a focused summary of routing, theme, state, and client scaffolding, see README_THEME_AND_ROUTING.md.
