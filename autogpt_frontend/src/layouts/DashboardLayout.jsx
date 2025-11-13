import React, { useMemo } from "react";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import "./dashboard.css";
import Toaster from "../components/common/Toaster";
import { getEnv } from "../lib/env";

/**
 * PUBLIC_INTERFACE
 * DashboardLayout - App shell with sidebar, topbar and main content area.
 * Includes a global Toaster to render notifications.
 * Shows an environment banner with guidance if critical env vars are missing.
 */
export default function DashboardLayout({ children }) {
  const env = useMemo(() => getEnv(), []);
  const missingCritical = useMemo(() => {
    const required = ["REACT_APP_BACKEND_URL", "REACT_APP_API_BASE", "REACT_APP_WS_URL"];
    const missing = required.filter((k) => !process.env[k]);
    return missing;
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__main">
        {/* Env/banner guard */}
        {missingCritical.length > 0 ? (
          <div
            role="status"
            aria-live="polite"
            className="theme-surface"
            style={{
              borderLeft: "4px solid var(--color-warning-500)",
              borderRadius: 12,
              padding: 10,
              marginBottom: 8,
              background:
                "linear-gradient(0deg, rgba(245,158,11,0.10), rgba(245,158,11,0.10)), var(--surface)",
            }}
          >
            <strong style={{ color: "var(--color-warning-600)" }}>
              Environment not fully configured
            </strong>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              Missing variables: <code>{missingCritical.join(", ")}</code>. Using safe defaults.
              Set them in .env for proper API/WS connectivity.
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
              API: <code>{env.API_ROOT}</code> • WS: <code>{env.WS_URL}</code>
            </div>
          </div>
        ) : null}
        <Topbar />
        <div className="layout__content theme-surface" role="main">
          {children}
        </div>
      </main>
      {/* Global toaster is rendered within AppProviders context; it reads uiStore safely */}
      <Toaster />
    </div>
  );
}
