import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import StatusPill from "../components/common/StatusPill";
import { getEnv } from "../lib/env";
import { getAutoGPTApi } from "../api/autogpt";
import { createLogger } from "../lib/logger";
import { useTasks, tasksStore } from "../state/tasksStore";

const log = createLogger("ui:tasks");

/**
 * PUBLIC_INTERFACE
 * TasksPage - Lists tasks and provides navigation to create a new task.
 */
export default function TasksPage() {
  const navigate = useNavigate();
  const env = useMemo(() => getEnv(), []);
  const [health, setHealth] = useState("Checking...");
  const { tasks = [] } = useTasks((s) => s);

  useEffect(() => {
    const api = getAutoGPTApi();
    api
      .health()
      .then((res) => setHealth(typeof res.status === "number" ? `OK (${res.status})` : "OK"))
      .catch(() => setHealth("Unavailable"));
  }, []);

  // Try to fetch tasks from API, but don't error if backend is absent
  useEffect(() => {
    const api = getAutoGPTApi();
    api
      .listTasks()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        tasksStore.actionsFactory().setTasks(list);
      })
      .catch(() => {
        // Populate demo tasks as placeholder
        const demo = [
          { id: "t1", name: "Research competitor landscape", status: "idle", createdAt: new Date().toISOString() },
          { id: "t2", name: "Summarize weekly reports", status: "idle", createdAt: new Date().toISOString() },
        ];
        tasksStore.actionsFactory().setTasks(demo);
      });
  }, []);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Tasks</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 6 }}>Create and manage your autonomous tasks.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" onClick={() => navigate("/tasks/create")}>+ New Task</Button>
        </div>
      </div>

      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12 }}>
        <span>Health: {health}</span>
        <span>•</span>
        <span>Experiments: {env.EXPERIMENTS_ENABLED ? "Enabled" : "Disabled"}</span>
        <span>•</span>
        <span>Flags: {Object.keys(env.FEATURE_FLAGS || {}).length}</span>
      </div>

      <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        {tasks.length === 0 ? (
          <div className="theme-surface-muted" style={{ padding: 16, fontSize: 14, color: "var(--text-muted)" }}>
            No tasks yet. Click "New Task" to create your first task.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
            {tasks.map((t) => (
              <li
                key={t.id}
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
                    <strong style={{ color: "var(--text)" }}>{t.name || t.id}</strong>
                    <StatusPill status={t.status === "running" ? "connected" : "unknown"} label={t.status || "idle"} />
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>
                    Created {new Date(t.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={`/runs?task=${encodeURIComponent(t.id)}`} style={{ textDecoration: "none" }}>
                    <Button variant="ghost" size="sm">View Runs</Button>
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
