import { createStore } from "./createStore";
import { getWebSocketClient } from "../lib/wsClient";
import { createLogger } from "../lib/logger";
import { uiStore } from "./uiStore";

const log = createLogger("store:runs");

const initialState = {
  runs: {}, // runId -> run object
  logs: {}, // runId -> [log lines]
  subscriptions: {}, // runId -> unsubscribe fn
};

function actionsFactory({ getState, setState }) {
  // PUBLIC_INTERFACE
  const upsertRun = (run) => {
    if (!run || !run.id) return;
    setState((s) => ({ ...s, runs: { ...s.runs, [run.id]: run } }));
  };

  // PUBLIC_INTERFACE
  const removeRun = (runId) => {
    if (!runId) return;
    setState((s) => {
      const next = { ...s.runs };
      delete next[runId];
      return { ...s, runs: next };
    });
  };

  // PUBLIC_INTERFACE
  const clearLogs = (runId) => {
    if (!runId) return;
    setState((s) => ({ ...s, logs: { ...s.logs, [runId]: [] } }));
  };

  // PUBLIC_INTERFACE
  const appendLog = (runId, line) => {
    if (!runId) return;
    setState((s) => {
      const arr = s.logs[runId] || [];
      return { ...s, logs: { ...s.logs, [runId]: [...arr, line] } };
    });
  };

  let wsClient;
  const ensureWS = () => {
    if (!wsClient) {
      wsClient = getWebSocketClient();
    }
    return wsClient;
  };

  // PUBLIC_INTERFACE
  const subscribeRunLogs = (runId) => {
    if (!runId) return () => {};
    const current = getState().subscriptions[runId];
    if (current) {
      return current;
    }

    const ws = ensureWS();
    const topic = `run:${runId}:logs`;
    log.debug("Subscribing to run logs", { runId, topic });

    const onMsg = (payload) => {
      const line =
        typeof payload === "string" ? payload : JSON.stringify(payload);
      appendLog(runId, line);
    };

    const unsub = ws.subscribe(topic, onMsg);
    setState((s) => ({
      ...s,
      subscriptions: { ...s.subscriptions, [runId]: unsub },
    }));

    return unsub;
  };

  // PUBLIC_INTERFACE
  const unsubscribeRunLogs = (runId) => {
    const subs = getState().subscriptions || {};
    const unsub = subs[runId];
    if (typeof unsub === "function") {
      try {
        unsub();
      } catch {
        // ignore
      }
    }
    setState((s) => {
      const n = { ...s.subscriptions };
      delete n[runId];
      return { ...s, subscriptions: n };
    });
  };

  // PUBLIC_INTERFACE
  const isSubscribed = (runId) => {
    return !!getState().subscriptions[runId];
  };

  // PUBLIC_INTERFACE
  const refreshConnectionStatus = () => {
    try {
      const ws = ensureWS();
      const status = ws.isConnected() ? "connected" : "disconnected";
      uiStore.actionsFactory
        ? uiStore.actionsFactory().setConnection(status)
        : uiStore.setState({ connection: status });
    } catch {
      // ignore
    }
  };

  return {
    upsertRun,
    removeRun,
    clearLogs,
    appendLog,
    subscribeRunLogs,
    unsubscribeRunLogs,
    isSubscribed,
    refreshConnectionStatus,
  };
}

export const runsStore = createStore(initialState, actionsFactory);

// PUBLIC_INTERFACE
export function useRuns(selector) {
  return runsStore.useStore(selector || ((s) => s));
}
