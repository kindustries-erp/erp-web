import React from "react";
import { useTranslation } from "react-i18next";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlHhbhRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
}

/** Lấy số HHBH (phiếu chi 4. HHBH) của một kỳ; chế độ OJ dùng ojAmount. */
const getHhbh = (r: GaragePnlReportResponse | undefined, isOj: boolean) => {
  const item = r?.sellingExpenses?.items?.find((i) => i.categoryKey === "HHBH");
  if (!item) return 0;
  return (isOj ? item.ojAmount : item.amount) || 0;
};

/** Dòng 4.2 HHBH trong mục IV Chi phí bán hàng. Không hiển thị tỷ lệ %. */
export function PnlHhbhRow({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
}: PnlHhbhRowProps) {
  const { t } = useTranslation("garage");

  const v0 = getHhbh(report, isOjOnly);
  const v1 = prevReport ? getHhbh(prevReport, isOjOnly) : undefined;
  const v2 = prev2Report ? getHhbh(prev2Report, isOjOnly) : undefined;

  return (
    <tr className="text-slate-700 dark:text-slate-300 bg-purple-50/20 dark:bg-purple-950/10 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
      <td className="py-2 px-8 font-medium">
        <span>{t("pnl.hhbh", "4.2. HHBH")}</span>
      </td>
      <PnlAmountCell
        amount={v0}
        prevAmount={v1}
        isCost
        isLoadingPrev={isLoadingPrev}
        hideRate
        tdClassName="py-2 px-4 text-right tabular-nums font-mono font-semibold"
        amountClassName="font-semibold text-foreground"
      />
      <PnlAmountCell
        amount={v1 ?? 0}
        prevAmount={v2}
        isCost
        isLoading={isLoadingPrev}
        isLoadingPrev={isLoadingPrev2}
        hideRate
        tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
      />
      <PnlAmountCell
        amount={v2 ?? 0}
        isCost
        isLoading={isLoadingPrev2}
        hideDelta
        hideRate
        tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
      />
    </tr>
  );
}
