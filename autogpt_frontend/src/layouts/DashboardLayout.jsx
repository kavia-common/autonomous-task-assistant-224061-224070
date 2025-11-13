import React from "react";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import "./dashboard.css";
import Toaster from "../components/common/Toaster";

/**
 * PUBLIC_INTERFACE
 * DashboardLayout - App shell with sidebar, topbar and main content area.
 * Includes a global Toaster to render notifications.
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__main">
        <Topbar />
        <div className="layout__content theme-surface" role="main">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
