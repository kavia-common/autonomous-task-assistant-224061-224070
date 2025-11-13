import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * Basic routed pages as placeholders: Tasks, Runs, Workspace, Settings.
 */
function Page({ title, description }) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ color: "var(--text-muted)" }}>{description}</p>
      <div
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 10,
          border: "1px dashed var(--border)",
          background: "var(--surface-2)",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Placeholder: No backend connected yet.
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route
          path="/tasks"
          element={<Page title="Tasks" description="Create and manage your autonomous tasks." />}
        />
        <Route
          path="/runs"
          element={<Page title="Runs" description="Track and monitor current and past runs." />}
        />
        <Route
          path="/workspace"
          element={<Page title="Workspace" description="Manage files and context for runs." />}
        />
        <Route
          path="/settings"
          element={<Page title="Settings" description="Configure preferences and integrations." />}
        />
        <Route path="*" element={<Page title="Not Found" description="Page not found." />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
