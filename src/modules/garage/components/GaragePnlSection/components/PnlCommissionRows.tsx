import React from "react";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlNetProfitBeforeCommissionRow } from "./PnlNetProfitBeforeCommissionRow";
import { PnlCommissionHeaderRow } from "./PnlCommissionHeaderRow";
import { PnlCommissionSaleRow } from "./PnlCommissionSaleRow";
import { PnlCommissionDvRow } from "./PnlCommissionDvRow";
import { PnlCommissionManualRows } from "./PnlCommissionManualRows";
import { PnlNetProfitAfterCommissionRow } from "./PnlNetProfitAfterCommissionRow";

interface PnlCommissionRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlCommissionRows({
  report,
  prevReport,
  isLoadingPrev,
}: PnlCommissionRowsProps) {
  return (
    <>
      <PnlNetProfitBeforeCommissionRow
        report={report}
        prevReport={prevReport}
        isLoadingPrev={isLoadingPrev}
      />
      <PnlCommissionHeaderRow
        report={report}
        prevReport={prevReport}
        isLoadingPrev={isLoadingPrev}
      />
      <PnlCommissionSaleRow
        report={report}
        prevReport={prevReport}
        isLoadingPrev={isLoadingPrev}
      />
      <PnlCommissionDvRow
        report={report}
        prevReport={prevReport}
        isLoadingPrev={isLoadingPrev}
      />
      <PnlCommissionManualRows report={report} prevReport={prevReport} />
      <PnlNetProfitAfterCommissionRow
        report={report}
        prevReport={prevReport}
        isLoadingPrev={isLoadingPrev}
      />
    </>
  );
}
