import { useCallback, useState } from "react";
import { saveBlob } from "@/v2/core/export-jobs";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { invoiceDebtsExportApi } from "../api/invoiceDebtsExportApi";

interface UseInvoiceDebtsExportDownloadOptions {
  downloadToastText: string;
  failedToastText: string;
}

export function useInvoiceDebtsExportDownload({
  downloadToastText,
  failedToastText,
}: UseInvoiceDebtsExportDownloadOptions) {
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);

  const handleDownload = useCallback(
    async (jobId: string, customFileName?: string) => {
      if (downloadingJobId) return;

      try {
        setDownloadingJobId(jobId);
        const blob = await invoiceDebtsExportApi.downloadBackgroundFile(jobId);
        saveBlob(blob, customFileName || "Bao_cao_cong_no.xlsx");

        useV2ToastStore.getState().showToast({
          title: downloadToastText,
          variant: "success",
        });
      } catch (error: unknown) {
        useV2ToastStore.getState().showToast({
          title: (error instanceof Error && error.message) || failedToastText,
          variant: "destructive",
        });
      } finally {
        setDownloadingJobId(null);
      }
    },
    [downloadingJobId, downloadToastText, failedToastText],
  );

  return {
    downloadingJobId,
    handleDownload,
  };
}
