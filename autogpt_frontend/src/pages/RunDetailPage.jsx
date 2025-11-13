import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/common/Button";
import StatusPill from "../components/common/StatusPill";
import RunLogViewer from "../components/runs/RunLogViewer";
import { getAutoGPTApi } from "../api/autogpt";
import { runsStore, useRuns } from "../state/runsStore";

/**
 * PUBLIC_INTERFACE
 * RunDetailPage - Shows info for a run and a live log viewer.
 * Adds loading and error states; degrades to demo data if backend is unavailable.
 */
export default function RunDetailPage() {
  const { id } = useParams();
  const { runs = {} } = useRuns((s) => s);
  const run = runs[id];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const api = getAutoGPTApi();
    if (!id) return;
    setLoading(true);
    setError("");
    api
      .getRun(id)
      .then((res) => runsStore.actionsFactory().upsertRun(res?.data || { id }))
      .catch(() => {
        // Seed a demo run if not present
        if (!runsStore.getState().runs[id]) {
          runsStore.actionsFactory().upsertRun({
            id,
            taskId: "t1",
            title: `Run ${id}`,
            status: "running",
            createdAt: new Date().toISOString(),
          });
        }
        setError("Backend unavailable, showing demo run.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const statusMap = (s) => (s === "running" ? "connected" : s === "failed" ? "disconnected" : "unknown");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Run {id}</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 6 }}>Details and live logs.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/runs" style={{ textDecoration: "none" }}>
            <Button variant="ghost" size="sm">Back to Runs</Button>
          </Link>
        </div>
      </div>

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

      <div className="theme-surface" style={{ marginTop: 16, padding: 12, borderRadius: 12, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <strong style={{ color: "var(--text)" }}>
            {loading ? "Loading..." : (run?.title || run?.id || id)}
          </strong>
          <StatusPill status={statusMap(run?.status)} label={run?.status || (loading ? "loading" : "unknown")} />
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
          Task: <code>{run?.taskId || "n/a"}</code> • Created {new Date(run?.createdAt || Date.now()).toLocaleString()}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <RunLogViewer runId={id} />
      </div>
    </div>
  );
}
