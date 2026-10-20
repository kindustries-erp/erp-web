import { useCallback, useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

import axiosInstance, { API_BASE_URL } from "@/core/api/axiosInstance";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import type { ExportProgressStore } from "./createExportProgressStore";
import type { ExportJobScope, ExportProgressEvent } from "./exportJobTypes";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Lấy tên file từ Content-Disposition; fallback về tên đã biết. */
export function resolveDownloadFileName(
  contentDisposition: string | undefined,
  fallback?: string,
): string {
  const quoted = contentDisposition
    ?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)?.[1]
    ?.trim();
  const raw = (quoted || fallback || "export.xlsx").replace(/"/g, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function saveBlob(blob: Blob, fileName: string) {
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (document.body.contains(a)) document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  }, 2000);
}

/** Kết nối SSE tiến độ của một luồng xuất và cung cấp hàm tải file đã sẵn sàng. */
export function useBackgroundExportProgress(
  scope: ExportJobScope,
  useStore: ExportProgressStore,
  enabled = true,
) {
  const token = useAuthStore((s) => s.accessToken);
  const setProgress = useStore((s) => s.setProgress);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !token) {
      setProgress({ sseConnected: false });
      return;
    }

    const abort = new AbortController();
    controller.current = abort;

    void fetchEventSource(`${API_BASE_URL}${scope.streamPath}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      signal: abort.signal,
      onopen(res) {
        if (res.ok && res.status === 200) {
          setProgress({ sseConnected: true, lastEventAt: Date.now() });
          return Promise.resolve();
        }
        setProgress({ sseConnected: false });
        return Promise.reject(new Error(`Export SSE failed: ${res.status}`));
      },
      onmessage(ev) {
        if (!ev.data) return;
        try {
          const data = JSON.parse(ev.data) as ExportProgressEvent;
          if (data.processId === "ping") {
            setProgress({ sseConnected: true, lastEventAt: Date.now() });
            return;
          }
          setProgress({
            jobId: data.jobId,
            fileName: data.fileName,
            current: data.current ?? 0,
            total: data.total ?? 100,
            isRunning: data.isRunning ?? false,
            completed: data.completed ?? false,
            ready: data.ready ?? false,
            failed: data.failed ?? false,
            message: data.message,
            sseConnected: true,
            lastEventAt: Date.now(),
          });
        } catch (err) {
          console.error("Failed to parse export SSE", err);
        }
      },
      onerror(err) {
        setProgress({ sseConnected: false });
        throw err;
      },
    }).catch((err) => {
      if (!abort.signal.aborted) {
        setProgress({ sseConnected: false });
        console.error("Export SSE error", err);
      }
    });

    return () => {
      abort.abort();
      setProgress({ sseConnected: false });
    };
  }, [enabled, token, scope.streamPath, setProgress]);

  const downloadReadyFile = useCallback(
    async (
      jobId: string,
      fileName?: string,
      headers?: Record<string, string>,
    ) => {
      if (!token) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const response = await axiosInstance.get<Blob>(
        scope.downloadPath(jobId),
        {
          responseType: "blob",
          timeout: 300000,
          headers,
        },
      );
      const resolved = resolveDownloadFileName(
        response.headers?.["content-disposition"],
        fileName,
      );
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: XLSX_MIME });
      saveBlob(blob, resolved);
    },
    [token, scope],
  );

  return { downloadReadyFile };
}
