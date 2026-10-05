import React from "react";
import { Play } from "lucide-react";
import { useT } from "@/core/i18n";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { BankStatementExportModeSelector } from "./BankStatementExportModeSelector";
import { BankStatementExportFilterPreview } from "./BankStatementExportFilterPreview";
import type {
  BankStatementExportMode,
  BankStatementFilterSummary,
} from "../BankStatementExportDrawer.type";

export interface BankStatementExportConditionSectionProps {
  type: "bank" | "cash";
  exportMode: BankStatementExportMode;
  onExportModeChange: (mode: BankStatementExportMode) => void;
  period: string;
  onPeriodChange: (period?: string) => void;
  periodOptions: Array<{ value: string; label: string }>;
  dateFrom: string;
  onDateFromChange: (val?: string) => void;
  dateTo: string;
  onDateToChange: (val?: string) => void;
  accountOptions: Array<{ value: string; label: string }>;
  selectedAccountId: string;
  onSelectedAccountIdChange: (val?: string) => void;
  transactionTypeOptions: Array<{ value: string; label: string }>;
  transactionType: string;
  onTransactionTypeChange: (val?: string) => void;
  currentFilterSummary?: BankStatementFilterSummary;
  starting: boolean;
  onStartExport: () => void;
}

export function BankStatementExportConditionSection(
  props: BankStatementExportConditionSectionProps,
) {
  const {
    type,
    exportMode,
    onExportModeChange,
    period,
    onPeriodChange,
    periodOptions,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    accountOptions,
    selectedAccountId,
    onSelectedAccountIdChange,
    transactionTypeOptions,
    transactionType,
    onTransactionTypeChange,
    currentFilterSummary,
    starting,
    onStartExport,
  } = props;
  const t = useT();

  return (
    <DrawerSection
      title={t("bankStatement.exportConditionTitle", "Điều kiện xuất dữ liệu")}
      collapsible
      defaultCollapsed={false}
    >
      <div className="space-y-4">
        <BankStatementExportModeSelector
          exportMode={exportMode}
          onChange={onExportModeChange}
        />

        {exportMode === "by-period" ? (
          <div className="space-y-3 pt-1 border-t border-border/60">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("bankStatement.period", "Kỳ")}
              </label>
              <Combobox
                options={periodOptions}
                value={period}
                onChange={onPeriodChange}
                placeholder={t("bankStatement.selectPeriod", "Chọn kỳ...")}
                allowClear={false}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("bankStatement.dateFrom", "Từ ngày")}
              </label>
              <DatePicker
                value={dateFrom}
                onChange={onDateFromChange}
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("bankStatement.dateTo", "Đến ngày")}
              </label>
              <DatePicker
                value={dateTo}
                onChange={onDateToChange}
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {type === "bank"
                  ? t("bankStatement.bankAccount", "Tài khoản ngân hàng")
                  : t("bankStatement.cashBook", "Sổ quỹ")}
              </label>
              <Combobox
                options={accountOptions}
                value={selectedAccountId}
                onChange={onSelectedAccountIdChange}
                placeholder={
                  type === "bank"
                    ? t(
                        "bankStatement.allBankAccounts",
                        "Tất cả tài khoản ngân hàng",
                      )
                    : t("bankStatement.allCashBooks", "Tất cả sổ quỹ")
                }
                allowClear={false}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("bankStatement.transactionType", "Loại giao dịch")}
              </label>
              <Combobox
                options={transactionTypeOptions}
                value={transactionType}
                onChange={onTransactionTypeChange}
                placeholder={t(
                  "bankStatement.allTypes",
                  "Tất cả loại giao dịch",
                )}
                allowClear={false}
              />
            </div>
          </div>
        ) : (
          <div className="pt-1 border-t border-border/60">
            <BankStatementExportFilterPreview
              summary={currentFilterSummary}
              type={type}
            />
          </div>
        )}

        <div className="pt-2">
          <Button
            className="w-full justify-center"
            onClick={onStartExport}
            disabled={starting}
          >
            <Play className="w-4 h-4 mr-1.5" />
            {starting
              ? t("bankStatement.starting", "Đang khởi tạo...")
              : t("bankStatement.start", "Xuất Excel")}
          </Button>
        </div>
      </div>
    </DrawerSection>
  );
}
