import React from "react";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import "./dashboard.css";

/**
 * PUBLIC_INTERFACE
 * DashboardLayout - App shell with sidebar, topbar and main content area.
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
    </div>
  );
}
