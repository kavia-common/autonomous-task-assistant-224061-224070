import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { AppProviders } from "../state/AppProviders";
import { runsStore } from "../state/runsStore";

// Create a controllable mock WS that we can emit messages through
class MockWS {
  constructor() {
    this.subscriptions = {};
    this._connected = true;
  }
  subscribe(topic, cb) {
    if (!this.subscriptions[topic]) this.subscriptions[topic] = new Set();
    this.subscriptions[topic].add(cb);
    return () => this.subscriptions[topic].delete(cb);
  }
  isConnected() { return this._connected; }
  connect() { this._connected = true; }
  close() { this._connected = false; }
  emit(topic, payload) {
    const set = this.subscriptions[topic];
    if (set) {
      set.forEach((cb) => cb(payload, { topic, payload }));
    }
  }
}

const wsInstance = new MockWS();

jest.mock("../lib/wsClient", () => {
  return {
    WebSocketClient: MockWS,
    getWebSocketClient: () => wsInstance,
  };
});

// Mock API for run detail fetch
jest.mock("../api/autogpt", () => {
  return {
    getAutoGPTApi: () => ({
      getRun: jest.fn().mockResolvedValue({ status: 200, data: { id: "r-test", title: "Run r-test", status: "running", createdAt: new Date().toISOString() } }),
      health: jest.fn().mockResolvedValue({ status: 200, data: { ok: true } }),
      listRuns: jest.fn().mockResolvedValue({ status: 200, data: [] }),
      listTasks: jest.fn().mockResolvedValue({ status: 200, data: [] }),
    }),
  };
});

function renderAppAt(route = "/") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </AppProviders>
  );
}

describe("Run logs via WebSocket", () => {
  beforeEach(() => {
    runsStore.setState({ runs: {}, logs: {}, subscriptions: {} }, true);
  });

  test("RunLogViewer subscribes and renders incoming log lines", async () => {
    // Navigate to run detail page with run id r-test
    renderAppAt("/runs/r-test");

    // Basic elements
    expect(await screen.findByText(/Run r-test/i)).toBeInTheDocument();
    expect(await screen.findByText(/Logs/i)).toBeInTheDocument();

    // Emit WS messages on the subscription topic
    const topic = "run:r-test:logs";
    wsInstance.emit(topic, "Initializing...");
    wsInstance.emit(topic, "Agent planning");
    wsInstance.emit(topic, { step: "execute", action: "search" });

    // Assert logs appear
    await waitFor(() => {
      expect(screen.getByText(/Initializing.../i)).toBeInTheDocument();
      expect(screen.getByText(/Agent planning/i)).toBeInTheDocument();
      expect(screen.getByText(/"action":"search"/i)).toBeInTheDocument(); // JSON stringified
    });

    // Clear button removes logs
    fireEvent.click(screen.getByRole("button", { name: /Clear/i }));
    await waitFor(() => {
      expect(screen.getByText(/No logs yet\./i)).toBeInTheDocument();
    });
  });
});
