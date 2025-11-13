import { createStore } from "./createStore";

/**
 * PUBLIC_INTERFACE
 * uiStore - Global UI state: connection, loading, toasts.
 * Toast API usage:
 *   import { uiStore } from "src/state/uiStore";
 *   uiStore.actionsFactory().pushToast({ type: "success", title: "Saved", message: "Your changes were saved." });
 *
 * Robustness:
 * - Uses optional chaining on storeRef to avoid destructuring undefined.
 * - Returns no-op bound actions if storeRef.current is not ready.
 */
const initialState = {
  connection: "unknown", // connected | disconnected | unknown | degraded
  loadingCount: 0,
  toasts: [], // { id, type, title, message, timeout }
};

let idSeq = 1;

function actionsFactory(ctx = {}) {
  const ref = ctx.storeRef;
  const safeGetState =
    (ctx && typeof ctx.getState === "function" && ctx.getState) || (() => initialState);
  const safeSetState =
    (ctx && typeof ctx.setState === "function" && ctx.setState) || (() => {});

  const isReady = !!ref?.current;

  if (!isReady) {
    // Provide safe no-op actions that still return ids, never throw.
    console.warn("[uiStore] actionsFactory: storeRef.current missing, returning no-op actions.");
    return {
      // PUBLIC_INTERFACE
      startLoading: () => {},
      // PUBLIC_INTERFACE
      stopLoading: () => {},
      // PUBLIC_INTERFACE
      setConnection: () => {},
      // PUBLIC_INTERFACE
      pushToast: ({ type = "info", title, message, timeout = 4000 } = {}) => `t_${idSeq++}`,
      // PUBLIC_INTERFACE
      removeToast: () => {},
    };
  }

  // PUBLIC_INTERFACE
  const startLoading = () =>
    safeSetState((s) => ({ ...s, loadingCount: Math.max(0, s.loadingCount + 1) }));

  // PUBLIC_INTERFACE
  const stopLoading = () =>
    safeSetState((s) => ({ ...s, loadingCount: Math.max(0, s.loadingCount - 1) }));

  // PUBLIC_INTERFACE
  const setConnection = (status) => {
    safeSetState((s) => ({ ...s, connection: status || "unknown" }));
  };

  // PUBLIC_INTERFACE
  const removeToast = (id) =>
    safeSetState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));

  // PUBLIC_INTERFACE
  const pushToast = ({ type = "info", title, message, timeout = 4000 } = {}) => {
    const id = `t_${idSeq++}`;
    const toast = { id, type, title, message, timeout };
    safeSetState((s) => ({ ...s, toasts: [toast, ...s.toasts].slice(0, 5) }));
    if (timeout > 0) {
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

// PUBLIC_INTERFACE
export function subscribeUI(listener) {
  return uiStore.subscribe(listener);
}
