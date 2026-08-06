import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { API_BASE_URL } from "@/core/api/axiosInstance";
import { useSerialProgressStore } from "@/shared/stores/useSerialProgressStore";

interface SerialProgressEvent {
  processId: "serial-generation" | "ping";
  pendingLines: number;
  pendingSerials: number;
  isRunning: boolean;
  completed: boolean;
  message?: string;
}

export function useSerialGenerationProgress() {
  const token = useAuthStore((s) => s.accessToken);
  const setProgress = useSerialProgressStore((s) => s.setProgress);
  const isConnecting = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token) return;
    if (isConnecting.current) return;

    isConnecting.current = true;
    controller.current = new AbortController();

    const url = `${API_BASE_URL}/api/v1/goods-receipts/serial-generation/progress/stream`;

    const connect = async () => {
      try {
        await fetchEventSource(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.current?.signal,
          onopen(res) {
            if (res.ok && res.status === 200) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error(`Failed to open SSE: ${res.status}`),
            );
          },
          onmessage(ev) {
            if (!ev.data) return;
            try {
              const data = JSON.parse(ev.data) as SerialProgressEvent;
              if (data.processId === "ping") return;

              setProgress({
                pendingLines: data.pendingLines ?? 0,
                pendingSerials: data.pendingSerials ?? 0,
                isRunning: data.isRunning ?? false,
                completed: data.completed ?? false,
                message: data.message,
              });
            } catch (err) {
              console.error("Failed to parse serial progress SSE message", err);
            }
          },
          onclose() {
            console.log("Serial generation SSE onclose");
          },
          onerror(err) {
            console.error("Serial generation SSE error", err);
            throw err;
          },
        });
      } catch (err) {
        console.error("fetchEventSource error for serial progress", err);
      }
    };

    connect();

    return () => {
      if (controller.current) {
        controller.current.abort();
      }
      isConnecting.current = false;
    };
  }, [token, setProgress]);
}
