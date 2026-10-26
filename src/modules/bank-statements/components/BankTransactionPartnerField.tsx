import { useTranslation } from "react-i18next";
import { BusinessPartnerPicker } from "@/v2/modules/business-partners/components/organisms/business-partner-picker";
import type { PartnerSelectionDirection } from "@/v2/modules/business-partners/domain/rules/partnerSelection";

export interface BankTransactionPartnerFieldProps {
  editMode: boolean;
  /** Tiền thu: OUT (khách hàng); tiền chi: IN (nhà cung cấp) */
  direction: PartnerSelectionDirection;
  /** Giá trị đã mã hóa của ô chọn, null là chưa gán */
  value: string | null;
  /** Nhãn của đối tượng đang chọn */
  label: string | null;
  onChange: (value: string | null, label: string | null) => void;
}

/** Ô Đối tượng trong drawer sao kê: xem thì hiện tên, sửa thì chọn từ danh mục hoặc hóa đơn */
export function BankTransactionPartnerField({
  editMode,
  direction,
  value,
  label,
  onChange,
}: BankTransactionPartnerFieldProps) {
  const { t } = useTranslation();
  const fieldLabel = t("bankStatement.partner", { defaultValue: "Đối tượng" });

  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{fieldLabel}</div>
      {editMode ? (
        <BusinessPartnerPicker
          direction={direction}
          value={value}
          selectedLabel={label}
          onValueChange={onChange}
        />
      ) : (
        <div className="text-sm">{label || "—"}</div>
      )}
    </div>
  );
}
