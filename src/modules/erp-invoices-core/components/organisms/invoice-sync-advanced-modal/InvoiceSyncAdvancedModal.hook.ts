import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  erpInvoicesCoreApi,
  type SyncStatusResponse,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  type SyncAdvancedFormValues,
  getDefaultSyncAdvancedFormValues,
} from "./InvoiceSyncAdvancedModal.state";

interface UseInvoiceSyncAdvancedModalParams {
  open: boolean;
  defaultCompanyTaxCode?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function useInvoiceSyncAdvancedModal({
  open,
  defaultCompanyTaxCode = "",
  onClose,
  onSuccess,
}: UseInvoiceSyncAdvancedModalParams) {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<SyncAdvancedFormValues>(() =>
    getDefaultSyncAdvancedFormValues(defaultCompanyTaxCode),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatusResponse | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      setFormValues(getDefaultSyncAdvancedFormValues(defaultCompanyTaxCode));
      setSyncStatus(null);
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }
  }, [open, defaultCompanyTaxCode]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  const handleFieldChange = useCallback(
    <K extends keyof SyncAdvancedFormValues>(
      field: K,
      value: SyncAdvancedFormValues[K],
    ) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const startPollingStatus = useCallback((syncId: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const status =
          await erpInvoicesCoreApi.getOriginalPdfSyncStatus(syncId);
        setSyncStatus(status);
        if (status.status !== "in_progress") {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        }
      } catch {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      }
    }, 2500);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formValues.companyTaxCode.trim()) {
      toast.error(
        t("erpInvoice.taxCodeRequired", "Vui lòng nhập mã số thuế công ty"),
      );
      return;
    }
    if (!formValues.fromDate || !formValues.toDate) {
      toast.error(
        t("erpInvoice.dateRangeRequired", "Vui lòng chọn khoảng thời gian"),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await erpInvoicesCoreApi.syncAdvanced({
        companyTaxCode: formValues.companyTaxCode.trim(),
        syncType: formValues.syncType,
        queryType: formValues.queryType,
        fromDate: formValues.fromDate,
        toDate: formValues.toDate,
      });

      toast.success(
        t(
          "erpInvoice.syncStarted",
          "Đã kích hoạt đồng bộ hóa đơn và tải PDF gốc nhà cung cấp",
        ),
      );

      setSyncStatus({
        id: res.syncId,
        status: res.status,
        totalFound: res.totalFound,
        totalPdfSuccess: 0,
        totalPdfFailed: 0,
        errorMessage: null,
      });

      startPollingStatus(res.syncId);
      onSuccess?.();
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        t("erpInvoice.syncFailed", "Đồng bộ hóa đơn thất bại");
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [formValues, t, startPollingStatus, onSuccess]);

  return {
    formValues,
    isSubmitting,
    syncStatus,
    handleFieldChange,
    handleSubmit,
    handleClose: onClose,
  };
}
