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

/**
 * Biến CSS sáng cho khối in. Bản in chạy trong iframe không có class `.theme-*`, nên phải gắn trực tiếp
 * để các token (`text-foreground`, `border-border`…) luôn ra màu của giấy in, không theo theme đang bật.
 */
export const GARAGE_CASHFLOW_PRINT_LIGHT_VARS: Record<string, string> = {
  "--surface": "#ffffff",
  "--border": "#e4e7ec",
  "--foreground": "#0f172a",
  "--muted": "#f8fafc",
  "--muted-fg": "#64748b",
  "--warn-bg": "#fffbeb",
  "--warn-fg": "#b45309",
  "--approve-bg": "#f0fdf4",
  "--approve-fg": "#16a34a",
};
