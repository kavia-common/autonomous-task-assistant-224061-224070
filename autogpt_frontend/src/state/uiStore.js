import { createStore } from "./createStore";

const initialState = {
  connection: "unknown", // connected | disconnected | unknown | degraded
  loadingCount: 0,
  toasts: [], // { id, type, title, message, timeout }
};

let idSeq = 1;

function actionsFactory({ getState, setState }) {
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
  const pushToast = ({ type = "info", title, message, timeout = 4000 }) => {
    const id = `t_${idSeq++}`;
    const toast = { id, type, title, message, timeout };
    setState((s) => ({ ...s, toasts: [toast, ...s.toasts].slice(0, 5) }));
    if (timeout > 0) {
      setTimeout(() => removeToast(id), timeout + 50);
    }
    return id;
  };

  // PUBLIC_INTERFACE
  const removeToast = (id) =>
    setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));

  return { startLoading, stopLoading, setConnection, pushToast, removeToast };
}

export const uiStore = createStore(initialState, actionsFactory);

// PUBLIC_INTERFACE
export function useUI(selector) {
  return uiStore.useStore(selector || ((s) => s));
}
