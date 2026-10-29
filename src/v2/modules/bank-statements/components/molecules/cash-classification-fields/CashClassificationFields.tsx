import { DrawerField, DrawerRow, V2Combobox } from "@/v2/shared/components";
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
 * Chế độ xem chỉ hiện nhãn; chế độ sửa hiện hai ô chọn có DrawerField nhãn chuẩn V2.
 */
export function CashClassificationFields({
  classification,
  purpose,
  editMode,
  onClassificationChange,
  onPurposeChange,
  t,
}: CashClassificationFieldsProps) {
  const classificationLabel = t(
    "v2.bankStatements.bankDetail.labels.classification",
    { defaultValue: t("v2.bankStatements.cashDetail.labels.classification") },
  );
  const purposeLabel = t("v2.bankStatements.bankDetail.labels.purpose", {
    defaultValue: t("v2.bankStatements.cashDetail.labels.purpose"),
  });

  if (!editMode) {
    return (
      <div className="space-y-1">
        <DrawerRow
          label={classificationLabel}
          value={getClassificationLabel(t, classification)}
        />
        <DrawerRow label={purposeLabel} value={getPurposeLabel(t, purpose)} />
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
      <DrawerField label={classificationLabel}>
        <V2Combobox
          aria-label={classificationLabel}
          options={buildClassificationOptions(t)}
          value={classification}
          onValueChange={handleClassification}
          placeholder={t(
            "v2.bankStatements.bankDetail.labels.selectClassification",
          )}
          searchable={false}
          clearable
        />
      </DrawerField>

      <DrawerField label={purposeLabel}>
        <V2Combobox
          aria-label={purposeLabel}
          options={buildPurposeOptions(t, classification)}
          value={purpose}
          onValueChange={(value) =>
            onPurposeChange((value || null) as CashflowPurpose | null)
          }
          placeholder={t("v2.bankStatements.bankDetail.labels.selectPurpose")}
          disabled={!classification}
          searchable={false}
          clearable
        />
      </DrawerField>
    </div>
  );
}
