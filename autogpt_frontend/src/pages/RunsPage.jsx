import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../components/common/Button";
import StatusPill from "../components/common/StatusPill";
import { getAutoGPTApi } from "../api/autogpt";
import { runsStore, useRuns } from "../state/runsStore";
import { uiStore } from "../state/uiStore";

/**
 * PUBLIC_INTERFACE
 * RunsPage - Lists runs with status. Works without backend by seeding demo runs.
 * Includes loading and error feedback with graceful fallbacks.
 */
export default function RunsPage() {
  const { runs = {} } = useRuns((s) => s);
  const runList = useMemo(
    () =>
      Object.values(runs || {}).sort(
        (a, b) => (b?.createdAt || 0).localeCompare?.(a?.createdAt || 0) || 0
      ),
    [runs]
  );
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Optional: filter by task id via ?task=<id>
  const params = new URLSearchParams(location.search);
  const filterTaskId = params.get("task");

  useEffect(() => {
    const api = getAutoGPTApi();
    const actions = uiStore.actionsFactory();
    setLoading(true);
    setError("");
    actions.startLoading();
    api
      .listRuns()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        list.forEach((r) => runsStore.actionsFactory().upsertRun(r));
      })
      .catch(() => {
        // Seed demo runs as placeholder
        setError("Backend unavailable, showing demo runs.");
        const now = new Date().toISOString();
        const demo = [
          { id: "r1", taskId: "t1", status: "running", createdAt: now, title: "Run t1 - A" },
          { id: "r2", taskId: "t2", status: "completed", createdAt: now, title: "Run t2 - B" },
        ];
        demo.forEach((r) => runsStore.actionsFactory().upsertRun(r));
      })
      .finally(() => {
        setLoading(false);
        actions.stopLoading();
      });
  }, []);

  const filtered = useMemo(
    () => (filterTaskId ? runList.filter((r) => r.taskId === filterTaskId) : runList),
    [runList, filterTaskId]
  );

  return (
    <div>
      <h2 style={{ margin: 0 }}>Runs</h2>
      <p style={{ color: "var(--text-muted)", marginTop: 6 }}>Track and monitor current and past runs.</p>

      {filterTaskId ? (
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
          Filtered by task: <code>{filterTaskId}</code>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="theme-surface"
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 10,
            borderLeft: "4px solid var(--color-warning-500)",
            background:
              "linear-gradient(0deg, rgba(245,158,11,0.08), rgba(245,158,11,0.08)), var(--surface)",
            color: "var(--text)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div className="theme-surface-muted" style={{ padding: 16, fontSize: 14, color: "var(--text-muted)" }}>
            Loading runs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="theme-surface-muted" style={{ padding: 16, fontSize: 14, color: "var(--text-muted)" }}>
            No runs available yet. Start a run from a task.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
            {filtered.map((r) => (
              <li
                key={r.id}
                className="theme-surface"
                style={{
                  padding: 12,
                  borderRadius: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <strong style={{ color: "var(--text)" }}>{r.title || r.id}</strong>
                    <StatusPill
                      status={r.status === "running" ? "connected" : r.status === "failed" ? "disconnected" : "unknown"}
                      label={r.status}
                    />
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>
                    Task: <code>{r.taskId || "n/a"}</code> • Created {new Date(r.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={`/runs/${encodeURIComponent(r.id)}`} style={{ textDecoration: "none" }}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
