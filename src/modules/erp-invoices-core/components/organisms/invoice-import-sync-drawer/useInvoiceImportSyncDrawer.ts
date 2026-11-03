import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  useInvoiceXmlUpload,
  type Direction,
} from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";
import { usePortalSync } from "@/modules/erp-invoices-core/hooks/usePortalSync";
import { useInvoiceSyncDrawerProgress } from "./useInvoiceSyncDrawerProgress";
import { useBulkDownloadXmlMutation } from "@/modules/erp-invoices-core/hooks/useBulkDownloadXmlMutation";
import { useInvoiceSyncPeriod } from "@/v2/modules/finance-invoice/drawers/InvoiceSyncDrawer.period.hook";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { extractApiError } from "@/shared/utils/apiError";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { InvoiceSyncMethod } from "./invoiceSyncDrawer.actions";

export interface UseInvoiceImportSyncDrawerParams {
  open: boolean;
  onClose: () => void;
  onImported: (direction: Direction) => void;
  initialDirection: Direction;
  onOpenLogin: () => void;
}

export function useInvoiceImportSyncDrawer({
  open,
  onClose,
  onImported,
  initialDirection,
  onOpenLogin,
}: UseInvoiceImportSyncDrawerParams) {
  const { t } = useTranslation("erpInvoices");
  const canEditInvoice = useHasPermission(
    ErpResource.INVOICES,
    ErpAction.UPDATE,
  );

  const [method, setMethod] = useState<InvoiceSyncMethod>("GDT");
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [showPreview, setShowPreview] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [showDrawerConfirm, setShowDrawerConfirm] = useState(false);

  const period = useInvoiceSyncPeriod();
  const xml = useInvoiceXmlUpload((_importId, dir) => onImported(dir));
  const portal = usePortalSync();
  const bulkXml = useBulkDownloadXmlMutation();

  const { startSyncLog, addSyncLog, failSync, progress } =
    useInvoiceSyncDrawerProgress(open);

  useEffect(() => {
    if (portal.needsRelogin && canEditInvoice) {
      onOpenLogin();
    }
  }, [portal.needsRelogin, canEditInvoice, onOpenLogin]);

  useEffect(() => {
    if (open) {
      setDirection(initialDirection);
      xml.setDirection(initialDirection);
      period.reset();
    }
  }, [open, initialDirection]);

  // Phiên nhập XML đang có file chưa import: cần xác nhận trước khi đóng
  const hasPendingXml =
    method === "XML" && xml.step === "select" && xml.files.length > 0;

  function handleDirectionChange(d: Direction) {
    if (xml.step === "importing" || portal.loading) return;
    setDirection(d);
    xml.setDirection(d);
    portal.clearResult();
    xml.handleReset();
  }

  function handleMethodChange(m: InvoiceSyncMethod) {
    if (xml.step === "importing" || portal.loading) return;
    setMethod(m);
  }

  function doClose() {
    xml.handleReset();
    portal.clearResult();
    onClose();
  }

  function requestClose() {
    if (hasPendingXml) {
      setShowDrawerConfirm(true);
      return;
    }
    doClose();
  }

  const handleSync = async () => {
    const type = direction === "IN" ? "purchase" : "sold";
    startSyncLog(
      t("syncProgressStarting", "Đang khởi tạo tiến trình đồng bộ..."),
    );
    const res = await portal.sync(type, {
      dateFrom: period.dateFrom,
      dateTo: period.dateTo,
    });
    if (res) {
      addSyncLog(
        res.note ||
          t("syncProgressSummary", {
            defaultValue:
              "Đã lấy {{imported}} hóa đơn mới, bỏ qua {{skipped}} trùng, xếp hàng {{queued}} file XML.",
            imported: res.imported,
            skipped: res.skipped,
            queued: res.xmlDownloadQueued,
          }),
        "success",
      );
      onImported(direction);
    } else {
      failSync(
        t(
          "syncProgressFailed",
          "Đồng bộ thất bại. Xem thông báo lỗi để biết chi tiết.",
        ),
      );
    }
  };

  const handleBulkXml = async () => {
    startSyncLog(t("syncProgressBulkStarting", "Đang tải lại XML..."));
    try {
      const res = await bulkXml.mutateAsync(direction);
      addSyncLog(res.message, "success");
      toast.success(res.message);
    } catch (e) {
      const message = extractApiError(e, t("bulkXmlError", "Lỗi tải lại XML"));
      failSync(message);
      toast.error(message);
    }
  };

  return {
    method,
    direction,
    period,
    progress,
    bulkXmlLoading: bulkXml.isPending,
    showPreview,
    setShowPreview,
    viewInvoiceId,
    setViewInvoiceId,
    showDrawerConfirm,
    setShowDrawerConfirm,
    hasPendingXml,
    canEditInvoice,
    xml,
    portal,
    handleDirectionChange,
    handleMethodChange,
    requestClose,
    doClose,
    handleSync,
    handleBulkXml,
  };
}
