import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import axiosInstance from "@/core/api/axiosInstance";
import type { ExportProgressStore } from "./createExportProgressStore";
import type {
  ExportHistoryItem,
  ExportHistoryResult,
  ExportJobScope,
  ExportStartResult,
} from "./exportJobTypes";
import { useBackgroundExportProgress } from "./useBackgroundExportProgress";

export interface UseBackgroundExportOptions {
  scope: ExportJobScope;
  useStore: ExportProgressStore;
  open: boolean;
  /** Thông báo hiển thị cho người dùng (đã dịch). */
  messages: {
    downloading: string;
    downloadFailed: string;
    startFailed: string;
  };
}

/**
 * Điều phối xuất Excel nền: tạo job, theo dõi tiến độ SSE, tự tải khi xong,
 * lịch sử phân trang và tải lại file (còn hạn).
 */
export function useBackgroundExport<TPayload>({
  scope,
  useStore,
  open,
  messages,
}: UseBackgroundExportOptions) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const downloadedRef = useRef<Set<string>>(new Set());
  const refreshGuardRef = useRef<string | null>(null);

  const progress = useStore();
  const { downloadReadyFile } = useBackgroundExportProgress(
    scope,
    useStore,
    open,
  );

  const historyQuery = useQuery({
    queryKey: ["export-history", scope.key, page, pageSize],
    queryFn: async () => {
      const res = await axiosInstance.get<ExportHistoryResult>(
        scope.historyPath,
        { params: { page, pageSize } },
      );
      return res.data;
    },
    enabled: open,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      if (!open) return false;
      const items = (query.state.data as ExportHistoryResult | undefined)
        ?.items;
      const running =
        Boolean(items?.some((it) => it.status === "RUNNING")) ||
        progress.isRunning;
      if (!running) return false;
      const age = progress.lastEventAt
        ? Date.now() - progress.lastEventAt
        : Infinity;
      return progress.sseConnected && age < 20_000 ? false : 10_000;
    },
  });
  const { refetch: refetchHistory } = historyQuery;

  const handleDownload = useCallback(
    async (jobIdOrRow: string | ExportHistoryItem, customFileName?: string) => {
      const jobId =
        typeof jobIdOrRow === "string" ? jobIdOrRow : jobIdOrRow.jobId;
      const fileName =
        typeof jobIdOrRow === "string" ? customFileName : jobIdOrRow.fileName;
      if (downloadingJobId) return;
      try {
        setDownloadingJobId(jobId);
        await downloadReadyFile(jobId, fileName);
        toast.success(messages.downloading);
        void refetchHistory();
      } catch (error: any) {
        toast.error(error?.message || messages.downloadFailed);
      } finally {
        setDownloadingJobId(null);
      }
    },
    [downloadingJobId, downloadReadyFile, messages, refetchHistory],
  );

  const startMutation = useMutation({
    mutationFn: async (input: {
      payload: TPayload;
      headers?: Record<string, string>;
    }) => {
      const res = await axiosInstance.post<ExportStartResult>(
        scope.startPath,
        input.payload,
        { headers: input.headers },
      );
      return res.data;
    },
  });
  const { mutateAsync: startExport } = startMutation;

  const start = useCallback(
    async (payload: TPayload, headers?: Record<string, string>) => {
      try {
        const result = await startExport({ payload, headers });
        if (result.reused) {
          downloadedRef.current.add(result.jobId);
          await handleDownload(result.jobId);
        } else {
          setTrackedJobId(result.jobId);
          toast.success(result.message);
        }
        void refetchHistory();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            messages.startFailed,
        );
      }
    },
    [startExport, handleDownload, messages.startFailed, refetchHistory],
  );

  useEffect(() => {
    if (!open) return;
    const activeJobId = progress.jobId;

    if (
      activeJobId &&
      activeJobId === trackedJobId &&
      (progress.ready || progress.completed) &&
      !downloadedRef.current.has(activeJobId)
    ) {
      downloadedRef.current.add(activeJobId);
      void handleDownload(activeJobId, progress.fileName);
    }

    if (trackedJobId && !downloadedRef.current.has(trackedJobId)) {
      const done = historyQuery.data?.items?.find(
        (it) => it.jobId === trackedJobId && it.status === "COMPLETED",
      );
      if (done) {
        downloadedRef.current.add(trackedJobId);
        void handleDownload(trackedJobId, done.fileName);
      }
    }

    if (
      activeJobId &&
      (progress.ready || progress.failed || progress.completed) &&
      refreshGuardRef.current !== activeJobId
    ) {
      refreshGuardRef.current = activeJobId;
      void refetchHistory();
    }
  }, [
    open,
    progress.jobId,
    progress.ready,
    progress.completed,
    progress.failed,
    trackedJobId,
    historyQuery.data?.items,
  ]);

  useEffect(() => {
    if (!progress.isRunning) refreshGuardRef.current = null;
  }, [progress.isRunning]);

  return {
    start,
    starting: startMutation.isPending,
    progress,
    historyQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    downloadingJobId,
    handleDownload,
  };
}
