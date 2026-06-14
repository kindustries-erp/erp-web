import { useCallback, useState } from "react";
import {
  getPaymentVouchersPagedApi,
  getPaymentVouchersSummaryApi,
  getOpeningBalancesPagedApi,
} from "@/modules/finance/api/financeApi";
import {
  TODAY,
  buildSixMonths,
  previousDate,
  DONUT_EMPTY,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildDonutItems,
} from "@/modules/finance/utils/financeHelpers";
import type { ChartOfAccount } from "@/modules/accounting/api/catalogApi";

/**
 * useVoucherDashboard — quản lý toàn bộ state KPI, biểu đồ đường, biểu đồ donut.
 * Dùng chung cho TienMat (CASH) và TienGui (BANK).
 */
export function useVoucherDashboard() {
  // KPI
  const [summary, setSummary] = useState<{
    receipt: number;
    payment: number;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [openingBal, setOpeningBal] = useState<number | null>(null);
  const [openingLoading, setOpeningLoading] = useState(false);

  // Line chart
  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [chartLabels, setChartLabels] = useState<string[]>([
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
  ]);
  const [chartYMax, setChartYMax] = useState(30);
  const [chartUnit, setChartUnit] = useState<"M" | "B">("M");

  // Donut
  const [receiptDonutItems, setReceiptDonutItems] = useState(DONUT_EMPTY);
  const [paymentDonutItems, setPaymentDonutItems] = useState(DONUT_EMPTY);
  const [donutLoading, setDonutLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────────

  type VoucherChannel = "CASH" | "BANK";
  type ChannelParam = "cash_fund_id" | "company_bank_account_id";
  type ChannelReceiptType = "CASH_RECEIPT" | "BANK_RECEIPT";
  type ChannelPaymentType = "CASH_PAYMENT" | "BANK_PAYMENT";

  interface DashboardParams {
    voucherChannel: VoucherChannel;
    channelParam: ChannelParam;
    channelFilter: string;
    receiptType: ChannelReceiptType;
    paymentType: ChannelPaymentType;
  }

  const loadSummary = useCallback(async function loadSummary(
    from: string,
    to: string,
    params: DashboardParams,
  ) {
    setSummaryLoading(true);
    try {
      const res = await getPaymentVouchersSummaryApi({
        voucher_channel: params.voucherChannel,
        status: "APPROVED",
        ...(params.channelFilter
          ? { [params.channelParam]: params.channelFilter }
          : {}),
        ...(from ? { posting_date_from: from } : {}),
        ...(to ? { posting_date_to: to } : {}),
      });
      setSummary({ receipt: res.total_receipt, payment: res.total_payment });
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadOpeningBalanceAndChart = useCallback(
    async function loadOpeningBalanceAndChart(
      from: string,
      chartEndDate: string,
      params: DashboardParams,
    ) {
      setOpeningLoading(true);
      try {
        const months = buildSixMonths(chartEndDate || TODAY);
        const [obRes, summaries] = await Promise.all([
          getOpeningBalancesPagedApi({ page: 1, pageSize: 500 }),
          Promise.all(
            months.map((mo) =>
              getPaymentVouchersSummaryApi({
                voucher_channel: params.voucherChannel,
                status: "APPROVED",
                ...(params.channelFilter
                  ? { [params.channelParam]: params.channelFilter }
                  : {}),
                posting_date_from: mo.from,
                posting_date_to: mo.to,
              }).catch(() => ({
                total_receipt: 0,
                total_payment: 0,
                net: 0,
                total_count: 0,
                breakdown: [],
              })),
            ),
          ),
        ]);

        // Build ob-by-period map
        const obByPeriod: Record<string, number> = {};
        for (const b of obRes.items) {
          const hasChannel =
            params.voucherChannel === "CASH"
              ? !!b.cash_fund_id
              : !!b.company_bank_account_id;
          if (!hasChannel) continue;
          const channelId =
            params.voucherChannel === "CASH"
              ? b.cash_fund_id
              : b.company_bank_account_id;
          if (params.channelFilter && channelId !== params.channelFilter)
            continue;
          obByPeriod[b.fiscal_period] =
            (obByPeriod[b.fiscal_period] ?? 0) +
            Number(b.debit_amount ?? 0) -
            Number(b.credit_amount ?? 0);
        }

        const anchorPeriod =
          Object.keys(obByPeriod)
            .filter((p) => p <= months[5].fiscalPeriod)
            .sort()
            .pop() ?? null;
        const anchorOb = anchorPeriod ? (obByPeriod[anchorPeriod] ?? 0) : 0;
        const anchorIdx = anchorPeriod
          ? months.findIndex((mo) => mo.fiscalPeriod === anchorPeriod)
          : -1;

        const endBals = new Array<number>(6).fill(0);
        if (anchorIdx >= 0) {
          endBals[anchorIdx] =
            anchorOb +
            summaries[anchorIdx].total_receipt -
            summaries[anchorIdx].total_payment;
          for (let i = anchorIdx + 1; i < 6; i++) {
            endBals[i] =
              endBals[i - 1] +
              summaries[i].total_receipt -
              summaries[i].total_payment;
          }
          if (anchorIdx > 0) {
            endBals[anchorIdx - 1] = anchorOb;
            for (let i = anchorIdx - 2; i >= 0; i--) {
              endBals[i] =
                endBals[i + 1] -
                summaries[i + 1].total_receipt +
                summaries[i + 1].total_payment;
            }
          }
        } else {
          let bal = anchorOb;
          if (anchorPeriod) {
            const anchorStart = `${anchorPeriod}-01`;
            const beforeChartStart = previousDate(months[0].from);
            if (anchorStart <= beforeChartStart) {
              const preChartSummary = await getPaymentVouchersSummaryApi({
                voucher_channel: params.voucherChannel,
                status: "APPROVED",
                ...(params.channelFilter
                  ? { [params.channelParam]: params.channelFilter }
                  : {}),
                posting_date_from: anchorStart,
                posting_date_to: beforeChartStart,
              }).catch(() => ({ total_receipt: 0, total_payment: 0 }));
              bal +=
                (preChartSummary.total_receipt ?? 0) -
                (preChartSummary.total_payment ?? 0);
            }
          }
          for (let i = 0; i < 6; i++) {
            endBals[i] =
              bal + summaries[i].total_receipt - summaries[i].total_payment;
            bal = endBals[i];
          }
        }

        // Tính opening balance cho khoảng filter
        if (from) {
          const fromPeriod = from.slice(0, 7);
          const openingAnchorPeriod =
            Object.keys(obByPeriod)
              .filter((p) => p <= fromPeriod)
              .sort()
              .pop() ?? null;
          let filterOpeningBal = openingAnchorPeriod
            ? (obByPeriod[openingAnchorPeriod] ?? 0)
            : 0;
          if (openingAnchorPeriod) {
            const anchorStart = `${openingAnchorPeriod}-01`;
            const beforeFrom = previousDate(from);
            if (anchorStart <= beforeFrom) {
              const preFilterSummary = await getPaymentVouchersSummaryApi({
                voucher_channel: params.voucherChannel,
                status: "APPROVED",
                ...(params.channelFilter
                  ? { [params.channelParam]: params.channelFilter }
                  : {}),
                posting_date_from: anchorStart,
                posting_date_to: beforeFrom,
              }).catch(() => ({ total_receipt: 0, total_payment: 0 }));
              filterOpeningBal +=
                (preFilterSummary.total_receipt ?? 0) -
                (preFilterSummary.total_payment ?? 0);
            }
          }
          setOpeningBal(filterOpeningBal);
        } else {
          setOpeningBal(null);
        }

        // Build chart data
        const maxBalance = Math.max(...endBals.map(Math.abs), 0);
        const useBillions = maxBalance >= 1_000_000_000;
        const divisor = useBillions ? 1_000_000_000 : 1_000_000;
        const data = endBals.map((b, i) => {
          const hasMonthData =
            summaries[i].total_count > 0 ||
            obByPeriod[months[i].fiscalPeriod] != null;
          return hasMonthData ? Math.round((b / divisor) * 10) / 10 : 0;
        });
        const maxAbs = Math.max(...data.map(Math.abs), 0.1);
        setChartData(data);
        setChartLabels(months.map((mo) => mo.label));
        setChartUnit(useBillions ? "B" : "M");
        setChartYMax(Math.max(Math.ceil(maxAbs * 1.3), 1));
      } catch {
        setOpeningBal(null);
      } finally {
        setOpeningLoading(false);
      }
    },
    [],
  );

  const loadDonutData = useCallback(async function loadDonutData(
    channelFilter: string,
    coa: ChartOfAccount[],
    params: DashboardParams,
    from?: string,
    to?: string,
  ) {
    setDonutLoading(true);
    try {
      const res = await getPaymentVouchersPagedApi({
        page: 1,
        pageSize: 500,
        voucher_channel: params.voucherChannel,
        status: "APPROVED",
        ...(channelFilter ? { [params.channelParam]: channelFilter } : {}),
        ...(from ? { posting_date_from: from } : {}),
        ...(to ? { posting_date_to: to } : {}),
      });

      const items = channelFilter
        ? res.items.filter(
            (v) =>
              (v as unknown as Record<string, unknown>)[params.channelParam] ===
              channelFilter,
          )
        : res.items;

      void items;
      void coa;
      setReceiptDonutItems(DONUT_EMPTY);
      setPaymentDonutItems(DONUT_EMPTY);
    } catch {
      setReceiptDonutItems(DONUT_EMPTY);
      setPaymentDonutItems(DONUT_EMPTY);
    } finally {
      setDonutLoading(false);
    }
  }, []);

  return {
    summary,
    summaryLoading,
    openingBal,
    openingLoading,
    chartData,
    chartLabels,
    chartYMax,
    chartUnit,
    receiptDonutItems,
    paymentDonutItems,
    donutLoading,
    loadSummary,
    loadOpeningBalanceAndChart,
    loadDonutData,
  };
}
