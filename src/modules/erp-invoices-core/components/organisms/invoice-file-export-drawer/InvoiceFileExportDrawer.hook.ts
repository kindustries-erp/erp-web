import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useInvoiceExportScope } from "../invoice-export-drawer/InvoiceExportDrawer.scope.hook";
import type { InvoiceExportMode } from "../invoice-export-drawer/components/InvoiceExportModeSelector";
import type { InvoiceExportFileType } from "../invoice-export-drawer/components/InvoiceExportFileTypeSelector";
import type { InvoiceFileExportDrawerProps } from "./InvoiceFileExportDrawer.type";

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function useInvoiceFileExportDrawer({
  open,
  onClose,
  direction,
  buildBaseQuery,
  selectedIds,
}: Pick<
  InvoiceFileExportDrawerProps,
  "open" | "onClose" | "direction" | "buildBaseQuery" | "selectedIds"
>) {
  const { t } = useTranslation("erpInvoices");
  const hasSelection = selectedIds.length > 0;
  const scope = useInvoiceExportScope({
    direction,
    buildBaseQuery,
    initialMode: hasSelection ? "selected" : "by-period",
  });
  const { exportMode, setExportMode } = scope;
  const [fileTypes, setFileTypes] = useState<InvoiceExportFileType[]>(["pdf"]);
  const [starting, setStarting] = useState(false);

  const modes: InvoiceExportMode[] = hasSelection
    ? ["selected", "by-period", "by-current-filter"]
    : ["by-period", "by-current-filter"];

  // Mỗi lần mở: ưu tiên "Đã chọn" nếu có chọn; mất chọn thì lùi về "Theo kỳ".
  useEffect(() => {
    if (open && hasSelection) setExportMode("selected");
  }, [open, hasSelection, setExportMode]);
  useEffect(() => {
    if (!hasSelection && exportMode === "selected") setExportMode("by-period");
  }, [hasSelection, exportMode, setExportMode]);

  const handleStart = async () => {
    if (fileTypes.length === 0) {
      toast.error(
        t(
          "erpInvoices:exportDrawer.error.missingFileType",
          "Vui lòng chọn ít nhất 1 loại file (PDF hoặc XML)",
        ),
      );
      return;
    }

    try {
      setStarting(true);
      let blob: Blob;
      let fileName: string;
      if (exportMode === "selected") {
        blob = await erpInvoicesCoreApi.bulkDownloadSelected({
          ids: selectedIds,
          types: fileTypes,
        });
        fileName = `HoaDon_${selectedIds.length}_invoices.zip`;
      } else {
        const query = scope.buildScopeQuery();
        if (!query) return;
        blob = await erpInvoicesCoreApi.bulkDownloadFiles({
          query: {
            date_from: query.date_from,
            date_to: query.date_to,
            direction,
            status: query.status,
            search: query.search,
          },
          types: fileTypes,
        });
        const label =
          exportMode === "by-period"
            ? `${scope.dateFrom}_${scope.dateTo}`
            : "filter";
        fileName = `HoaDon_${label}_${direction}.zip`;
      }
      saveBlob(blob, fileName);
      toast.success(
        t("erpInvoices:exportDrawer.toast.zipDone", "Tải file ZIP thành công!"),
      );
      onClose();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "erpInvoices:exportDrawer.error.zipFailed",
            "Không thể tải file ZIP.",
          ),
      );
    } finally {
      setStarting(false);
    }
  };

  return {
    ...scope,
    modes,
    fileTypes,
    setFileTypes,
    starting,
    handleStart,
  };
}
