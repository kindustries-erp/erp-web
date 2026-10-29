import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  useInvoiceXmlUpload,
  type Direction,
} from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";
import { usePortalSync } from "@/modules/erp-invoices-core/hooks/usePortalSync";
import { useInvoiceSyncProgressStore } from "@/modules/erp-invoices-core/hooks/useInvoiceSyncProgressStore";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useInvoiceSyncPeriod } from "@/v2/modules/finance-invoice/drawers/InvoiceSyncDrawer.period.hook";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { InvoiceSyncMethod } from "./invoiceSyncDrawer.actions";

export interface UseInvoiceImportSyncDrawerParams {
  open: boolean;
  onClose: () => void;
  onImported: (direction: Direction) => void;
  initialDirection: Direction;
}

export function useInvoiceImportSyncDrawer({
  open,
  onClose,
  onImported,
  initialDirection,
}: UseInvoiceImportSyncDrawerParams) {
  const { t } = useTranslation("erpInvoices");
  const canEditInvoice = useHasPermission(
    ErpResource.INVOICES,
    ErpAction.UPDATE,
  );

  const [method, setMethod] = useState<InvoiceSyncMethod>("GDT");
  const [configOpen, setConfigOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [bulkXmlLoading, setBulkXmlLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [showDrawerConfirm, setShowDrawerConfirm] = useState(false);

  const period = useInvoiceSyncPeriod();
  const xml = useInvoiceXmlUpload((_importId, dir) => onImported(dir));
  const portal = usePortalSync();

  const startSyncLog = useInvoiceSyncProgressStore((s) => s.start);
  const addSyncLog = useInvoiceSyncProgressStore((s) => s.addLog);
  const failSync = useInvoiceSyncProgressStore((s) => s.fail);
  const setPanelVisible = useInvoiceSyncProgressStore((s) => s.setPanelVisible);
  const progressStatus = useInvoiceSyncProgressStore((s) => s.status);
  const progressValue = useInvoiceSyncProgressStore((s) => s.progress);
  const progressLogs = useInvoiceSyncProgressStore((s) => s.logs);
  const progressItem = useInvoiceSyncProgressStore((s) => s.currentItem);

  useEffect(() => {
    setPanelVisible(open);
    return () => setPanelVisible(false);
  }, [open, setPanelVisible]);

  useEffect(() => {
    if (portal.needsRelogin && canEditInvoice) {
      setConfigOpen(true);
    }
  }, [portal.needsRelogin, canEditInvoice]);

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
    try {
      setBulkXmlLoading(true);
      startSyncLog(t("syncProgressBulkStarting", "Đang tải lại XML..."));
      const res = await erpInvoicesCoreApi.bulkDownloadXml({ direction });
      addSyncLog(res.message, "success");
      toast.success(res.message);
    } catch (e: any) {
      const message =
        e.response?.data?.message ||
        e.message ||
        t("bulkXmlError", "Lỗi tải lại XML");
      failSync(message);
      toast.error(message);
    } finally {
      setBulkXmlLoading(false);
    }
  };

  return {
    method,
    direction,
    period,
    progress: {
      status: progressStatus,
      progress: progressValue,
      logs: progressLogs,
      currentItem: progressItem,
    },
    configOpen,
    setConfigOpen,
    bulkXmlLoading,
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
