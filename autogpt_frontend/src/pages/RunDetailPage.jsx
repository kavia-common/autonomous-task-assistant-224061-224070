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
 */
export default function RunDetailPage() {
  const { id } = useParams();
  const { runs = {} } = useRuns((s) => s);
  const run = runs[id];

  useEffect(() => {
    const api = getAutoGPTApi();
    if (!id) return;
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
      });
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

      <div className="theme-surface" style={{ marginTop: 16, padding: 12, borderRadius: 12, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <strong style={{ color: "var(--text)" }}>{run?.title || run?.id || id}</strong>
          <StatusPill status={statusMap(run?.status)} label={run?.status || "unknown"} />
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
