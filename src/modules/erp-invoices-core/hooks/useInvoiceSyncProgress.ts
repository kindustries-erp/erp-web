import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import toast from "react-hot-toast";
import React from "react";
import { Progress } from "@/shared/components/ui/progress";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { API_BASE_URL } from "@/core/api/axiosInstance";

export function useInvoiceSyncProgress(onComplete?: () => void) {
  const token = useAuthStore((s) => s.accessToken);
  const isConnecting = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token) return;
    if (isConnecting.current) return;

    isConnecting.current = true;
    controller.current = new AbortController();

    const url = `${API_BASE_URL}/api/v1/erp-invoices/portal/progress`;

    const connect = async () => {
      try {
        await fetchEventSource(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.current?.signal,
          onmessage(ev) {
            try {
              const data = JSON.parse(ev.data);
              const { current, total, message, completed } = data;

              if (!completed) {
                const percent = total > 0 ? (current / total) * 100 : 0;
                toast.loading(
                  React.createElement(
                    "div",
                    { className: "flex flex-col gap-2 min-w-[200px]" },
                    React.createElement(
                      "div",
                      { className: "text-sm font-medium" },
                      message,
                    ),
                    React.createElement(Progress, { value: percent }),
                  ),
                  { id: "sync-progress", duration: Infinity },
                );
              } else {
                toast.success(message, { id: "sync-progress", duration: 4000 });
                if (onComplete) {
                  onComplete();
                }
              }
            } catch (err) {
              console.error("Failed to parse SSE message", err);
            }
          },
          onerror(err) {
            console.error("SSE error", err);
            throw err;
          },
        });
      } catch (err) {
        console.error("fetchEventSource error", err);
      }
    };

    connect();

    return () => {
      if (controller.current) {
        controller.current.abort();
      }
      isConnecting.current = false;
    };
  }, [onComplete]);
}
