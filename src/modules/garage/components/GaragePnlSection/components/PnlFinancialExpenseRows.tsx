import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Landmark } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { mergePnlItems } from "../utils/pnlHelpers";
import { PnlAmountCell } from "./PnlAmountCell";
import { PnlLevel1HeaderCell } from "./PnlLevel1HeaderCell";
import { PnlFinancialItemRow } from "./PnlFinancialItemRow";

export interface PnlFinancialExpenseRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
  onOpenDrawer: (costGroup?: "FINANCIAL") => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function PnlFinancialExpenseRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
  onOpenDrawer,
  isCollapsed = false,
  onToggle,
}: PnlFinancialExpenseRowsProps) {
  const { t } = useTranslation("garage");
  const finItems = mergePnlItems(
    report.financialExpenses?.items,
    prevReport?.financialExpenses?.items,
    prev2Report?.financialExpenses?.items,
  );

  const finTotal0 = isOjOnly
    ? report.oj?.financialExpensesTotal || 0
    : report.financialExpenses?.total || 0;
  const finTotal1 = isOjOnly
    ? prevReport?.oj?.financialExpensesTotal
    : prevReport?.financialExpenses?.total;
  const finTotal2 = isOjOnly
    ? prev2Report?.oj?.financialExpensesTotal
    : prev2Report?.financialExpenses?.total;

  const displayItems = isOjOnly
    ? finItems.filter(
        (i) =>
          (i.curOjAmount && i.curOjAmount > 0) ||
          (i.prevOjAmount && i.prevOjAmount > 0) ||
          (i.prev2OjAmount && i.prev2OjAmount > 0),
      )
    : finItems;

  return (
    <>
      {/* VI. Chi phí tài chính Header */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <PnlLevel1HeaderCell
          title={t("pnl.financialExpenseHeader", "VI. Chi phí tài chính")}
          icon={Landmark}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          hasSubRows={true}
          extraAction={
            !isOjOnly ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenDrawer("FINANCIAL")}
                className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary"
              >
                <Plus className="w-3 h-3" />
                <span>{t("opex.actions.addExpense", "Thêm CP")}</span>
              </Button>
            ) : undefined
          }
        />
        <PnlAmountCell
          amount={finTotal0}
          prevAmount={finTotal1}
          revenue={isOjOnly ? report.oj?.revenue : report.revenue}
          isCost
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={finTotal1}
          prevAmount={finTotal2}
          revenue={isOjOnly ? prevReport?.oj?.revenue : prevReport?.revenue}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={finTotal2}
          revenue={isOjOnly ? prev2Report?.oj?.revenue : prev2Report?.revenue}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground"
        />
      </tr>

      {!isCollapsed && (
        <>
          {displayItems.length === 0 ? (
            <tr className="text-muted-foreground/60 italic hover:bg-muted/10">
              <td className="py-2 px-8">
                {isOjOnly
                  ? t(
                      "pnl.noOjFinancialHint",
                      "6.1. Chưa có chi phí tài chính phân bổ cho OJ",
                    )
                  : t(
                      "pnl.noFinancialHint",
                      "6.1. Chưa nhập chi phí tài chính cho tháng này",
                    )}
              </td>
              <PnlAmountCell
                amount={0}
                hideDelta
                hideRate
                tdClassName="py-2 px-4 text-right tabular-nums font-mono"
              />
              <PnlAmountCell
                amount={finTotal1}
                isLoading={isLoadingPrev}
                hideDelta
                hideRate
                tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
              />
              <PnlAmountCell
                amount={finTotal2}
                isLoading={isLoadingPrev2}
                hideDelta
                hideRate
                tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
              />
            </tr>
          ) : (
            displayItems.map((item, idx) => (
              <PnlFinancialItemRow
                key={item.key}
                item={item}
                index={idx}
                isOjOnly={isOjOnly}
                isLoadingPrev={isLoadingPrev}
                isLoadingPrev2={isLoadingPrev2}
              />
            ))
          )}
        </>
      )}
    </>
  );
}
