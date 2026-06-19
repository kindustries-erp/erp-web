import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { recurrenceOptions } from "@/modules/operational/utils/operationalHelpers";
import { useT } from "@/core/i18n";

interface ExpenseFieldsProps {
  title: string;
  expenseCategory: string;
  recurrenceType: string;
  recurrenceInterval: string;
  recurrenceStartDate: string;
  recurrenceEndDate: string;
  nextDueDate: string;
  autoGenerateNext: boolean;
  disabled?: boolean;
  onTitle: (v: string) => void;
  onExpenseCategory: (v: string) => void;
  onRecurrenceType: (v: string) => void;
  onRecurrenceInterval: (v: string) => void;
  onRecurrenceStartDate: (v: string) => void;
  onRecurrenceEndDate: (v: string) => void;
  onNextDueDate: (v: string) => void;
  onAutoGenerateNext: (v: boolean) => void;
}

/**
 * Các field đặc thù của variant "expenses" trong form chứng từ.
 * Extracted từ OperationalFormDrawer.tsx (dòng 1204–1296).
 */
export function ExpenseFields({
  title,
  expenseCategory,
  recurrenceType,
  recurrenceInterval,
  recurrenceStartDate,
  recurrenceEndDate,
  nextDueDate,
  autoGenerateNext,
  disabled,
  onTitle,
  onExpenseCategory,
  onRecurrenceType,
  onRecurrenceInterval,
  onRecurrenceStartDate,
  onRecurrenceEndDate,
  onNextDueDate,
  onAutoGenerateNext,
}: ExpenseFieldsProps) {
  const t = useT();
  return (
    <>
      <DrawerField label={t("Tiêu đề")}>
        <input
          className={inputCls}
          value={title}
          disabled={disabled}
          onChange={(e) => onTitle(e.target.value)}
        />
      </DrawerField>
      <DrawerField label={t("Nhóm chi phí")}>
        <input
          className={inputCls}
          value={expenseCategory}
          disabled={disabled}
          onChange={(e) => onExpenseCategory(e.target.value)}
          placeholder="VD: UTILITY"
        />
      </DrawerField>
      <DrawerField label={t("Chu kỳ")}>
        <Combobox
          options={recurrenceOptions}
          value={recurrenceType}
          disabled={disabled}
          onChange={(v) => onRecurrenceType(v || "ONE_TIME")}
          allowClear={false}
        />
      </DrawerField>
      <DrawerField label={t("Khoảng lặp")}>
        <input
          type="number"
          min={1}
          className={inputCls}
          value={recurrenceInterval}
          disabled={disabled}
          onChange={(e) => onRecurrenceInterval(e.target.value)}
        />
      </DrawerField>
      <DrawerField label={t("Bắt đầu")}>
        <input
          type="date"
          className={inputCls}
          value={recurrenceStartDate}
          disabled={disabled}
          onChange={(e) => onRecurrenceStartDate(e.target.value)}
        />
      </DrawerField>
      <DrawerField label={t("Kết thúc")}>
        <input
          type="date"
          className={inputCls}
          value={recurrenceEndDate}
          disabled={disabled}
          onChange={(e) => onRecurrenceEndDate(e.target.value)}
        />
      </DrawerField>
      <DrawerField label={t("Kỳ tiếp theo")}>
        <input
          type="date"
          className={inputCls}
          value={nextDueDate}
          disabled={disabled}
          onChange={(e) => onNextDueDate(e.target.value)}
        />
      </DrawerField>
      <DrawerField label={t("Tự sinh kỳ sau")}>
        <Checkbox
          checked={autoGenerateNext}
          disabled={disabled}
          onCheckedChange={(v) => onAutoGenerateNext(!!v)}
        />
      </DrawerField>
    </>
  );
}
