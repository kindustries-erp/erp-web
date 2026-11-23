import type { BatchCellLayout } from "./layoutBatchPage";
import type { BatchExportItem } from "./exportBatchZip";
import { foldForPdf, type BatchCaption } from "./exportBatchPdf";
import { fitTextLines } from "./layoutBatchPage";

export interface PdfCanvas {
  addImage: (
    data: string,
    fmt: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => void;
  rect: (x: number, y: number, w: number, h: number, style?: string) => void;
  roundedRect: (
    x: number,
    y: number,
    w: number,
    h: number,
    rx: number,
    ry: number,
    s?: string,
  ) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  text: (
    text: string,
    x: number,
    y: number,
    opt?: { align?: "center" | "left" | "right" },
  ) => void;
  setFont: (family: string, style: string) => void;
  setFontSize: (size: number) => void;
  setDrawColor: (r: number, g?: number, b?: number) => void;
  setFillColor: (r: number, g?: number, b?: number) => void;
  setTextColor: (r: number, g?: number, b?: number) => void;
  splitTextToSize: (text: string, width: number) => string[];
  getTextWidth: (text: string) => number;
}

/** Vẽ Header và Footer chuẩn mực cho từng trang PDF A4 */
export function drawPageHeaderAndFooter(
  doc: PdfCanvas,
  page: number,
  totalPages: number,
  totalCount: number,
  totalAmount: number,
  date: Date,
): void {
  // Header trang A4
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("BANG KE MA QR THANH TOAN (VIETQR NAPAS 247)", 10, 8);

  const dateStr = date.toLocaleString("vi-VN");
  const amountStr =
    totalAmount > 0
      ? `${totalAmount.toLocaleString("vi-VN")} VND`
      : "Theo tung lenh";
  const meta = `Ngay xuat: ${dateStr}  |  Tong so: ${totalCount} lenh  |  Tong tien: ${amountStr}`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(meta, 10, 13);

  doc.setDrawColor(226, 232, 240);
  doc.line(10, 15.5, 200, 15.5);

  // Footer trang A4
  doc.line(10, 289, 200, 289);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "He thong ERP Greenway - Tinh nang Tao ma QR chuyen khoan",
    10,
    293.5,
  );
  doc.text(`Trang ${page} / ${totalPages}`, 200, 293.5, { align: "right" });
}

/** Vẽ thẻ lệnh thanh toán (Card Layout) chuyên nghiệp trong từng ô */
export function drawBatchCardCell(
  doc: PdfCanvas,
  cell: BatchCellLayout,
  index: number,
  item: BatchExportItem & { caption: BatchCaption },
): void {
  // 1. Viền thẻ bo góc mềm mại
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(cell.x, cell.y, cell.width, cell.height, 2.5, 2.5, "S");

  // 2. Top Bar: Badge Lệnh thanh toán (trái) + Badge VietQR Napas (phải)
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(cell.x + 3, cell.y + 2.5, 34, 5, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(146, 64, 14);
  doc.text(`#${index + 1} LENH THANH TOAN`, cell.x + 4.5, cell.y + 6);

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(
    cell.x + cell.width - 3 - 27,
    cell.y + 2.5,
    27,
    5,
    1.5,
    1.5,
    "FD",
  );
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(6);
  doc.text("VIETQR | NAPAS 247", cell.x + cell.width - 3 - 13.5, cell.y + 6, {
    align: "center",
  });

  doc.setDrawColor(241, 245, 249);
  doc.line(cell.x + 2, cell.y + 9, cell.x + cell.width - 2, cell.y + 9);

  // 3. Khung viền và ảnh QR
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(
    cell.qrX - 1,
    cell.qrY - 1,
    cell.qrSize + 2,
    cell.qrSize + 2,
    1.5,
    1.5,
    "S",
  );
  doc.addImage(
    item.qrDataUrl,
    "PNG",
    cell.qrX,
    cell.qrY,
    cell.qrSize,
    cell.qrSize,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    foldForPdf(
      item.caption.bankCode
        ? `${item.caption.bankCode} (Napas 247)`
        : "NAPAS 247",
    ),
    cell.centerX,
    cell.qrY + cell.qrSize + 3.8,
    { align: "center" },
  );

  // 4. Details Box chia 2 cột rõ ràng
  const boxY = cell.qrY + cell.qrSize + 5.5;
  const boxHeight = 24.5;
  const boxWidth = cell.width - 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(cell.x + 3, boxY, boxWidth, boxHeight, 1.5, 1.5, "FD");

  let rowY = boxY + 4.2;
  // Hàng 1: Người nhận
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Nguoi nhan:", cell.x + 5.5, rowY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  const nameFit = fitTextLines(
    foldForPdf(item.caption.accountName || "-"),
    1,
    52,
    (t, w) => doc.splitTextToSize(t, w),
    (t) => doc.getTextWidth(t),
  );
  doc.text(nameFit[0] || "-", cell.x + cell.width - 5.5, rowY, {
    align: "right",
  });

  // Hàng 2: Số tài khoản
  rowY += 5.2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("So tai khoan:", cell.x + 5.5, rowY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    foldForPdf(item.caption.accountNumber),
    cell.x + cell.width - 5.5,
    rowY,
    { align: "right" },
  );

  // Hàng 3: Số tiền
  rowY += 5.2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("So tien:", cell.x + 5.5, rowY);
  const amountText =
    item.caption.amount === null
      ? "Tu nhap"
      : `${item.caption.amount.toLocaleString("vi-VN")} VND`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text(amountText, cell.x + cell.width - 5.5, rowY, { align: "right" });

  // Hàng 4: Nội dung
  rowY += 5.2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Noi dung:", cell.x + 5.5, rowY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  const contentFit = fitTextLines(
    foldForPdf(item.caption.content || "(Trong)"),
    1,
    52,
    (t, w) => doc.splitTextToSize(t, w),
    (t) => doc.getTextWidth(t),
  );
  doc.text(contentFit[0] || "(Trong)", cell.x + cell.width - 5.5, rowY, {
    align: "right",
  });

  // 5. Ghi chú chân thẻ
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "* Quet bang app ngan hang bat ky (Napas 247)",
    cell.centerX,
    cell.y + cell.height - 2,
    { align: "center" },
  );
}
