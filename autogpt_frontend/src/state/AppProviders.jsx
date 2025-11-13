import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../theme/ThemeProvider";
import { getEnv } from "../lib/env";
import { createLogger } from "../lib/logger";
import { uiStore } from "./uiStore";
import { settingsStore } from "./settingsStore";
import { getWebSocketClient } from "../lib/wsClient";

/**
 * PUBLIC_INTERFACE
 * AppProviders - Wires ThemeProvider, Router, and initializes global state:
 * - Sync theme preference with ThemeProvider
 * - Monitor WebSocket connection to update UI store
 * - Expose feature flags/experiments via settings store
 * - Respect telemetry disabled flag (no telemetry SDK integrated)
 *
 * Note on source maps: CRA controls source map generation via build mode; we do not override it here.
 */
export function AppProviders({ children }) {
  const env = getEnv();
  const log = createLogger("app:providers");

  // Respect telemetry disabled flag (documented behavior; no telemetry SDK)
  useEffect(() => {
    try {
      window.APP_TELEMETRY_DISABLED = !!env.NEXT_TELEMETRY_DISABLED;
      if (window.APP_TELEMETRY_DISABLED) {
        log.info("Telemetry disabled via REACT_APP_NEXT_TELEMETRY_DISABLED=true");
      }
    } catch {
      // ignore
    }
  }, [env.NEXT_TELEMETRY_DISABLED]);

  // Initialize WS connection and connection status heartbeat
  useEffect(() => {
    const ws = getWebSocketClient(env.WS_URL);
    const update = () => {
      const status = ws.isConnected() ? "connected" : "disconnected";
      uiStore.setState({ connection: status });
    };
    update();

    const unsub = ws.subscribe("system", () => update());
    const timer = setInterval(update, 2000);
    return () => {
      try {
        unsub?.();
      } catch {
        // ignore
      }
      clearInterval(timer);
    };
  }, [env.WS_URL]);

  // Persist feature flags and experiments on window for debugging (non-sensitive)
  useEffect(() => {
    try {
      window.APP_FEATURE_FLAGS = env.FEATURE_FLAGS || {};
      window.APP_EXPERIMENTS_ENABLED = !!env.EXPERIMENTS_ENABLED;
      log.info("Feature flags loaded", {
        experiments: window.APP_EXPERIMENTS_ENABLED,
        flags: Object.keys(window.APP_FEATURE_FLAGS || {}),
      });
    } catch {
      // noop
    }
  }, [env.FEATURE_FLAGS, env.EXPERIMENTS_ENABLED]);

  // Sync saved theme preference into settings store if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ui.theme.preference");
      if (saved) {
        settingsStore.setState({ theme: saved });
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter
        basename={
          process.env.REACT_APP_FRONTEND_URL
            ? new URL(process.env.REACT_APP_FRONTEND_URL).pathname
            : "/"
        }
      >
        {children}
      </BrowserRouter>
    </ThemeProvider>
  );
}
