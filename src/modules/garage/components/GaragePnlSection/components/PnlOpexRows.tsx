import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { mergePnlItems } from "../utils/pnlHelpers";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlOpexRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
  onOpenDrawer: () => void;
}

export function PnlOpexRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
  onOpenDrawer,
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

  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  return (
    <>
      {/* 5. Chi phí vận hành */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 px-4 flex items-center justify-between">
          <span>{t("pnl.opexHeader", "5. Chi phí vận hành")}</span>
          {!isOjOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenDrawer}
              className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary"
            >
              <Plus className="w-3 h-3" />
              <span>{t("opex.actions.addExpense", "Thêm CP")}</span>
            </Button>
          )}
        </td>
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
        displayItems.map((item, idx) => {
          const curVal = isOjOnly ? item.curOjAmount : item.curAmount;
          const prevVal = isOjOnly ? item.prevOjAmount : item.prevAmount;
          const prev2Val = isOjOnly ? item.prev2OjAmount : item.prev2Amount;

          return (
            <React.Fragment key={item.key}>
              <tr className="text-muted-foreground hover:bg-muted/10 transition-colors">
                <td className="py-2 px-8 flex items-center justify-between">
                  <span>
                    5.{idx + 1}. {item.categoryName}
                  </span>
                  {item.note && (
                    <span className="text-[10px] text-muted-foreground/70 italic max-w-[200px] truncate">
                      ({item.note})
                    </span>
                  )}
                </td>
                <PnlAmountCell
                  amount={curVal && curVal > 0 ? curVal : null}
                  hideDelta
                  hideRate
                  tdClassName="py-2 px-4 text-right tabular-nums font-mono font-medium"
                />
                <PnlAmountCell
                  amount={prevVal && prevVal > 0 ? prevVal : null}
                  isLoading={isLoadingPrev}
                  hideDelta
                  hideRate
                  tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
                />
                <PnlAmountCell
                  amount={prev2Val && prev2Val > 0 ? prev2Val : null}
                  isLoading={isLoadingPrev2}
                  hideDelta
                  hideRate
                  tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
                />
              </tr>

              {/* Sub-item Level 3 nếu có ojAmount > 0 (Chỉ hiện khi xem Toàn bộ) */}
              {!isOjOnly &&
                Boolean(
                  (item.curOjAmount && item.curOjAmount > 0) ||
                  (item.prevOjAmount && item.prevOjAmount > 0) ||
                  (item.prev2OjAmount && item.prev2OjAmount > 0),
                ) && (
                  <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
                    <td className="py-1.5 pl-14 pr-4">
                      <span className="text-[11px] italic">
                        5.{idx + 1}.1. Trong đó: Phát sinh liên quan OJ
                      </span>
                    </td>
                    <PnlAmountCell
                      amount={item.curOjAmount || null}
                      hideDelta
                      hideRate
                      tdClassName={subCell}
                    />
                    <PnlAmountCell
                      amount={item.prevOjAmount || null}
                      isLoading={isLoadingPrev}
                      hideDelta
                      hideRate
                      tdClassName={subCell}
                    />
                    <PnlAmountCell
                      amount={item.prev2OjAmount || null}
                      isLoading={isLoadingPrev2}
                      hideDelta
                      hideRate
                      tdClassName={subCell}
                    />
                  </tr>
                )}
            </React.Fragment>
          );
        })
      )}
    </>
  );
}
