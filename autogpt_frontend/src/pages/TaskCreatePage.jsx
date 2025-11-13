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
 * Adds input validation for length and allowed characters.
 */
export default function TaskCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const DISALLOWED = /[<>]/; // basic guard against angle brackets
  const MAX_NAME = 100;
  const MAX_GOAL = 5000;

  const validate = () => {
    const trimmed = name.trim();
    if (!trimmed) return "Task name is required.";
    if (DISALLOWED.test(trimmed)) return "Task name contains disallowed characters.";
    if (trimmed.length > MAX_NAME) return `Task name must be ≤ ${MAX_NAME} characters.`;
    if (goal && goal.length > MAX_GOAL) return `Goal is too long (max ${MAX_GOAL} characters).`;
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setError(v);
    if (v) return;

    setSubmitting(true);

    const api = getAutoGPTApi();
    try {
      // Try backend create, fall back to local
      const payload = { name: name.trim(), goal };
      let created = null;
      try {
        const res = await api.createTask(payload);
        created = res?.data || null;
      } catch (err) {
        // Offline/local placeholder
        created = {
          id: `t_${Date.now()}`,
          name: payload.name,
          goal: payload.goal,
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

  const nameHelp = `Max ${MAX_NAME} chars. Disallowed: < >`;
  const currentInvalid = error ? true : false;

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
            aria-invalid={currentInvalid}
            aria-describedby="task_name_help"
            maxLength={MAX_NAME + 10}
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
          <div id="task_name_help" style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
            {nameHelp}
          </div>
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
            maxLength={MAX_GOAL + 200}
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
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
            Optional. Up to {MAX_GOAL.toLocaleString()} characters.
          </div>
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
