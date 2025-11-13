import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { AppProviders } from "../state/AppProviders";

// Silence console warnings from env in tests
const origWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});
afterAll(() => {
  console.warn = origWarn;
});

// Mock API and network-dependent modules at a high level where needed
jest.mock("../api/autogpt", () => {
  const actual = jest.requireActual("../api/autogpt");
  return {
    ...actual,
    getAutoGPTApi: () => ({
      listTasks: jest.fn().mockResolvedValue({ status: 200, data: [] }),
      listRuns: jest.fn().mockResolvedValue({ status: 200, data: [] }),
      getRun: jest.fn().mockResolvedValue({ status: 200, data: { id: "r1", title: "Run r1", status: "running" } }),
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
      return () => {
        this.subscriptions[topic].delete(cb);
      };
    }
    isConnected() {
      return this._connected;
    }
    connect() {
      this._connected = true;
    }
    close() {
      this._connected = false;
    }
    emit(topic, payload) {
      const set = this.subscriptions[topic];
      if (set) {
        set.forEach((cb) => cb(payload, { topic, payload }));
      }
    }
  }
  const instance = new MockWS();
  return {
    WebSocketClient: MockWS,
    getWebSocketClient: () => instance,
  };
});

function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AppProviders>
  );
}

describe("Routing smoke tests", () => {
  test("redirects '/' to '/tasks' and renders Tasks page", async () => {
    renderWithProviders(<App />, { route: "/" });

    // Heading "Tasks" should be present from TasksPage
    expect(await screen.findByText(/Tasks/i)).toBeInTheDocument();
    // New Task button exists
    expect(screen.getByRole("button", { name: /\+ New Task/i })).toBeInTheDocument();
  });

  test("navigates to TaskCreate page", async () => {
    renderWithProviders(<App />, { route: "/tasks/create" });

    expect(await screen.findByText(/Create Task/i)).toBeInTheDocument();
    // There should be a Task Name input
    expect(screen.getByLabelText(/Task Name/i)).toBeInTheDocument();
  });

  test("navigates to Runs page", async () => {
    renderWithProviders(<App />, { route: "/runs" });

    expect(await screen.findByText(/Runs/i)).toBeInTheDocument();
  });

  test("navigates to Run detail page and shows basic structure", async () => {
    renderWithProviders(<App />, { route: "/runs/r1" });

    expect(await screen.findByText(/Run r1/i)).toBeInTheDocument();
    // RunLogViewer shows a "Logs" header
    expect(await screen.findByText(/Logs/i)).toBeInTheDocument();
  });

  test("navigates to Workspace and Settings pages", async () => {
    renderWithProviders(<App />, { route: "/workspace" });
    expect(await screen.findByText(/Workspace/i)).toBeInTheDocument();

    renderWithProviders(<App />, { route: "/settings" });
    expect(await screen.findByText(/Settings/i)).toBeInTheDocument();
  });

  test("renders Not Found for unknown route", async () => {
    renderWithProviders(<App />, { route: "/does-not-exist" });
    expect(await screen.findByText(/Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
  });
});
