import type {
  GarageCashflowPrintLabels,
  GarageCashflowPrintVariant,
} from "./GarageCashflowPrintTemplate.type";

/** Nhãn hành chính cố định (mẫu 01-TT phiếu thu / 02-TT phiếu chi, QĐ 15/2006/QĐ-BTC). */
export const GARAGE_CASHFLOW_PRINT_LABELS: Record<
  GarageCashflowPrintVariant,
  GarageCashflowPrintLabels
> = {
  RECEIPT: {
    templateNo: "Mẫu số: 01 – TT",
    title: "PHIẾU THU",
    partyLabel: "Họ và tên người nộp tiền",
    reasonLabel: "Lý do nộp",
    signerLabel: "Người nộp tiền",
  },
  PAYMENT: {
    templateNo: "Mẫu số: 02 – TT",
    title: "PHIẾU CHI",
    partyLabel: "Họ và tên người nhận tiền",
    reasonLabel: "Lý do chi",
    signerLabel: "Người nhận tiền",
  },
};

export const GARAGE_CASHFLOW_PRINT_STATUTORY_NOTE =
  "(Ban hành theo QĐ số: 15/2006/QĐ-BTC ngày 20/03/2006 của Bộ trưởng BTC)";

export const GARAGE_CASHFLOW_PRINT_LINE = "............................";
export const GARAGE_CASHFLOW_PRINT_DOTTED =
  "................................................................";

/** Logo mặc định lấy từ file Excel mẫu PHIẾU THU (dùng khi công ty chưa cấu hình logo). */
export const GARAGE_CASHFLOW_PRINT_DEFAULT_LOGO = "/garage-cashflow-logo.png";
