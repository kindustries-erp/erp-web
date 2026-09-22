import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import {
  DataTable,
  type DataTableColumn,
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { PillTabs } from "@/shared/components/PillTabs";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { LineChart } from "@/shared/components/charts/LineChart";
import { ChartSkeleton } from "@/shared/components/ChartSkeleton";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { CopyButton } from "@/shared/components/CopyButton";
import {
  Calendar,
  Clock,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Building2,
  Lightbulb,
  ExternalLink,
  TrendingUp,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  ReceiptText,
  Calculator,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  type TimeHorizonKey,
  type TimeHorizonInvoiceItem,
  type TimeHorizonDailyForecastItem,
} from "../api/invoiceDashboardApi";
import { useTimeHorizonInvoices } from "../hooks/useTimeHorizonInvoices";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

export interface ForecastScheduleRow {
  dateKey: string;
  displayDate: string;
  receivable: number;
  payable: number;
  net: number;
  invoiceCount: number;
}

export interface MonthlyBreakdownRow {
  month: string;
  monthLabel: string;
  invoiceCount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  rate: number;
}

export interface InvoiceTimeHorizonDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  horizon: TimeHorizonKey | null;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  onOpenPartnerDetail?: (taxCode: string, partnerName?: string) => void;
}

export function InvoiceTimeHorizonDetailDrawer({
  open,
  onClose,
  horizon,
  dateFrom,
  dateTo,
  branchId,
  onOpenPartnerDetail,
}: InvoiceTimeHorizonDetailDrawerProps) {
  const { t } = useTranslation(["debts", "common"]);

  // Sub-tab navigation state (Left Panel): 'invoices' | 'analytics'
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "analytics">(
    "invoices",
  );

  // Direction Filter State: 'OUT' (Receivables) | 'IN' (Payables)
  const [direction, setDirection] = useState<"IN" | "OUT">("OUT");

  // Client Table Column State for Header Filters and Sorting
  const tableState = useTableColumnState(
    `time-horizon-detail-${horizon || "unknown"}`,
  );

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Reset pagination & active sub-tab when drawer opens or horizon changes
  useEffect(() => {
    if (open) {
      setActiveSubTab("invoices");
      setDirection("OUT");
      setPage(1);
    }
  }, [open, horizon]);

  // Effective date ranges: priority to column header filter (tableState.dateFrom/To), then drawer prop (dateFrom/To)
  const effectiveDateFrom = tableState.dateFrom || dateFrom;
  const effectiveDateTo = tableState.dateTo || dateTo;

  // Reset pagination when filter/sorting/direction/date changes
  useEffect(() => {
    setPage(1);
  }, [
    direction,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
    tableState.dateFrom,
    tableState.dateTo,
  ]);

  const activeSort = tableState.sorts[0];
  const sortBy = activeSort
    ? activeSort.startsWith("-")
      ? activeSort.slice(1)
      : activeSort
    : undefined;
  const sortOrder = activeSort
    ? activeSort.startsWith("-")
      ? ("DESC" as const)
      : ("ASC" as const)
    : ("DESC" as const);

  // Data Query Hook
  const { summary, items, total, totalPages, isLoading, isFetching, refetch } =
    useTimeHorizonInvoices({
      horizon,
      dateFrom: effectiveDateFrom,
      dateTo: effectiveDateTo,
      branchId,
      direction,
      page,
      pageSize,
      sortBy,
      sortOrder,
      columnSearch: tableState.columnSearch,
      columnFilters: tableState.columnFilters,
      enabled: open && Boolean(horizon),
    });

  // Internal invoice drawer hook for viewing full invoice detail
  const handleReloadInvoices = useCallback(() => {
    void refetch();
  }, [refetch]);
  const formHook = useErpInvoiceForm(handleReloadInvoices);

  // Horizon Metadata & Badge info
  const horizonMeta = useMemo(() => {
    switch (horizon) {
      case "nextWeekDue":
        return {
          title: t("debts:dashboard.freshDebt7", "Mới phát sinh (≤ 7 ngày)"),
          badge: t("debts:dashboard.freshBadge", "Mới"),
          badgeVariant: "outline" as const,
          icon: <Calendar className="w-4 h-4 text-emerald-600" />,
          recommendation: t(
            "debts:horizonDrawer.recNextWeek",
            "Các khoản nợ mới phát sinh trong 7 ngày gần nhất, đang trong hạn luân chuyển chứng từ và chuẩn bị đối chiếu công nợ ban đầu.",
          ),
        };
      case "nextMonthDue":
        return {
          title: t(
            "debts:dashboard.standardDebt30",
            "Trong hạn chuẩn (≤ 30 ngày)",
          ),
          badge: t("debts:dashboard.standardBadge", "Chuẩn"),
          badgeVariant: "default" as const,
          icon: <Calendar className="w-4 h-4 text-primary" />,
          recommendation: t(
            "debts:horizonDrawer.recNextMonth",
            "Các khoản nợ trong hạn tiêu chuẩn thông thường (0-30 ngày). Cần theo dõi sát hạn thanh toán và chuẩn bị nguồn tiền cân đối dòng tiền chi trả.",
          ),
        };
      case "overdue30To90":
        return {
          title: t("debts:dashboard.overdue30To90", "Quá hạn 31-90 ngày"),
          badge: t("debts:dashboard.urgentBadge", "Đôn đốc"),
          badgeVariant: "outline" as const,
          icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
          recommendation: t(
            "debts:horizonDrawer.recOverdue30To90",
            "Các khoản nợ quá hạn từ 31 đến 90 ngày cần được đôn đốc quyết liệt. Gửi công văn đối soát và nhắc nợ đối với các khách hàng trọng yếu.",
          ),
        };
      case "criticalOverdue90Plus":
        return {
          title: t("debts:dashboard.criticalOverdue90Plus", "Quá hạn >90 ngày"),
          badge: t("debts:dashboard.warningBadge", "Cảnh báo"),
          badgeVariant: "destructive" as const,
          icon: <AlertOctagon className="w-4 h-4 text-rose-600" />,
          recommendation: t(
            "debts:horizonDrawer.recCriticalOverdue90Plus",
            "Cảnh báo rủi ro cao đối với các khoản nợ quá hạn >90 ngày. Cần kích hoạt quy trình thu hồi nợ nghiêm ngặt và xem xét trích lập dự phòng nợ phải thu khó đòi.",
          ),
        };
      case "forecastNext7Days":
        return {
          title: t(
            "debts:dashboard.forecastNext7Days",
            "Dự báo Tuần tới (7 ngày)",
          ),
          badge: t("debts:dashboard.forecastT7Badge", "T+7 (Lag)"),
          badgeVariant: "outline" as const,
          icon: <Calendar className="w-4 h-4 text-emerald-600" />,
          recommendation: t(
            "debts:horizonDrawer.recForecastNext7Days",
            "Dự phóng dòng tiền thực tế sẽ phát sinh trong 7 ngày tới dựa trên độ trễ thanh toán trung bình (DSO/DPO) lịch sử của từng đối tác.",
          ),
        };
      case "forecastNext30Days":
        return {
          title: t(
            "debts:dashboard.forecastNext30Days",
            "Kế hoạch Tháng tới (30 ngày)",
          ),
          badge: t("debts:dashboard.forecastT30Badge", "T+30 (Lag)"),
          badgeVariant: "default" as const,
          icon: <Calendar className="w-4 h-4 text-primary" />,
          recommendation: t(
            "debts:horizonDrawer.recForecastNext30Days",
            "Kế hoạch dòng tiền luân chuyển trong vòng 30 ngày tới. Cân đối các khoản thu từ khách hàng có độ trễ ngắn để chuẩn bị nguồn thanh toán cho nhà cung cấp.",
          ),
        };
      case "expectedCashflow":
        return {
          title: t(
            "debts:dashboard.expectedCashflow",
            "Dòng tiền Kỳ vọng (IFRS 9)",
          ),
          badge: t("debts:dashboard.forecastExpectedBadge", "Kỳ vọng"),
          badgeVariant: "outline" as const,
          icon: <TrendingUp className="w-4 h-4 text-indigo-600" />,
          recommendation: t(
            "debts:horizonDrawer.recExpectedCashflow",
            "Giá trị dòng tiền kỳ vọng thực thu/thực chi sau khi áp dụng ma trận xác suất thu hồi nợ IFRS 9 dựa trên mức độ trễ hạn của từng khoản nợ.",
          ),
        };
      case "defaultRiskProvision":
        return {
          title: t(
            "debts:dashboard.defaultRiskProvision",
            "Dự phòng Rủi ro Nợ",
          ),
          badge: t("debts:dashboard.forecastRiskBadge", "Rủi ro"),
          badgeVariant: "destructive" as const,
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
          recommendation: t(
            "debts:horizonDrawer.recDefaultRiskProvision",
            "Giá trị nợ cần trích lập dự phòng rủi ro khó đòi theo IFRS 9 đối với các khoản nợ quá hạn kéo dài hoặc đối tác có lịch sử thanh toán chậm bất thường.",
          ),
        };
      default:
        return {
          title: t("debts:title", "Công nợ"),
          badge: "Chi tiết",
          badgeVariant: "default" as const,
          icon: <Clock className="w-4 h-4 text-primary" />,
          recommendation: "",
        };
    }
  }, [horizon, t]);

  const isReceivable = direction === "OUT";

  // Whether this horizon is a forecast one (context-aware analytics toggle)
  const isForecastHorizon =
    horizon === "forecastNext7Days" || horizon === "forecastNext30Days";

  const isIfrs9Horizon =
    horizon === "expectedCashflow" || horizon === "defaultRiskProvision";

  // ─── FORECAST CHART DATA (only when isForecastHorizon) ─────────────────────

  // A. Daily Forecast Bar Chart: Dự thu vs Dự chi theo ngày
  const dailyForecastBarData = useMemo(() => {
    const raw: TimeHorizonDailyForecastItem[] =
      summary?.dailyForecastTimeline || [];
    if (!raw.length) return null;

    // Sort: OVERDUE first, then ascending date
    const sorted = [...raw].sort((a, b) => {
      if (a.dateKey === "OVERDUE") return -1;
      if (b.dateKey === "OVERDUE") return 1;
      return a.dateKey.localeCompare(b.dateKey);
    });

    const labels = sorted.map((d) => {
      if (d.dateKey === "OVERDUE")
        return t("debts:horizonDrawer.forecastOverdueBucket", "Quá hạn");
      // format YYYY-MM-DD -> DD/MM
      const parts = d.dateKey.split("-");
      return `${parts[2]}/${parts[1]}`;
    });

    const outData = sorted.map((d) =>
      isReceivable ? d.outAmount : d.inAmount,
    );
    const inData = sorted.map((d) => (isReceivable ? d.inAmount : d.outAmount));

    return {
      labels,
      datasets: [
        {
          label: t("debts:horizonDrawer.forecastDailyReceivable", "Dự thu"),
          data: outData,
          color: "#10b981",
        },
        {
          label: t("debts:horizonDrawer.forecastDailyPayable", "Dự chi"),
          data: inData,
          color: "#f97316",
        },
      ],
    };
  }, [summary?.dailyForecastTimeline, isReceivable, t]);

  // B. Cumulative Forecast Line Chart: Dự thu tích lũy / Dự chi tích lũy / Vị thế ròng
  const cumulativeForecastData = useMemo(() => {
    const raw: TimeHorizonDailyForecastItem[] =
      summary?.dailyForecastTimeline || [];
    if (!raw.length) return null;

    const sorted = [...raw].sort((a, b) => {
      if (a.dateKey === "OVERDUE") return -1;
      if (b.dateKey === "OVERDUE") return 1;
      return a.dateKey.localeCompare(b.dateKey);
    });

    const labels = sorted.map((d) => {
      if (d.dateKey === "OVERDUE")
        return t("debts:horizonDrawer.forecastOverdueBucket", "Quá hạn");
      const parts = d.dateKey.split("-");
      return `${parts[2]}/${parts[1]}`;
    });

    let cumOut = 0;
    let cumIn = 0;
    const cumOutData: number[] = [];
    const cumInData: number[] = [];
    const netData: number[] = [];

    sorted.forEach((d) => {
      cumOut += isReceivable ? d.outAmount : d.inAmount;
      cumIn += isReceivable ? d.inAmount : d.outAmount;
      cumOutData.push(cumOut);
      cumInData.push(cumIn);
      netData.push(cumOut - cumIn);
    });

    return {
      labels,
      datasets: [
        {
          label: t(
            "debts:horizonDrawer.forecastCumulativeReceivable",
            "Dự thu tích lũy",
          ),
          data: cumOutData,
          color: "#10b981",
          fill: false,
        },
        {
          label: t(
            "debts:horizonDrawer.forecastCumulativePayable",
            "Dự chi tích lũy",
          ),
          data: cumInData,
          color: "#f97316",
          fill: false,
        },
        {
          label: t("debts:horizonDrawer.forecastCumulativeNet", "Vị thế ròng"),
          data: netData,
          color: "#6366f1",
          fill: false,
        },
      ],
    };
  }, [summary?.dailyForecastTimeline, isReceivable, t]);

  // C. Forecast Composition Donut (Đến hạn chuẩn kỳ vs Quá hạn trôi sang)
  const forecastCompositionItems = useMemo(() => {
    const mb = summary?.maturityBreakdown;
    if (!mb || !isForecastHorizon) return [];
    const dueAmount = isReceivable
      ? mb.outDueInPeriodAmount
      : mb.inDueInPeriodAmount;
    const overdueAmount = isReceivable
      ? mb.outOverdueCarriedAmount
      : mb.inOverdueCarriedAmount;
    return [
      {
        id: "due",
        label: t("debts:horizonDrawer.forecastDueInPeriod", "Đến hạn chuẩn kỳ"),
        value: dueAmount,
        color: "#10b981",
      },
      {
        id: "overdue",
        label: t(
          "debts:horizonDrawer.forecastOverdueCarried",
          "Quá hạn trôi sang (DSO)",
        ),
        value: overdueAmount,
        color: "#f97316",
      },
    ].filter((x) => x.value > 0);
  }, [summary?.maturityBreakdown, isForecastHorizon, isReceivable, t]);

  // D. Daily Schedule Table rows
  const forecastScheduleRows = useMemo((): ForecastScheduleRow[] => {
    const raw: TimeHorizonDailyForecastItem[] =
      summary?.dailyForecastTimeline || [];
    if (!raw.length) return [];
    return [...raw]
      .sort((a, b) => {
        if (a.dateKey === "OVERDUE") return -1;
        if (b.dateKey === "OVERDUE") return 1;
        return a.dateKey.localeCompare(b.dateKey);
      })
      .map((d) => {
        const recv = isReceivable ? d.outAmount : d.inAmount;
        const pay = isReceivable ? d.inAmount : d.outAmount;
        return {
          dateKey: d.dateKey,
          displayDate:
            d.dateKey === "OVERDUE"
              ? t("debts:horizonDrawer.forecastOverdueRow", "Quá hạn trôi sang")
              : d.dateKey.split("-").reverse().join("/"),
          receivable: recv,
          payable: pay,
          net: recv - pay,
          invoiceCount: isReceivable ? d.outCount : d.inCount,
        };
      });
  }, [summary?.dailyForecastTimeline, isReceivable, t]);

  // Schedule Table Column State for client-side filtering, searching and sorting
  const scheduleTableState = useTableColumnState(
    `time-horizon-forecast-schedule-${horizon || "unknown"}`,
  );

  // Header filter builder for schedule table
  const scheduleHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: scheduleTableState,
        items: forecastScheduleRows,
        defaultAlign: "center",
      }),
    [scheduleTableState, forecastScheduleRows],
  );

  // Filter & Sort client items for schedule table
  const filteredSortedScheduleRows = useMemo(() => {
    return filterClientItems(forecastScheduleRows, scheduleTableState);
  }, [forecastScheduleRows, scheduleTableState]);

  // Table Columns Definition for Forecast Schedule Table according to /standardize-table
  const scheduleColumns: DataTableColumn<ForecastScheduleRow>[] =
    useMemo(() => {
      return [
        // 1. STT (#) - 40px, Center aligned, 1-based index via {idx}
        {
          key: "index",
          header: <span className="w-full block text-center">#</span>,
          size: 40,
          minSize: 40,
          enableResizing: false,
          className:
            "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
          headerClassName: "text-center w-[40px] min-w-[40px]",
          cell: (_, idx) => <span>{idx}</span>,
        },
        // 2. Ngày dự kiến
        {
          key: "dateKey",
          header: scheduleHeaderFilter(
            "dateKey",
            t("debts:horizonDrawer.forecastColDate", "Ngày dự kiến"),
          ),
          size: 160,
          minSize: 130,
          enableResizing: true,
          cell: (row) => {
            const isOverdue = row.dateKey === "OVERDUE";
            return (
              <div className="flex items-center gap-1.5 font-medium">
                {isOverdue && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                )}
                <span
                  className={cn(
                    "font-mono text-xs",
                    isOverdue
                      ? "text-amber-800 dark:text-amber-300 font-semibold"
                      : "text-foreground",
                  )}
                >
                  {row.displayDate}
                </span>
              </div>
            );
          },
        },
        // 3. Dự thu (receivable)
        {
          key: "receivable",
          className: "text-right",
          header: scheduleHeaderFilter.amount(
            "receivable",
            t("debts:horizonDrawer.forecastColReceivable", "Dự thu"),
          ),
          size: 140,
          minSize: 120,
          enableResizing: true,
          cell: (row) => (
            <span className="tabular-nums font-mono font-semibold text-xs text-emerald-600 dark:text-emerald-400">
              {row.receivable > 0 ? money(row.receivable) : "—"}
            </span>
          ),
        },
        // 4. Dự chi (payable)
        {
          key: "payable",
          className: "text-right",
          header: scheduleHeaderFilter.amount(
            "payable",
            t("debts:horizonDrawer.forecastColPayable", "Dự chi"),
          ),
          size: 140,
          minSize: 120,
          enableResizing: true,
          cell: (row) => (
            <span className="tabular-nums font-mono font-semibold text-xs text-amber-700 dark:text-amber-400">
              {row.payable > 0 ? money(row.payable) : "—"}
            </span>
          ),
        },
        // 5. Vị thế ròng (net)
        {
          key: "net",
          className: "text-right",
          header: scheduleHeaderFilter.amount(
            "net",
            t("debts:horizonDrawer.forecastColNet", "Vị thế ròng"),
          ),
          size: 150,
          minSize: 130,
          enableResizing: true,
          cell: (row) => (
            <span
              className={cn(
                "tabular-nums font-mono font-bold text-xs",
                row.net >= 0 ? "text-primary" : "text-destructive",
              )}
            >
              {row.net >= 0 ? "+" : ""}
              {money(row.net)}
            </span>
          ),
        },
        // 6. Số HĐ (invoiceCount)
        {
          key: "invoiceCount",
          className: "text-center",
          header: scheduleHeaderFilter.numeric(
            "invoiceCount",
            t("debts:horizonDrawer.forecastColInvoices", "Số HĐ"),
          ),
          size: 90,
          minSize: 80,
          enableResizing: true,
          cell: (row) => (
            <span className="tabular-nums font-mono text-xs text-muted-foreground">
              {row.invoiceCount}
            </span>
          ),
        },
      ];
    }, [scheduleHeaderFilter, t]);

  // Subtotal Summary Row for Schedule Table
  const scheduleSummaryRow = useMemo(() => {
    if (!filteredSortedScheduleRows.length) return undefined;

    let totRec = 0;
    let totPay = 0;
    let totNet = 0;
    let totCount = 0;

    for (const r of filteredSortedScheduleRows) {
      totRec += r.receivable || 0;
      totPay += r.payable || 0;
      totNet += r.net || 0;
      totCount += r.invoiceCount || 0;
    }

    return {
      dateKey: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
        />
      ),
      receivable: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:horizonDrawer.forecastColReceivable", "Dự thu")}
          itemTitle={t("debts:horizonDrawer.daysUnit", "ngày")}
          subtotalAmount={totRec}
          grandTotalAmount={totRec}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
          valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
        />
      ),
      payable: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:horizonDrawer.forecastColPayable", "Dự chi")}
          itemTitle={t("debts:horizonDrawer.daysUnit", "ngày")}
          subtotalAmount={totPay}
          grandTotalAmount={totPay}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
          valueClassName="text-amber-700 dark:text-amber-400 font-bold"
        />
      ),
      net: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:horizonDrawer.forecastColNet", "Vị thế ròng")}
          itemTitle={t("debts:horizonDrawer.daysUnit", "ngày")}
          subtotalAmount={totNet}
          grandTotalAmount={totNet}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
          valueClassName={cn(
            "font-bold",
            totNet >= 0 ? "text-primary" : "text-destructive",
          )}
        />
      ),
      invoiceCount: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("debts:horizonDrawer.forecastColInvoices", "Số HĐ")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalQty={totCount}
          grandTotalQty={totCount}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
          valueClassName="text-muted-foreground font-bold"
        />
      ),
    };
  }, [filteredSortedScheduleRows, forecastScheduleRows.length, t]);

  // E. Ticket Size Pareto Donut Chart items (<10M, 10-50M, 50-100M, >100M)
  const ticketSizeDonutItems = useMemo(() => {
    const tsb = summary?.ticketSizeBuckets;
    if (!tsb) return [];
    const under10m = isReceivable
      ? tsb.outUnder10mAmount
      : tsb.inUnder10mAmount;
    const u10Count = isReceivable ? tsb.outUnder10mCount : tsb.inUnder10mCount;
    const from10to50m = isReceivable
      ? tsb.out10mTo50mAmount
      : tsb.in10mTo50mAmount;
    const f10Count = isReceivable ? tsb.out10mTo50mCount : tsb.in10mTo50mCount;
    const from50to100m = isReceivable
      ? tsb.out50mTo100mAmount
      : tsb.in50mTo100mAmount;
    const f50Count = isReceivable
      ? tsb.out50mTo100mCount
      : tsb.in50mTo100mCount;
    const over100m = isReceivable
      ? tsb.outOver100mAmount
      : tsb.inOver100mAmount;
    const overCount = isReceivable ? tsb.outOver100mCount : tsb.inOver100mCount;

    return [
      {
        id: "under10m",
        label: `${t("debts:horizonDrawer.ticketSizeUnder10m", "< 10 triệu")} (${u10Count} HĐ)`,
        value: under10m,
        color: "#10b981",
      },
      {
        id: "10mTo50m",
        label: `${t("debts:horizonDrawer.ticketSize10mTo50m", "10 - 50 triệu")} (${f10Count} HĐ)`,
        value: from10to50m,
        color: "#0284c7",
      },
      {
        id: "50mTo100m",
        label: `${t("debts:horizonDrawer.ticketSize50mTo100m", "50 - 100 triệu")} (${f50Count} HĐ)`,
        value: from50to100m,
        color: "#f59e0b",
      },
      {
        id: "over100m",
        label: `${t("debts:horizonDrawer.ticketSizeOver100m", "> 100 triệu")} (${overCount} HĐ)`,
        value: over100m,
        color: "#ef4444",
      },
    ].filter((x) => x.value > 0);
  }, [summary?.ticketSizeBuckets, isReceivable, t]);

  // F. Branch Breakdown Bar Chart Data
  const branchBarData = useMemo(() => {
    const branches = summary?.branchBreakdown || [];
    if (!branches.length) return null;

    const labels = branches.map((b) =>
      b.branchId === "UNASSIGNED"
        ? t("debts:horizonDrawer.unassignedBranch", "Chưa phân chi nhánh")
        : b.branchName || b.branchCode || b.branchId,
    );
    const data = branches.map((b) => (isReceivable ? b.outAmount : b.inAmount));

    return {
      labels,
      datasets: [
        {
          label: isReceivable
            ? t("debts:horizonDrawer.tabReceivablesShort", "Phải thu")
            : t("debts:horizonDrawer.tabPayablesShort", "Phải trả"),
          data,
          color: isReceivable ? "#10b981" : "#f59e0b",
        },
      ],
    };
  }, [summary?.branchBreakdown, isReceivable, t]);

  // G. Top Partners Concentration Horizontal/Ranked Bar Data
  const topPartnersBarData = useMemo(() => {
    const partners =
      direction === "OUT"
        ? summary?.topReceivablePartners || []
        : summary?.topPayablePartners || [];
    if (!partners.length) return null;

    const labels = partners.map((p) => {
      const name = p.partnerName || p.taxCode;
      return name.length > 20 ? name.slice(0, 18) + "..." : name;
    });
    const data = partners.map((p) =>
      p.contributingAmount !== undefined
        ? p.contributingAmount
        : p.balanceAmount,
    );

    return {
      labels,
      datasets: [
        {
          label: isReceivable
            ? t("debts:horizonDrawer.tabReceivablesShort", "Phải thu")
            : t("debts:horizonDrawer.tabPayablesShort", "Phải trả"),
          data,
          color: isReceivable ? "#0284c7" : "#d97706",
        },
      ],
    };
  }, [
    summary?.topReceivablePartners,
    summary?.topPayablePartners,
    direction,
    isReceivable,
    t,
  ]);

  // H. IFRS 9 Exposure Comparison Bar Data (Tổng Nợ vs Tiền kỳ vọng vs Dự phòng rủi ro)
  const ifrs9ComparisonData = useMemo(() => {
    const aging = summary?.agingBreakdown;
    if (!aging) return null;
    const isRiskHorizon = horizon === "defaultRiskProvision";

    const labels = ["≤ 30 ngày", "31 - 60 ngày", "61 - 90 ngày", "> 90 ngày"];
    const outAging = [
      aging.outAging0_30 || 0,
      aging.outAging31_60 || 0,
      aging.outAging61_90 || 0,
      aging.outAgingOver90 || 0,
    ];
    const inAging = [
      aging.inAging0_30 || 0,
      aging.inAging31_60 || 0,
      aging.inAging61_90 || 0,
      aging.inAgingOver90 || 0,
    ];
    const balanceData = isReceivable ? outAging : inAging;

    const expectedWeights = isReceivable
      ? [0.85, 0.6, 0.3, 0.1]
      : [0.95, 0.85, 0.7, 0.5];
    const riskWeights = isReceivable
      ? [0.15, 0.4, 0.7, 0.9]
      : [0.05, 0.15, 0.3, 0.5];

    const expectedData = balanceData.map((b, i) =>
      Math.round(b * expectedWeights[i]),
    );
    const riskData = balanceData.map((b, i) => Math.round(b * riskWeights[i]));

    return {
      labels,
      datasets: isRiskHorizon
        ? [
            {
              label: "Tổng dư nợ gốc",
              data: balanceData,
              color: "#94a3b8",
            },
            {
              label: "Dự phòng rủi ro (IFRS 9)",
              data: riskData,
              color: "#ef4444",
            },
          ]
        : [
            {
              label: "Tổng dư nợ gốc",
              data: balanceData,
              color: "#94a3b8",
            },
            {
              label: "Dòng tiền kỳ vọng (IFRS 9)",
              data: expectedData,
              color: "#10b981",
            },
          ],
    };
  }, [summary?.agingBreakdown, isReceivable, horizon]);

  // Aging Donut Chart items
  const agingDonutItems = useMemo(() => {
    const aging = summary?.agingBreakdown;
    const a0_30 = isReceivable
      ? aging?.outAging0_30 || 0
      : aging?.inAging0_30 || 0;
    const a31_60 = isReceivable
      ? aging?.outAging31_60 || 0
      : aging?.inAging31_60 || 0;
    const a61_90 = isReceivable
      ? aging?.outAging61_90 || 0
      : aging?.inAging61_90 || 0;
    const aOver90 = isReceivable
      ? aging?.outAgingOver90 || 0
      : aging?.inAgingOver90 || 0;
    const totalBal = a0_30 + a31_60 + a61_90 + aOver90;

    return [
      {
        id: "aging0_30",
        label: t("debts:drawer.aging0_30", "0 - 30 ngày (Trong hạn)"),
        value: a0_30,
        color: "#10b981",
      },
      {
        id: "aging31_60",
        label: t("debts:drawer.aging31_60", "31 - 60 ngày (Cần theo dõi)"),
        value: a31_60,
        color: "#f59e0b",
      },
      {
        id: "aging61_90",
        label: t("debts:drawer.aging61_90", "61 - 90 ngày (Quá hạn)"),
        value: a61_90,
        color: "#f97316",
      },
      {
        id: "agingOver90",
        label: t(
          "debts:drawer.agingOver90",
          "> 90 ngày (Quá hạn nghiêm trọng)",
        ),
        value: aOver90,
        color: "#ef4444",
      },
    ].filter((item) => item.value > 0 || totalBal === 0);
  }, [summary?.agingBreakdown, isReceivable, t]);

  // 5. Monthly Breakdown Matrix for Analytics Tab
  const monthlyBreakdownStats: MonthlyBreakdownRow[] = useMemo(() => {
    const trendList = summary?.monthlyTrend || [];
    const sorted = [...trendList].sort((a, b) =>
      b.month.localeCompare(a.month),
    );

    return sorted.map((item) => {
      const [year, month] = item.month.split("-");
      const totalAmount = isReceivable ? item.outTotal : item.inTotal;
      const paidAmount = isReceivable ? item.outPaid : item.inPaid;
      const balanceAmount = isReceivable ? item.outBalance : item.inBalance;
      const rate =
        totalAmount > 0
          ? Math.min(100, Math.round((paidAmount / totalAmount) * 100))
          : 0;

      return {
        month: item.month,
        monthLabel: `Thg ${month}/${year}`,
        invoiceCount: item.invoiceCount,
        totalAmount,
        paidAmount,
        balanceAmount,
        rate,
      };
    });
  }, [summary?.monthlyTrend, isReceivable]);

  // Table state for Monthly Breakdown Table (Analytics Tab)
  const monthlyTableState = useTableColumnState(
    `time-horizon-monthly-${horizon || "unknown"}`,
  );

  const monthlyHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: monthlyTableState,
        items: monthlyBreakdownStats,
        defaultAlign: "center",
      }),
    [monthlyTableState, monthlyBreakdownStats],
  );

  const filteredSortedMonthlyRows = useMemo(() => {
    return filterClientItems(monthlyBreakdownStats, monthlyTableState, {
      dateField: "month",
    });
  }, [monthlyBreakdownStats, monthlyTableState]);

  const monthlyColumns: DataTableColumn<MonthlyBreakdownRow>[] = useMemo(() => {
    return [
      // 1. STT (#) - 40px, Center aligned, 1-based index via {idx}
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        enableResizing: false,
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => <span>{idx}</span>,
      },
      // 2. Tháng (month)
      {
        key: "month",
        header: monthlyHeaderFilter.month(
          "month",
          t("debts:horizonDrawer.colMonth", "Tháng"),
        ),
        size: 130,
        minSize: 110,
        enableResizing: true,
        cell: (row) => (
          <span className="font-mono text-xs font-semibold text-foreground">
            {row.monthLabel}
          </span>
        ),
      },
      // 3. Số lượng HĐ (invoiceCount)
      {
        key: "invoiceCount",
        className: "text-center",
        header: monthlyHeaderFilter.numeric(
          "invoiceCount",
          t("debts:horizonDrawer.colInvoiceCount", "Số lượng HĐ"),
        ),
        size: 120,
        minSize: 100,
        enableResizing: true,
        cell: (row) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.invoiceCount}
          </span>
        ),
      },
      // 4. Tổng phát sinh (totalAmount)
      {
        key: "totalAmount",
        className: "text-right",
        header: monthlyHeaderFilter.amount(
          "totalAmount",
          t("debts:horizonDrawer.colTotalAmount", "Tổng phát sinh"),
        ),
        size: 160,
        minSize: 130,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono font-medium text-xs text-foreground">
            {money(row.totalAmount)}
          </span>
        ),
      },
      // 5. Đã thu / Đã trả (paidAmount)
      {
        key: "paidAmount",
        className: "text-right",
        header: monthlyHeaderFilter.amount(
          "paidAmount",
          direction === "OUT"
            ? t("debts:horizonDrawer.colPaidOut", "Đã thu")
            : t("debts:horizonDrawer.colPaidIn", "Đã trả"),
        ),
        size: 160,
        minSize: 130,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono font-semibold text-xs text-emerald-600 dark:text-emerald-400">
            {money(row.paidAmount)}
          </span>
        ),
      },
      // 6. Còn nợ (balanceAmount)
      {
        key: "balanceAmount",
        className: "text-right",
        header: monthlyHeaderFilter.amount(
          "balanceAmount",
          t("debts:horizonDrawer.colBalanceAmount", "Còn nợ"),
        ),
        size: 160,
        minSize: 130,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
            {money(row.balanceAmount)}
          </span>
        ),
      },
      // 7. Tỷ lệ hoàn tất (rate)
      {
        key: "rate",
        className: "text-center",
        header: monthlyHeaderFilter.numeric(
          "rate",
          t("debts:horizonDrawer.colCompletionRate", "Tỷ lệ hoàn tất"),
        ),
        size: 130,
        minSize: 110,
        enableResizing: true,
        cell: (row) => (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold inline-block",
              row.rate >= 90
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50"
                : row.rate >= 50
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50",
            )}
          >
            {row.rate}%
          </span>
        ),
      },
    ];
  }, [monthlyHeaderFilter, direction, t]);

  // Subtotal Summary Row for Monthly Breakdown Table
  const monthlySummaryRow = useMemo(() => {
    if (!filteredSortedMonthlyRows.length) return undefined;

    let totCount = 0;
    let totTotal = 0;
    let totPaid = 0;
    let totBalance = 0;

    for (const r of filteredSortedMonthlyRows) {
      totCount += r.invoiceCount || 0;
      totTotal += r.totalAmount || 0;
      totPaid += r.paidAmount || 0;
      totBalance += r.balanceAmount || 0;
    }

    const avgRate =
      totTotal > 0 ? Math.min(100, Math.round((totPaid / totTotal) * 100)) : 0;

    return {
      month: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
        />
      ),
      invoiceCount: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("debts:horizonDrawer.colInvoiceCount", "Số lượng HĐ")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalQty={totCount}
          grandTotalQty={totCount}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-muted-foreground font-bold"
        />
      ),
      totalAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t(
            "debts:horizonDrawer.colTotalAmount",
            "Tổng phát sinh",
          )}
          itemTitle={t("debts:horizonDrawer.unitMonth", "tháng")}
          subtotalAmount={totTotal}
          grandTotalAmount={totTotal}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-foreground font-semibold"
        />
      ),
      paidAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={
            direction === "OUT"
              ? t("debts:horizonDrawer.colPaidOut", "Đã thu")
              : t("debts:horizonDrawer.colPaidIn", "Đã trả")
          }
          itemTitle={t("debts:horizonDrawer.unitMonth", "tháng")}
          subtotalAmount={totPaid}
          grandTotalAmount={totPaid}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-emerald-600 dark:text-emerald-400 font-semibold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:horizonDrawer.colBalanceAmount", "Còn nợ")}
          itemTitle={t("debts:horizonDrawer.unitMonth", "tháng")}
          subtotalAmount={totBalance}
          grandTotalAmount={totBalance}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-amber-600 dark:text-amber-400 font-bold"
        />
      ),
      rate: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${avgRate}%`}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-foreground font-bold"
        />
      ),
    };
  }, [filteredSortedMonthlyRows, monthlyBreakdownStats.length, direction, t]);

  // Reusable Monthly Matrix Section Component
  const monthlyTableSection = (
    <DrawerSection
      title={
        <div className="flex items-center justify-between w-full pr-2">
          <span>
            {t(
              "debts:horizonDrawer.monthlyMatrixTitle",
              "Bảng kê tổng hợp phát sinh & dư nợ theo tháng",
            )}{" "}
            ({filteredSortedMonthlyRows.length} / {monthlyBreakdownStats.length}
            )
          </span>
          {monthlyTableState.activeFilterCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                monthlyTableState.resetFilters();
              }}
              className="h-5 px-1.5 text-[10px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded border border-destructive/20 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>
                {t("common:clearFilters", "Xóa bộ lọc")} (
                {monthlyTableState.activeFilterCount})
              </span>
            </button>
          )}
        </div>
      }
      collapsible
      defaultCollapsed={false}
      bodyClassName="p-0"
    >
      <DataTable<MonthlyBreakdownRow>
        tableId="time-horizon-monthly-breakdown-table"
        items={filteredSortedMonthlyRows}
        columns={monthlyColumns}
        variant="spreadsheet"
        enableColumnResizing={true}
        getRowKey={(r) => r.month}
        summaryRow={monthlySummaryRow}
        containerClassName="max-h-[380px] overflow-y-auto scrollbar-thin"
        emptyLabel={t(
          "debts:horizonDrawer.emptyMonthlyData",
          "Không có dữ liệu tháng nào khớp với bộ lọc",
        )}
      />
    </DrawerSection>
  );

  // Column Header Filter Builder
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items,
        defaultAlign: "center",
      }),
    [tableState, items],
  );

  // Table Columns Definition according to /standardize-table
  const columns: DataTableColumn<TimeHorizonInvoiceItem>[] = useMemo(() => {
    const isForecast =
      horizon === "forecastNext7Days" || horizon === "forecastNext30Days";
    const isExpected = horizon === "expectedCashflow";
    const isRisk = horizon === "defaultRiskProvision";

    // Current date string in YYYY-MM-DD to check overdue status
    const todayStr = new Date().toISOString().slice(0, 10);

    return [
      // 1. STT (#) - 40px, Center aligned, 1-based index via {idx}
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        enableResizing: false,
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => <span>{idx}</span>,
      },

      // 2. Số / Ký hiệu HĐ (invoiceNo + serialNo) - Gom 2 dòng chuẩn erp-invoice
      {
        key: "invoiceNo",
        header: headerFilter(
          "invoiceNo",
          t("debts:horizonDrawer.invoiceNoAndSerial", "Số / Ký hiệu HĐ"),
        ),
        size: 140,
        minSize: 120,
        enableResizing: true,
        cell: (row) => {
          const invNo = row.invoiceNo?.trim() || "";
          const sNo = row.serialNo?.trim() || "";
          if (!invNo && !sNo)
            return <span className="text-muted-foreground">—</span>;

          const handleOpenDetail = (e: React.MouseEvent) => {
            e.stopPropagation();
            formHook.openInternal(row as any);
          };

          return (
            <div className="flex items-center gap-1.5 w-full min-w-0">
              <Tooltip
                content={t("debts:viewInvoiceDetail", "Xem chi tiết hóa đơn")}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-muted/60 hover:text-primary rounded-xs transition-all focus:ring-0 focus-visible:ring-0 focus:outline-none"
                  onClick={handleOpenDetail}
                  aria-label="Xem chi tiết"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>

              <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
                {/* Dòng 1: Số HĐ bold primary */}
                <div className="flex items-center gap-1 min-w-0 group/invno">
                  <Tooltip content={`Số HĐ: ${invNo || "—"}`}>
                    <span
                      className="truncate text-xs font-semibold text-primary leading-tight select-text cursor-pointer hover:underline"
                      onClick={handleOpenDetail}
                    >
                      {invNo || "—"}
                    </span>
                  </Tooltip>
                  {invNo && (
                    <CopyButton
                      value={invNo}
                      tooltip="Copy Số HĐ"
                      copiedTooltip="Đã copy"
                      toastMessage="Đã copy Số HĐ"
                      toastId={`inv-no-${row.id}`}
                      iconClassName="w-2.5 h-2.5"
                      className="h-3.5 w-3.5 p-0 opacity-0 group-hover/invno:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                    />
                  )}
                </div>

                {/* Dòng 2: Ký hiệu HĐ mono muted */}
                {sNo && (
                  <div className="flex items-center gap-1 min-w-0 group/serial">
                    <Tooltip content={`Ký hiệu: ${sNo}`}>
                      <span className="truncate text-[11px] font-normal font-mono text-muted-foreground leading-tight select-text">
                        {sNo}
                      </span>
                    </Tooltip>
                    <CopyButton
                      value={sNo}
                      tooltip="Copy Ký hiệu"
                      copiedTooltip="Đã copy"
                      toastMessage="Đã copy Ký hiệu HĐ"
                      toastId={`inv-sno-${row.id}`}
                      iconClassName="w-2.5 h-2.5"
                      className="h-3 w-3 p-0 opacity-0 group-hover/serial:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        },
      },

      // 3. Đối tác / MST (partnerName + taxCode) - Gom 2 dòng chuẩn erp-invoice
      {
        key: "partnerName",
        header: headerFilter(
          "partnerName",
          direction === "IN"
            ? t("debts:horizonDrawer.partnerSellerAndTax", "Bên bán / MST")
            : t("debts:horizonDrawer.partnerBuyerAndTax", "Bên mua / MST"),
        ),
        size: 240,
        minSize: 190,
        enableResizing: true,
        cell: (row) => {
          const pName = row.partnerName?.trim() || "";
          const rawTax = row.taxCode?.trim() || "";
          const hasTax = Boolean(rawTax && rawTax !== "KHONG_MST");
          const taxText = rawTax === "KHONG_MST" ? "Không có MST" : rawTax;

          const handleOpenPartner = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (rawTax) {
              onOpenPartnerDetail?.(rawTax, pName);
            }
          };

          return (
            <div className="flex items-center gap-1.5 w-full min-w-0">
              <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
                {/* Dòng 1: Tên đối tác */}
                <div className="flex items-center gap-1 min-w-0 group/pname">
                  <Tooltip content={pName || "—"}>
                    <span
                      className={cn(
                        "truncate text-xs font-semibold leading-tight select-text",
                        hasTax
                          ? "text-slate-800 dark:text-slate-200 cursor-pointer hover:text-primary hover:underline"
                          : "text-foreground",
                      )}
                      onClick={hasTax ? handleOpenPartner : undefined}
                    >
                      {pName || "—"}
                    </span>
                  </Tooltip>
                  {pName && pName !== "—" && (
                    <CopyButton
                      value={pName}
                      tooltip="Copy tên"
                      copiedTooltip="Đã copy"
                      toastMessage="Đã copy tên đối tác"
                      toastId={`partner-name-${row.id}`}
                      iconClassName="w-2.5 h-2.5"
                      className="h-3.5 w-3.5 p-0 opacity-0 group-hover/pname:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                    />
                  )}
                </div>

                {/* Dòng 2: MST */}
                {rawTax && (
                  <div className="flex items-center gap-1 min-w-0 group/tax">
                    <Tooltip content={`MST: ${taxText}`}>
                      <span className="truncate text-[11px] font-normal font-mono text-muted-foreground leading-tight select-text">
                        <span className="text-slate-400 font-sans mr-0.5">
                          MST:
                        </span>
                        {taxText}
                      </span>
                    </Tooltip>
                    {hasTax && (
                      <CopyButton
                        value={rawTax}
                        tooltip="Copy MST"
                        copiedTooltip="Đã copy"
                        toastMessage="Đã copy MST"
                        toastId={`partner-tax-${row.id}`}
                        iconClassName="w-2.5 h-2.5"
                        className="h-3 w-3 p-0 opacity-0 group-hover/tax:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },

      // 4. Ngày HĐ (invoiceDate) - TableDateCell right aligned
      {
        key: "invoiceDate",
        className: "text-right",
        header: headerFilter.date(
          "invoiceDate",
          t("debts:drawer.invoiceDate", "Ngày HĐ"),
        ),
        size: 110,
        minSize: 100,
        enableResizing: true,
        cell: (row) => (
          <TableDateCell
            date={row.invoiceDate}
            format="date"
            className="justify-end w-full"
          />
        ),
      },

      // 5. Cột Dự báo: Độ trễ TB & Ngày dự kiến thu/trả (Đưa lên vị trí trung tâm!)
      ...(isForecast
        ? [
            // Độ trễ TB đối tác (partnerAvgLagDays)
            {
              key: "partnerAvgLagDays",
              className: "text-center",
              header: headerFilter.numeric(
                "partnerAvgLagDays",
                t("debts:horizonDrawer.partnerAvgLag", "Độ trễ TB"),
              ),
              size: 100,
              minSize: 90,
              enableResizing: true,
              cell: (row: TimeHorizonInvoiceItem) => {
                const lag = row.partnerAvgLagDays ?? 30;
                return (
                  <span className="font-mono text-xs text-muted-foreground">
                    {lag} ngày
                  </span>
                );
              },
            },
            // Ngày dự kiến thu/trả (estimatedSettlementDate)
            {
              key: "estimatedSettlementDate",
              className: "text-right",
              header: headerFilter.date(
                "estimatedSettlementDate",
                t(
                  "debts:horizonDrawer.estimatedSettlementDate",
                  "Dự kiến thu/trả",
                ),
              ),
              size: 130,
              minSize: 115,
              enableResizing: true,
              cell: (row: TimeHorizonInvoiceItem) => {
                const isOverdue =
                  row.estimatedSettlementDate &&
                  row.estimatedSettlementDate < todayStr;
                return (
                  <div className="flex flex-col items-end gap-0.5 w-full">
                    <TableDateCell
                      date={row.estimatedSettlementDate}
                      format="date"
                      className={cn(
                        "justify-end w-full font-medium font-mono text-xs",
                        isOverdue
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-primary",
                      )}
                    />
                    {row.estimatedSettlementDate && (
                      <span
                        className={cn(
                          "text-[9px] px-1 py-0 rounded font-medium inline-block",
                          isOverdue
                            ? "bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                        )}
                      >
                        {isOverdue
                          ? t("debts:horizonDrawer.overdueCarried", "Trôi sang")
                          : t("debts:horizonDrawer.normalLagBadge", "Trong kỳ")}
                      </span>
                    )}
                  </div>
                );
              },
            },
          ]
        : []),

      // 6. Tổng tiền (totalAmount)
      {
        key: "totalAmount",
        className: "text-right",
        header: headerFilter.amount(
          "totalAmount",
          t("debts:drawer.totalAmount", "Tổng tiền"),
        ),
        size: 130,
        minSize: 115,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
            {money(row.totalAmount)}
          </span>
        ),
      },

      // 7. Đã cấn trừ (paidAmount)
      {
        key: "paidAmount",
        className: "text-right",
        header: headerFilter.amount(
          "paidAmount",
          t("debts:drawer.paidAmount", "Đã cấn trừ"),
        ),
        size: 120,
        minSize: 105,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono font-medium text-xs text-emerald-700 dark:text-emerald-400">
            {money(row.paidAmount)}
          </span>
        ),
      },

      // 8. Tiền dự thu / Tiền dự chi / Còn nợ (balanceAmount)
      {
        key: "balanceAmount",
        className: "text-right",
        header: headerFilter.amount(
          "balanceAmount",
          direction === "OUT"
            ? t("debts:horizonDrawer.expectedAmountCol", "Tiền dự thu")
            : direction === "IN"
              ? t("debts:horizonDrawer.expectedPayableCol", "Tiền dự chi")
              : t("debts:drawer.balanceAmount", "Còn nợ"),
        ),
        size: 135,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <span
            className={cn(
              "tabular-nums font-mono font-bold text-xs",
              row.direction === "OUT"
                ? "text-rose-600 dark:text-rose-400"
                : "text-amber-700 dark:text-amber-400",
            )}
          >
            {money(row.balanceAmount)}
          </span>
        ),
      },

      // 9. Cột theo dõi mô hình IFRS 9 (nếu chọn thẻ Expected hoặc Risk)
      ...(isExpected
        ? [
            // Xác suất thu hồi (%)
            {
              key: "recoveryProbability",
              className: "text-center",
              header: headerFilter.numeric(
                "recoveryProbability",
                t(
                  "debts:horizonDrawer.recoveryProbability",
                  "Xác suất thu hồi",
                ),
              ),
              size: 145,
              minSize: 130,
              enableResizing: true,
              cell: (row: TimeHorizonInvoiceItem) => {
                const prob = row.recoveryProbability ?? 0;
                const colorCls =
                  prob >= 85
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : prob >= 60
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400"
                      : prob >= 30
                        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
                return (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0 font-semibold",
                      colorCls,
                    )}
                  >
                    {prob}%
                  </Badge>
                );
              },
            },
            // Tiền kỳ vọng
            {
              key: "expectedAmount",
              className: "text-right",
              header: headerFilter.amount(
                "expectedAmount",
                t("debts:horizonDrawer.expectedAmount", "Tiền kỳ vọng"),
              ),
              size: 135,
              minSize: 120,
              enableResizing: true,
              cell: (row: TimeHorizonInvoiceItem) => (
                <span className="tabular-nums font-mono font-bold text-xs text-primary">
                  {money(row.expectedAmount ?? 0)}
                </span>
              ),
            },
          ]
        : isRisk
          ? [
              // Tỷ lệ trích lập (%)
              {
                key: "riskProbability",
                className: "text-center",
                header: headerFilter.numeric(
                  "riskProbability",
                  t("debts:horizonDrawer.riskProbability", "Tỷ lệ trích lập"),
                ),
                size: 140,
                minSize: 125,
                enableResizing: true,
                cell: (row: TimeHorizonInvoiceItem) => {
                  const prob = row.riskProbability ?? 0;
                  const colorCls =
                    prob <= 15
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : prob <= 40
                        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                        : prob <= 70
                          ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
                  return (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0 font-semibold",
                        colorCls,
                      )}
                    >
                      {prob}%
                    </Badge>
                  );
                },
              },
              // Dự phòng rủi ro
              {
                key: "riskAmount",
                className: "text-right",
                header: headerFilter.amount(
                  "riskAmount",
                  t("debts:horizonDrawer.riskAmount", "Dự phòng rủi ro"),
                ),
                size: 135,
                minSize: 120,
                enableResizing: true,
                cell: (row: TimeHorizonInvoiceItem) => (
                  <span className="tabular-nums font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                    {money(row.riskAmount ?? 0)}
                  </span>
                ),
              },
            ]
          : []),

      // 10. Tuổi nợ (agingDays)
      {
        key: "agingDays",
        className: "text-center",
        header: headerFilter.numeric(
          "agingDays",
          t("debts:drawer.agingDays", "Tuổi nợ"),
        ),
        size: 100,
        minSize: 90,
        enableResizing: true,
        cell: (row) => {
          const aging = row.agingDays || 0;
          const isOver90 = aging > 90;
          const is61to90 = aging > 60 && aging <= 90;
          const is31to60 = aging > 30 && aging <= 60;
          const tagCls = isOver90
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : is61to90
              ? "bg-orange-50 text-orange-700 border-orange-200"
              : is31to60
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

          return (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 font-mono font-medium",
                tagCls,
              )}
            >
              {aging} ngày
            </Badge>
          );
        },
      },
    ];
  }, [headerFilter, formHook, onOpenPartnerDetail, horizon, direction, t]);

  // Grand totals across all pages for this horizon and direction
  const grandTotals = useMemo(() => {
    const trend = summary?.monthlyTrend || [];
    let grandTotal = 0;
    let grandPaid = 0;
    let grandBal = 0;

    for (const m of trend) {
      if (direction === "OUT") {
        grandTotal += Number(m.outTotal) || 0;
        grandPaid += Number(m.outPaid) || 0;
        grandBal += Number(m.outBalance) || 0;
      } else if (direction === "IN") {
        grandTotal += Number(m.inTotal) || 0;
        grandPaid += Number(m.inPaid) || 0;
        grandBal += Number(m.inBalance) || 0;
      } else {
        grandTotal += (Number(m.outTotal) || 0) + (Number(m.inTotal) || 0);
        grandPaid += (Number(m.outPaid) || 0) + (Number(m.inPaid) || 0);
        grandBal += (Number(m.outBalance) || 0) + (Number(m.inBalance) || 0);
      }
    }

    const fallbackBal =
      direction === "OUT"
        ? summary?.receivableAmount || 0
        : direction === "IN"
          ? summary?.payableAmount || 0
          : (summary?.receivableAmount || 0) + (summary?.payableAmount || 0);

    return {
      grandTotal: grandTotal || undefined,
      grandPaid: grandPaid || undefined,
      grandBal: grandBal || fallbackBal || undefined,
    };
  }, [summary, direction]);

  // Subtotal Summary Row for DataTable
  const summaryRow = useMemo(() => {
    if (!items || items.length === 0) return undefined;

    let subtotalTotal = 0;
    let subtotalPaid = 0;
    let subtotalBal = 0;
    let subtotalExp = 0;
    let subtotalRisk = 0;

    for (const inv of items) {
      subtotalTotal += Number(inv.totalAmount) || 0;
      subtotalPaid += Number(inv.paidAmount) || 0;
      subtotalBal += Number(inv.balanceAmount) || 0;
      subtotalExp += Number(inv.expectedAmount) || 0;
      subtotalRisk += Number(inv.riskAmount) || 0;
    }

    const isExpected = horizon === "expectedCashflow";
    const isRisk = horizon === "defaultRiskProvision";
    const activeGrandTotal =
      direction === "OUT"
        ? summary?.receivableAmount || 0
        : direction === "IN"
          ? summary?.payableAmount || 0
          : (summary?.receivableAmount || 0) + (summary?.payableAmount || 0);

    return {
      invoiceDate: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
        />
      ),
      totalAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.totalAmount", "Tổng giá trị hóa đơn")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalTotal}
          grandTotalAmount={grandTotals.grandTotal ?? subtotalTotal}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName="text-foreground font-bold"
        />
      ),
      paidAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.paidAmount", "Đã thanh toán / Cấn trừ")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalPaid}
          grandTotalAmount={grandTotals.grandPaid ?? subtotalPaid}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName="text-emerald-700 dark:text-emerald-400 font-bold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={
            direction === "OUT"
              ? t("debts:horizonDrawer.expectedAmountCol", "Tiền dự thu")
              : direction === "IN"
                ? t("debts:horizonDrawer.expectedPayableCol", "Tiền dự chi")
                : t("debts:drawer.balanceAmount", "Tổng nợ còn lại")
          }
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalBal}
          grandTotalAmount={
            isExpected || isRisk
              ? activeGrandTotal
              : (grandTotals.grandBal ?? activeGrandTotal ?? subtotalBal)
          }
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName="text-destructive font-bold"
        />
      ),
      ...(isExpected && {
        expectedAmount: (
          <SubtotalSummaryCell
            variantType="amount"
            metricTitle={t(
              "debts:horizonDrawer.expectedAmount",
              "Tiền kỳ vọng",
            )}
            itemTitle={t("debts:unitInvoice", "hóa đơn")}
            subtotalAmount={subtotalExp}
            grandTotalAmount={activeGrandTotal ?? subtotalExp}
            page={page}
            totalPages={totalPages}
            currentPageCount={items.length}
            totalCount={total}
            valueClassName="text-primary font-bold"
          />
        ),
      }),
      ...(isRisk && {
        riskAmount: (
          <SubtotalSummaryCell
            variantType="amount"
            metricTitle={t("debts:horizonDrawer.riskAmount", "Dự phòng rủi ro")}
            itemTitle={t("debts:unitInvoice", "hóa đơn")}
            subtotalAmount={subtotalRisk}
            grandTotalAmount={activeGrandTotal ?? subtotalRisk}
            page={page}
            totalPages={totalPages}
            currentPageCount={items.length}
            totalCount={total}
            valueClassName="text-rose-600 dark:text-rose-400 font-bold"
          />
        ),
      }),
    };
  }, [
    items,
    summary,
    grandTotals,
    page,
    totalPages,
    total,
    horizon,
    direction,
    t,
  ]);

  // Tab 1 Content: Embedded DataTable with Viewport Fit Height and sticky pagination
  const leftPanelContent = (
    <DrawerSection
      title={`${t("debts:horizonDrawer.invoicesList", "Danh sách hóa đơn chi tiết")} (${total})`}
      collapsible
      defaultCollapsed={false}
      className="p-2.5 mb-0 border border-border/80"
      bodyClassName="p-0"
    >
      <div className="h-[calc(100vh-275px)] min-h-[320px] max-h-[calc(100vh-275px)] flex flex-col overflow-hidden bg-white dark:bg-slate-900 rounded-lg">
        <DataTable<TimeHorizonInvoiceItem>
          tableId="time-horizon-invoices-table"
          items={items}
          columns={columns}
          variant="spreadsheet"
          enableColumnResizing={true}
          getRowKey={(r) => r.id}
          loading={isLoading || isFetching}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPage={(p) => setPage(p)}
          onPageSize={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          summaryRow={summaryRow}
          containerClassName="flex-1 min-h-0"
          paginationClassName="mt-2 shrink-0 px-2 py-1.5 border-t border-border/50 bg-muted/20"
          emptyLabel={t(
            "debts:horizonDrawer.emptyInvoices",
            "Không tìm thấy hóa đơn nào trong mốc thời gian này",
          )}
        />
      </div>
    </DrawerSection>
  );

  // Tab 2 Content: Context-Aware Analytics
  // 1. isForecastHorizon (T+7, T+30): Daily Timeline BarChart + Cumulative Line + Donut (Maturity) + Schedule Table
  // 2. isIfrs9Horizon (Expected, Risk): IFRS 9 Exposure BarChart + Ticket Size Pareto Donut + Top Risk Partners + Branch Breakdown + Monthly Table
  // 3. isAgingHorizon (Historical Aging): Top Partners BarChart + Ticket Size Pareto Donut + Branch Breakdown + Sub-Aging Donut + Monthly Table
  const analyticsContent = (
    <div className="space-y-4 pb-2">
      {isForecastHorizon ? (
        // ═══════════════════════════════════════════════════
        // MODE 1: DỰ BÁO THUẬT TOÁN (T+7 / T+30 DAILY TIMELINE)
        // ═══════════════════════════════════════════════════
        <>
          {/* HÀNG 1: BIỂU ĐỒ LỊCH TRÌNH THU/CHI THEO NGÀY */}
          <DrawerSection
            title={t(
              "debts:horizonDrawer.forecastDailyTimelineTitle",
              "Lịch trình Dự thu / Dự chi theo Ngày",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <div className="relative h-[260px] w-full pt-1">
              {isLoading || isFetching ? (
                <ChartSkeleton />
              ) : dailyForecastBarData ? (
                <BarChart
                  labels={dailyForecastBarData.labels}
                  stacked={false}
                  showLegend={true}
                  yCallback={(v) => money(Number(v))}
                  datasets={dailyForecastBarData.datasets}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                  <Calendar className="w-8 h-8 opacity-30" />
                  <span>
                    {t("common:noData", "Chưa có dữ liệu dự báo theo ngày")}
                  </span>
                </div>
              )}
            </div>
          </DrawerSection>

          {/* HÀNG 2: GRID 3:1 — DÒNG TIỀN TÍCH LŨY + CƠ CẤU NGUỒN TIỀN DỰ BÁO */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            {/* CỘT 1 (3/4): DÒNG TIỀN DỰ BÁO TÍCH LŨY & VỊ THẾ RÒNG */}
            <div className="xl:col-span-3">
              <DrawerSection
                title={t(
                  "debts:horizonDrawer.forecastCumulativeTitle",
                  "Dòng tiền Dự báo Tích lũy & Vị thế Ròng",
                )}
                collapsible
                defaultCollapsed={false}
              >
                <div className="relative h-[240px] w-full pt-1">
                  {isLoading || isFetching ? (
                    <ChartSkeleton />
                  ) : cumulativeForecastData ? (
                    <LineChart
                      labels={cumulativeForecastData.labels}
                      datasets={cumulativeForecastData.datasets}
                      showLegend={true}
                      yCallback={(v) => money(Number(v))}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                      <TrendingUp className="w-8 h-8 opacity-30" />
                      <span>
                        {t("common:noData", "Chưa có dữ liệu dự báo")}
                      </span>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </div>

            {/* CỘT 2 (1/4): CƠ CẤU NGUỒN TIỀN DỰ BÁO (Donut) */}
            <div className="xl:col-span-1">
              <DrawerSection
                title={t(
                  "debts:horizonDrawer.forecastCompositionTitle",
                  "Cơ cấu Nguồn Tiền Dự báo",
                )}
                collapsible
                defaultCollapsed={false}
              >
                <div className="flex flex-col justify-center gap-2 h-[240px] w-full pt-1">
                  {forecastCompositionItems.length > 0 &&
                  forecastCompositionItems.some((x) => x.value > 0) ? (
                    <>
                      <div className="relative h-[130px]">
                        <DonutChart
                          items={forecastCompositionItems}
                          cutout="65%"
                          valueFormatter={(v) => money(Number(v))}
                        />
                      </div>
                      <div className="text-[11px]">
                        <DonutLegend
                          items={forecastCompositionItems}
                          valueFormatter={(v) => money(Number(v))}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-4 gap-2">
                      <CheckCircle2 className="w-9 h-9 text-emerald-500/80" />
                      <div className="text-xs text-muted-foreground">
                        Không có dữ liệu cơ cấu
                      </div>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </div>
          </div>

          {/* HÀNG 3: BẢNG KÊ LỊCH TRÌNH THU/CHI DỰ KIẾN THEO NGÀY */}
          <DrawerSection
            title={
              <div className="flex items-center justify-between w-full pr-2">
                <span>
                  {t(
                    "debts:horizonDrawer.forecastScheduleTableTitle",
                    "Bảng Kê Lịch Trình Thu/Chi Dự Kiến theo Ngày",
                  )}{" "}
                  ({filteredSortedScheduleRows.length} /{" "}
                  {forecastScheduleRows.length})
                </span>
                {scheduleTableState.activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scheduleTableState.resetFilters();
                    }}
                    className="h-5 px-1.5 text-[10px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded border border-destructive/20 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>
                      {t("common:clearFilters", "Xóa bộ lọc")} (
                      {scheduleTableState.activeFilterCount})
                    </span>
                  </button>
                )}
              </div>
            }
            collapsible
            defaultCollapsed={false}
            bodyClassName="p-0"
          >
            <DataTable<ForecastScheduleRow>
              tableId="time-horizon-forecast-schedule-table"
              items={filteredSortedScheduleRows}
              columns={scheduleColumns}
              variant="spreadsheet"
              enableColumnResizing={true}
              getRowKey={(r) => r.dateKey}
              summaryRow={scheduleSummaryRow}
              containerClassName="max-h-[380px] overflow-y-auto scrollbar-thin"
              emptyLabel={t(
                "debts:horizonDrawer.emptySchedule",
                "Không có dòng lịch trình nào khớp với bộ lọc",
              )}
            />
          </DrawerSection>
        </>
      ) : isIfrs9Horizon ? (
        // ═══════════════════════════════════════════════════
        // MODE 2: MÔ HÌNH IFRS 9 (KỲ VỌNG THU HỒI & DỰ PHÒNG RỦI RO)
        // ═══════════════════════════════════════════════════
        <>
          {/* HÀNG 1: GRID 3:1 — MA TRẬN BÓC TÁCH IFRS 9 + CƠ CẤU QUY MÔ HÓA ĐƠN PARETO */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            {/* CỘT 1 (3/4): MA TRẬN BÓC TÁCH IFRS 9 THEO NHÓM TUỔI NỢ */}
            <div className="xl:col-span-3">
              <DrawerSection
                title={t(
                  "debts:horizonDrawer.riskExposureTitle",
                  "Ma trận Bóc tách Rủi ro Khó đòi & Trích lập IFRS 9",
                )}
                collapsible
                defaultCollapsed={false}
              >
                <div className="relative h-[250px] w-full pt-1">
                  {isLoading || isFetching ? (
                    <ChartSkeleton />
                  ) : ifrs9ComparisonData ? (
                    <BarChart
                      labels={ifrs9ComparisonData.labels}
                      stacked={false}
                      showLegend={true}
                      yCallback={(v) => money(Number(v))}
                      datasets={ifrs9ComparisonData.datasets}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                      <ShieldAlert className="w-8 h-8 opacity-30" />
                      <span>
                        {t("common:noData", "Chưa có dữ liệu bóc tách IFRS 9")}
                      </span>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </div>

            {/* CỘT 2 (1/4): PHÂN TẦNG QUY MÔ HÓA ĐƠN PARETO 80/20 */}
            <div className="xl:col-span-1">
              <DrawerSection
                title={t(
                  "debts:horizonDrawer.ticketSizeTitle",
                  "Cơ cấu Quy mô Hóa đơn (Pareto 80/20)",
                )}
                collapsible
                defaultCollapsed={false}
              >
                <div className="flex flex-col justify-center gap-2 h-[250px] w-full pt-1">
                  {ticketSizeDonutItems.length > 0 ? (
                    <>
                      <div className="relative h-[135px]">
                        <DonutChart
                          items={ticketSizeDonutItems}
                          cutout="65%"
                          valueFormatter={(v) => money(Number(v))}
                        />
                      </div>
                      <div className="text-[11px]">
                        <DonutLegend
                          items={ticketSizeDonutItems}
                          valueFormatter={(v) => money(Number(v))}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-4 gap-2">
                      <CheckCircle2 className="w-9 h-9 text-emerald-500/80" />
                      <div className="text-xs text-muted-foreground">
                        Không có dữ liệu quy mô
                      </div>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </div>
          </div>

          {/* HÀNG 2: GRID 1:1 — ĐỐI TÁC CHI PHỐI & PHÂN BỔ CHI NHÁNH */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {/* CỘT 1: ĐỐI TÁC CHI PHỐI RỦI RO / KỲ VỌNG */}
            <DrawerSection
              title={t(
                "debts:horizonDrawer.topPartnersConcentrationTitle",
                "Đối tác Chi phối & Tập trung Nợ (Top 5)",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="relative h-[250px] w-full pt-1">
                {topPartnersBarData ? (
                  <BarChart
                    labels={topPartnersBarData.labels}
                    datasets={topPartnersBarData.datasets}
                    showLegend={false}
                    yCallback={(v) => money(Number(v))}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                    <Building2 className="w-8 h-8 opacity-30" />
                    <span>{t("common:noData", "Chưa có dữ liệu đối tác")}</span>
                  </div>
                )}
              </div>
            </DrawerSection>

            {/* CỘT 2: PHÂN BỔ CÔNG NỢ THEO CHI NHÁNH */}
            <DrawerSection
              title={t(
                "debts:horizonDrawer.branchDistributionTitle",
                "Phân bổ Công nợ theo Chi nhánh",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="relative h-[250px] w-full pt-1">
                {branchBarData ? (
                  <BarChart
                    labels={branchBarData.labels}
                    datasets={branchBarData.datasets}
                    showLegend={false}
                    yCallback={(v) => money(Number(v))}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                    <Building2 className="w-8 h-8 opacity-30" />
                    <span>
                      {t("common:noData", "Chưa có dữ liệu chi nhánh")}
                    </span>
                  </div>
                )}
              </div>
            </DrawerSection>
          </div>

          {/* HÀNG 3: BẢNG KÊ TỔNG HỢP PHÁT SINH & DƯ NỢ THEO THÁNG */}
          {monthlyTableSection}
        </>
      ) : (
        // ═══════════════════════════════════════════════════
        // MODE 3: PHÂN BỔ TUỔI NỢ THỰC TẾ (HISTORICAL AGING)
        // ═══════════════════════════════════════════════════
        <>
          {/* HÀNG 1: GRID 3:1 — ĐỐI TÁC CHI PHỐI NỢ (3/4) + CƠ CẤU QUY MÔ HÓA ĐƠN PARETO (1/4) */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            {/* CỘT 1 (3/4): ĐỐI TÁC CHI PHỐI & TẬP TRUNG NỢ */}
            <div className="xl:col-span-3">
              <DrawerSection
                title={t(
                  "debts:horizonDrawer.topPartnersConcentrationTitle",
                  "Đối tác Chi phối & Tập trung Nợ (Top 5)",
                )}
                collapsible
                defaultCollapsed={false}
              >
                <div className="relative h-[250px] w-full pt-1">
                  {isLoading || isFetching ? (
                    <ChartSkeleton />
                  ) : topPartnersBarData ? (
                    <BarChart
                      labels={topPartnersBarData.labels}
                      datasets={topPartnersBarData.datasets}
                      showLegend={false}
                      yCallback={(v) => money(Number(v))}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                      <Building2 className="w-8 h-8 opacity-30" />
                      <span>
                        {t("common:noData", "Chưa có dữ liệu đối tác")}
                      </span>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </div>

            {/* CỘT 2 (1/4): CƠ CẤU QUY MÔ HÓA ĐƠN PARETO 80/20 */}
            <div className="xl:col-span-1">
              <DrawerSection
                title={t(
                  "debts:horizonDrawer.ticketSizeTitle",
                  "Cơ cấu Quy mô Hóa đơn (Pareto 80/20)",
                )}
                collapsible
                defaultCollapsed={false}
              >
                <div className="flex flex-col justify-center gap-2 h-[250px] w-full pt-1">
                  {ticketSizeDonutItems.length > 0 ? (
                    <>
                      <div className="relative h-[135px]">
                        <DonutChart
                          items={ticketSizeDonutItems}
                          cutout="65%"
                          valueFormatter={(v) => money(Number(v))}
                        />
                      </div>
                      <div className="text-[11px]">
                        <DonutLegend
                          items={ticketSizeDonutItems}
                          valueFormatter={(v) => money(Number(v))}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-4 gap-2">
                      <CheckCircle2 className="w-9 h-9 text-emerald-500/80" />
                      <div className="text-xs text-muted-foreground">
                        Không có dữ liệu quy mô
                      </div>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </div>
          </div>

          {/* HÀNG 2: GRID 1:1 — PHÂN BỔ THEO CHI NHÁNH & CƠ CẤU TUỔI NỢ */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {/* CỘT 1: PHÂN BỔ CÔNG NỢ THEO CHI NHÁNH */}
            <DrawerSection
              title={t(
                "debts:horizonDrawer.branchDistributionTitle",
                "Phân bổ Công nợ theo Chi nhánh",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="relative h-[250px] w-full pt-1">
                {branchBarData ? (
                  <BarChart
                    labels={branchBarData.labels}
                    datasets={branchBarData.datasets}
                    showLegend={false}
                    yCallback={(v) => money(Number(v))}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                    <Building2 className="w-8 h-8 opacity-30" />
                    <span>
                      {t("common:noData", "Chưa có dữ liệu chi nhánh")}
                    </span>
                  </div>
                )}
              </div>
            </DrawerSection>

            {/* CỘT 2: CƠ CẤU PHÂN BỔ TUỔI NỢ */}
            <DrawerSection
              title={t(
                "debts:horizonDrawer.agingDistribution",
                "Cơ cấu phân bổ tuổi nợ",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="flex flex-col justify-center gap-2.5 h-[250px] w-full pt-1">
                {agingDonutItems.length > 0 &&
                agingDonutItems.some((x) => x.value > 0) ? (
                  <>
                    <div className="relative h-[135px]">
                      <DonutChart
                        items={agingDonutItems}
                        cutout="65%"
                        valueFormatter={(v) => money(Number(v))}
                      />
                    </div>
                    <div className="text-[11px]">
                      <DonutLegend
                        items={agingDonutItems}
                        valueFormatter={(v) => money(Number(v))}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-4 gap-2">
                    <CheckCircle2 className="w-9 h-9 text-emerald-500/80" />
                    <div className="text-xs font-semibold text-foreground">
                      Đã tất toán toàn bộ
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Không còn dư nợ trong kỳ này.
                    </div>
                  </div>
                )}
              </div>
            </DrawerSection>
          </div>

          {/* HÀNG 3: BẢNG KÊ TỔNG HỢP PHÁT SINH & DƯ NỢ THEO THÁNG */}
          {monthlyTableSection}
        </>
      )}
    </div>
  );

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={`${t("debts:horizonDrawer.title", { name: horizonMeta.title, defaultValue: `Chi tiết Mốc thời gian: ${horizonMeta.title}` })}`}
        subtitle={t(
          "debts:horizonDrawer.subtitle",
          "Theo dõi chi tiết hóa đơn phát sinh, tiến độ cấn trừ và cơ cấu nợ theo mốc thời gian",
        )}
        titleExtra={
          <Badge variant={horizonMeta.badgeVariant}>{horizonMeta.badge}</Badge>
        }
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        leftPanel={
          <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
            {/* ─── 1. THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS + RIGHT-SIDE PRESET TABS ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              {/* Bên trái: Sub-Tabs 1. Danh sách hóa đơn / 2. Biến động & Phân tích */}
              <div className="flex items-center gap-2">
                <PillTabs<"invoices" | "analytics">
                  size="sm"
                  value={activeSubTab}
                  onValueChange={setActiveSubTab}
                  items={[
                    {
                      value: "invoices",
                      label: t(
                        "debts:horizonDrawer.tabInvoices",
                        "1. Danh sách hóa đơn",
                      ),
                      icon: ReceiptText,
                      badgeCount: total > 0 ? total : undefined,
                    },
                    {
                      value: "analytics",
                      label: t(
                        "debts:horizonDrawer.tabAnalytics",
                        "2. Biến động & Phân tích",
                      ),
                      icon: TrendingUp,
                    },
                  ]}
                />
              </div>

              {/* Bên phải: Cụm nút chọn Phải thu / Phải trả (kiểu Tab Tài chính erp-invoice) + Xóa bộ lọc */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-0.5">
                  {[
                    {
                      value: "OUT" as const,
                      label: t(
                        "debts:horizonDrawer.tabReceivablesShort",
                        "Phải thu",
                      ),
                      icon: ArrowUpRight,
                      count: summary?.receivableCount || 0,
                    },
                    {
                      value: "IN" as const,
                      label: t(
                        "debts:horizonDrawer.tabPayablesShort",
                        "Phải trả",
                      ),
                      icon: ArrowDownLeft,
                      count: summary?.payableCount || 0,
                    },
                  ].map((tab) => {
                    const isActive = direction === tab.value;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => {
                          setDirection(tab.value);
                          setPage(1);
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap",
                          isActive
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-3.5 h-3.5",
                            isActive
                              ? "text-inherit"
                              : tab.value === "OUT"
                                ? "text-emerald-600"
                                : "text-amber-600",
                          )}
                        />
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                          <span
                            className={cn(
                              "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold",
                              isActive
                                ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
                            )}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {activeSubTab === "invoices" &&
                  tableState.activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        tableState.resetFilters();
                        setPage(1);
                      }}
                      className="h-6 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded-md border border-destructive/20 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>
                        {t("common:clearFilters", "Xóa bộ lọc")} (
                        {tableState.activeFilterCount})
                      </span>
                    </button>
                  )}
              </div>
            </div>

            {/* ─── 2. NỘI DUNG CHÍNH THEO SUB-TAB ─── */}
            {activeSubTab === "invoices" ? leftPanelContent : analyticsContent}
          </div>
        }
        rightPanel={
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
                {/* Expected In (Dự thu) */}
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
                            ? t(
                                "debts:dashboard.forecastRiskIn",
                                "Rủi ro Phải thu",
                              )
                            : t(
                                "debts:dashboard.expectedIn",
                                "Dự thu (Phải thu)",
                              )}
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

                {/* Expected Out (Dự chi) */}
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
                            ? t(
                                "debts:dashboard.forecastRiskOut",
                                "Rủi ro Phải trả",
                              )
                            : t(
                                "debts:dashboard.expectedOut",
                                "Dự chi (Phải trả)",
                              )}
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
                          ? t(
                              "debts:dashboard.forecastNetRisk",
                              "Chênh lệch rủi ro",
                            )
                          : t("debts:dashboard.netFlow", "Vị thế ròng")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(summary?.netAmount || 0) >= 0
                          ? t(
                              "debts:horizonDrawer.surplus",
                              "Thặng dư dòng tiền",
                            )
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

            {/* ─── TIER 3: BÓC TÁCH CƠ CẤU NGUỒN TIỀN & ĐỐI TÁC TRỌNG YẾU ─── */}
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
                {(horizon === "forecastNext7Days" ||
                  horizon === "forecastNext30Days") &&
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
                        ? Number(
                            ((overdueAmount / totalAmount) * 100).toFixed(1),
                          )
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
                            {dueCount} {t("debts:unitInvoice", "hóa đơn")} có
                            ngày dự kiến thanh toán rơi đúng kỳ
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
                            {overdueCount} {t("debts:unitInvoice", "hóa đơn")}{" "}
                            theo chu kỳ đáng lẽ đã thanh toán, trôi sang kỳ này
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
                  const partners =
                    direction === "OUT"
                      ? summary?.topReceivablePartners || []
                      : summary?.topPayablePartners || [];

                  if (partners.length === 0) {
                    return (
                      <div className="text-xs text-muted-foreground italic py-2 text-center">
                        {t("common:noData", "Không có dữ liệu đối tác")}
                      </div>
                    );
                  }

                  const totalTopShare = Number(
                    partners
                      .reduce((sum, p) => sum + (p.sharePercentage || 0), 0)
                      .toFixed(1),
                  );

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
                        {partners.map((p, idx) => {
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
                                    <span className="truncate">
                                      {p.partnerName}
                                    </span>
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
                                      Trôi sang:{" "}
                                      {money(p.overdueCarriedAmount || 0)}
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
        }
      />

      {/* Full Detail Invoice Internal Drawer */}
      <ErpInvoiceInternalDrawer
        open={formHook.internalDrawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        form={formHook.form}
        fieldSet={(key: string, value: any) =>
          formHook.setForm((prev) => ({ ...prev, [key]: value }))
        }
        direction={formHook.form.direction || "IN"}
        postingState={formHook.postingState}
        pendingUnpost={formHook.pendingUnpost}
        onUnpost={() => formHook.setPendingUnpost(true)}
        rightPanel={
          <div className="flex flex-col gap-4">
            <ErpInvoiceInternalSidebar
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key: string, value: any) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={formHook.form.direction || "IN"}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={formHook.handleSyncDetail}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <ErpInvoiceInternalMain
            detailInvoice={formHook.detailInvoice}
            invoicePreview={
              formHook.detailInvoice ? (
                <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
              ) : undefined
            }
          />
        </div>
      </ErpInvoiceInternalDrawer>
    </>
  );
}
