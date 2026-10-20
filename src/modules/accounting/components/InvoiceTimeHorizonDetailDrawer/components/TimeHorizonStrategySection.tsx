import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Calculator,
} from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import type {
  TimeHorizonDetailSummary,
  HorizonMeta,
  TimeHorizonKey,
} from "../types";

export interface TimeHorizonStrategySectionProps {
  horizon: TimeHorizonKey | null;
  horizonMeta: HorizonMeta;
  summary?: TimeHorizonDetailSummary | null;
  t: any;
}

export function TimeHorizonStrategySection({
  horizon,
  horizonMeta,
  summary,
  t,
}: TimeHorizonStrategySectionProps) {
  const isExpectedCashflow = horizon === "expectedCashflow";
  const isDefaultRisk = horizon === "defaultRiskProvision";
  const isForecast =
    horizon === "forecastNext7Days" || horizon === "forecastNext30Days";
  const isDeficit = (summary?.netAmount || 0) < 0;

  return (
    <DrawerSection
      title={t(
        "debts:horizonDrawer.actionStrategyTitle",
        "Chiến lược Hành động & Cơ chế Mô hình",
      )}
      collapsible
      defaultCollapsed={false}
    >
      <div className="space-y-2.5 text-xs">
        {/* 1. Vị thế ròng & Cảnh báo Thâm hụt / Thặng dư */}
        {isDeficit ? (
          <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 space-y-1">
            <div className="flex items-center gap-1.5 text-destructive font-semibold text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {t(
                  "debts:horizonDrawer.deficitWarning",
                  "Áp lực chi trả: Thâm hụt {{amount}}",
                  { amount: money(Math.abs(summary?.netAmount || 0)) },
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
                  { amount: money(summary?.netAmount || 0) },
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

          {isExpectedCashflow ? (
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
          ) : isDefaultRisk ? (
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
          ) : isForecast ? (
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
    </DrawerSection>
  );
}
