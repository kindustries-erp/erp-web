import toast from "react-hot-toast";
import { ImportExcelModal } from "@/shared/components/ImportExcelModal";
import {
  downloadInventoryTemplate,
  parseExcelFile,
} from "@/shared/utils/excelUtils";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import type { UseGrDrawerReturn } from "@/modules/goods-receipts-core/hooks/useGrDrawer";

interface GrFormExcelImportProps {
  isOpen: boolean;
  onClose: () => void;
  drawer: UseGrDrawerReturn;
}

export function GrFormExcelImport({
  isOpen,
  onClose,
  drawer,
}: GrFormExcelImportProps) {
  const { setForm } = drawer;

  const handleDownloadTemplate = async () => {
    const headers = ["Mã linh kiện", "Tên linh kiện", "Số lượng", "Đơn giá"];
    let refItems: any[] = [];
    try {
      const res = await basicMastersApi.list({
        entities: "inventoryItems",
        limit: 5000,
      });
      refItems = (res.items.inventoryItems || []).map((item: any) => ({
        sku: item.sku || "",
        name: item.itemName || "",
      }));
    } catch (e) {
      console.error("Failed to fetch reference items", e);
    }
    downloadInventoryTemplate(headers, "Template_NhapKho.xlsx", refItems);
  };

  const handleUpload = async (file: File, overwrite: boolean) => {
    try {
      const data = await parseExcelFile(file);
      let skipped = 0;
      const newLines: any[] = [];
      let allItems: any[] = [];
      try {
        const res = await basicMastersApi.list({
          entities: "inventoryItems",
          limit: 5000,
        });
        allItems = res.items.inventoryItems || [];
      } catch (e) {
        console.error("Failed to fetch items for upload lookup", e);
      }
      const skuToId: Record<string, string> = {};
      const idToName: Record<string, string> = {};
      const idToSku: Record<string, string> = {};
      allItems.forEach((item: any) => {
        if (item.sku) {
          skuToId[item.sku.toLowerCase()] = item.id;
          idToName[item.id] = item.itemName;
          idToSku[item.id] = item.sku;
        }
      });
      data.forEach((row: any) => {
        const sku = row["Mã linh kiện"]?.toString().trim();
        const qty = row["Số lượng"]?.toString().trim();
        const price = row["Đơn giá"]?.toString().trim();
        if (!sku) return;
        const itemId = skuToId[sku.toLowerCase()];
        if (itemId) {
          newLines.push({
            purchaseOrderLineId: "",
            productionOrderMaterialId: "",
            itemId,
            itemCode: idToSku[itemId] || "",
            itemName: idToName[itemId] || "",
            qtyReceived: qty || "",
            unitCost: price || "",
          });
        } else {
          skipped++;
        }
      });
      if (skipped > 0) {
        toast.error(
          `Đã bỏ qua ${skipped} dòng chứa mã linh kiện không tồn tại.`,
        );
      }
      setForm((f) => {
        const filteredOldLines = overwrite
          ? []
          : f.lines.filter((l: any) => l.itemId);
        return { ...f, lines: [...filteredOldLines, ...newLines] };
      });
      onClose();
    } catch {
      toast.error("Lỗi khi đọc file Excel");
    }
  };

  return (
    <ImportExcelModal
      isOpen={isOpen}
      onClose={onClose}
      onDownloadTemplate={handleDownloadTemplate}
      onUpload={handleUpload}
    />
  );
}
