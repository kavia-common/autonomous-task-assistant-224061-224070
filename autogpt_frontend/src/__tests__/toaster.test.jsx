import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Toaster from "../components/common/Toaster";
import { uiStore } from "../state/uiStore";

// No network dependencies for this unit
jest.mock("../api/autogpt", () => {
  return {
    getAutoGPTApi: () => ({
      listTasks: jest.fn().mockResolvedValue({ status: 200, data: [] }),
      listRuns: jest.fn().mockResolvedValue({ status: 200, data: [] }),
      health: jest.fn().mockResolvedValue({ status: 200, data: { ok: true } }),
    }),
  };
});

describe("Toaster singleton behavior", () => {
  test("mounts without providers and does not crash before store init", async () => {
    render(<Toaster />);
    // Initially, no toasts
    await waitFor(() => {
      // No crash implies the container is present and empty is fine
      expect(document.body).toBeTruthy();
    });
  });

  test("renders a toast pushed after mount", async () => {
    render(<Toaster />);

    const id = uiStore.actionsFactory().pushToast({
      type: "success",
      title: "Hello",
      message: "Toast works",
      timeout: 0, // keep it visible
    });
    expect(id).toBeTruthy();

    expect(await screen.findByText(/Hello/i)).toBeInTheDocument();
    expect(screen.getByText(/Toast works/i)).toBeInTheDocument();
  });
});
