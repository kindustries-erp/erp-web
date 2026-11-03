import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { V2DropdownGroup } from "@/v2/shared/components";
import type { ErpInvoiceDetailDrawerProps } from "./ErpInvoiceDetailDrawer.type";
import type { PartnerSubTabMode } from "../erp-invoice-partner-tab/ErpInvoicePartnerTabNav";

export function useErpInvoiceDetailDrawer(props: ErpInvoiceDetailDrawerProps) {
  const {
    detailInvoice,
    saving,
    handleSave,
    cancelEdit,
    onSyncDetail,
    loadingDetail,
    form,
    fieldSet,
    direction,
    editMode,
    open,
    activeTabKey,
    onTabChange,
    partnerViewMode,
  } = props;

  const { t } = useTranslation("erpInvoices");
  const [showNetOffModal, setShowNetOffModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [showSoModal, setShowSoModal] = useState(false);
  const [showGarageCaseModal, setShowGarageCaseModal] = useState(false);

  const isUrlLinesTab = useMemo(() => {
    if (typeof window === "undefined") return false;
    const s = window.location.search;
    return (
      s.includes("tab=in-lines") ||
      s.includes("tab=out-lines") ||
      s.includes("view=lines")
    );
  }, []);

  const opensPartnerTab =
    (partnerViewMode !== undefined && partnerViewMode !== "details") ||
    isUrlLinesTab;
  const partnerDefaultSubTab: PartnerSubTabMode =
    partnerViewMode === "lines" || isUrlLinesTab ? "lines" : "invoices";

  // Deep link "Đối soát dòng tiền" (activeTabKey="financials") hoặc "linked_docs" → mở main tab Chi tiết
  useEffect(() => {
    if (activeTabKey !== "financials" && activeTabKey !== "linked_docs") return;
    if (activeTabKey === "financials") {
      setShowNetOffModal(true);
    }
    onTabChange?.("invoice_details");
  }, [activeTabKey, onTabChange]);

  // Deep link "Hạch toán kế toán" (activeTabKey="accounting") → mở main tab Chi tiết (có sub-tab hạch toán)
  useEffect(() => {
    if (activeTabKey !== "accounting") return;
    onTabChange?.("invoice_details");
  }, [activeTabKey, onTabChange]);

  // Deep link danh sách HHDV/đối tượng → main tab "Chi tiết theo NCC/KH" khi mở drawer
  useEffect(() => {
    if (!open || !opensPartnerTab) return;
    onTabChange?.("invoice_partner");
  }, [open, opensPartnerTab]);

  const [traceabilityCount, setTraceabilityCount] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setTraceabilityCount(null);
  }, [detailInvoice?.id]);

  const handleFetchGraph = useCallback(async (id: string) => {
    const res = await erpInvoicesCoreApi.getTraceabilityGraph(id);
    if (res && Array.isArray(res.nodes)) {
      const next = Math.max(0, res.nodes.length - 1);
      setTraceabilityCount((prev) => (prev === next ? prev : next));
    }
    return res;
  }, []);

  const handleSelectBankNetOff = (
    selected: { id: string; amount: number }[],
  ) => {
    if (selected.length === 0) return;
    const current = form?.pendingDocumentChanges || [];
    const newChanges = selected.map((s) => ({
      action: "ADD" as const,
      type: "BANK" as const,
      refId: s.id,
      amount: s.amount,
    }));
    fieldSet?.("pendingDocumentChanges", [...current, ...newChanges]);
    toast.success(
      t(
        "toastLinkedBankSuccess",
        "Đã thêm giao dịch ngân hàng vào danh sách cấn trừ (chờ Lưu thay đổi).",
      ),
    );
  };

  const handleSelectPo = (po: any) => {
    if (!po) return;
    const current = form?.pendingDocumentChanges || [];
    fieldSet?.("pendingDocumentChanges", [
      ...current,
      { action: "ADD" as const, type: "PO" as const, refId: po.id },
    ]);
    fieldSet?.("purchaseOrderId", po.id);
    toast.success(
      t("toastLinkedPoSuccess", {
        defaultValue:
          "Đã chọn đơn mua hàng {{poNo}} để liên kết (chờ Lưu thay đổi).",
        poNo: po.poNo,
      }),
    );
  };

  const handleSelectSo = (so: any) => {
    if (!so) return;
    const current = form?.pendingDocumentChanges || [];
    fieldSet?.("pendingDocumentChanges", [
      ...current,
      { action: "ADD" as const, type: "SO" as const, refId: so.id },
    ]);
    fieldSet?.("salesOrderId", so.id);
    toast.success(
      t("toastLinkedSoSuccess", {
        defaultValue:
          "Đã chọn đơn bán hàng {{soNo}} để liên kết (chờ Lưu thay đổi).",
        soNo: so.soNo,
      }),
    );
  };

  const handleSelectGarageCase = (caseItem: any) => {
    if (!caseItem) return;
    const refId = caseItem.id || caseItem.VuViecCode;
    const code = caseItem.VuViecCode || caseItem.SoBaoGia || refId;
    const current = form?.pendingDocumentChanges || [];
    fieldSet?.("pendingDocumentChanges", [
      ...current,
      { action: "ADD" as const, type: "CASE" as const, refId },
    ]);
    fieldSet?.("settlementOrder", code);
    toast.success(
      t("toastLinkedCaseSuccess", {
        defaultValue:
          "Đã chọn vụ việc garage {{code}} để liên kết (chờ Lưu thay đổi).",
        code,
      }),
    );
  };

  const editActions = useMemo(
    () => [
      {
        label: t("actionCancel", "Hủy"),
        onClick: cancelEdit,
        variant: "outline" as const,
        disabled: saving,
      },
      {
        label: saving
          ? t("actionSaving", "Đang lưu...")
          : t("actionSaveChange", "Lưu thay đổi"),
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => handleSave("CONFIRMED"),
      },
    ],
    [cancelEdit, handleSave, saving, t],
  );

  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExportSingleExcel = useCallback(async () => {
    if (!detailInvoice?.id) return;
    try {
      setExportingExcel(true);
      toast.loading(t("exportingExcel", "Đang xuất file Excel..."), {
        id: "export-single-invoice",
      });
      const blob = await erpInvoicesCoreApi.exportExcel({
        id: detailInvoice.id,
        direction: (detailInvoice.direction as any) || direction,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeInvoiceNo = detailInvoice.invoiceNo
        ? detailInvoice.invoiceNo.replace(/[^a-zA-Z0-9_-]/g, "_")
        : detailInvoice.id;
      const safeSerial = detailInvoice.serialNo
        ? `_${detailInvoice.serialNo.replace(/[^a-zA-Z0-9_-]/g, "_")}`
        : "";
      a.download = `Hoa_don_${safeInvoiceNo}${safeSerial}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t("exportExcelSuccess", "Xuất file Excel thành công!"), {
        id: "export-single-invoice",
      });
    } catch (err: any) {
      toast.error(
        err?.message || t("exportExcelError", "Lỗi xuất file Excel"),
        { id: "export-single-invoice" },
      );
    } finally {
      setExportingExcel(false);
    }
  }, [detailInvoice, direction, t]);

  const actionGroups = useMemo<V2DropdownGroup[] | undefined>(() => {
    if (editMode) return undefined;
    if (!onSyncDetail && !detailInvoice) return undefined;

    const groups: V2DropdownGroup[] = [];

    if (onSyncDetail) {
      groups.push({
        groupLabel: t("groupSync", "ĐỒNG BỘ"),
        items: [
          {
            label: t("syncGdt", "Đồng bộ từ GĐT"),
            icon: (
              <RefreshCw
                className={`w-4 h-4 text-teal-400 ${loadingDetail ? "animate-spin" : ""}`}
              />
            ),
            onClick: onSyncDetail,
            disabled: loadingDetail,
          },
        ],
      });
    }

    if (detailInvoice?.id) {
      groups.push({
        groupLabel: t("groupExport", "XUẤT DỮ LIỆU"),
        items: [
          {
            label: t("exportInvoiceExcel", "Xuất Excel hóa đơn"),
            icon: (
              <FileSpreadsheet
                className={`w-4 h-4 text-emerald-500 ${exportingExcel ? "animate-spin" : ""}`}
              />
            ),
            onClick: handleExportSingleExcel,
            disabled: exportingExcel,
          },
        ],
      });
    }

    if (groups.length === 0) return undefined;
    return groups;
  }, [
    editMode,
    onSyncDetail,
    loadingDetail,
    detailInvoice,
    exportingExcel,
    handleExportSingleExcel,
    t,
  ]);

  return {
    t,
    showNetOffModal,
    setShowNetOffModal,
    showPoModal,
    setShowPoModal,
    showSoModal,
    setShowSoModal,
    showGarageCaseModal,
    setShowGarageCaseModal,
    partnerDefaultSubTab,
    handleFetchGraph,
    traceabilityCount,
    handleSelectBankNetOff,
    handleSelectPo,
    handleSelectSo,
    handleSelectGarageCase,
    editActions,
    actionGroups,
    footerLeft: undefined,
  };
}
