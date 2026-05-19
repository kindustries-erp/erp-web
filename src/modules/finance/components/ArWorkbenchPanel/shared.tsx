import { todayIsoDate } from "@/modules/finance/utils/financeHelpers";
import { cn } from "@/shared/utils";
import type {
  ApplyAdvanceToInvoiceDto,
  ArDocumentStatus,
  ArDocumentType,
  CreateArSalesInvoiceDto,
  CreateCustomerAdvanceDto,
  CreatePaymentReceiptDto,
  PaymentMethod,
  VoucherStatus,
} from "@/modules/finance/api/financeApi";

export const DOC_TYPES: { value: ArDocumentType; label: string }[] = [
  { value: "INVOICE", label: "Invoice công nợ" },
  { value: "IMMEDIATE_SALE", label: "Bán thu tiền ngay" },
  { value: "ADVANCE", label: "Đặt cọc/credit" },
  { value: "CREDIT_NOTE", label: "Credit note" },
  { value: "SALES_RETURN", label: "Hàng trả lại" },
  { value: "SUSPENSE", label: "Tiền treo" },
  { value: "COD", label: "COD" },
  { value: "GATEWAY", label: "Payment gateway" },
  { value: "RETENTION", label: "Retention" },
  { value: "CONTRACT_MILESTONE", label: "Milestone" },
  { value: "WRITE_OFF", label: "Write-off" },
  { value: "REFUND", label: "Refund" },
];

export const STATUS_LABELS: Record<ArDocumentStatus, string> = {
  DRAFT: "Nháp",
  POSTED: "Đã ghi nhận",
  PARTIAL: "Một phần",
  SETTLED: "Tất toán",
  DISPUTED: "Tranh chấp",
  REVERSED: "Đảo bút toán",
  CANCELLED: "Đã hủy",
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Tiền mặt (111)" },
  { value: "BANK", label: "Ngân hàng (112)" },
  { value: "EWALLET", label: "Ví điện tử (113)" },
];

export const VOUCHER_STATUS_LABELS: Record<VoucherStatus, string> = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
};

export function money(v?: number | string | null) {
  return Number(v ?? 0).toLocaleString("vi-VN");
}

export function statusCls(status: ArDocumentStatus) {
  if (status === "SETTLED") return "bg-approve-bg text-approve-fg";
  if (status === "PARTIAL" || status === "POSTED")
    return "bg-[#e8f0fd] text-[#2a6dd9]";
  if (status === "DISPUTED") return "bg-warn-bg text-warn-fg";
  return "bg-[color:var(--muted)] text-[color:var(--muted-fg)]";
}

export function StatusPill({ status }: { status: VoucherStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        status === "APPROVED"
          ? "bg-approve-bg text-approve-fg"
          : status === "CANCELLED"
            ? "bg-error-bg text-error-fg"
            : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
      )}
    >
      {VOUCHER_STATUS_LABELS[status]}
    </span>
  );
}

export function emptySalesInvoiceForm(): CreateArSalesInvoiceDto {
  const today = todayIsoDate();
  return {
    document_no: `AR-${today.split("-").join("")}-`,
    business_partner_id: "",
    document_date: today,
    posting_date: today,
    due_date: "",
    currency: "VND",
    exchange_rate: 1,
    reference_no: "",
    description: "",
    lines: [
      { line_no: 1, description: "", quantity: 1, unit_price: 0, tax_rate: 10 },
    ],
  };
}

export function emptyReceiptForm(): CreatePaymentReceiptDto {
  const today = todayIsoDate();
  return {
    payment_method: "BANK",
    document_date: today,
    posting_date: today,
    counterparty_id: "",
    counterparty_name_snapshot: "",
    amount: 0,
    currency: "VND",
    description: "",
  };
}

export function emptyApplyAdvanceForm(): ApplyAdvanceToInvoiceDto {
  return {
    advance_voucher_id: "",
    ar_document_id: "",
    amount: 0,
    application_date: todayIsoDate(),
    reason: "Cấn trừ tiền cọc vào invoice",
  };
}

export function emptyAdvanceForm(): CreateCustomerAdvanceDto {
  const today = todayIsoDate();
  return {
    payment_method: "BANK",
    document_date: today,
    posting_date: today,
    counterparty_id: "",
    counterparty_name_snapshot: "",
    amount: 0,
    currency: "VND",
    description: "Khách đặt cọc trước — chưa ghi nhận doanh thu/VAT",
  };
}
