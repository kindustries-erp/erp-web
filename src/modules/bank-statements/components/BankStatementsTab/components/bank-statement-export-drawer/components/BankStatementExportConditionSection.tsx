import React from "react";
import { Play } from "lucide-react";
import { useT } from "@/core/i18n";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { PillTabs } from "@/shared/components/PillTabs";
import { BankStatementExportModeSelector } from "./BankStatementExportModeSelector";
import { BankStatementExportFilterPreview } from "./BankStatementExportFilterPreview";
import type { BankStatementPeriodType } from "../BankStatementExportDrawer.type";
import type { BankStatementExportConditionSectionProps } from "./BankStatementExportConditionSection.type";

export type { BankStatementExportConditionSectionProps };

export function BankStatementExportConditionSection(
  props: BankStatementExportConditionSectionProps,
) {
  const {
    type,
    exportMode,
    onExportModeChange,
    periodType,
    onPeriodTypeChange,
    period,
    onPeriodChange,
    periodOptions,
    quarter,
    onQuarterChange,
    quarterOptions,
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
            <div className="pt-0.5 pb-0.5">
              <PillTabs<BankStatementPeriodType>
                size="sm"
                variant="pill"
                className="w-full shrink-0"
                listClassName="w-full grid grid-cols-3"
                triggerClassName="justify-center flex-1"
                value={periodType}
                onValueChange={onPeriodTypeChange}
                items={[
                  {
                    value: "month",
                    label: t("bankStatement.periodTypeMonth", "Theo tháng"),
                  },
                  {
                    value: "quarter",
                    label: t("bankStatement.periodTypeQuarter", "Theo quý"),
                  },
                  {
                    value: "custom",
                    label: t("bankStatement.periodTypeCustom", "Tùy chỉnh"),
                  },
                ]}
              />
            </div>

            {periodType === "month" && (
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
            )}

            {periodType === "quarter" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.quarter", "Quý")}
                </label>
                <Combobox
                  options={quarterOptions}
                  value={quarter}
                  onChange={onQuarterChange}
                  placeholder={t("bankStatement.selectQuarter", "Chọn quý...")}
                  allowClear={false}
                />
              </div>
            )}

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
