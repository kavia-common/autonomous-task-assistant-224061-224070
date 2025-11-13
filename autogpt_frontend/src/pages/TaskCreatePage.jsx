import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { tasksStore } from "../state/tasksStore";
import { getAutoGPTApi } from "../api/autogpt";
import { createLogger } from "../lib/logger";

const log = createLogger("ui:task-create");

/**
 * PUBLIC_INTERFACE
 * TaskCreatePage - Minimal form to create a new task; works offline with local state.
 */
export default function TaskCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Task name is required.");
      return;
    }
    setSubmitting(true);

    const api = getAutoGPTApi();
    try {
      // Try backend create, fall back to local
      const payload = { name, goal };
      let created = null;
      try {
        const res = await api.createTask(payload);
        created = res?.data || null;
      } catch (err) {
        // Offline/local placeholder
        created = {
          id: `t_${Date.now()}`,
          name,
          goal,
          status: "idle",
          createdAt: new Date().toISOString(),
        };
      }
      tasksStore.actionsFactory().addTask(created);
      navigate("/tasks");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ margin: 0 }}>Create Task</h2>
      <p style={{ color: "var(--text-muted)", marginTop: 6 }}>Define the objective and let the agent run it.</p>

      <form className="theme-surface" onSubmit={onSubmit} style={{ marginTop: 16, padding: 16, borderRadius: 12, display: "grid", gap: 12 }}>
        <div>
          <label htmlFor="task_name" style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Task Name
          </label>
          <input
            id="task_name"
            className="theme-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., Draft market analysis for Q2"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              transition: "box-shadow var(--transition-fast), border-color var(--transition-fast)"
            }}
          />
        </div>

        <div>
          <label htmlFor="task_goal" style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Goal / Instructions
          </label>
          <textarea
            id="task_goal"
            className="theme-outline"
            rows={6}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe the goal and constraints..."
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              resize: "vertical",
              transition: "box-shadow var(--transition-fast), border-color var(--transition-fast)"
            }}
          />
        </div>

        {error ? (
          <div style={{ color: "var(--color-error)", fontSize: 12 }}>
            {error}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8 }}>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Task"}
          </Button>
          <Button variant="ghost" type="button" onClick={() => navigate("/tasks")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
