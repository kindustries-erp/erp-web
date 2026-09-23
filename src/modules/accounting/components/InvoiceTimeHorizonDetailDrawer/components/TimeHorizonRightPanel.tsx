import React from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  Calculator,
  ExternalLink,
} from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Popover } from "@/core/components/ui/Popover";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { money } from "@/shared/utils/format";
import type {
  TimeHorizonDetailSummary,
  HorizonMeta,
  TimeHorizonKey,
} from "../types";

export interface TimeHorizonRightPanelProps {
  horizon: TimeHorizonKey | null;
  horizonMeta: HorizonMeta;
  summary?: TimeHorizonDetailSummary | null;
  direction: "IN" | "OUT";
  onOpenPartnerDetail?: (taxCode: string, partnerName?: string) => void;
  t: any;
}

export function TimeHorizonRightPanel({
  horizon,
  horizonMeta,
  summary,
  direction,
  onOpenPartnerDetail,
  t,
}: TimeHorizonRightPanelProps) {
  const isForecast =
    horizon === "forecastNext7Days" || horizon === "forecastNext30Days";

  const partners =
    direction === "OUT"
      ? summary?.topReceivablePartners || []
      : summary?.topPayablePartners || [];

  const totalTopShare = Number(
    partners
      .reduce((sum: number, p: any) => sum + (p.sharePercentage || 0), 0)
      .toFixed(1),
  );

  return (
    <div className="space-y-3 pb-2 pr-0.5">
      {/* ─── TIER 1: TỔNG QUAN TÀI CHÍNH MỐC THỜI GIAN (KÈM TOOLTIP CHIẾN LƯỢC & MÔ HÌNH) ─── */}
      <DrawerSection
        title={
          <div className="flex items-center justify-between w-full pr-1">
            <span>
              {t(
                "debts:horizonDrawer.financialSummary",
                "Tổng quan tài chính mốc thời gian",
              )}
            </span>
            <Popover
              side="bottom"
              align="end"
              sideOffset={8}
              glass={true}
              className="w-[360px] sm:w-[400px] p-0 overflow-hidden text-foreground text-xs shadow-2xl"
              content={
                <div className="flex flex-col max-h-[460px]">
                  {/* Popover Header */}
                  <div className="p-3 border-b border-border/70 bg-muted/30 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">
                        {t(
                          "debts:horizonDrawer.actionStrategyTitle",
                          "Chiến lược Hành động & Cơ chế Mô hình",
                        )}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {t(
                          "debts:horizonDrawer.methodModelTitle",
                          "Phương pháp & Mô hình tính toán",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Popover Scrollable Body */}
                  <div className="p-3 overflow-y-auto space-y-2.5 scrollbar-thin">
                    {/* 1. Alert Vị thế ròng */}
                    {(summary?.netAmount || 0) < 0 ? (
                      <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 space-y-1">
                        <div className="flex items-center gap-1.5 text-destructive font-semibold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {t(
                              "debts:horizonDrawer.deficitWarning",
                              "Áp lực chi trả: Thâm hụt {{amount}}",
                              {
                                amount: money(
                                  Math.abs(summary?.netAmount || 0),
                                ),
                              },
                            )}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-relaxed">
                          {t(
                            "debts:horizonDrawer.deficitDesc",
                            "Nhu cầu chi trả lớn hơn dòng tiền dự thu trong kỳ. Cần ưu tiên thu hồi nợ quá hạn từ các khách hàng lớn và đàm phán giãn thời hạn thanh toán với nhà cung cấp.",
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {t(
                              "debts:horizonDrawer.surplusSafe",
                              "Vị thế an toàn: Thặng dư {{amount}}",
                              {
                                amount: money(summary?.netAmount || 0),
                              },
                            )}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-relaxed">
                          {t(
                            "debts:horizonDrawer.surplusDesc",
                            "Dòng tiền dự thu đủ đáp ứng các nghĩa vụ chi trả. Duy trì đối soát và thu hồi đúng chu kỳ.",
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. Khuyến nghị điều hành cụ thể */}
                    {horizonMeta.recommendation && (
                      <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/10 flex items-start gap-2 text-xs text-foreground">
                        <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          {horizonMeta.recommendation}
                        </div>
                      </div>
                    )}

                    {/* 3. Diễn giải Cơ chế & Mô hình Tính toán */}
                    <div className="p-2.5 rounded-lg border border-border/70 bg-muted/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Calculator className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {t(
                            "debts:horizonDrawer.methodModelTitle",
                            "Phương pháp & Mô hình tính toán",
                          )}
                        </span>
                      </div>

                      {horizon === "expectedCashflow" ? (
                        <div className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                          <p className="font-medium text-foreground">
                            {t(
                              "debts:horizonDrawer.matrixTitle",
                              "Ma trận trọng số xác suất IFRS 9",
                            )}
                            :
                          </p>
                          <div className="p-2 bg-background/90 rounded border border-border/40 font-mono text-[10px] space-y-1">
                            <div className="text-emerald-700 dark:text-emerald-400">
                              •{" "}
                              {t(
                                "debts:horizonDrawer.matrixReceivable",
                                "Phải thu KH: ≤30d (85%), 31-60d (60%), 61-90d (30%), >90d (10%)",
                              )}
                            </div>
                            <div className="text-amber-700 dark:text-amber-400">
                              •{" "}
                              {t(
                                "debts:horizonDrawer.matrixPayable",
                                "Phải trả NCC: ≤30d (95%), 31-60d (85%), 61-90d (70%), >90d (50%)",
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] leading-relaxed">
                            {t(
                              "debts:horizonDrawer.expectedFormula",
                              "Tiền kỳ vọng = ∑(Còn nợ × Xác suất IFRS 9). Khớp 100% với cột Tiền kỳ vọng trong bảng chi tiết.",
                            )}
                          </p>
                        </div>
                      ) : horizon === "defaultRiskProvision" ? (
                        <div className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                          <p className="font-medium text-foreground">
                            {t(
                              "debts:horizonDrawer.riskModelTitle",
                              "Mô hình Dự phòng Rủi ro Tín dụng (IFRS 9 ECL):",
                            )}
                          </p>
                          <div className="p-2 bg-background/90 rounded border border-border/40 font-mono text-[10px] space-y-1">
                            <div className="text-rose-600 dark:text-rose-400">
                              •{" "}
                              {t(
                                "debts:horizonDrawer.riskReceivable",
                                "Phải thu KH: ≤30d (15%), 31-60d (40%), 61-90d (70%), >90d (90%)",
                              )}
                            </div>
                            <div className="text-amber-700 dark:text-amber-400">
                              •{" "}
                              {t(
                                "debts:horizonDrawer.riskPayable",
                                "Phải trả NCC: ≤30d (5%), 31-60d (15%), 61-90d (30%), >90d (50%)",
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] leading-relaxed">
                            {t(
                              "debts:horizonDrawer.riskFormula",
                              "Dự phòng rủi ro = ∑(Còn nợ × Tỷ lệ trích lập). Khớp 100% với cột Dự phòng rủi ro trong bảng chi tiết.",
                            )}
                          </p>
                        </div>
                      ) : horizon === "forecastNext7Days" ||
                        horizon === "forecastNext30Days" ? (
                        <div className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                          <p className="font-medium text-foreground">
                            {t(
                              "debts:horizonDrawer.weightedLagTitle",
                              "Thuật toán Weighted Partner Lag (DSO/DPO):",
                            )}
                          </p>
                          <p className="text-[10px] leading-relaxed">
                            {t(
                              "debts:horizonDrawer.dsoExplanation",
                              "Ngày dự kiến thu/trả = Ngày phát hành HĐ + Độ trễ thanh toán TB (DSO/DPO) của đối tác.",
                            )}
                          </p>
                          <div className="p-2 bg-background/90 rounded border border-border/40 text-[10px] text-primary font-medium">
                            {t(
                              "debts:horizonDrawer.forecastFilterNote",
                              "Lọc các hóa đơn có Ngày dự kiến thu/trả ≤ {{horizon}}.",
                              {
                                horizon:
                                  horizon === "forecastNext7Days"
                                    ? "T+7 ngày"
                                    : "T+30 ngày",
                              },
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-[11px] leading-relaxed">
                          {t(
                            "debts:horizonDrawer.standardAgingNote",
                            "Khoảng phân loại tuổi nợ theo số ngày trôi qua kể từ Ngày hóa đơn: ",
                          )}
                          <span className="font-mono font-medium text-foreground">
                            {horizon === "nextWeekDue"
                              ? "≤ 7 ngày"
                              : horizon === "nextMonthDue"
                                ? "≤ 30 ngày"
                                : horizon === "overdue30To90"
                                  ? "31 - 90 ngày"
                                  : "> 90 ngày"}
                          </span>
                          .
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              }
            >
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                aria-label={t(
                  "debts:horizonDrawer.actionStrategyTitle",
                  "Chiến lược Hành động & Cơ chế Mô hình",
                )}
              >
                <AlertCircle className="w-3.5 h-3.5" />
              </button>
            </Popover>
          </div>
        }
        collapsible
        defaultCollapsed={false}
      >
        <div className="space-y-2.5">
          {/* Expected In (Dự thu / Thu kỳ vọng) */}
          <div className="p-3 rounded-xl border border-border/70 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {horizon === "expectedCashflow"
                    ? t(
                        "debts:dashboard.forecastExpectedIn",
                        "Thu kỳ vọng (KH)",
                      )
                    : horizon === "defaultRiskProvision"
                      ? t("debts:dashboard.forecastRiskIn", "Rủi ro Phải thu")
                      : t("debts:dashboard.expectedIn", "Dự thu (Phải thu)")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {summary?.receivableCount || 0}{" "}
                  {t("debts:unitInvoice", "hóa đơn")}
                </div>
              </div>
            </div>
            <div className="text-right font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
              +{money(summary?.receivableAmount || 0)}
            </div>
          </div>

          {/* Expected Out (Dự chi / Chi kỳ vọng) */}
          <div className="p-3 rounded-xl border border-border/70 bg-amber-50/30 dark:bg-amber-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {horizon === "expectedCashflow"
                    ? t(
                        "debts:dashboard.forecastExpectedOut",
                        "Chi kỳ vọng (NCC)",
                      )
                    : horizon === "defaultRiskProvision"
                      ? t("debts:dashboard.forecastRiskOut", "Rủi ro Phải trả")
                      : t("debts:dashboard.expectedOut", "Dự chi (Phải trả)")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {summary?.payableCount || 0}{" "}
                  {t("debts:unitInvoice", "hóa đơn")}
                </div>
              </div>
            </div>
            <div className="text-right font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
              -{money(summary?.payableAmount || 0)}
            </div>
          </div>

          {/* Net Position (Vị thế ròng) */}
          <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {horizon === "defaultRiskProvision"
                    ? t("debts:dashboard.forecastNetRisk", "Chênh lệch rủi ro")
                    : t("debts:dashboard.netFlow", "Vị thế ròng")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(summary?.netAmount || 0) >= 0
                    ? t("debts:horizonDrawer.surplus", "Thặng dư dòng tiền")
                    : t("debts:horizonDrawer.deficit", "Áp lực chi trả")}
                </div>
              </div>
            </div>
            <div
              className={cn(
                "text-right font-mono font-bold text-sm",
                (summary?.netAmount || 0) >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-destructive",
              )}
            >
              {(summary?.netAmount || 0) >= 0 ? "+" : ""}
              {money(summary?.netAmount || 0)}
            </div>
          </div>
        </div>
      </DrawerSection>

      {/* ─── TIER 2: BÓC TÁCH CƠ CẤU NGUỒN TIỀN & ĐỐI TÁC TRỌNG YẾU ─── */}
      <DrawerSection
        title={t(
          "debts:horizonDrawer.flowBreakdownTitle",
          "Bóc tách Cơ cấu Nguồn tiền & Đối tác Trọng yếu",
        )}
        collapsible
        defaultCollapsed={false}
      >
        <div className="space-y-3">
          {/* 1. Cashflow Maturity Breakdown Widget (For Forecast Horizons) */}
          {isForecast &&
            (() => {
              const mb = summary?.maturityBreakdown;
              const totalAmount =
                direction === "OUT"
                  ? summary?.receivableAmount || 0
                  : direction === "IN"
                    ? summary?.payableAmount || 0
                    : (summary?.receivableAmount || 0) +
                      (summary?.payableAmount || 0);

              const dueAmount =
                direction === "OUT"
                  ? mb?.outDueInPeriodAmount || 0
                  : direction === "IN"
                    ? mb?.inDueInPeriodAmount || 0
                    : (mb?.outDueInPeriodAmount || 0) +
                      (mb?.inDueInPeriodAmount || 0);

              const dueCount =
                direction === "OUT"
                  ? mb?.outDueInPeriodCount || 0
                  : direction === "IN"
                    ? mb?.inDueInPeriodCount || 0
                    : (mb?.outDueInPeriodCount || 0) +
                      (mb?.inDueInPeriodCount || 0);

              const overdueAmount =
                direction === "OUT"
                  ? mb?.outOverdueCarriedAmount || 0
                  : direction === "IN"
                    ? mb?.inOverdueCarriedAmount || 0
                    : (mb?.outOverdueCarriedAmount || 0) +
                      (mb?.inOverdueCarriedAmount || 0);

              const overdueCount =
                direction === "OUT"
                  ? mb?.outOverdueCarriedCount || 0
                  : direction === "IN"
                    ? mb?.inOverdueCarriedCount || 0
                    : (mb?.outOverdueCarriedCount || 0) +
                      (mb?.inOverdueCarriedCount || 0);

              const duePercent =
                totalAmount > 0
                  ? Number(((dueAmount / totalAmount) * 100).toFixed(1))
                  : 0;
              const overduePercent =
                totalAmount > 0
                  ? Number(((overdueAmount / totalAmount) * 100).toFixed(1))
                  : 0;

              return (
                <div className="p-3 rounded-xl border border-border/70 bg-card space-y-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>
                      Bóc tách nguồn tiền dự{" "}
                      {direction === "IN" ? "chi" : "thu"}
                    </span>
                    <span className="font-mono text-xs text-foreground font-bold">
                      {money(totalAmount)}
                    </span>
                  </div>

                  {/* Segment 1: Due in period */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-muted-foreground font-medium">
                          {t(
                            "debts:horizonDrawer.dueInPeriod",
                            "Đến hạn trong kỳ (Chuẩn chu kỳ)",
                          )}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {money(dueAmount)}{" "}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({duePercent}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground pl-3.5">
                      {dueCount} {t("debts:unitInvoice", "hóa đơn")} có ngày dự
                      kiến thanh toán rơi đúng kỳ
                    </div>
                  </div>

                  {/* Segment 2: Overdue carried over */}
                  <div className="space-y-1 pt-1 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-muted-foreground font-medium">
                          {t(
                            "debts:horizonDrawer.overdueCarried",
                            "Quá hạn trôi sang (DSO quá hạn)",
                          )}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">
                        {money(overdueAmount)}{" "}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({overduePercent}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground pl-3.5">
                      {overdueCount} {t("debts:unitInvoice", "hóa đơn")} theo
                      chu kỳ đáng lẽ đã thanh toán, trôi sang kỳ này
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${duePercent}%` }}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${overduePercent}%` }}
                    />
                  </div>
                </div>
              );
            })()}

          {/* 2. Key Partners Concentration Exposure */}
          {(() => {
            if (partners.length === 0) {
              return (
                <div className="text-xs text-muted-foreground italic py-2 text-center">
                  {t("common:noData", "Không có dữ liệu đối tác")}
                </div>
              );
            }

            return (
              <div className="space-y-2">
                {/* Concentration Exposure Alert */}
                {totalTopShare >= 50 && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {t("debts:horizonDrawer.concentrationAlert", {
                          count: partners.length,
                          percent: totalTopShare,
                          defaultValue: `Top ${partners.length} đối tác chi phối ${totalTopShare}% dòng tiền`,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Partners List with Overdue Lag Badge */}
                <div className="space-y-2">
                  {partners.map((p: any, idx: number) => {
                    const displayAmount =
                      p.contributingAmount !== undefined
                        ? p.contributingAmount
                        : p.balanceAmount;
                    const share = p.sharePercentage ?? 0;

                    return (
                      <div
                        key={p.taxCode + idx}
                        onClick={() =>
                          onOpenPartnerDetail?.(p.taxCode, p.partnerName)
                        }
                        className="group p-2.5 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1 mr-2">
                            <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
                              <span className="truncate">{p.partnerName}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-primary" />
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{p.taxCode}</span>
                              <span>•</span>
                              <span>{p.invoiceCount} HĐ</span>
                              {p.avgLagDays !== undefined && (
                                <>
                                  <span>•</span>
                                  <span>Độ trễ: {p.avgLagDays}d</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div
                              className={cn(
                                "font-mono text-xs font-semibold",
                                direction === "OUT"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-700 dark:text-amber-400",
                              )}
                            >
                              {money(displayAmount)}
                            </div>
                            {/* Badge status: Overdue or On-cycle */}
                            {p.isOverdueLag ? (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 font-medium bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                              >
                                Trôi sang: {money(p.overdueCarriedAmount || 0)}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                              >
                                {t(
                                  "debts:horizonDrawer.normalLagBadge",
                                  "Đúng chu kỳ",
                                )}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Progress bar representing share percentage */}
                        {share > 0 && (
                          <div className="space-y-0.5 pt-0.5 border-t border-border/40">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>Tỷ trọng</span>
                              <span className="font-mono font-medium text-foreground">
                                {share}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  direction === "OUT"
                                    ? "bg-emerald-500"
                                    : "bg-amber-500",
                                )}
                                style={{
                                  width: `${Math.min(100, share)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </DrawerSection>
    </div>
  );
}
