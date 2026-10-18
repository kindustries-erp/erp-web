import React from "react";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";

const METHOD_BADGE_STYLES: Record<string, string> = {
  "Chuyển khoản": "bg-sky-500/10 text-sky-600 border-sky-500/20",
  "Tiền mặt": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Thẻ tín dụng": "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export const renderPaymentMethodCell = (row: GarageCashflowVoucher) => {
  const method =
    row.paymentMethod ||
    (row.erpBankTransactionId
      ? "Chuyển khoản"
      : row.erpCashVoucherId
        ? "Tiền mặt"
        : "");

  if (!method) return <span className="text-muted-foreground">—</span>;

  const badgeStyle =
    METHOD_BADGE_STYLES[method] ||
    "bg-slate-500/10 text-slate-600 border-slate-500/20";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}
    >
      {method}
    </span>
  );
};

const CONTENT_BADGE_STYLES: Record<string, string> = {
  "1. KH thanh toán":
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "KH thanh toán": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "2. Tất toán": "bg-teal-500/10 text-teal-600 border-teal-500/20",
  "Tất toán": "bg-teal-500/10 text-teal-600 border-teal-500/20",
  "3. BH thanh toán": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  "BH thanh toán": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  "4. HHBH": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  HHBH: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "5. Ứng trước": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Ứng trước": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "6. Cấn trừ": "bg-violet-500/10 text-violet-600 border-violet-500/20",
  "Cấn trừ": "bg-violet-500/10 text-violet-600 border-violet-500/20",
  "7. Phụ tùng / vật tư":
    "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Phụ tùng / vật tư": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Mua phụ tùng / vật tư":
    "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "8. Vật tư tiêu hao": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  "Vật tư tiêu hao": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  "9. Chi phí vận hành": "bg-rose-500/10 text-rose-600 border-rose-500/20",
  "Chi phí vận hành": "bg-rose-500/10 text-rose-600 border-rose-500/20",
  "10. Hoa hồng / nhân công": "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "Hoa hồng / nhân công": "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "11. Hoàn ứng": "bg-amber-600/10 text-amber-700 border-amber-600/20",
  "Hoàn ứng": "bg-amber-600/10 text-amber-700 border-amber-600/20",
  "12. Khác": "bg-slate-500/10 text-slate-600 border-slate-500/20",
  Khác: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

export const renderPaymentContentCell = (row: GarageCashflowVoucher) => {
  const content = row.paymentContent;
  if (!content) return <span className="text-muted-foreground">—</span>;

  const normalized = content.replace(/^\d+\.\s*/, "").trim();
  const badgeStyle =
    CONTENT_BADGE_STYLES[content] ||
    CONTENT_BADGE_STYLES[normalized] ||
    "bg-slate-500/10 text-slate-600 border-slate-500/20";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}
    >
      {content}
    </span>
  );
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  APPROVED: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  PAID: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  EXPECTED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export const renderPaymentStatusCell = (row: GarageCashflowVoucher) => {
  const isReceipt = (row.voucherType || "").toUpperCase() === "RECEIPT";
  const isPayment = (row.voucherType || "").toUpperCase() === "PAYMENT";

  if (!isReceipt && !isPayment) {
    return <span className="text-muted-foreground">—</span>;
  }

  let label = "";
  let badgeStyle = "bg-slate-500/10 text-slate-600 border-slate-500/20";

  if (isReceipt) {
    if (row.paymentStatus === "EXPECTED") {
      label = "Dự thu";
      badgeStyle = STATUS_BADGE_STYLES.EXPECTED;
    } else {
      label = "Đã thu";
      badgeStyle = STATUS_BADGE_STYLES.PAID;
    }
  } else if (isPayment) {
    if (!row.paymentStatus) {
      return <span className="text-muted-foreground">—</span>;
    }
    if (row.paymentStatus === "PENDING") {
      label = "Chờ duyệt";
      badgeStyle = STATUS_BADGE_STYLES.PENDING;
    } else if (row.paymentStatus === "APPROVED") {
      label = "Đã duyệt";
      badgeStyle = STATUS_BADGE_STYLES.APPROVED;
    } else if (row.paymentStatus === "PAID") {
      label = "Đã chi";
      badgeStyle = STATUS_BADGE_STYLES.PAID;
    } else {
      label = row.paymentStatus;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}
    >
      {label}
    </span>
  );
};
