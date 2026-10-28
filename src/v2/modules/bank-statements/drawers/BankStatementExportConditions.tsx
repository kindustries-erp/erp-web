import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import {
  V2Combobox,
  type V2ComboboxOption,
} from "@/v2/shared/components/molecules/v2-combobox";
import {
  V2ExportConditionSection,
  type V2ExportConditionSectionProps,
} from "@/v2/shared/components/molecules/v2-export-condition-section";

export type BankStatementExportConditionsProps = Omit<
  V2ExportConditionSectionProps,
  "className" | "children"
> & {
  /** Chưa chọn cột nào thì không cho xuất */
  noColumnSelected: boolean;
  accountLabel: string;
  accountPlaceholder: string;
  accountOptions: V2ComboboxOption[];
  accountId: string;
  onAccountChange: (accountId: string) => void;
  transactionTypeLabel: string;
  transactionTypePlaceholder: string;
  transactionTypeOptions: V2ComboboxOption[];
  transactionType: string;
  onTransactionTypeChange: (transactionType: string) => void;
};

/**
 * Điều kiện xuất sao kê: map state của hook sang V2ExportConditionSection,
 * thêm chọn tài khoản / sổ quỹ và loại giao dịch vào phần children.
 */
export const BankStatementExportConditions: React.FC<
  BankStatementExportConditionsProps
> = ({
  noColumnSelected,
  accountLabel,
  accountPlaceholder,
  accountOptions,
  accountId,
  onAccountChange,
  transactionTypeLabel,
  transactionTypePlaceholder,
  transactionTypeOptions,
  transactionType,
  onTransactionTypeChange,
  ...props
}) => (
  <V2ExportConditionSection {...props} startDisabled={noColumnSelected}>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <V2Text variant="label">{accountLabel}</V2Text>
        <V2Combobox
          options={accountOptions}
          value={accountId || null}
          onValueChange={(value) => onAccountChange(value ?? "")}
          placeholder={accountPlaceholder}
          aria-label={accountLabel}
          clearable
        />
      </div>
      <div className="space-y-1.5">
        <V2Text variant="label">{transactionTypeLabel}</V2Text>
        <V2Combobox
          options={transactionTypeOptions}
          value={transactionType || null}
          onValueChange={(value) => onTransactionTypeChange(value ?? "")}
          placeholder={transactionTypePlaceholder}
          aria-label={transactionTypeLabel}
          searchable={false}
          clearable
        />
      </div>
    </div>
  </V2ExportConditionSection>
);
