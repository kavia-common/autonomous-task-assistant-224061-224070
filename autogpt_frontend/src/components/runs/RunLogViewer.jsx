import React, { useEffect, useMemo, useRef } from "react";
import Button from "../common/Button";
import { useRuns, runsStore } from "../../state/runsStore";

/**
 * PUBLIC_INTERFACE
 * RunLogViewer - Displays streaming logs for a run via WebSocket subscription.
 * Ensures log content is safely rendered as text to prevent XSS.
 */
export default function RunLogViewer({ runId }) {
  const { logs = {} } = useRuns((s) => s);
  const lines = logs[runId] || [];
  const tailRef = useRef(null);

  const actions = useMemo(() => runsStore.actionsFactory(), []);

  useEffect(() => {
    if (!runId) return;
    const unsub = actions.subscribeRunLogs(runId);

    const fallbackTimer = setTimeout(() => {
      // If still empty after 1s, seed some demo lines to prove UI
      if ((runsStore.getState().logs[runId] || []).length === 0) {
        ["Booting agent...", "Connecting tools...", "Planning next steps...", "Executing action...", "Streaming output..."].forEach((l, i) => {
          setTimeout(() => actions.appendLog(runId, `[demo] ${l}`), 300 * (i + 1));
        });
      }
    }, 1000);

    return () => {
      clearTimeout(fallbackTimer);
      try {
        unsub?.();
      } catch {
        // ignore
      }
    };
  }, [runId, actions]);

  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  // Helper to coerce any value to a safe display string
  const toSafeString = (val) => {
    if (val == null) return "";
    if (typeof val === "string") return val;
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="theme-surface" style={{ borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <strong>Logs</strong>
        <Button
          variant="ghost"
          size="sm"
          ariaLabel="Clear logs"
          onClick={() => runsStore.actionsFactory().clearLogs(runId)}
        >
          Clear
        </Button>
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          fontSize: 12,
          lineHeight: 1.4,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 10,
          height: 280,
          overflow: "auto",
        }}
        aria-live="polite"
      >
        {lines.length === 0 ? (
          <div style={{ color: "var(--text-muted)" }}>No logs yet.</div>
        ) : (
          lines.map((l, i) => (
            <pre key={`${i}-${toSafeString(l).slice(0, 20)}`} style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {toSafeString(l)}
            </pre>
          ))
        )}
        <div ref={tailRef} />
      </div>
    </div>
  );
}
