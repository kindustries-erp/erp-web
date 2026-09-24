import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { mergePnlItems } from "../utils/pnlHelpers";

interface PnlCommissionManualRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
}

export function PnlCommissionManualRows({
  report,
  prevReport,
}: PnlCommissionManualRowsProps) {
  const { t } = useTranslation("garage");

  const manualCommissionItems = mergePnlItems(
    report.commission?.manual?.items ||
      (report.commission?.items || []).filter(
        (i: { categoryKey?: string }) =>
          i.categoryKey !== "RATE_LAI_GOP_KY_GUI" &&
          i.categoryKey !== "HOA_HONG_SALE" &&
          i.categoryKey !== "HOA_HONG_DV",
      ),
    prevReport?.commission?.manual?.items ||
      (prevReport?.commission?.items || []).filter(
        (i: { categoryKey?: string }) =>
          i.categoryKey !== "RATE_LAI_GOP_KY_GUI" &&
          i.categoryKey !== "HOA_HONG_SALE" &&
          i.categoryKey !== "HOA_HONG_DV",
      ),
  );

  return (
    <>
      {manualCommissionItems.map((item) => (
        <tr
          key={item.key}
          className="text-muted-foreground bg-slate-50/40 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20"
        >
          <td className="py-2 px-8 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span>{item.categoryName}</span>
              <Badge
                variant="outline"
                className="text-[9px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
              >
                {t("pnl.manualCommissionBadge", "Nhập tay")}
              </Badge>
            </div>
            {item.note && (
              <span className="text-[10px] text-muted-foreground/70 italic max-w-[200px] truncate">
                ({item.note})
              </span>
            )}
          </td>
          <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
            {item.curOjAmount !== undefined && item.curOjAmount !== 0
              ? `${item.curOjAmount.toLocaleString("vi-VN")} đ`
              : "—"}
          </td>
          <td
            className={`py-2 px-4 text-right tabular-nums font-mono font-medium ${
              item.curAmount < 0 ? "text-rose-600 dark:text-rose-400" : ""
            }`}
          >
            {item.curAmount !== 0
              ? `${item.curAmount < 0 ? `- ${Math.abs(item.curAmount).toLocaleString("vi-VN")} đ` : `${item.curAmount.toLocaleString("vi-VN")} đ`}`
              : "—"}
          </td>
          <td
            className={`py-2 px-4 text-right tabular-nums font-mono text-muted-foreground ${
              (item.prevAmount ?? 0) < 0
                ? "text-rose-600/80 dark:text-rose-400/80"
                : ""
            }`}
          >
            {item.prevAmount !== undefined && item.prevAmount !== 0
              ? `${item.prevAmount < 0 ? `- ${Math.abs(item.prevAmount).toLocaleString("vi-VN")} đ` : `${item.prevAmount.toLocaleString("vi-VN")} đ`}`
              : "—"}
          </td>
        </tr>
      ))}
    </>
  );
}
