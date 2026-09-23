import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { renderPrevVal, renderDelta } from "../utils/pnlHelpers";

interface PnlCommissionSaleRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlCommissionSaleRow({
  report,
  prevReport,
  isLoadingPrev,
}: PnlCommissionSaleRowProps) {
  const { t } = useTranslation("garage");

  const saleItem = (report.commission?.items || []).find(
    (i: { categoryKey?: string }) => i.categoryKey === "HOA_HONG_SALE",
  );
  const saleAmount =
    saleItem?.amount ?? report.commission.auto?.saleCommission ?? 0;

  return (
    <>
      {/* 1. Dòng Tỷ lệ lãi gộp Ký gửi / Tổng lãi gộp */}
      <tr className="text-slate-700 dark:text-slate-300 bg-purple-50/30 dark:bg-purple-950/10 hover:bg-purple-50/60 dark:hover:bg-purple-950/20 transition-colors border-b border-border/20">
        <td className="py-2.5 px-8">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {t("pnl.kyGuiProfitRate", "Tỷ lệ lãi gộp ký gửi / Lãi gộp")}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 bg-purple-100/80 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-medium"
                title={t(
                  "pnl.kyGuiProfitRateTooltip",
                  "Tỷ lệ % lợi nhuận gộp từ các phiếu dịch vụ có phân loại Ký gửi/Nội bộ trên tổng lợi nhuận gộp toàn xưởng. Dùng làm hệ số phân bổ Lợi nhuận ròng để tính 10% hoa hồng cho bộ phận Sale.",
                )}
              >
                {t("pnl.kyGuiAllocationBadge", "Tỷ trọng phân bổ Sale")}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground font-normal">
              Lãi gộp Ký gửi:{" "}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                {(
                  report.kyGui?.grossProfit ??
                  report.commission.auto?.kyGuiGrossProfit ??
                  0
                ).toLocaleString("vi-VN")}{" "}
                đ
              </strong>{" "}
              / Tổng lãi gộp:{" "}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                {report.grossProfit.toLocaleString("vi-VN")} đ
              </strong>
            </span>
          </div>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono font-medium text-muted-foreground border-r border-border/40">
          <Badge
            variant="outline"
            className="text-[11px] font-mono px-2 py-0 border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60"
          >
            {(report.oj?.commissionAuto?.kyGuiProfitRate ?? 0).toFixed(2)}%
          </Badge>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono font-bold text-purple-700 dark:text-purple-400">
          <div className="flex items-center justify-end">
            <Badge
              variant="outline"
              className="text-[11px] font-mono px-2 py-0.5 border-purple-300 dark:border-purple-800 bg-purple-100/70 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold"
            >
              {(report.commission.auto?.kyGuiProfitRate ?? 0).toFixed(2)}%
            </Badge>
            {prevReport?.commission?.auto?.kyGuiProfitRate !== undefined &&
              renderDelta(
                report.commission.auto?.kyGuiProfitRate ?? 0,
                prevReport.commission.auto?.kyGuiProfitRate,
                false,
                isLoadingPrev,
              )}
          </div>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[12px] text-muted-foreground">
          {prevReport?.commission?.auto?.kyGuiProfitRate !== undefined
            ? `${prevReport.commission.auto.kyGuiProfitRate.toFixed(2)}%`
            : "—"}
        </td>
      </tr>

      {/* 2. Dòng Hoa hồng cho Sale (10%) */}
      <tr className="text-slate-700 dark:text-slate-300 hover:bg-muted/10 transition-colors border-b border-border/20">
        <td className="py-2.5 px-8">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {t("pnl.saleCommission", "Hoa hồng cho Sale (10%)")}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-normal"
              >
                10% × LN ròng ×{" "}
                {(report.commission.auto?.kyGuiProfitRate ?? 0).toFixed(1)}% Ký
                gửi
              </Badge>
              <Tooltip
                content={t(
                  "pnl.autoCalculatedTooltip",
                  "Khoản hoa hồng này được tính toán tự động 100% từ Báo cáo P&L (Chỉ đọc)",
                )}
              >
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 cursor-help shrink-0 shadow-xs hover:bg-amber-500/20 transition-colors">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
              </Tooltip>
            </div>
            <span className="text-[11px] text-muted-foreground font-normal">
              {saleItem?.note ||
                t(
                  "pnl.saleCommissionSubtitle",
                  "Tính trên 10% của Lợi nhuận ròng theo Tỷ lệ lợi nhuận gộp do ký gửi",
                )}
            </span>
          </div>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
          {(
            saleItem?.ojAmount ??
            report.oj?.commissionAuto?.saleCommission ??
            0
          ).toLocaleString("vi-VN")}{" "}
          đ
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono font-semibold">
          <div className="flex items-center justify-end">
            <span>{saleAmount.toLocaleString("vi-VN")} đ</span>
            {renderDelta(
              saleAmount,
              prevReport?.commission?.items?.find(
                (i: { categoryKey?: string }) =>
                  i.categoryKey === "HOA_HONG_SALE",
              )?.amount ?? prevReport?.commission?.auto?.saleCommission,
              true,
              isLoadingPrev,
            )}
          </div>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-muted-foreground">
          {renderPrevVal(
            prevReport?.commission?.items?.find(
              (i: { categoryKey?: string }) =>
                i.categoryKey === "HOA_HONG_SALE",
            )?.amount ?? prevReport?.commission?.auto?.saleCommission,
            isLoadingPrev,
          )}
        </td>
      </tr>
    </>
  );
}
