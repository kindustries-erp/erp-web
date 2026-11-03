import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  erpInvoicesCoreApi,
  type SyncAdvancedPayload,
  type SyncStatusResponse,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  type SyncAdvancedFormValues,
  getDefaultSyncAdvancedFormValues,
} from "./InvoiceSyncAdvancedModal.state";

/** Chu kỳ hỏi trạng thái tải PDF khi tiến trình còn chạy */
const STATUS_POLL_INTERVAL_MS = 2500;

interface UseInvoiceSyncAdvancedModalParams {
  open: boolean;
  defaultCompanyTaxCode?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Form và trạng thái modal đồng bộ nâng cao. Gửi yêu cầu là mutation;
 * theo dõi tiến trình PDF là query với `refetchInterval` (thay cho setInterval).
 */
export function useInvoiceSyncAdvancedModal({
  open,
  defaultCompanyTaxCode = "",
  onClose,
  onSuccess,
}: UseInvoiceSyncAdvancedModalParams) {
  const { t } = useTranslation("erpInvoices");
  const [formValues, setFormValues] = useState<SyncAdvancedFormValues>(() =>
    getDefaultSyncAdvancedFormValues(defaultCompanyTaxCode),
  );
  const [syncId, setSyncId] = useState<string | null>(null);
  const [startStatus, setStartStatus] = useState<SyncStatusResponse | null>(
    null,
  );

  // Mở lại modal thì đặt lại form và bỏ tiến trình cũ
  useEffect(() => {
    if (open) {
      setFormValues(getDefaultSyncAdvancedFormValues(defaultCompanyTaxCode));
      setSyncId(null);
      setStartStatus(null);
    }
  }, [open, defaultCompanyTaxCode]);

  const statusQuery = useQuery({
    queryKey: ["erp-invoices", "original-pdf-sync", syncId],
    queryFn: () =>
      erpInvoicesCoreApi.getOriginalPdfSyncStatus(syncId as string),
    enabled: open && syncId !== null,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return query.state.data?.status === "in_progress"
        ? STATUS_POLL_INTERVAL_MS
        : false;
    },
    retry: false,
  });

  const syncMutation = useMutation({
    mutationFn: (payload: SyncAdvancedPayload) =>
      erpInvoicesCoreApi.syncAdvanced(payload),
    onSuccess: (res) => {
      toast.success(
        t(
          "advancedSyncStarted",
          "Đã kích hoạt đồng bộ hóa đơn và tải PDF gốc nhà cung cấp",
        ),
      );
      setStartStatus({
        id: res.syncId,
        status: res.status,
        totalFound: res.totalFound,
        totalPdfSuccess: 0,
        totalPdfFailed: 0,
        errorMessage: null,
      });
      setSyncId(res.syncId);
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("advancedSyncFailed", "Đồng bộ hóa đơn thất bại"),
      );
    },
  });

  const handleFieldChange = useCallback(
    <K extends keyof SyncAdvancedFormValues>(
      field: K,
      value: SyncAdvancedFormValues[K],
    ) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!formValues.companyTaxCode.trim()) {
      toast.error(
        t("advancedSyncTaxCodeRequired", "Vui lòng nhập mã số thuế công ty"),
      );
      return;
    }
    if (!formValues.fromDate || !formValues.toDate) {
      toast.error(
        t("advancedSyncDateRangeRequired", "Vui lòng chọn khoảng thời gian"),
      );
      return;
    }
    syncMutation.mutate({
      companyTaxCode: formValues.companyTaxCode.trim(),
      syncType: formValues.syncType,
      queryType: formValues.queryType,
      fromDate: formValues.fromDate,
      toDate: formValues.toDate,
    });
  }, [formValues, syncMutation, t]);

  return {
    formValues,
    isSubmitting: syncMutation.isPending,
    syncStatus: statusQuery.data ?? startStatus,
    handleFieldChange,
    handleSubmit,
    handleClose: onClose,
  };
}
