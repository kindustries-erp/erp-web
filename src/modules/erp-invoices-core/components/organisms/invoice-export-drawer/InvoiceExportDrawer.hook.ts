import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceListParams,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useInvoiceExportScope } from "./InvoiceExportDrawer.scope.hook";
import { useInvoiceExportSync } from "./InvoiceExportDrawer.sync.hook";

export interface UseInvoiceExportDrawerOptions {
  open: boolean;
  direction: "IN" | "OUT";
  buildBaseQuery: () => Partial<ErpInvoiceListParams>;
}

export function useInvoiceExportDrawer({
  open,
  direction,
  buildBaseQuery,
}: UseInvoiceExportDrawerOptions) {
  const { t } = useTranslation("erpInvoices");
  const scope = useInvoiceExportScope({ direction, buildBaseQuery });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);

  const { downloadingJobId, progress, historyQuery, handleDownload } =
    useInvoiceExportSync({
      open,
      page,
      pageSize,
      direction,
      trackedJobId,
    });

  const handleStartExport = async () => {
    const payload = scope.buildScopeQuery();
    if (!payload) return;

    try {
      setStarting(true);
      const result =
        await erpInvoicesCoreApi.startExportExcelBackground(payload);
      setTrackedJobId(result.jobId);
      if (result.reused) {
        toast.success(
          result.message ||
            t(
              "erpInvoices:exportDrawer.toast.reused",
              "Đã tìm thấy file cũ. Đang tự động tải xuống.",
            ),
        );
        void handleDownload(result.jobId);
      } else {
        toast.success(
          result.message ||
            t(
              "erpInvoices:exportDrawer.toast.started",
              "Đã bắt đầu tiến trình xuất Excel.",
            ),
        );
      }
      await historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "erpInvoices:exportDrawer.error.startFailed",
            "Không thể bắt đầu xuất Excel.",
          ),
      );
    } finally {
      setStarting(false);
    }
  };

  return {
    ...scope,
    page,
    setPage,
    pageSize,
    setPageSize,
    starting,
    downloadingJobId,
    progress,
    historyQuery,
    handleDownload,
    handleStartExport,
  };
}
