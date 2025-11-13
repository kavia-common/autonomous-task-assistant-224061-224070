import { getHttpClient } from "../lib/httpClient";
import { getWebSocketClient } from "../lib/wsClient";
import { getEnv } from "../lib/env";
import { createLogger } from "../lib/logger";

const log = createLogger("api");

/**
 * PUBLIC_INTERFACE
 * AutoGPTApi - High-level API surface for the app. Endpoints are placeholders
 * aligned with expected flows: tasks, runs, workspace, settings.
 * Replace paths when backend spec is available.
 */
export class AutoGPTApi {
  constructor({ httpClient, wsClient } = {}) {
    this.http = httpClient || getHttpClient();
    const env = getEnv();
    this.ws = wsClient || getWebSocketClient(env.WS_URL);
  }

  // Tasks
  // PUBLIC_INTERFACE
  async listTasks({ page = 1, pageSize = 20 } = {}) {
    return this.http.get("/tasks", { query: { page, pageSize } });
  }

  // PUBLIC_INTERFACE
  async createTask(payload) {
    return this.http.post("/tasks", payload);
  }

  // PUBLIC_INTERFACE
  async getTask(taskId) {
    return this.http.get(`/tasks/${encodeURIComponent(taskId)}`);
  }

  // Runs
  // PUBLIC_INTERFACE
  async listRuns({ page = 1, pageSize = 20 } = {}) {
    return this.http.get("/runs", { query: { page, pageSize } });
  }

  // PUBLIC_INTERFACE
  async startRun(taskId, options = {}) {
    return this.http.post(`/tasks/${encodeURIComponent(taskId)}/runs`, options);
  }

  // PUBLIC_INTERFACE
  async getRun(runId) {
    return this.http.get(`/runs/${encodeURIComponent(runId)}`);
  }

  // Workspace
  // PUBLIC_INTERFACE
  async listWorkspaceFiles({ path = "" } = {}) {
    return this.http.get("/workspace/files", { query: { path } });
  }

  // PUBLIC_INTERFACE
  async uploadWorkspaceFile({ path = "", content = "" }) {
    return this.http.post("/workspace/files", { path, content });
  }

  // Settings/Health
  // PUBLIC_INTERFACE
  async health() {
    const env = getEnv();
    // The health path can be configured; CRA dev proxy or absolute URL is handled by http client base URL.
    const path = env.HEALTHCHECK_PATH || "/health";
    return this.http.get(path);
  }

  // Logs via WebSocket
  // PUBLIC_INTERFACE
  subscribeRunLogs(runId, handler) {
    const topic = `run:${runId}:logs`;
    log.debug("Subscribing to run logs", { topic });
    return this.ws.subscribe(topic, handler);
  }

  // PUBLIC_INTERFACE
  subscribeSystem(handler) {
    return this.ws.subscribe("system", handler);
  }
}

// PUBLIC_INTERFACE
export function getAutoGPTApi() {
  return new AutoGPTApi({});
}
