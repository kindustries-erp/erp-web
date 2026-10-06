import React from "react";
import { useTranslation } from "react-i18next";
import { Award } from "lucide-react";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import type { PairedPnlItem } from "../types";
import { mergePnlItems } from "../utils/pnlHelpers";
import { PnlManualCommissionRows } from "./PnlManualCommissionRows";
import { PnlDvCommissionRow } from "./PnlDvCommissionRow";
import { PnlAmountCell } from "./PnlAmountCell";
import { PnlLevel1HeaderCell } from "./PnlLevel1HeaderCell";

interface PnlServiceCommissionRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

function getDv(r?: GaragePnlReportResponse): number {
  return (
    r?.commission?.items?.find((i) => i.categoryKey === "HOA_HONG_DV")
      ?.amount ??
    r?.serviceCommission?.dvCommission ??
    r?.commission?.auto?.dvCommission ??
    0
  );
}

const filterManual = (items?: any[]) =>
  items?.filter(
    (i) =>
      !["RATE_LAI_GOP_KY_GUI", "HOA_HONG_SALE", "HOA_HONG_DV"].includes(
        i.categoryKey,
      ),
  );

const sumItems = (items: PairedPnlItem[], isOj: boolean, period: 0 | 1 | 2) =>
  items.reduce((s, i) => {
    const val =
      period === 0
        ? isOj
          ? i.curOjAmount
          : i.curAmount
        : period === 1
          ? isOj
            ? i.prevOjAmount
            : i.prevAmount
          : isOj
            ? i.prev2OjAmount
            : i.prev2Amount;
    return s + (Number(val) || 0);
  }, 0);

export function PnlServiceCommissionRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
  isCollapsed = false,
  onToggle,
}: PnlServiceCommissionRowsProps) {
  const { t } = useTranslation("garage");

  const rawManualItems = mergePnlItems(
    report.commission?.manual?.items ||
      filterManual(report.commission?.items as any),
    prevReport?.commission?.manual?.items ||
      filterManual(prevReport?.commission?.items as any),
    prev2Report?.commission?.manual?.items ||
      filterManual(prev2Report?.commission?.items as any),
  );

  const manualItems = isOjOnly
    ? rawManualItems.filter(
        (i) =>
          (i.curOjAmount && i.curOjAmount > 0) ||
          (i.prevOjAmount && i.prevOjAmount > 0) ||
          (i.prev2OjAmount && i.prev2OjAmount > 0),
      )
    : rawManualItems;

  const dv0 = isOjOnly
    ? (report.oj?.commissionAuto?.dvCommission ?? 0)
    : getDv(report);
  const dv1 = isOjOnly
    ? prevReport?.oj?.commissionAuto?.dvCommission
    : prevReport
      ? getDv(prevReport)
      : undefined;
  const dv2 = isOjOnly
    ? prev2Report?.oj?.commissionAuto?.dvCommission
    : prev2Report
      ? getDv(prev2Report)
      : undefined;

  const total0 = isOjOnly
    ? (report.oj?.serviceCommissionTotal ??
      dv0 + sumItems(manualItems, true, 0))
    : (report.serviceCommission?.total ??
      dv0 + sumItems(manualItems, false, 0));

  const total1 = isOjOnly
    ? (prevReport?.oj?.serviceCommissionTotal ??
      (dv1 !== undefined ? dv1 + sumItems(manualItems, true, 1) : undefined))
    : (prevReport?.serviceCommission?.total ??
      (dv1 !== undefined ? dv1 + sumItems(manualItems, false, 1) : undefined));

  const total2 = isOjOnly
    ? (prev2Report?.oj?.serviceCommissionTotal ??
      (dv2 !== undefined ? dv2 + sumItems(manualItems, true, 2) : undefined))
    : (prev2Report?.serviceCommission?.total ??
      (dv2 !== undefined ? dv2 + sumItems(manualItems, false, 2) : undefined));

  return (
    <>
      {/* VII. Thưởng và Hoa hồng Dịch vụ Header */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <PnlLevel1HeaderCell
          title={t(
            "pnl.serviceCommissionHeader",
            "VII. Thưởng và Hoa hồng Dịch vụ",
          )}
          icon={Award}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          hasSubRows={true}
        />
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

      {/* Sub-rows: 7.1, 7.2 (chỉ hiển thị khi !isCollapsed) */}
      {!isCollapsed && (
        <>
          <PnlDvCommissionRow
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
          />
          <PnlManualCommissionRows items={manualItems} isOjOnly={isOjOnly} />
        </>
      )}
    </>
  );
}
