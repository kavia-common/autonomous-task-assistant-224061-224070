import React, { useContext, useMemo } from "react";
import Button from "./Button";
import StatusPill from "./StatusPill";
import { ThemeContext } from "../../theme/ThemeProvider";
import "./topbar.css";
import { useUI } from "../../state/uiStore";
import HealthIndicator from "./HealthIndicator";

/**
 * PUBLIC_INTERFACE
 * Topbar - contains theme toggle and status indicators (connection and health).
 */
export default function Topbar() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useContext(ThemeContext);
  const conn = useUI((s) => s.connection) || "unknown";

  const themeLabel =
    theme === "system"
      ? `System (${resolvedTheme})`
      : theme === "dark"
      ? "Dark"
      : "Light";

  return (
    <header className="topbar theme-surface" role="banner">
      <div className="topbar__left">
        <h1 className="topbar__title">Dashboard</h1>
      </div>
      <div className="topbar__right">
        <div className="topbar__status" style={{ display: "flex", gap: 6 }}>
          <StatusPill status={conn} label={`Connection: ${conn}`} />
          <HealthIndicator />
        </div>
        <div className="topbar__divider" aria-hidden="true" />
        <div className="topbar__theme">
          <Button variant="ghost" size="sm" ariaLabel="Toggle theme" onClick={toggleTheme}>
            Theme: {themeLabel}
          </Button>
          <div className="topbar__theme-menu" role="group" aria-label="Theme select">
            <Button variant="ghost" size="sm" onClick={() => setTheme("light")}>☀️</Button>
            <Button variant="ghost" size="sm" onClick={() => setTheme("dark")}>🌙</Button>
            <Button variant="ghost" size="sm" onClick={() => setTheme("system")}>🖥️</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
