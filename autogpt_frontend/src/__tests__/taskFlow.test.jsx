import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { AppProviders } from "../state/AppProviders";
import { tasksStore } from "../state/tasksStore";

// Mock API to avoid network
jest.mock("../api/autogpt", () => {
  return {
    getAutoGPTApi: () => ({
      createTask: jest.fn().mockImplementation(async (payload) => {
        // Simulate backend creating an id
        return { status: 201, data: { id: "t_created", ...payload, status: "idle", createdAt: new Date().toISOString() } };
      }),
      listTasks: jest.fn().mockResolvedValue({ status: 200, data: [] }),
      health: jest.fn().mockResolvedValue({ status: 200, data: { ok: true } }),
    }),
  };
});

// Mock WS to keep AppProviders happy
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

function renderAppAt(route = "/") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </AppProviders>
  );
}

describe("Task creation flow", () => {
  beforeEach(() => {
    // Reset tasks store to a known state
    tasksStore.setState({ tasks: [], selectedTaskId: null }, true);
  });

  test("submitting the create form adds a task and navigates back to /tasks", async () => {
    renderAppAt("/tasks/create");

    // Fill out form
    const nameInput = await screen.findByLabelText(/Task Name/i);
    fireEvent.change(nameInput, { target: { value: "Draft market analysis" } });

    const goalInput = screen.getByLabelText(/Goal \/ Instructions/i);
    fireEvent.change(goalInput, { target: { value: "Analyze Q2 performance" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Create Task/i }));

    // After submit, the page should navigate to Tasks (heading appears)
    await waitFor(async () => {
      expect(await screen.findByText(/Tasks/i)).toBeInTheDocument();
    });

    // Assert store contains the created task (either from API or fallback)
    const state = tasksStore.getState();
    const found = state.tasks.find((t) => t.name === "Draft market analysis");
    expect(found).toBeTruthy();
    expect(found.status).toBeDefined();

    // The task list UI should show the new task
    expect(screen.getByText(/Draft market analysis/i)).toBeInTheDocument();
  });

  test("validation shows error when submitting empty name", async () => {
    renderAppAt("/tasks/create");
    fireEvent.click(screen.getByRole("button", { name: /Create Task/i }));

    // Should remain on Create page and show validation message
    expect(await screen.findByText(/Task name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Task/i)).toBeInTheDocument();
  });
});
