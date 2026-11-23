import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { StockLedgerDisplayRow } from "./stockLedgerCalculator";

export function exportStockLedgerToExcel(
  rows: StockLedgerDisplayRow[],
  itemInfo: {
    itemCode: string;
    itemName: string;
    costingMethod: string;
  },
) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    ["THẺ KHO PHỤ TÙNG / HÀNG HÓA GARAGE"],
    [
      `Mã hàng: ${itemInfo.itemCode}`,
      `Tên hàng: ${itemInfo.itemName}`,
      `Phương pháp: ${
        itemInfo.costingMethod === "FIFO"
          ? "FIFO (Nhập trước xuất trước)"
          : "Bình quân gia quyền"
      }`,
    ],
    [`Ngày xuất báo cáo: ${format(new Date(), "dd/MM/yyyy HH:mm")}`],
    [],
  ];

  const headerRows = [
    [
      "STT",
      "Ngày",
      "Nghiệp vụ",
      "Số phiếu",
      "Nhập",
      "Xuất",
      "Điều chỉnh",
      "Tồn",
      "Đơn giá",
    ],
  ];

  let totalInQty = 0;
  let totalOutQty = 0;
  let totalAdjustedQty = 0;
  let finalBalanceQty = 0;

  if (rows.length > 0) {
    // Row 0 is the newest (DESC), so row[0] has final balance
    finalBalanceQty = rows[0].balanceQty;
  }

  const dataRows = rows.map((r, idx) => {
    totalInQty += r.qtyIn || 0;
    totalOutQty += r.qtyOut || 0;
    totalAdjustedQty += r.qtyAdjusted || 0;

    return [
      idx + 1,
      r.createdAt
        ? format(new Date(r.createdAt), "dd/MM/yyyy HH:mm:ss")
        : r.transactionDate
          ? format(new Date(r.transactionDate), "dd/MM/yyyy")
          : "",
      r.transactionType || "",
      r.documentNo || "",
      r.qtyIn > 0 ? r.qtyIn : "",
      r.qtyOut > 0 ? r.qtyOut : "",
      r.qtyAdjusted !== 0 ? r.qtyAdjusted : "",
      r.balanceQty,
      r.unitCost || "",
    ];
  });

  const footerRow = [
    "TỔNG CỘNG",
    "",
    "",
    "",
    totalInQty || 0,
    totalOutQty || 0,
    totalAdjustedQty !== 0 ? totalAdjustedQty : 0,
    finalBalanceQty,
    "",
  ];

  const allSheetData = [...titleRows, ...headerRows, ...dataRows, footerRow];
  const ws = XLSX.utils.aoa_to_sheet(allSheetData);

  ws["!cols"] = [
    { wch: 6 }, // STT
    { wch: 14 }, // Ngày
    { wch: 20 }, // Nghiệp vụ
    { wch: 18 }, // Số phiếu
    { wch: 12 }, // Nhập
    { wch: 12 }, // Xuất
    { wch: 14 }, // Điều chỉnh
    { wch: 12 }, // Tồn
    { wch: 16 }, // Đơn giá
  ];

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Title
    {
      s: { r: allSheetData.length - 1, c: 0 },
      e: { r: allSheetData.length - 1, c: 3 },
    }, // TỔNG CỘNG
  ];

  XLSX.utils.book_append_sheet(wb, ws, "The_kho");
  const fileName = `The_kho_${itemInfo.itemCode}_${itemInfo.costingMethod}_${format(
    new Date(),
    "yyyyMMdd_HHmm",
  )}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
