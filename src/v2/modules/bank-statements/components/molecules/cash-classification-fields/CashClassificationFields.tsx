import { DrawerRow, V2Combobox } from "@/v2/shared/components";
import {
  buildClassificationOptions,
  buildPurposeOptions,
  getClassificationLabel,
  getPurposeLabel,
} from "../../helpers/cashflowOptions.helper";
import {
  isPurposeAllowed,
  type CashflowClassification,
  type CashflowPurpose,
} from "../../../domain/value-objects/cashflowAttributes";
import type { CashClassificationFieldsProps } from "./CashClassificationFields.type";

/**
 * Phân loại và mục đích dòng tiền. Đổi phân loại làm mục đích cũ không còn hợp lệ thì xóa mục đích.
 * Chế độ xem chỉ hiện nhãn; chế độ sửa hiện hai ô chọn, ô mục đích chỉ có lựa chọn sau khi chọn phân loại.
 */
export function CashClassificationFields({
  classification,
  purpose,
  editMode,
  onClassificationChange,
  onPurposeChange,
  t,
}: CashClassificationFieldsProps) {
  if (!editMode) {
    return (
      <div className="space-y-1">
        <DrawerRow
          label={t("v2.bankStatements.cashDetail.labels.classification")}
          value={getClassificationLabel(t, classification)}
        />
        <DrawerRow
          label={t("v2.bankStatements.cashDetail.labels.purpose")}
          value={getPurposeLabel(t, purpose)}
        />
      </div>
    );
  }

  const handleClassification = (value: string | null) => {
    const next = (value || null) as CashflowClassification | null;
    onClassificationChange(next);
    if (!isPurposeAllowed(next, purpose)) onPurposeChange(null);
  };

  return (
    <div className="grid gap-3">
      <V2Combobox
        aria-label={t("v2.bankStatements.cashDetail.labels.classification")}
        options={buildClassificationOptions(t)}
        value={classification}
        onValueChange={handleClassification}
        searchable={false}
        clearable
      />
      <V2Combobox
        aria-label={t("v2.bankStatements.cashDetail.labels.purpose")}
        options={buildPurposeOptions(t, classification)}
        value={purpose}
        onValueChange={(value) =>
          onPurposeChange((value || null) as CashflowPurpose | null)
        }
        disabled={!classification}
        searchable={false}
        clearable
      />
    </div>
  );
}
