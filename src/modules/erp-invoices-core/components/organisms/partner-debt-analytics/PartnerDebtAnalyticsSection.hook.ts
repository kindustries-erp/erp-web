import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PartnerInvoiceDetailItem } from "@/modules/accounting/api/invoiceDebtsApi";
import {
  computeDebtTotals,
  computeMonthlyBarData,
  computeMonthlyDebtTableData,
  computeAgingDonutItems,
  computeCumulativeTrendData,
  computeMonthlyRecoveryRateData,
} from "./PartnerDebtAnalyticsSection.helper";
import type { PartnerDebtAnalyticsData } from "./PartnerDebtAnalyticsSection.type";

export function usePartnerDebtAnalytics(
  invoices: PartnerInvoiceDetailItem[],
  isCustomer: boolean,
): PartnerDebtAnalyticsData {
  const { t } = useTranslation(["erpInvoices", "debts"]);

  const totals = useMemo(() => computeDebtTotals(invoices), [invoices]);

  const { labels: monthlyBarLabels, datasets: monthlyBarDatasets } = useMemo(
    () => computeMonthlyBarData(invoices, isCustomer, t),
    [invoices, isCustomer, t],
  );

  const monthlyTableRows = useMemo(
    () => computeMonthlyDebtTableData(invoices),
    [invoices],
  );

  const agingDonutItems = useMemo(
    () => computeAgingDonutItems(totals, t),
    [totals, t],
  );

  const { labels: cumulativeTrendLabels, datasets: cumulativeTrendDatasets } =
    useMemo(
      () => computeCumulativeTrendData(invoices, isCustomer, t),
      [invoices, isCustomer, t],
    );

  const { labels: recoveryRateLabels, datasets: recoveryRateDatasets } =
    useMemo(
      () => computeMonthlyRecoveryRateData(invoices, isCustomer, t),
      [invoices, isCustomer, t],
    );

  return {
    totals,
    monthlyBarLabels,
    monthlyBarDatasets,
    monthlyTableRows,
    agingDonutItems,
    cumulativeTrendLabels,
    cumulativeTrendDatasets,
    recoveryRateLabels,
    recoveryRateDatasets,
  };
}
