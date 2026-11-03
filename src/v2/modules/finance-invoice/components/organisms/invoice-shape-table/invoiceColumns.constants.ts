import type { V2FilterOption } from "@/v2/shared/types/v2-table";

export const TAX_INVOICE_STATUS_OPTIONS: V2FilterOption[] = [
  { value: "1", label: "Hóa đơn mới" },
  { value: "2", label: "Hóa đơn thay thế" },
  { value: "3", label: "Hóa đơn điều chỉnh" },
  { value: "4", label: "Bị thay thế" },
  { value: "5", label: "Bị điều chỉnh" },
  { value: "6", label: "Đã hủy" },
];

export const TAX_PROCESS_STATUS_OPTIONS: V2FilterOption[] = [
  { value: "VALID", label: "Hợp lệ" },
  { value: "WARNING", label: "Cần rà soát" },
  { value: "INVALID", label: "Không hợp lệ" },
];

export const VAT_RATE_OPTIONS: V2FilterOption[] = [
  { value: "0", label: "0%" },
  { value: "5", label: "5%" },
  { value: "8", label: "8%" },
  { value: "10", label: "10%" },
  { value: "-1", label: "KCT (Không chịu thuế)" },
  { value: "-2", label: "KTT (Không tính thuế)" },
];

export const INVOICE_TYPE_OPTIONS: V2FilterOption[] = [
  { value: "1", label: "HĐ GTGT" },
  { value: "2", label: "HĐ Bán hàng" },
  { value: "5", label: "HĐ Khác" },
];
