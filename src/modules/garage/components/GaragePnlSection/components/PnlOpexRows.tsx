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
  onOpenDrawer: () => void;
}

export function PnlOpexRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  onOpenDrawer,
}: PnlOpexRowsProps) {
  const { t } = useTranslation("garage");
  const opexItems = mergePnlItems(
    report.opex?.items,
    prevReport?.opex?.items,
    prev2Report?.opex?.items,
  );

  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  return (
    <>
      {/* 5. Chi phí vận hành */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 px-4 flex items-center justify-between">
          <span>{t("pnl.opexHeader", "5. Chi phí vận hành")}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenDrawer}
            className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary"
          >
            <Plus className="w-3 h-3" />
            <span>{t("opex.actions.addExpense", "Thêm CP")}</span>
          </Button>
        </td>
        <PnlAmountCell
          amount={report.opex.total}
          prevAmount={prevReport?.opex?.total}
          revenue={report.revenue}
          isCost
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={prevReport?.opex?.total}
          prevAmount={prev2Report?.opex?.total}
          revenue={prevReport?.revenue}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={prev2Report?.opex?.total}
          revenue={prev2Report?.revenue}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground"
        />
      </tr>

      {opexItems.length === 0 ? (
        <tr className="text-muted-foreground/60 italic hover:bg-muted/10">
          <td className="py-2 px-8">
            {t(
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
            amount={prevReport?.opex?.total}
            isLoading={isLoadingPrev}
            hideDelta
            hideRate
            tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
          />
          <PnlAmountCell
            amount={prev2Report?.opex?.total}
            isLoading={isLoadingPrev2}
            hideDelta
            hideRate
            tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
          />
        </tr>
      ) : (
        opexItems.map((item, idx) => (
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
                amount={item.curAmount > 0 ? item.curAmount : null}
                hideDelta
                hideRate
                tdClassName="py-2 px-4 text-right tabular-nums font-mono font-medium"
              />
              <PnlAmountCell
                amount={
                  item.prevAmount && item.prevAmount > 0
                    ? item.prevAmount
                    : null
                }
                isLoading={isLoadingPrev}
                hideDelta
                hideRate
                tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
              />
              <PnlAmountCell
                amount={
                  item.prev2Amount && item.prev2Amount > 0
                    ? item.prev2Amount
                    : null
                }
                isLoading={isLoadingPrev2}
                hideDelta
                hideRate
                tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
              />
            </tr>

            {/* Sub-item Level 3 nếu có ojAmount > 0 */}
            {Boolean(
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
        ))
      )}
    </>
  );
}
