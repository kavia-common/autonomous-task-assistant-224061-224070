import React, { useEffect, useState } from "react";
import Button from "../components/common/Button";
import { getAutoGPTApi } from "../api/autogpt";
import { uiStore } from "../state/uiStore";

/**
 * PUBLIC_INTERFACE
 * WorkspacePage - Displays workspace files and allows a mock upload.
 */
export default function WorkspacePage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const api = getAutoGPTApi();
    api
      .listWorkspaceFiles()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.files || []);
        setFiles(list);
      })
      .catch(() => {
        setFiles([
          { path: "notes/research.md", size: 1234, modified: new Date().toISOString() },
          { path: "context/summary.txt", size: 342, modified: new Date().toISOString() },
        ]);
      });
  }, []);

  const onMockUpload = async () => {
    setUploading(true);
    const api = getAutoGPTApi();
    try {
      try {
        await api.uploadWorkspaceFile({ path: "notes/new.txt", content: "Hello from UI" });
      } catch {
        // offline fallback: just mutate UI state
      }
      setFiles((prev) => [{ path: "notes/new.txt", size: 12, modified: new Date().toISOString() }, ...prev]);

      // Show a small success toast as an example of the toast API
      uiStore.actionsFactory().pushToast({
        type: "success",
        title: "Upload complete",
        message: "notes/new.txt added to workspace.",
        timeout: 2500,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 style={{ margin: 0 }}>Workspace</h2>
      <p style={{ color: "var(--text-muted)", marginTop: 6 }}>Manage files and context for runs.</p>

      <div style={{ marginTop: 8 }}>
        <Button onClick={onMockUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Mock Upload File"}
        </Button>
      </div>

      <div style={{ marginTop: 16 }}>
        {files.length === 0 ? (
          <div className="theme-surface-muted" style={{ padding: 16, fontSize: 14, color: "var(--text-muted)" }}>
            No files found.
          </div>
        ) : (
          <div className="theme-surface" style={{ padding: 12, borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "8px 6px" }}>Path</th>
                  <th style={{ padding: "8px 6px" }}>Size</th>
                  <th style={{ padding: "8px 6px" }}>Modified</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.path} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 6px" }}>
                      <code>{f.path}</code>
                    </td>
                    <td style={{ padding: "8px 6px" }}>{f.size ?? "-"}</td>
                    <td style={{ padding: "8px 6px" }}>{new Date(f.modified || Date.now()).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
