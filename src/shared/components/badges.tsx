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
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_APPROVAL: "bg-warn-bg text-warn-fg",
  APPROVED: "bg-approve-bg text-approve-fg",
  REJECTED: "bg-[#fde8e8] text-[#d92a2a]",
  CANCELLED:
    "bg-[color:var(--muted)] text-[color:var(--muted-fg)] text-red-700 bg-red-100", // Wait, let's use a standard red for Cancelled
  PROCESSING: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  RESERVED: "bg-emerald-100 text-emerald-700",
  PARTIAL_RESERVED: "bg-amber-100 text-amber-700",
  DELIVERING: "bg-amber-100 text-amber-700",
  PARTIAL_DELIVERING: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  PARTIAL_DELIVERED: "bg-amber-100 text-amber-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  ISSUED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-gray-200 text-gray-700",
  POSTED: "bg-approve-bg text-approve-fg",
  NOT_RECEIVED: "bg-gray-100 text-gray-600",
  PARTIAL_RECEIVED: "bg-blue-100 text-blue-700",
  PARTIALLY_RECEIVED: "bg-blue-100 text-blue-700",
  FULLY_RECEIVED: "bg-emerald-100 text-emerald-700",
  NOT_ISSUED: "bg-gray-100 text-gray-600",
  PARTIALLY_ISSUED: "bg-blue-100 text-blue-700",
  FULLY_ISSUED: "bg-emerald-100 text-emerald-700",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Badge hiển thị trạng thái chứng từ (Nháp, Chờ duyệt, Đã duyệt, ...).
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useT();
  const s = status as VoucherStatus;
  const i18nKey = STATUS_I18N_KEYS[s];
  const label = i18nKey ? t(i18nKey) : (STATUS_LABELS[s] ?? status);
  const cls = STATUS_CLS[s] ?? "";
  return (
    <span
      className={cn(
        "text-[11px] px-2 py-[3px] rounded-md font-semibold whitespace-nowrap",
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}

// ── VoucherType badge ─────────────────────────────────────────────────────────

interface VoucherTypeBadgeProps {
  type: string;
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
export function VoucherTypeBadge({ type }: VoucherTypeBadgeProps) {
  const label = VOUCHER_TYPE_LABEL[type] ?? type;
  const isReceipt = type === "CASH_RECEIPT" || type === "BANK_RECEIPT";
  return (
    <span
      className={cn(
        "text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium",
        isReceipt ? "bg-approve-bg text-approve-fg" : "bg-warn-bg text-warn-fg",
      )}
    >
      {label}
    </span>
  );
}

// ── Active/Inactive tag ───────────────────────────────────────────────────────

interface TagCellProps {
  active: boolean;
  isDefault?: boolean;
}

/**
 * Tag hiển thị trạng thái hoạt động và nhãn "Mặc định" (dùng trong ThietLap).
 */
export function TagCell({ active, isDefault }: TagCellProps) {
  return (
    <div className="flex gap-[4px] flex-wrap">
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
}
