import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { AppProviders } from "../state/AppProviders";
import { uiStore } from "../state/uiStore";

// Mock API and WS to avoid network dependencies
jest.mock("../api/autogpt", () => {
  return {
    getAutoGPTApi: () => ({
      listTasks: jest.fn().mockResolvedValue({ status: 200, data: [] }),
      listRuns: jest.fn().mockResolvedValue({ status: 200, data: [] }),
      health: jest.fn().mockResolvedValue({ status: 200, data: { ok: true } }),
    }),
  };
});

jest.mock("../lib/wsClient", () => {
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
    isConnected() { return true; }
    connect() {}
    close() {}
  }
  const instance = new MockWS();
  return {
    WebSocketClient: MockWS,
    getWebSocketClient: () => instance,
  };
});

function renderWithProviders(route = "/") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </AppProviders>
  );
}

describe("Toaster integration", () => {
  test("app mounts and can push and render a toast without crashing", async () => {
    renderWithProviders("/tasks");

    // Push a toast via uiStore API
    const id = uiStore.actionsFactory().pushToast({
      type: "success",
      title: "Hello",
      message: "Toast works",
      timeout: 0, // don't auto-dismiss in test
    });
    expect(id).toBeTruthy();

    // The toast contents should appear
    expect(await screen.findByText(/Hello/i)).toBeInTheDocument();
    expect(screen.getByText(/Toast works/i)).toBeInTheDocument();
  });
});
