import React from "react";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlRevenueRows } from "./PnlRevenueRows";
import { PnlCogsRows } from "./PnlCogsRows";
import { PnlGrossProfitRow } from "./PnlGrossProfitRow";

interface PnlRevenueCogsRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlRevenueCogsRows({
  report,
  prevReport,
  isLoadingPrev,
}: PnlRevenueCogsRowsProps) {
  return (
    <>
      <PnlRevenueRows
        report={report}
        prevReport={prevReport}
        isLoadingPrev={isLoadingPrev}
      />
      <PnlCogsRows
        report={report}
        prevReport={prevReport}
        isLoadingPrev={isLoadingPrev}
      />
      <PnlGrossProfitRow
        report={report}
        prevReport={prevReport}
        isLoadingPrev={isLoadingPrev}
      />
    </>
  );
}
