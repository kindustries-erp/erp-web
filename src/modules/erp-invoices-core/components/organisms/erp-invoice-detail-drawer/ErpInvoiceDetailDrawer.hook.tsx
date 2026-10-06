import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, FileSpreadsheet, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import type { ErpInvoiceDetailDrawerProps } from "./ErpInvoiceDetailDrawer.type";

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
  } = props;

  const { t } = useTranslation("erpInvoices");
  const [showNetOffModal, setShowNetOffModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [showSoModal, setShowSoModal] = useState(false);
  const [showGarageCaseModal, setShowGarageCaseModal] = useState(false);
  const [subTabKey, setSubTabKey] = useState<
    "details" | "invoices" | "lines" | "analytics" | "attachments"
  >("details");

  const handleFetchGraph = useCallback(
    (id: string) => erpInvoicesCoreApi.getTraceabilityGraph(id),
    [],
  );

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
      t("Đã chọn đơn mua hàng {{poNo}} để liên kết (chờ Lưu thay đổi).", {
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
      t("Đã chọn đơn bán hàng {{soNo}} để liên kết (chờ Lưu thay đổi).", {
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
      t("Đã chọn vụ việc garage {{code}} để liên kết (chờ Lưu thay đổi).", {
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

  const footerLeft = useMemo(() => {
    if (editMode) return undefined;
    if (!onSyncDetail && !detailInvoice) return undefined;

    const dropdownItems: ActionDropdownItem[] = [];

    if (onSyncDetail) {
      dropdownItems.push({
        groupLabel: "ĐỒNG BỘ",
        items: [
          {
            label: "Đồng bộ từ GĐT",
            icon: (
              <RefreshCw
                className={`w-4 h-4 ${loadingDetail ? "animate-spin" : ""}`}
              />
            ),
            onClick: onSyncDetail,
            disabled: loadingDetail,
          },
        ],
      });
    }

    if (detailInvoice?.id) {
      dropdownItems.push({
        groupLabel: "XUẤT DỮ LIỆU",
        items: [
          {
            label: "Xuất Excel hóa đơn",
            icon: (
              <FileSpreadsheet
                className={`w-4 h-4 text-emerald-600 ${exportingExcel ? "animate-spin" : ""}`}
              />
            ),
            onClick: handleExportSingleExcel,
            disabled: exportingExcel,
          },
        ],
      });
    }

    if (dropdownItems.length === 0) return undefined;

    return (
      <ActionDropdown
        align="start"
        items={dropdownItems}
        customTrigger={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[color:var(--border)] bg-white hover:bg-[color:var(--bg-muted)] text-[color:var(--fg)] shadow-sm transition-colors cursor-pointer"
          >
            <span className="font-semibold text-[color:var(--fg)]">
              Thao tác
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[color:var(--faint)]" />
          </button>
        }
      />
    );
  }, [
    editMode,
    onSyncDetail,
    loadingDetail,
    detailInvoice,
    exportingExcel,
    handleExportSingleExcel,
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
    subTabKey,
    setSubTabKey,
    handleFetchGraph,
    handleSelectBankNetOff,
    handleSelectPo,
    handleSelectSo,
    handleSelectGarageCase,
    editActions,
    footerLeft,
  };
}
