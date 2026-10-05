import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  erpInvoicesCoreApi,
  type InvoiceExportHistoryItem,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useInvoiceExportProgress } from "@/modules/erp-invoices-core/hooks/useInvoiceExportProgress";
import { useInvoiceExportProgressStore } from "@/shared/stores/useInvoiceExportProgressStore";

export interface UseInvoiceExportSyncOptions {
  open: boolean;
  page: number;
  pageSize: number;
  direction: "IN" | "OUT";
  trackedJobId: string | null;
}

export function useInvoiceExportSync({
  open,
  page,
  pageSize,
  direction,
  trackedJobId,
}: UseInvoiceExportSyncOptions) {
  const { t } = useTranslation("erpInvoices");
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const terminalRefreshGuardRef = useRef<string | null>(null);
  const downloadedJobIdsRef = useRef<Set<string>>(new Set());

  const progress = useInvoiceExportProgressStore();
  const { downloadReadyFile } = useInvoiceExportProgress();

  const handleDownload = async (
    jobIdOrRow: string | InvoiceExportHistoryItem,
    customFileName?: string,
  ) => {
    const jobId =
      typeof jobIdOrRow === "string" ? jobIdOrRow : jobIdOrRow.jobId;
    const fileName =
      typeof jobIdOrRow === "string" ? customFileName : jobIdOrRow.fileName;

    if (downloadingJobId) return;

    try {
      setDownloadingJobId(jobId);
      await downloadReadyFile(jobId, fileName);
      toast.success(
        t("erpInvoices:exportDrawer.toast.downloading", "Đang tải file XLSX."),
      );
      void historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "erpInvoices:exportDrawer.error.downloadFailed",
            "Không thể tải lại file XLSX.",
          ),
      );
    } finally {
      setDownloadingJobId(null);
    }
  };

  const historyQuery = useQuery({
    queryKey: ["invoice-export-history", page, pageSize, direction],
    queryFn: () =>
      erpInvoicesCoreApi.listExportExcelBackgroundHistory(page, pageSize),
    enabled: open,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      if (!open) return false;
      const data = query.state.data as
        | { items?: Array<{ status: string }> }
        | undefined;
      const hasRunningFromHistory = Boolean(
        data?.items?.some((item) => item.status === "RUNNING"),
      );
      const hasRunning = hasRunningFromHistory || Boolean(progress.isRunning);
      if (!hasRunning) return false;

      const now = Date.now();
      const eventAgeMs = progress.lastEventAt
        ? now - progress.lastEventAt
        : Infinity;
      return progress.sseConnected && eventAgeMs < 20_000 ? false : 10_000;
    },
  });

  useEffect(() => {
    if (!open) return;

    const activeJobId = progress.jobId;
    if (
      activeJobId &&
      (progress.ready || progress.completed) &&
      !downloadedJobIdsRef.current.has(activeJobId)
    ) {
      downloadedJobIdsRef.current.add(activeJobId);
      void handleDownload(activeJobId, progress.fileName);
    }

    if (trackedJobId && !downloadedJobIdsRef.current.has(trackedJobId)) {
      const historyItem = historyQuery.data?.items?.find(
        (it) => it.jobId === trackedJobId && it.status === "COMPLETED",
      );
      if (historyItem) {
        downloadedJobIdsRef.current.add(trackedJobId);
        void handleDownload(trackedJobId, historyItem.fileName);
      }
    }

    if (
      activeJobId &&
      (progress.ready || progress.failed || progress.completed)
    ) {
      if (terminalRefreshGuardRef.current !== activeJobId) {
        terminalRefreshGuardRef.current = activeJobId;
        void historyQuery.refetch();
      }
    }
  }, [
    open,
    progress.jobId,
    progress.ready,
    progress.completed,
    progress.failed,
    progress.fileName,
    trackedJobId,
    historyQuery.data?.items,
  ]);

  useEffect(() => {
    if (!progress.isRunning) {
      terminalRefreshGuardRef.current = null;
    }
  }, [progress.isRunning]);

  return {
    downloadingJobId,
    progress,
    historyQuery,
    handleDownload,
  };
}
