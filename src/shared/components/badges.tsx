import { cn } from "@/shared/utils";
import type { VoucherStatus } from "@/modules/finance/api/financeApi";

// ── VoucherStatus badge ───────────────────────────────────────────────────────

/** Maps VoucherStatus → Vietnamese label */
export const STATUS_LABELS: Record<VoucherStatus, string> = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  POSTED: "Đã hạch toán",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

const STATUS_CLS: Record<VoucherStatus, string> = {
  DRAFT: "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
  PENDING_APPROVAL: "bg-warn-bg text-warn-fg",
  APPROVED: "bg-approve-bg text-approve-fg",
  POSTED: "bg-[#e8f0fd] text-[#2a6dd9]",
  REJECTED: "bg-[#fde8e8] text-[#d92a2a]",
  CANCELLED: "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
};

interface StatusBadgeProps {
  status: string;
}

/**
 * Badge hiển thị trạng thái chứng từ (Nháp, Chờ duyệt, Đã duyệt, ...).
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const s = status as VoucherStatus;
  const label = STATUS_LABELS[s] ?? status;
  const cls = STATUS_CLS[s] ?? "";
  return (
    <span className={cn("text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium whitespace-nowrap", cls)}>
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
          active ? "bg-approve-bg text-approve-fg" : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]"
        }`}
      >
        {active ? "Hoạt động" : "Tắt"}
      </span>
    </div>
  );
}
