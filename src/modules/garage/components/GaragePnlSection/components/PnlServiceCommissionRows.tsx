import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { mergePnlItems } from "../utils/pnlHelpers";
import { PnlManualCommissionRows } from "./PnlManualCommissionRows";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlServiceCommissionRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
}

export function PnlServiceCommissionRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
}: PnlServiceCommissionRowsProps) {
  const { t } = useTranslation("garage");

  const getDv = (r?: GaragePnlReportResponse) =>
    r?.commission?.items?.find((i) => i.categoryKey === "HOA_HONG_DV")
      ?.amount ??
    r?.serviceCommission?.dvCommission ??
    r?.commission?.auto?.dvCommission ??
    0;

  const [dv0, dv1, dv2] = [
    getDv(report),
    prevReport ? getDv(prevReport) : undefined,
    prev2Report ? getDv(prev2Report) : undefined,
  ];
  const [oj0, oj1, oj2] = [
    report.oj?.commissionAuto?.dvCommission ?? 0,
    prevReport?.oj?.commissionAuto?.dvCommission,
    prev2Report?.oj?.commissionAuto?.dvCommission,
  ];

  const filterManual = (
    items?: Array<{
      categoryKey: string;
      categoryName: string;
      amount: number;
      ojAmount?: number;
      note?: string | null;
    }>,
  ) =>
    items?.filter(
      (i) =>
        !["RATE_LAI_GOP_KY_GUI", "HOA_HONG_SALE", "HOA_HONG_DV"].includes(
          i.categoryKey,
        ),
    );

  const manualItems = mergePnlItems(
    report.commission?.manual?.items ||
      filterManual(report.commission?.items as any),
    prevReport?.commission?.manual?.items ||
      filterManual(prevReport?.commission?.items as any),
    prev2Report?.commission?.manual?.items ||
      filterManual(prev2Report?.commission?.items as any),
  );

  const total0 =
    report.serviceCommission?.total ??
    dv0 + manualItems.reduce((sum, i) => sum + (Number(i.curAmount) || 0), 0);
  const total1 =
    prevReport?.serviceCommission?.total ??
    (dv1 !== undefined
      ? dv1 +
        manualItems.reduce((sum, i) => sum + (Number(i.prevAmount) || 0), 0)
      : undefined);
  const total2 =
    prev2Report?.serviceCommission?.total ??
    (dv2 !== undefined
      ? dv2 +
        manualItems.reduce((sum, i) => sum + (Number(i.prev2Amount) || 0), 0)
      : undefined);

  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  return (
    <>
      {/* 7. Thưởng và Hoa hồng Dịch vụ Header */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 px-4 flex items-center justify-between">
          <span>
            {t("pnl.serviceCommissionHeader", "7. Thưởng và Hoa hồng Dịch vụ")}
          </span>
        </td>
        <PnlAmountCell
          amount={total0}
          prevAmount={total1}
          isCost
          isLoadingPrev={isLoadingPrev}
          hideRate
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={total1}
          prevAmount={total2}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          hideRate
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={total2}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground"
        />
      </tr>

      {/* 7.1. Hoa hồng cho DV (10%) */}
      <tr className="text-slate-700 dark:text-slate-300 hover:bg-muted/10 transition-colors">
        <td className="py-2 px-8">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {t("pnl.dvCommission", "7.1. Hoa hồng cho DV (10%)")}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-normal"
              >
                10% × Lợi nhuận ròng
              </Badge>
              <Tooltip
                content={t(
                  "pnl.autoCalculatedTooltip",
                  "Khoản hoa hồng này được tính toán tự động 100% từ Báo cáo P&L",
                )}
              >
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 cursor-help shrink-0 shadow-2xs hover:bg-amber-500/20 transition-colors">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
              </Tooltip>
            </div>
            <span className="text-[11px] text-muted-foreground font-normal">
              {t(
                "pnl.dvCommissionSubtitle",
                "Tính trên 10% Lợi nhuận ròng của toàn xưởng",
              )}
            </span>
          </div>
        </td>
        <PnlAmountCell
          amount={dv0}
          prevAmount={dv1}
          isCost
          isLoadingPrev={isLoadingPrev}
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono font-semibold"
          amountClassName="font-semibold text-foreground"
        />
        <PnlAmountCell
          amount={dv1}
          prevAmount={dv2}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
        />
        <PnlAmountCell
          amount={dv2}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
        />
      </tr>

      {/* 7.1.1. Trong đó: Phát sinh liên quan OJ */}
      <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
        <td className="py-1.5 pl-14 pr-4">
          <span className="text-[11px] italic">
            {t(
              "pnl.dvCommissionOjSub",
              "7.1.1. Trong đó: Phát sinh liên quan OJ",
            )}
          </span>
        </td>
        <PnlAmountCell
          amount={oj0 > 0 ? oj0 : 0}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={oj1}
          isLoading={isLoadingPrev}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={oj2}
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
      </tr>

      {/* Các khoản hoa hồng nhập tay thủ công khác (7.2...) */}
      <PnlManualCommissionRows items={manualItems} />
    </>
  );
}
