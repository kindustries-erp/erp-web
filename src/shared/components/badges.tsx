import React from "react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import type { VoucherStatus } from "@/modules/finance/api/financeApi";

// ── VoucherStatus badge ───────────────────────────────────────────────────────

/** i18n keys for VoucherStatus labels */
const STATUS_I18N_KEYS: Record<string, string> = {
  DRAFT: "voucher.status.draft",
  PENDING_APPROVAL: "voucher.status.pendingApproval",
  APPROVED: "voucher.status.approved",
  REJECTED: "voucher.status.rejected",
  CANCELLED: "voucher.status.cancelled",
  CONFIRMED: "status.CONFIRMED",
  RESERVED: "status.RESERVED",
  PARTIAL_RESERVED: "status.PARTIAL_RESERVED",
  DELIVERING: "status.DELIVERING",
  PARTIAL_DELIVERING: "status.PARTIAL_DELIVERING",
  DELIVERED: "status.DELIVERED",
  PARTIAL_DELIVERED: "status.PARTIAL_DELIVERED",
  IN_STOCK: "status.IN_STOCK",
  SOLD: "status.SOLD",
  POSTED: "status.POSTED",
  RECEIVED: "status.RECEIVED",
  COMPLETED: "status.COMPLETED",
  NOT_RECEIVED: "status.NOT_RECEIVED",
  PARTIAL_RECEIVED: "status.PARTIAL_RECEIVED",
  FULLY_RECEIVED: "status.FULLY_RECEIVED",
  NOT_ISSUED: "status.NOT_ISSUED",
  PARTIALLY_ISSUED: "status.PARTIALLY_ISSUED",
  FULLY_ISSUED: "status.FULLY_ISSUED",
};

/** Fallback Vietnamese labels (used when i18n is not available) */
export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  PROCESSING: "Đang xử lý",
  CONFIRMED: "Đã chốt",
  RESERVED: "Đã giữ hàng",
  PARTIAL_RESERVED: "Giữ 1 phần",
  DELIVERING: "Đang giao",
  PARTIAL_DELIVERING: "Đang giao 1 phần",
  DELIVERED: "Đã giao",
  PARTIAL_DELIVERED: "Đã giao 1 phần",
  IN_STOCK: "Trong kho",
  SOLD: "Đã bán",
  RECEIVED: "Đã nhận",
  ISSUED: "Đã xuất",
  COMPLETED: "Hoàn thành",
  CLOSED: "Đã đóng",
  POSTED: "Đã vào sổ",
  NOT_RECEIVED: "Chưa nhập",
  PARTIAL_RECEIVED: "Nhập một phần",
  PARTIALLY_RECEIVED: "Đang nhập",
  FULLY_RECEIVED: "Đã nhập",
  NOT_ISSUED: "Chưa xuất",
  PARTIALLY_ISSUED: "Đang xuất",
  FULLY_ISSUED: "Đã xuất",
};

const STATUS_CLS: Record<string, string> = {
  DRAFT:
    "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
  PENDING_APPROVAL:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
  APPROVED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  REJECTED:
    "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
  CANCELLED:
    "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
  PROCESSING:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
  CONFIRMED:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
  RESERVED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  PARTIAL_RESERVED:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
  DELIVERING:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
  PARTIAL_DELIVERING:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
  DELIVERED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  PARTIAL_DELIVERED:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
  RECEIVED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  ISSUED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  CLOSED:
    "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
  POSTED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  NOT_RECEIVED:
    "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
  PARTIAL_RECEIVED:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
  PARTIALLY_RECEIVED:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
  FULLY_RECEIVED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  NOT_ISSUED:
    "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
  PARTIALLY_ISSUED:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
  FULLY_ISSUED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  className?: string;
}

/**
 * Badge hiển thị trạng thái chứng từ (Nháp, Chờ duyệt, Đã duyệt, ...).
 */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const t = useT();
    const s = status as VoucherStatus;
    const i18nKey = STATUS_I18N_KEYS[s];
    const fallbackLabel = STATUS_LABELS[s] ?? status;
    const label = i18nKey ? t(i18nKey, fallbackLabel) : fallbackLabel;
    const cls = STATUS_CLS[s] ?? "";
    return (
      <span
        ref={ref}
        className={cn(
          "text-[11px] px-2 py-[3px] rounded-md font-semibold whitespace-nowrap",
          cls,
          className,
        )}
        {...props}
      >
        {label}
      </span>
    );
  },
);
StatusBadge.displayName = "StatusBadge";

// ── VoucherType badge ─────────────────────────────────────────────────────────

export interface VoucherTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: string;
  className?: string;
}

const VOUCHER_TYPE_LABEL: Record<string, string> = {
  CASH_RECEIPT: "PT",
  CASH_PAYMENT: "PC",
  BANK_RECEIPT: "UNT",
  BANK_PAYMENT: "UNC",
};

/**
 * Badge hiển thị loại chứng từ (PT/PC/UNT/UNC).
 */
export const VoucherTypeBadge = React.forwardRef<
  HTMLSpanElement,
  VoucherTypeBadgeProps
>(({ type, className, ...props }, ref) => {
  const label = VOUCHER_TYPE_LABEL[type] ?? type;
  const isReceipt = type === "CASH_RECEIPT" || type === "BANK_RECEIPT";
  return (
    <span
      ref={ref}
      className={cn(
        "text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium",
        isReceipt ? "bg-approve-bg text-approve-fg" : "bg-warn-bg text-warn-fg",
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
});
VoucherTypeBadge.displayName = "VoucherTypeBadge";

// ── Active/Inactive tag ───────────────────────────────────────────────────────

export interface TagCellProps extends React.HTMLAttributes<HTMLDivElement> {
  active: boolean;
  isDefault?: boolean;
  className?: string;
}

/**
 * Tag hiển thị trạng thái hoạt động và nhãn "Mặc định" (dùng trong ThietLap).
 */
export const TagCell = React.forwardRef<HTMLDivElement, TagCellProps>(
  ({ active, isDefault, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex gap-[4px] flex-wrap", className)}
        {...props}
      >
        {isDefault && (
          <span className="text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium bg-[#e8f0fd] text-[#2a6dd9]">
            Mặc định
          </span>
        )}
        <span
          className={`text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium ${
            active
              ? "bg-approve-bg text-approve-fg"
              : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]"
          }`}
        >
          {active ? "Hoạt động" : "Tắt"}
        </span>
      </div>
    );
  },
);
TagCell.displayName = "TagCell";
