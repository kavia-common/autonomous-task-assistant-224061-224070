import { createStore } from "./createStore";
import { getEnv } from "../lib/env";
import { createLogger } from "../lib/logger";

const log = createLogger("store:settings");
const env = getEnv();

const initialState = {
  theme: "system",
  resolvedTheme: "light",
  experimentsEnabled: !!env.EXPERIMENTS_ENABLED,
  featureFlags: env.FEATURE_FLAGS || {},
};

function actionsFactory({ getState, setState }) {
  // PUBLIC_INTERFACE
  const setTheme = (theme) => {
    if (!["light", "dark", "system"].includes(theme)) return;
    setState((s) => ({ ...s, theme }));
    try {
      localStorage.setItem("ui.theme.preference", theme);
    } catch {
      // ignore
    }
  };

  // PUBLIC_INTERFACE
  const setResolvedTheme = (resolved) => {
    setState((s) => ({ ...s, resolvedTheme: resolved }));
  };

  // PUBLIC_INTERFACE
  const toggleExperiments = (value) => {
    const v =
      typeof value === "boolean" ? value : !getState().experimentsEnabled;
    setState((s) => ({ ...s, experimentsEnabled: v }));
  };

  // PUBLIC_INTERFACE
  const setFeatureFlag = (key, value) => {
    setState((s) => ({
      ...s,
      featureFlags: { ...s.featureFlags, [key]: value },
    }));
  };

  // PUBLIC_INTERFACE
  const isFeatureEnabled = (key) => {
    const flags = getState().featureFlags || {};
    return !!flags[key];
  };

  return {
    setTheme,
    setResolvedTheme,
    toggleExperiments,
    setFeatureFlag,
    isFeatureEnabled,
  };
}

export const settingsStore = createStore(initialState, actionsFactory);

// PUBLIC_INTERFACE
export function useSettings(selector) {
  return settingsStore.useStore(selector || ((s) => s));
}
