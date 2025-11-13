import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import "./App.css";
import TasksPage from "./pages/TasksPage";
import TaskCreatePage from "./pages/TaskCreatePage";
import RunsPage from "./pages/RunsPage";
import RunDetailPage from "./pages/RunDetailPage";
import WorkspacePage from "./pages/WorkspacePage";
import SettingsPage from "./pages/SettingsPage";

/**
 * PUBLIC_INTERFACE
 * App - Main router wiring for Tasks, Runs, Workspace, Settings and details.
 */
function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/create" element={<TaskCreatePage />} />
        <Route path="/runs" element={<RunsPage />} />
        <Route path="/runs/:id" element={<RunDetailPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="*"
          element={
            <div>
              <h2 style={{ marginTop: 0 }}>Not Found</h2>
              <p style={{ color: "var(--text-muted)" }}>Page not found.</p>
            </div>
          }
        />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
