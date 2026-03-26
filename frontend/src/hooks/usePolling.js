import { useEffect } from "react";

export function usePolling(callback, intervalMs, enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const id = setInterval(() => {
      callback();
    }, intervalMs);

    return () => clearInterval(id);
  }, [callback, enabled, intervalMs]);
}

