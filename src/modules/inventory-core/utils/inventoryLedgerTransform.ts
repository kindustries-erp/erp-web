import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { InventoryMovement } from "../api/inventoryCoreApi";

export interface InventoryLedgerRow {
  id: string;
  transactionDate: string;
  documentNo: string | null;
  documentId: string | null;
  documentType: string | null;
  transactionType: string;
  notes: string | null;
  direction: "IN" | "OUT";
  typeLabel: string;

  // Inbound
  inQty: number | null;
  inUnitCost: number | null;
  inTotal: number | null;

  // Outbound
  outQty: number | null;
  outUnitCost: number | null;
  outTotal: number | null;

  // Balance
  balanceQty: number;
  balanceTotal: number | null;
}

export interface InventoryTrendPoint {
  key: string;
  label: string;
  inQty: number;
  outQty: number;
  balanceQty: number;
}

export interface InventoryLedgerTotals {
  inQty: number;
  inTotal: number;
  outQty: number;
  outTotal: number;
  balanceQty: number;
  balanceTotal: number;
}

/**
 * Builds chronological ledger rows with running balances from raw movements.
 */
export function buildInventoryLedgerRows(
  movements: InventoryMovement[],
): InventoryLedgerRow[] {
  if (!movements || movements.length === 0) return [];

  // Sort chronologically (oldest first) to compute running totals accurately
  const sorted = [...movements].sort((a, b) => {
    const timeA = a.transactionDate
      ? new Date(a.transactionDate).getTime()
      : a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;
    const timeB = b.transactionDate
      ? new Date(b.transactionDate).getTime()
      : b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;
    return timeA - timeB;
  });

  let runningBalance = 0;
  const result: InventoryLedgerRow[] = [];

  for (const m of sorted) {
    const qtyIn = Number(m.qtyIn || 0);
    const qtyOut = Number(m.qtyOut || 0);
    const isIn = qtyIn > 0;
    const isAdjustment = m.documentType === "INVENTORY_ADJUSTMENT";
    const isProduction = m.documentType === "PRODUCTION_ORDER";

    let typeLabel: string;
    if (isAdjustment) {
      typeLabel = "Điều chỉnh kho";
    } else if (isProduction) {
      typeLabel = isIn ? "Hoàn thành LSX" : "Xuất NVL LSX";
    } else if (m.documentType === "GOODS_RECEIPT") {
      typeLabel = "Nhập kho";
    } else if (m.documentType === "GOODS_ISSUE") {
      typeLabel = "Xuất kho";
    } else {
      typeLabel = isIn ? "Nhập kho" : "Xuất kho";
    }

    runningBalance = runningBalance + qtyIn - qtyOut;
    const roundedBalance = Math.round(runningBalance * 1000) / 1000;

    const unitCost =
      m.unitCost != null && Number(m.unitCost) > 0 ? Number(m.unitCost) : null;
    const inTotal = isIn && unitCost != null ? qtyIn * unitCost : null;
    const outTotal = !isIn && unitCost != null ? qtyOut * unitCost : null;

    result.push({
      id: m.id,
      transactionDate: m.transactionDate || m.createdAt || "",
      documentNo: m.documentNo || null,
      documentId: m.documentId || null,
      documentType: m.documentType || null,
      transactionType: m.transactionType,
      notes: m.notes || null,
      direction: isIn ? "IN" : "OUT",
      typeLabel,

      inQty: isIn ? qtyIn : null,
      inUnitCost: isIn ? unitCost : null,
      inTotal,

      outQty: !isIn ? qtyOut : null,
      outUnitCost: !isIn ? unitCost : null,
      outTotal,

      balanceQty: roundedBalance,
      balanceTotal: unitCost != null ? roundedBalance * unitCost : null,
    });
  }

  return result;
}

/**
 * Aggregates ledger rows into trend points for Bar & Line chart.
 */
export function buildInventoryTrendData(
  rows: InventoryLedgerRow[],
): InventoryTrendPoint[] {
  if (!rows || rows.length === 0) return [];

  // Sort chronologically
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(a.transactionDate).getTime() -
      new Date(b.transactionDate).getTime(),
  );

  const map = new Map<
    string,
    { label: string; inQty: number; outQty: number; balanceQty: number }
  >();

  for (const r of sorted) {
    if (!r.transactionDate) continue;
    const d = new Date(r.transactionDate);
    const key = format(d, "yyyy-MM-dd");
    const label = format(d, "dd/MM/yyyy");

    if (!map.has(key)) {
      map.set(key, {
        label,
        inQty: 0,
        outQty: 0,
        balanceQty: r.balanceQty,
      });
    }

    const current = map.get(key)!;
    current.inQty += r.inQty || 0;
    current.outQty += r.outQty || 0;
    current.balanceQty = r.balanceQty; // latest balance of that day
  }

  return Array.from(map.entries()).map(([key, val]) => ({
    key,
    label: val.label,
    inQty: Math.round(val.inQty * 1000) / 1000,
    outQty: Math.round(val.outQty * 1000) / 1000,
    balanceQty: Math.round(val.balanceQty * 1000) / 1000,
  }));
}

/**
 * Exports single item ledger to a well-formatted XLSX file.
 */
export function exportInventoryLedgerToExcel(
  rows: InventoryLedgerRow[],
  itemInfo: {
    sku: string;
    itemName: string;
    uom?: string;
  },
) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    ["SỔ CHI TIẾT XUẤT NHẬP TỒN ITEM KHO"],
    [
      `Mã SKU: ${itemInfo.sku}`,
      `Tên item: ${itemInfo.itemName}`,
      `ĐVT: ${itemInfo.uom || "—"}`,
    ],
    [`Ngày xuất báo cáo: ${format(new Date(), "dd/MM/yyyy HH:mm")}`],
    [],
  ];

  const headerRows = [
    [
      "STT",
      "THÔNG TIN CHUNG",
      "",
      "",
      "NHẬP KHO",
      "",
      "",
      "XUẤT KHO",
      "",
      "",
      "TỒN KHO",
      "",
    ],
    [
      "",
      "Ngày",
      "Số phiếu",
      "Ghi chú",
      "SL Nhập",
      "Đơn giá",
      "Thành tiền",
      "SL Xuất",
      "Đơn giá",
      "Thành tiền",
      "SL Tồn",
      "Giá trị tồn",
    ],
  ];

  let totalInQty = 0;
  let totalOutQty = 0;
  let totalInAmount = 0;
  let totalOutAmount = 0;
  let lastBalanceQty = 0;

  const dataRows = rows.map((r, idx) => {
    totalInQty += r.inQty || 0;
    totalOutQty += r.outQty || 0;
    totalInAmount += r.inTotal || 0;
    totalOutAmount += r.outTotal || 0;
    lastBalanceQty = r.balanceQty;

    return [
      idx + 1,
      r.transactionDate
        ? format(new Date(r.transactionDate), "dd/MM/yyyy HH:mm")
        : "",
      r.documentNo || "",
      r.notes || r.typeLabel || "",
      r.inQty ?? "",
      r.inUnitCost ?? "",
      r.inTotal ?? "",
      r.outQty ?? "",
      r.outUnitCost ?? "",
      r.outTotal ?? "",
      r.balanceQty,
      r.balanceTotal ?? "",
    ];
  });

  const footerRow = [
    "TỔNG CỘNG",
    "",
    "",
    "",
    totalInQty || "",
    "",
    totalInAmount || "",
    totalOutQty || "",
    "",
    totalOutAmount || "",
    lastBalanceQty,
    "",
  ];

  const allSheetData = [...titleRows, ...headerRows, ...dataRows, footerRow];
  const ws = XLSX.utils.aoa_to_sheet(allSheetData);

  // Set column widths
  ws["!cols"] = [
    { wch: 6 }, // STT
    { wch: 18 }, // Ngày
    { wch: 22 }, // Số phiếu
    { wch: 30 }, // Ghi chú
    { wch: 12 }, // SL Nhập
    { wch: 14 }, // Đơn giá Nhập
    { wch: 16 }, // Thành tiền Nhập
    { wch: 12 }, // SL Xuất
    { wch: 14 }, // Đơn giá Xuất
    { wch: 16 }, // Thành tiền Xuất
    { wch: 12 }, // SL Tồn
    { wch: 16 }, // Giá trị tồn
  ];

  // Set merges for group headers
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Title
    { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } }, // STT
    { s: { r: 4, c: 1 }, e: { r: 4, c: 3 } }, // THÔNG TIN CHUNG
    { s: { r: 4, c: 4 }, e: { r: 4, c: 6 } }, // NHẬP KHO
    { s: { r: 4, c: 7 }, e: { r: 4, c: 9 } }, // XUẤT KHO
    { s: { r: 4, c: 10 }, e: { r: 4, c: 11 } }, // TỒN KHO
    {
      s: { r: allSheetData.length - 1, c: 0 },
      e: { r: allSheetData.length - 1, c: 3 },
    }, // TỔNG CỘNG merge
  ];

  XLSX.utils.book_append_sheet(wb, ws, "So_cai_xuat_nhap_ton");
  const fileName = `So_cai_ton_kho_${itemInfo.sku}_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
