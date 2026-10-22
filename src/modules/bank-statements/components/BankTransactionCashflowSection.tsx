import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import {
  buildClassificationOptions,
  buildPurposeOptions,
  getClassificationLabel,
  isPurposeAllowed,
  getPurposeLabel,
  type CashflowClassification,
  type CashflowPurpose,
} from "../constants/cashflowAttributes";

export interface BankTransactionCashflowSectionProps {
  classification: CashflowClassification | null;
  purpose: CashflowPurpose | null;
  editMode?: boolean;
  onClassificationChange?: (value: CashflowClassification | null) => void;
  onPurposeChange?: (value: CashflowPurpose | null) => void;
}

export function BankTransactionCashflowSection({
  classification,
  purpose,
  editMode = false,
  onClassificationChange,
  onPurposeChange,
}: BankTransactionCashflowSectionProps) {
  const { t } = useTranslation();

  const title = t("bankStatement.cashflowAttributes", {
    defaultValue: "PHÂN LOẠI DÒNG TIỀN",
  });
  const classificationLabel = t("bankStatement.classification", {
    defaultValue: "Phân loại",
  });
  const purposeLabel = t("bankStatement.purpose", {
    defaultValue: "Mục đích",
  });

  if (!editMode) {
    return (
      <DrawerSection title={title} collapsible defaultCollapsed={false}>
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {classificationLabel}
            </div>
            <div className="font-medium text-foreground">
              {getClassificationLabel(t, classification)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {purposeLabel}
            </div>
            <div className="font-medium text-foreground">
              {getPurposeLabel(t, purpose)}
            </div>
          </div>
        </div>
      </DrawerSection>
    );
  }

  return (
    <DrawerSection title={title} collapsible defaultCollapsed={false}>
      <div className="space-y-4">
        <DrawerField label={classificationLabel}>
          <Combobox
            options={buildClassificationOptions(t)}
            value={classification ?? ""}
            onChange={(val) => {
              const next = (val as CashflowClassification) || null;
              onClassificationChange?.(next);
              if (!isPurposeAllowed(next, purpose)) onPurposeChange?.(null);
            }}
            placeholder={t("bankStatement.selectClassification", {
              defaultValue: "-- Chọn phân loại --",
            })}
            allowClear
          />
        </DrawerField>
        <DrawerField label={purposeLabel}>
          <Combobox
            options={buildPurposeOptions(t, classification)}
            value={purpose ?? ""}
            disabled={!classification}
            onChange={(val) =>
              onPurposeChange?.((val as CashflowPurpose) || null)
            }
            placeholder={
              classification
                ? t("bankStatement.selectPurpose", {
                    defaultValue: "-- Chọn mục đích --",
                  })
                : t("bankStatement.selectClassificationFirst", {
                    defaultValue: "-- Chọn phân loại trước --",
                  })
            }
            allowClear
          />
        </DrawerField>
      </div>
    </DrawerSection>
  );
}
