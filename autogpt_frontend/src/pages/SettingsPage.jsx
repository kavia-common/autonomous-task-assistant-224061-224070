import React from "react";
import Button from "../components/common/Button";
import { useSettings, settingsStore } from "../state/settingsStore";
import { getEnv } from "../lib/env";

/**
 * PUBLIC_INTERFACE
 * SettingsPage - Controls theme, experiments, and shows feature flags.
 */
export default function SettingsPage() {
  const { theme, experimentsEnabled, featureFlags } = useSettings((s) => s);
  const actions = settingsStore.actionsFactory();
  const env = getEnv();

  const themeOrder = ["light", "dark", "system"];

  const cycleTheme = () => {
    const idx = themeOrder.indexOf(theme);
    actions.setTheme(themeOrder[(idx + 1) % themeOrder.length]);
  };

  return (
    <div>
      <h2 style={{ margin: 0 }}>Settings</h2>
      <p style={{ color: "var(--text-muted)", marginTop: 6 }}>Configure preferences and integrations.</p>

      <div className="theme-surface" style={{ marginTop: 16, padding: 12, borderRadius: 12, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <strong>Theme</strong>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Current: {theme}</div>
          </div>
          <Button variant="ghost" onClick={cycleTheme}>Cycle Theme</Button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <strong>Experiments</strong>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {experimentsEnabled ? "Enabled" : "Disabled"}
            </div>
          </div>
          <Button variant="ghost" onClick={() => actions.toggleExperiments()}>
            Toggle
          </Button>
        </div>

        <div>
          <strong>Feature Flags</strong>
          {Object.keys(featureFlags || {}).length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>
              No feature flags set.
            </div>
          ) : (
            <ul style={{ marginTop: 6 }}>
              {Object.entries(featureFlags).map(([k, v]) => (
                <li key={k} style={{ fontSize: 14 }}>
                  <code>{k}</code>: {String(v)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <strong>Environment</strong>
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>
            API: <code>{env.API_ROOT}</code> • WS: <code>{env.WS_URL}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
