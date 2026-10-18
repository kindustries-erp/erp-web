import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { mergePnlItems } from "../utils/pnlHelpers";
import { PnlAmountCell } from "./PnlAmountCell";
import { PnlLevel1HeaderCell } from "./PnlLevel1HeaderCell";
import { PnlOpexItemRow } from "./PnlOpexItemRow";

interface PnlOpexRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
  onOpenDrawer: () => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function PnlOpexRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
  onOpenDrawer,
  isCollapsed = false,
  onToggle,
}: PnlOpexRowsProps) {
  const { t } = useTranslation("garage");
  const opexItems = mergePnlItems(
    report.opex?.items,
    prevReport?.opex?.items,
    prev2Report?.opex?.items,
  );

  const opexTotal0 = isOjOnly ? report.oj?.opexTotal || 0 : report.opex.total;
  const opexTotal1 = isOjOnly
    ? prevReport?.oj?.opexTotal
    : prevReport?.opex?.total;
  const opexTotal2 = isOjOnly
    ? prev2Report?.oj?.opexTotal
    : prev2Report?.opex?.total;

  const displayItems = isOjOnly
    ? opexItems.filter(
        (i) =>
          (i.curOjAmount && i.curOjAmount > 0) ||
          (i.prevOjAmount && i.prevOjAmount > 0) ||
          (i.prev2OjAmount && i.prev2OjAmount > 0),
      )
    : opexItems;

  return (
    <>
      {/* V. Chi phí vận hành Header */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <PnlLevel1HeaderCell
          title={t("pnl.opexHeader", "V. Chi phí vận hành")}
          icon={Building2}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          hasSubRows={true}
          extraAction={
            !isOjOnly ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenDrawer}
                className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary"
              >
                <Plus className="w-3 h-3" />
                <span>{t("opex.actions.addExpense", "Thêm CP")}</span>
              </Button>
            ) : undefined
          }
        />
        <PnlAmountCell
          amount={opexTotal0}
          prevAmount={opexTotal1}
          revenue={isOjOnly ? report.oj?.revenue : report.revenue}
          isCost
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={opexTotal1}
          prevAmount={opexTotal2}
          revenue={isOjOnly ? prevReport?.oj?.revenue : prevReport?.revenue}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={opexTotal2}
          revenue={isOjOnly ? prev2Report?.oj?.revenue : prev2Report?.revenue}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground"
        />
      </tr>

      {/* Sub-items Level 2 trở về sau (chỉ hiển thị khi !isCollapsed) */}
      {!isCollapsed && (
        <>
          {displayItems.length === 0 ? (
            <tr className="text-muted-foreground/60 italic hover:bg-muted/10">
              <td className="py-2 px-8">
                {isOjOnly
                  ? t(
                      "pnl.noOjOpexHint",
                      "5.1. Chưa có chi phí vận hành phân bổ cho OJ",
                    )
                  : t(
                      "pnl.noOpexHint",
                      "5.1. Chưa nhập chi phí vận hành cho tháng này",
                    )}
              </td>
              <PnlAmountCell
                amount={0}
                hideDelta
                hideRate
                tdClassName="py-2 px-4 text-right tabular-nums font-mono"
              />
              <PnlAmountCell
                amount={opexTotal1}
                isLoading={isLoadingPrev}
                hideDelta
                hideRate
                tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
              />
              <PnlAmountCell
                amount={opexTotal2}
                isLoading={isLoadingPrev2}
                hideDelta
                hideRate
                tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
              />
            </tr>
          ) : (
            displayItems.map((item, idx) => (
              <PnlOpexItemRow
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
