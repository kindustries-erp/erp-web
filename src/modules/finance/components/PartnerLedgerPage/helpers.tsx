import { cn } from "@/shared/utils";
import { todayIsoDate } from "@/modules/finance/utils/financeHelpers";
import type {
  CreatePartnerLedgerItemDto,
  PartnerLedgerItemType,
  PartnerLedgerStatus,
} from "@/modules/finance/api/financeApi";

export function fmtAmt(n: number) {
  return n.toLocaleString("vi-VN");
}

export function StatusBadge({ status }: { status: PartnerLedgerStatus }) {
  const cls: Record<PartnerLedgerStatus, string> = {
    OPEN: "bg-warn-bg text-warn-fg",
    PARTIAL: "bg-[#e8f0fd] text-[#2a6dd9]",
    SETTLED: "bg-approve-bg text-approve-fg",
    CANCELLED: "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
  };
  const labels: Record<PartnerLedgerStatus, string> = {
    OPEN: "Chưa TT",
    PARTIAL: "Một phần",
    SETTLED: "Tất toán",
    CANCELLED: "Đã hủy",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-medium", cls[status])}>
      {labels[status]}
    </span>
  );
}

export function emptyForm(itemType: PartnerLedgerItemType): CreatePartnerLedgerItemDto {
  const today = todayIsoDate();
  return {
    item_no: "",
    item_type: itemType,
    source_type: "MANUAL",
    business_partner_id: "",
    accounting_account_id: "",
    document_date: today,
    posting_date: today,
    due_date: "",
    reference_no: "",
    description: "",
    currency: "VND",
    original_amount: 0,
    note: "",
  };
}
