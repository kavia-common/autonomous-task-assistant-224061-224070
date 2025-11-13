import { createStore } from "./createStore";

/**
 * PUBLIC_INTERFACE
 * uiStore - Global UI state: connection, loading, toasts.
 * Toast API usage:
 *   import { uiStore } from "src/state/uiStore";
 *   uiStore.actionsFactory().pushToast({ type: "success", title: "Saved", message: "Your changes were saved." });
 *
 * Robustness:
 * - Guards all actions to operate even if store instance context is not ready.
 * - Logs a warning instead of throwing when called unexpectedly early.
 */
const initialState = {
  connection: "unknown", // connected | disconnected | unknown | degraded
  loadingCount: 0,
  toasts: [], // { id, type, title, message, timeout }
};

let idSeq = 1;

function actionsFactory(ctx) {
  // Defensive: handle missing ctx
  if (!ctx || typeof ctx.getState !== "function" || typeof ctx.setState !== "function") {
    console.warn("[uiStore] actionsFactory invoked without a valid store context; installing no-op actions.");
    const noop = () => {};
    const noopReturn = (v) => v;
    return {
      // PUBLIC_INTERFACE
      startLoading: noop,
      // PUBLIC_INTERFACE
      stopLoading: noop,
      // PUBLIC_INTERFACE
      setConnection: noop,
      // PUBLIC_INTERFACE
      pushToast: ({ type = "info", title, message, timeout = 4000 }) => {
        // Generate an id to keep caller expectations, but do not mutate state
        return `t_${idSeq++}`;
      },
      // PUBLIC_INTERFACE
      removeToast: noop,
    };
  }

  const { getState, setState } = ctx;

  // PUBLIC_INTERFACE
  const startLoading = () =>
    setState((s) => ({ ...s, loadingCount: Math.max(0, s.loadingCount + 1) }));

  // PUBLIC_INTERFACE
  const stopLoading = () =>
    setState((s) => ({ ...s, loadingCount: Math.max(0, s.loadingCount - 1) }));

  // PUBLIC_INTERFACE
  const setConnection = (status) => {
    setState((s) => ({ ...s, connection: status || "unknown" }));
  };

  // PUBLIC_INTERFACE
  const removeToast = (id) =>
    setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));

  // PUBLIC_INTERFACE
  const pushToast = ({ type = "info", title, message, timeout = 4000 }) => {
    const id = `t_${idSeq++}`;
    const toast = { id, type, title, message, timeout };
    setState((s) => ({ ...s, toasts: [toast, ...s.toasts].slice(0, 5) }));
    if (timeout > 0) {
      // Use try/catch to ensure no crash on timer tick
      setTimeout(() => {
        try {
          removeToast(id);
        } catch {
          // ignore
        }
      }, timeout + 50);
    }
    return id;
  };

  return { startLoading, stopLoading, setConnection, pushToast, removeToast };
}

export const uiStore = createStore(initialState, actionsFactory);

// PUBLIC_INTERFACE
export function useUI(selector) {
  return uiStore.useStore(selector || ((s) => s));
}
