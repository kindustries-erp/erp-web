import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import { goodsIssuesCoreApi } from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import type { WarehouseRow } from "@/modules/inventory-core/api/warehouseVouchersCoreApi";
import type { GoodsReceiptPrintData } from "@/shared/components/print-templates/GoodsReceiptPrintTemplate";
import type { GoodsIssuePrintData } from "@/shared/components/print-templates/GoodsIssuePrintTemplate";

export function useWarehousePrintExport() {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);

  const { data: companyProfile } = useCompanyProfile();

  const printGrRef = useRef<HTMLDivElement>(null);
  const printGiRef = useRef<HTMLDivElement>(null);
  const [printGrData, setPrintGrData] = useState<{
    id: string;
    data: GoodsReceiptPrintData;
  } | null>(null);
  const [printGiData, setPrintGiData] = useState<{
    id: string;
    data: GoodsIssuePrintData;
  } | null>(null);
  const [printTargetId, setPrintTargetId] = useState<string | null>(null);
  const [xlsxExportingId, setXlsxExportingId] = useState<string | null>(null);

  const handlePrintGr = useReactToPrint({
    contentRef: printGrRef,
    documentTitle: `PhieuNhapKho_${printGrData?.data.receiptNo || ""}`,
    onAfterPrint: () => setPrintTargetId(null),
  });

  const handlePrintGi = useReactToPrint({
    contentRef: printGiRef,
    documentTitle: `PhieuXuatKho_${printGiData?.data.issueNo || ""}`,
    onAfterPrint: () => setPrintTargetId(null),
  });

  useEffect(() => {
    setGlobalLoading(!!printTargetId);
  }, [printTargetId, setGlobalLoading]);

  useEffect(() => {
    if (printTargetId && printGrData && printGrData.id === printTargetId) {
      handlePrintGr();
    }
  }, [printTargetId, printGrData, handlePrintGr]);

  useEffect(() => {
    if (printTargetId && printGiData && printGiData.id === printTargetId) {
      handlePrintGi();
    }
  }, [printTargetId, printGiData, handlePrintGi]);

  const handlePrintRow = async (row: WarehouseRow) => {
    setPrintTargetId(row.id);
    try {
      if (row.type === "receipt") {
        const detail = await goodsReceiptsCoreApi.get(row.id);
        const itemIds = [
          ...new Set(
            detail.lines?.map((l) => l.itemId).filter(Boolean) as string[],
          ),
        ];
        let itemsDict: Record<
          string,
          { itemCode?: string; itemName?: string }
        > = {};
        if (itemIds.length > 0) {
          const res = await inventoryCoreApi.list({
            ids: itemIds.join(","),
            pageSize: 1000,
          });
          itemsDict = Object.fromEntries(res.items.map((i) => [i.id, i]));
        }

        setPrintGrData({
          id: row.id,
          data: {
            receiptNo: detail.receiptNo,
            receiptDate: detail.receiptDate,
            supplierName: detail.supplierName || "",
            remarks: detail.remarks || "",
            lines:
              detail.lines?.map((l) => {
                const dictItem = l.itemId ? itemsDict[l.itemId] : null;
                return {
                  itemId: l.itemId || "",
                  itemCode: dictItem?.itemCode || l.itemId || "",
                  itemName: l.itemName || dictItem?.itemName || "",
                  qtyReceived: l.qtyReceived,
                  unitCost: l.unitCost,
                };
              }) || [],
          },
        });
      } else {
        const detail = await goodsIssuesCoreApi.get(row.id);
        const itemIds = [
          ...new Set(
            detail.lines?.map((l) => l.itemId).filter(Boolean) as string[],
          ),
        ];
        let itemsDict: Record<
          string,
          { itemCode?: string; itemName?: string }
        > = {};
        if (itemIds.length > 0) {
          const res = await inventoryCoreApi.list({
            ids: itemIds.join(","),
            pageSize: 1000,
          });
          itemsDict = Object.fromEntries(res.items.map((i) => [i.id, i]));
        }

        setPrintGiData({
          id: row.id,
          data: {
            issueNo: detail.issueNo,
            issueDate: detail.issueDate,
            customerName: detail.customerName || "",
            remarks: detail.remarks || "",
            lines:
              detail.lines?.map((l) => {
                const dictItem = l.itemId ? itemsDict[l.itemId] : null;
                return {
                  itemId: l.itemId || "",
                  itemCode: dictItem?.itemCode || l.itemId || "",
                  itemName: l.itemName || dictItem?.itemName || "",
                  qtyIssued: l.qtyIssued,
                  unitCost: l.unitCost,
                };
              }) || [],
          },
        });
      }
    } catch (e) {
      console.error(e);
      setPrintTargetId(null);
      showToast({
        title: t("inventory.printError", "Lỗi tải dữ liệu in"),
        variant: "destructive",
      });
    }
  };

  const handleExportXlsx = async (row: WarehouseRow) => {
    try {
      setXlsxExportingId(row.id);
      let blob: Blob;
      let filename = "";
      if (row.type === "receipt") {
        blob = await goodsReceiptsCoreApi.exportXlsx(row.id);
        filename = `PhieuNhapKho_${row.voucherNo}.xlsx`;
      } else {
        blob = await goodsIssuesCoreApi.exportXlsx(row.id);
        filename = `PhieuXuatKho_${row.voucherNo}.xlsx`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export XLSX error:", error);
      showToast({
        title: t("common.exportError", "Lỗi xuất file"),
        description: t(
          "common.exportXlsxErrorDesc",
          "Không thể xuất file XLSX, vui lòng thử lại sau.",
        ),
        variant: "destructive",
      });
    } finally {
      setXlsxExportingId(null);
    }
  };

  return {
    companyProfile,
    printGrRef,
    printGiRef,
    printGrData,
    printGiData,
    printTargetId,
    xlsxExportingId,
    handlePrintRow,
    handleExportXlsx,
  };
}
