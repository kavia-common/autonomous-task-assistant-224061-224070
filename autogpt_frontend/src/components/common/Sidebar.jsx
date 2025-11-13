import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

/**
 * PUBLIC_INTERFACE
 * Sidebar - Primary app navigation.
 */
export default function Sidebar() {
  const nav = [
    { to: "/tasks", label: "Tasks", emoji: "🗒️" },
    { to: "/runs", label: "Runs", emoji: "⚙️" },
    { to: "/workspace", label: "Workspace", emoji: "📁" },
    { to: "/settings", label: "Settings", emoji: "⚙️" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="brand__logo">🌊</div>
        <div className="brand__text">
          <span className="brand__title">AutoGPT</span>
          <span className="brand__subtitle">Dashboard</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              "sidebar__link" + (isActive ? " sidebar__link--active" : "")
            }
          >
            <span className="sidebar__icon" aria-hidden="true">{n.emoji}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__env">Env: {process.env.REACT_APP_NODE_ENV || "dev"}</span>
      </div>
    </aside>
  );
}
