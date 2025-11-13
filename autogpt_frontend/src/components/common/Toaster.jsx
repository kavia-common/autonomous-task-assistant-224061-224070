import React from "react";
import { useUI, uiStore } from "../../state/uiStore";

/**
 * PUBLIC_INTERFACE
 * Toaster - Renders ephemeral toast notifications from the uiStore.
 * Usage:
 *   import { uiStore } from "src/state/uiStore";
 *   uiStore.actionsFactory().pushToast({ type: "success", title: "Saved", message: "Your changes were saved." });
 */
export default function Toaster() {
  const { toasts = [] } = useUI((s) => s);
  const actions = uiStore.actionsFactory();

  const typeColors = {
    info: { bg: "rgba(59,130,246,0.15)", border: "#93C5FD", fg: "#1E3A8A" },
    success: { bg: "rgba(16,185,129,0.15)", border: "#6EE7B7", fg: "#065F46" },
    warning: { bg: "rgba(245,158,11,0.15)", border: "#FCD34D", fg: "#92400E" },
    error: { bg: "rgba(239,68,68,0.15)", border: "#FCA5A5", fg: "#7F1D1D" },
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        display: "grid",
        gap: 10,
        zIndex: 1000,
      }}
    >
      {toasts.map((t) => {
        const theme = typeColors[t.type] || typeColors.info;
        return (
          <div
            key={t.id}
            className="theme-surface"
            role="status"
            style={{
              borderRadius: 12,
              border: `1px solid var(--border)`,
              boxShadow: "var(--shadow-md)",
              minWidth: 260,
              maxWidth: 380,
              padding: 12,
              background: `linear-gradient(0deg, ${theme.bg}, ${theme.bg}), var(--surface)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div style={{ display: "grid", gap: 4 }}>
                {t.title ? (
                  <strong style={{ color: theme.fg }}>{t.title}</strong>
                ) : null}
                {t.message ? (
                  <div style={{ color: "var(--text)", fontSize: 13 }}>
                    {t.message}
                  </div>
                ) : null}
              </div>
              <button
                className="button-focus-ring"
                aria-label="Dismiss notification"
                onClick={() => actions.removeToast(t.id)}
                style={{
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  borderRadius: 8,
                  cursor: "pointer",
                  padding: "2px 6px",
                }}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
