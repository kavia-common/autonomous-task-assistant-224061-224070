import React, { useEffect, useMemo, useState } from "react";
import StatusPill from "./StatusPill";
import { getEnv } from "../../lib/env";
import { getAutoGPTApi } from "../../api/autogpt";
import { createLogger } from "../../lib/logger";
import { uiStore } from "../../state/uiStore";

/**
 * PUBLIC_INTERFACE
 * HealthIndicator - Periodically pings the backend health endpoint and shows a status pill.
 * - Health URL is composed from REACT_APP_BACKEND_URL + (REACT_APP_HEALTHCHECK_PATH || '/health').
 * - Polling interval is modest to avoid load; errors degrade status and trigger a toast.
 * - Intended to be used in the Topbar.
 */
export default function HealthIndicator() {
  const log = useMemo(() => createLogger("ui:health"), []);
  const env = useMemo(() => getEnv(), []);
  const [status, setStatus] = useState("unknown");
  const [lastCode, setLastCode] = useState(null);

  useEffect(() => {
    const api = getAutoGPTApi();

    let mounted = true;
    let timer;

    const check = async () => {
      try {
        // The api.health() uses HEALTHCHECK_PATH, but UX requires explicit composition of BACKEND_URL + HEALTHCHECK_PATH.
        // We still prefer going through http client with base set to API_ROOT for consistent headers/timeouts.
        // Here we call api.health() which honors env.HEALTHCHECK_PATH, and returns status.
        const res = await api.health();
        if (!mounted) return;
        const code = res?.status ?? 200;
        setLastCode(code);
        setStatus(code >= 200 && code < 300 ? "connected" : "degraded");
      } catch (e) {
        if (!mounted) return;
        setLastCode(null);
        setStatus("disconnected");
        uiStore.actionsFactory().pushToast({
          type: "error",
          title: "Health check failed",
          message:
            "Unable to reach backend health endpoint. The app may be offline.",
          timeout: 3000,
        });
        log.warn("Health check failed");
      }
    };

    check();
    timer = setInterval(check, 15000); // 15s cadence to be gentle

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const label =
    status === "connected"
      ? lastCode
        ? `Healthy (${lastCode})`
        : "Healthy"
      : status === "degraded"
      ? lastCode
        ? `Degraded (${lastCode})`
        : "Degraded"
      : "Unavailable";

  return <StatusPill status={status} label={`Health: ${label}`} />;
}
