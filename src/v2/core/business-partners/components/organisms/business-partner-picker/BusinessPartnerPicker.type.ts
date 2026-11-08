import type { PartnerSelectionDirection } from "../../../domain/rules/partnerSelection";

export interface BusinessPartnerPickerProps {
  /** IN = tiền chi (NCC), OUT = tiền thu (khách hàng) */
  direction: PartnerSelectionDirection;
  /** Giá trị đã mã hóa (xem toPartnerOptionValue); null là chưa chọn */
  value: string | null;
  /** Nhãn của giá trị đang chọn, hiển thị khi giá trị không có trong kết quả tìm kiếm */
  selectedLabel: string | null;
  onValueChange: (value: string | null, label: string | null) => void;
  disabled?: boolean;
  className?: string;
}
