import type {
  PartnerLedgerSourceType,
  PartnerLedgerStatus,
} from "@/modules/finance/api/financeApi";

export const CURRENCY_OPTS = [
  { value: "VND", label: "VND" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

export const SOURCE_TYPE_OPTS: {
  value: PartnerLedgerSourceType;
  label: string;
}[] = [
  { value: "OPENING", label: "Số dư đầu kỳ" },
  { value: "MANUAL", label: "Thủ công" },
  { value: "SALES_DOC", label: "Bán hàng" },
  { value: "PURCHASE_DOC", label: "Mua hàng" },
  { value: "ADJUSTMENT", label: "Điều chỉnh" },
];

export const STATUS_OPTS: { value: PartnerLedgerStatus; label: string }[] = [
  { value: "OPEN", label: "Chưa TT" },
  { value: "PARTIAL", label: "Thanh toán một phần" },
  { value: "SETTLED", label: "Đã tất toán" },
  { value: "CANCELLED", label: "Đã hủy" },
];
