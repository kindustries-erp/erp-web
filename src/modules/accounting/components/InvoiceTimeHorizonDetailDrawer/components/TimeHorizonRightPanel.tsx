import React from "react";
import { TimeHorizonStrategySection } from "./TimeHorizonStrategySection";
import { TimeHorizonFinancialSummarySection } from "./TimeHorizonFinancialSummarySection";
import { TimeHorizonMaturitySection } from "./TimeHorizonMaturitySection";
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
  t,
}: TimeHorizonRightPanelProps) {
  const isForecast =
    horizon === "forecastNext7Days" || horizon === "forecastNext30Days";

  return (
    <div className="space-y-3 pb-2 pr-0.5">
      {/* ─── SECTION 1: CHIẾN LƯỢC HÀNH ĐỘNG & CƠ CHẾ MÔ HÌNH ─── */}
      <TimeHorizonStrategySection
        horizon={horizon}
        horizonMeta={horizonMeta}
        summary={summary}
        t={t}
      />

      {/* ─── SECTION 2: TỔNG QUAN TÀI CHÍNH MỐC THỜI GIAN (3 THẺ KPI) ─── */}
      <TimeHorizonFinancialSummarySection
        horizon={horizon}
        summary={summary}
        t={t}
      />

      {/* ─── SECTION 3: BÓC TÁCH NGUỒN TIỀN ĐẾN HẠN & QUÁ HẠN (CHO DỰ BÁO) ─── */}
      {isForecast && (
        <TimeHorizonMaturitySection
          summary={summary}
          direction={direction}
          t={t}
        />
      )}
    </div>
  );
}
