import React from "react";

/**
 * PUBLIC_INTERFACE
 * StatusPill - colored small pill to display a status label.
 */
export default function StatusPill({ status = "unknown", label }) {
  const map = {
    connected: { bg: "rgba(16,185,129,0.15)", fg: "#10B981" },
    disconnected: { bg: "rgba(239,68,68,0.15)", fg: "#EF4444" },
    degraded: { bg: "rgba(245,158,11,0.15)", fg: "#F59E0B" },
    unknown: { bg: "rgba(107,114,128,0.15)", fg: "#6B7280" },
  };
  const c = map[status] || map.unknown;
  const style = {
    background: c.bg,
    color: c.fg,
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid rgba(0,0,0,0.04)",
  };
  return <span style={style}>{label || status}</span>;
}
