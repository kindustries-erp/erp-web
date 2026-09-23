import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Inbox,
  XCircle,
  TrendingUp,
  Percent,
  Layers,
  BarChart3,
  DollarSign,
  Wrench,
  Building2,
  Zap,
  HelpCircle,
  RotateCcw,
  PieChart as PieIcon,
} from "lucide-react";
import { Chart } from "react-chartjs-2";
import "@/shared/utils/chartSetup";
import { useChartTheme } from "@/shared/utils/chartTheme";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { Combobox, ComboboxOption } from "@/shared/components/Combobox";
import { money, shortMoney } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { EmptyState } from "@/shared/components/EmptyState";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import {
  GarageConversionFunnel,
  GarageConversionFunnelClassificationItem,
  GarageProjectedPipeline,
  GarageStatusDistributionItem,
  GarageClassificationDistributionItem,
} from "../api/garageDashboardApi";

interface GarageConversionFunnelCardProps {
  funnel?: GarageConversionFunnel;
  byMonth?: Record<string, GarageConversionFunnel>;
  availableMonths?: string[];
  projectedToday?: GarageProjectedPipeline;
  projectedMonth?: GarageProjectedPipeline;
  statusDistribution?: GarageStatusDistributionItem[];
  statusDistributionByMonth?: Record<string, GarageStatusDistributionItem[]>;
  classificationDistribution?: GarageClassificationDistributionItem[];
  classificationDistributionByMonth?: Record<
    string,
    GarageClassificationDistributionItem[]
  >;
  loading?: boolean;
}

interface ClassificationTableRow {
  id: string;
  key: string;
  name: string;
  dot: string;
  icon: React.ComponentType<{ className?: string }>;
  totalCount: number;
  totalAmount: number;
  inProgressCount: number;
  inProgressAmount: number;
  completedCount: number;
  completedAmount: number;
  cancelledCount: number;
  cancelledAmount: number;
  completionRate: number;
  cancellationRate: number;
}

const CLASSIFICATION_CONFIG: Record<
  string,
  {
    defaultName: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  SUA_CHUA_CHUNG: {
    defaultName: "Sửa chữa chung",
    dot: "#10b981",
    icon: Wrench,
  },
  KY_GUI_NOI_BO: {
    defaultName: "Ký gửi / Nội bộ",
    dot: "#6366f1",
    icon: Building2,
  },
  OJ_NGOAI: {
    defaultName: "OJ Ngoài",
    dot: "#f59e0b",
    icon: Zap,
  },
  KHAC: {
    defaultName: "Khác",
    dot: "#64748b",
    icon: HelpCircle,
  },
};

const ORDERED_KEYS = [
  "SUA_CHUA_CHUNG",
  "KY_GUI_NOI_BO",
  "OJ_NGOAI",
  "KHAC",
] as const;

const getStatusColor = (name: string, index: number) => {
  const lower = name.toLowerCase();
  if (
    lower.includes("kết thúc") ||
    lower.includes("hoàn tất") ||
    lower.includes("xong")
  ) {
    return "#10b981"; // Emerald
  }
  if (
    lower.includes("đang thực hiện") ||
    lower.includes("đang sửa") ||
    lower.includes("tiến hành")
  ) {
    return "#6366f1"; // Indigo
  }
  if (lower.includes("tiếp nhận") || lower.includes("mới")) {
    return "#3b82f6"; // Blue
  }
  if (lower.includes("báo giá") || lower.includes("chờ duyệt")) {
    return "#f59e0b"; // Amber
  }
  if (lower.includes("hủy") || lower.includes("từ chối")) {
    return "#ef4444"; // Red
  }
  const fallbackColors = [
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#64748b",
    "#84cc16",
  ];
  return fallbackColors[index % fallbackColors.length];
};

export function GarageConversionFunnelCard({
  funnel,
  byMonth = {},
  availableMonths = [],
  projectedToday,
  projectedMonth,
  statusDistribution = [],
  statusDistributionByMonth = {},
  classificationDistribution = [],
  classificationDistributionByMonth = {},
  loading,
}: GarageConversionFunnelCardProps) {
  const { t } = useTranslation("garage");
  const { gridColor, tickColor } = useChartTheme();

  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"AMOUNT" | "COUNT">("AMOUNT");

  // Dữ liệu phễu hiển thị dựa trên tháng được chọn (hoặc Toàn bộ 6 tháng)
  const activeFunnel = useMemo(() => {
    if (selectedMonth === "ALL" || !byMonth[selectedMonth]) {
      return funnel;
    }
    return byMonth[selectedMonth];
  }, [selectedMonth, byMonth, funnel]);

  const formatMonthLabel = (m: string) => {
    const parts = m.split("-");
    if (parts.length === 2) {
      return `Tháng ${parts[1]}/${parts[0]}`;
    }
    return m;
  };

  const monthOptions: ComboboxOption[] = useMemo(() => {
    const totalCount = funnel?.totalIntake?.count || 0;
    const opts: ComboboxOption[] = [
      {
        value: "ALL",
        label: `${t("dashboard.funnel.allSixMonthsView", "Toàn bộ 6 tháng")} (${totalCount} ${t("dashboard.funnel.casesUnit", "tiếp nhận")})`,
      },
    ];
    availableMonths.forEach((m) => {
      const mData = byMonth[m];
      const mCount = mData?.totalIntake?.count || 0;
      opts.push({
        value: m,
        label: `${formatMonthLabel(m)} (${mCount} ${t("dashboard.funnel.casesUnit", "tiếp nhận")})`,
      });
    });
    return opts;
  }, [funnel, availableMonths, byMonth, t]);

  const {
    totalIntake = { count: 0, amount: 0, rate: 100 },
    inProgress = { count: 0, amount: 0, rate: 0 },
    completed = { count: 0, amount: 0, rate: 0 },
    cancelled = { count: 0, amount: 0, rate: 0 },
    byClassification = {} as Record<
      string,
      GarageConversionFunnelClassificationItem
    >,
  } = activeFunnel || {};

  const isAmount = viewMode === "AMOUNT";

  // Timeline Data: strictly sorted chronologically from left to right: T4 -> T9
  const timelineMonths = useMemo(() => {
    const list =
      availableMonths.length > 0 ? [...availableMonths] : Object.keys(byMonth);
    return list.sort((a, b) => a.localeCompare(b));
  }, [availableMonths, byMonth]);

  const timelineLabels = useMemo(() => {
    return timelineMonths.map((m) => formatMonthLabel(m));
  }, [timelineMonths]);

  const timelineDatasets = useMemo(() => {
    const completedData = timelineMonths.map((m) => {
      const item = byMonth[m];
      return isAmount
        ? item?.completed?.amount || 0
        : item?.completed?.count || 0;
    });

    const inProgressData = timelineMonths.map((m) => {
      const item = byMonth[m];
      return isAmount
        ? item?.inProgress?.amount || 0
        : item?.inProgress?.count || 0;
    });

    const cancelledData = timelineMonths.map((m) => {
      const item = byMonth[m];
      return isAmount
        ? item?.cancelled?.amount || 0
        : item?.cancelled?.count || 0;
    });

    const completionRateData = timelineMonths.map((m) => {
      const item = byMonth[m];
      return item?.completed?.rate || 0;
    });

    return [
      {
        type: "bar" as const,
        label: t("dashboard.funnel.chartCompleted", "Hoàn tất (Doanh thu)"),
        data: completedData,
        backgroundColor: "#10b981",
        borderColor: "#10b981",
        stack: "timeline",
        borderRadius: 3,
        barPercentage: 0.5,
        yAxisID: "y",
      },
      {
        type: "bar" as const,
        label: t("dashboard.funnel.chartInProgress", "Đang làm (Dự thu)"),
        data: inProgressData,
        backgroundColor: "#6366f1",
        borderColor: "#6366f1",
        stack: "timeline",
        borderRadius: 3,
        barPercentage: 0.5,
        yAxisID: "y",
      },
      {
        type: "bar" as const,
        label: t("dashboard.funnel.chartCancelled", "Đã hủy"),
        data: cancelledData,
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
        stack: "timeline",
        borderRadius: 3,
        barPercentage: 0.5,
        yAxisID: "y",
      },
      {
        type: "line" as const,
        label: t("dashboard.funnel.chartCompletionRate", "Tỷ lệ hoàn tất (%)"),
        data: completionRateData,
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#f59e0b",
        tension: 0.2,
        yAxisID: "y1",
      },
    ];
  }, [timelineMonths, byMonth, isAmount, t]);

  // Donut Chart Data: Active Classification
  const activeClassificationData = useMemo(() => {
    if (
      selectedMonth === "ALL" ||
      !classificationDistributionByMonth[selectedMonth]
    ) {
      return classificationDistribution;
    }
    return classificationDistributionByMonth[selectedMonth];
  }, [
    selectedMonth,
    classificationDistributionByMonth,
    classificationDistribution,
  ]);

  const classificationDonutItems = useMemo(() => {
    return activeClassificationData.map((d) => ({
      label: d.classificationName,
      value: isAmount ? d.revenue || 0 : d.count || 0,
      color: CLASSIFICATION_CONFIG[d.classificationKey]?.dot || "#64748b",
    }));
  }, [activeClassificationData, isAmount]);

  const totalClassificationVal = useMemo(() => {
    return classificationDonutItems.reduce((s, d) => s + (d.value || 0), 0);
  }, [classificationDonutItems]);

  // Donut Chart Data: Active Status
  const activeStatusData = useMemo(() => {
    if (selectedMonth === "ALL" || !statusDistributionByMonth[selectedMonth]) {
      return statusDistribution;
    }
    return statusDistributionByMonth[selectedMonth];
  }, [selectedMonth, statusDistributionByMonth, statusDistribution]);

  const statusDonutItems = useMemo(() => {
    return activeStatusData.map((d, index) => ({
      label: d.statusName,
      value: isAmount ? d.revenue || 0 : d.count || 0,
      color: getStatusColor(d.statusName, index),
    }));
  }, [activeStatusData, isAmount]);

  const totalStatusVal = useMemo(() => {
    return statusDonutItems.reduce((s, d) => s + (d.value || 0), 0);
  }, [statusDonutItems]);

  // Standardized DataTable rows according to /standardize-table
  const tableRows: ClassificationTableRow[] = useMemo(() => {
    return ORDERED_KEYS.map((key) => {
      const item = byClassification[key] || {
        name: CLASSIFICATION_CONFIG[key]?.defaultName || key,
        totalCount: 0,
        totalAmount: 0,
        inProgressCount: 0,
        inProgressAmount: 0,
        completedCount: 0,
        completedAmount: 0,
        cancelledCount: 0,
        cancelledAmount: 0,
        completionRate: 0,
        cancellationRate: 0,
      };
      const config = CLASSIFICATION_CONFIG[key] || CLASSIFICATION_CONFIG.KHAC;
      return {
        id: key,
        key,
        name: item.name || config.defaultName,
        dot: config.dot,
        icon: config.icon,
        totalCount: item.totalCount,
        totalAmount: item.totalAmount,
        inProgressCount: item.inProgressCount,
        inProgressAmount: item.inProgressAmount,
        completedCount: item.completedCount,
        completedAmount: item.completedAmount,
        cancelledCount: item.cancelledCount,
        cancelledAmount: item.cancelledAmount,
        completionRate: item.completionRate,
        cancellationRate: item.cancellationRate,
      };
    });
  }, [byClassification]);

  // DataTable columns adhering to /standardize-table
  const columns: DataTableColumn<ClassificationTableRow>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => (
          <span className="w-full block text-center font-mono">{idx}</span>
        ),
      },
      {
        key: "name",
        header: t("dashboard.funnel.colClassification", "Phân Loại ERP"),
        size: 180,
        cell: (row) => {
          const Icon = row.icon;
          return (
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: row.dot }}
              />
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">{row.name}</span>
            </div>
          );
        },
      },
      {
        key: "total",
        header: t("dashboard.funnel.colIntake", "Tổng Tiếp Nhận"),
        size: 150,
        className: "text-right",
        cell: (row) => (
          <div className="flex flex-col items-end">
            <span className="font-semibold text-foreground tabular-nums">
              {row.totalCount} {t("dashboard.funnel.vehiclesUnit", "xe")}
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {shortMoney(row.totalAmount)}
            </span>
          </div>
        ),
      },
      {
        key: "inProgress",
        header: t("dashboard.funnel.colInProgress", "Đang Làm (Dự Thu)"),
        size: 160,
        className: "text-right",
        cell: (row) => (
          <div className="flex flex-col items-end">
            <span className="font-semibold text-foreground tabular-nums">
              {row.inProgressCount} {t("dashboard.funnel.vehiclesUnit", "xe")}
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {shortMoney(row.inProgressAmount)}
            </span>
          </div>
        ),
      },
      {
        key: "completed",
        header: t("dashboard.funnel.colCompleted", "Hoàn Thành (Doanh Thu)"),
        size: 170,
        className: "text-right",
        cell: (row) => (
          <div className="flex flex-col items-end">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {row.completedCount} {t("dashboard.funnel.vehiclesUnit", "xe")}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
              {shortMoney(row.completedAmount)}
            </span>
          </div>
        ),
      },
      {
        key: "cancelled",
        header: t("dashboard.funnel.colCancelled", "Đã Hủy"),
        size: 140,
        className: "text-right",
        cell: (row) => (
          <div className="flex flex-col items-end">
            <span className="font-semibold text-destructive tabular-nums">
              {row.cancelledCount} {t("dashboard.funnel.vehiclesUnit", "xe")}
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {shortMoney(row.cancelledAmount)}
            </span>
          </div>
        ),
      },
      {
        key: "completionRate",
        header: t("dashboard.funnel.colRate", "Tỷ Lệ Hoàn Tất"),
        size: 140,
        className: "text-center",
        cell: (row) => (
          <div className="flex items-center justify-center gap-2">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${row.completionRate}%` }}
              />
            </div>
            <span className="font-bold text-foreground text-[11px] tabular-nums">
              {row.completionRate}%
            </span>
          </div>
        ),
      },
    ],
    [t],
  );

  // Standardized SubtotalSummaryCell footer row
  const summaryRow = useMemo(() => {
    return {
      index: (
        <SubtotalSummaryCell
          variantType="label"
          label={t("common.total", "Tổng") + ":"}
        />
      ),
      name: (
        <SubtotalSummaryCell
          variantType="label"
          label={`4 ${t("dashboard.funnel.colClassification", "nhóm ERP")}`}
        />
      ),
      total: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("dashboard.funnel.colIntake", "Tổng tiếp nhận")}
          itemTitle={t("dashboard.funnel.vehiclesUnit", "xe")}
          subtotalQty={totalIntake.count}
          subtotalAmount={totalIntake.amount}
        />
      ),
      inProgress: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("dashboard.funnel.colInProgress", "Đang làm (Dự thu)")}
          itemTitle={t("dashboard.funnel.vehiclesUnit", "xe")}
          subtotalQty={inProgress.count}
          subtotalAmount={inProgress.amount}
        />
      ),
      completed: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t(
            "dashboard.funnel.colCompleted",
            "Hoàn thành (Doanh thu)",
          )}
          itemTitle={t("dashboard.funnel.vehiclesUnit", "xe")}
          subtotalQty={completed.count}
          subtotalAmount={completed.amount}
        />
      ),
      cancelled: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("dashboard.funnel.colCancelled", "Đã hủy")}
          itemTitle={t("dashboard.funnel.vehiclesUnit", "xe")}
          subtotalQty={cancelled.count}
          subtotalAmount={cancelled.amount}
        />
      ),
      completionRate: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${completed.rate ?? 0}%`}
          valueClassName="text-center font-bold text-emerald-600 dark:text-emerald-400"
        />
      ),
    };
  }, [t, totalIntake, inProgress, completed, cancelled]);

  if (!loading && (!activeFunnel || activeFunnel.totalIntake.count === 0)) {
    return (
      <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col justify-center items-center min-h-[300px]">
        <EmptyState
          message={t(
            "dashboard.funnel.noFunnelData",
            "Chưa có dữ liệu phễu chuyển đổi trong khoảng thời gian này",
          )}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* SECTION HEADER BADGE (TẠO BADGE PHÂN ĐOẠN PHÍA TRÊN) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            {t(
              "dashboard.funnel.hubTitle",
              "Pipeline Dự Thu & Phễu Chuyển Đổi Dịch Vụ",
            )}
          </h4>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            *{" "}
            {t(
              "dashboard.funnel.hubDesc",
              "Theo dõi luồng chuyển đổi từ Tiếp nhận đến Nghiệm thu doanh thu & Dự thu theo 4 phân loại ERP",
            )}
          </span>
        </div>
        <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1 hidden md:block" />
      </div>

      {/* MAIN CONTAINER CARD */}
      <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-5">
        {/* Header Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">
              {t("dashboard.funnel.monthFilterLabel", "Đang xem chi tiết:")}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold px-2 py-0.5",
                selectedMonth === "ALL"
                  ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300"
                  : "bg-primary/10 text-primary border-primary/30",
              )}
            >
              {selectedMonth === "ALL"
                ? t("dashboard.funnel.allSixMonthsView", "Toàn bộ 6 tháng")
                : formatMonthLabel(selectedMonth)}
            </Badge>
            {selectedMonth !== "ALL" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMonth("ALL")}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                title={t(
                  "dashboard.funnel.resetToAllMonths",
                  "Xem toàn bộ 6 tháng",
                )}
              >
                <RotateCcw className="w-3 h-3" />
                {t("dashboard.funnel.resetToAllMonths", "Xem toàn bộ 6 tháng")}
              </Button>
            )}
          </div>

          {/* Month Selector Combobox (Header Right) */}
          <div className="flex items-center gap-1.5 min-w-[210px] max-w-[260px]">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <Combobox
                options={monthOptions}
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val || "ALL")}
                allowClear={false}
                placeholder="Chọn tháng..."
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>

        {/* TẦNG 1: 4 Cards Phễu Chuyển Đổi Tinh Gọn (Có Sub-Badge Hôm Nay & Tháng Này) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stage 1: Tiếp Nhận */}
          <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <Inbox className="w-4 h-4" />
                {t("dashboard.funnel.stageIntake", "1. Tổng Tiếp Nhận")}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                100%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-foreground">
                {totalIntake.count}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {t("dashboard.funnel.casesUnit", "phiếu")}
                </span>
              </div>
              <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                {money(totalIntake.amount)}
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 border-t border-indigo-100 dark:border-indigo-900/40 pt-1.5">
              {t(
                "dashboard.funnel.stageIntakeSub",
                "Tổng nhu cầu đưa xe vào xưởng",
              )}
            </div>
          </div>

          {/* Stage 2: Đang Làm (Dự Thu) - Có Sub-badge Hôm nay & Tháng này */}
          <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/15 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {t(
                  "dashboard.funnel.stageInProgress",
                  "2. Đang Xử Lý (Dự thu)",
                )}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                {inProgress.rate ?? 0}%
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-bold text-foreground">
                {inProgress.count}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {t("dashboard.funnel.casesUnit", "phiếu")}
                </span>
              </div>
              <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                {money(inProgress.amount)}
              </div>
            </div>
            {/* Micro Sub-badges for Today & Month Pipeline */}
            <div className="mt-2 pt-1.5 border-t border-indigo-100 dark:border-indigo-900/40 flex flex-col gap-1 text-[10.5px]">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>
                  • {t("dashboard.funnel.todayProjected", "Hôm nay")}:{" "}
                  <strong className="text-foreground">
                    {projectedToday?.totalCount || 0} xe
                  </strong>
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                  {shortMoney(projectedToday?.totalAmount || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>
                  • {t("dashboard.funnel.monthProjected", "Tháng này")}:{" "}
                  <strong className="text-foreground">
                    {projectedMonth?.totalCount || inProgress.count} xe
                  </strong>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {shortMoney(projectedMonth?.totalAmount || inProgress.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Stage 3: Hoàn Tất (Doanh Thu Thực Tế) */}
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t(
                  "dashboard.funnel.stageCompleted",
                  "3. Đã Hoàn Thành (Doanh thu)",
                )}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                {completed.rate ?? 0}%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-foreground">
                {completed.count}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {t("dashboard.funnel.casesUnit", "phiếu")}
                </span>
              </div>
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                {money(completed.amount)}
              </div>
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-2 border-t border-emerald-100 dark:border-emerald-900/40 pt-1.5">
              {t(
                "dashboard.funnel.stageCompletedSub",
                "Doanh thu thực tế (Kế toán dồn tích)",
              )}
            </div>
          </div>

          {/* Stage 4: Đã Hủy */}
          <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                {t("dashboard.funnel.stageCancelled", "4. Hủy / Từ Chối")}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                {cancelled.rate ?? 0}%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-foreground">
                {cancelled.count}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {t("dashboard.funnel.casesUnit", "phiếu")}
                </span>
              </div>
              <div className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5">
                {money(cancelled.amount)}
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 border-t border-rose-100 dark:border-rose-900/40 pt-1.5">
              {t(
                "dashboard.funnel.stageCancelledSub",
                "Doanh thu tổn thất / khách hủy",
              )}
            </div>
          </div>
        </div>

        {/* Visual Progress Ratio Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs flex-wrap gap-1">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" />
              {t(
                "dashboard.funnel.stageIntake",
                "Cơ cấu chuyển đổi trên tổng tiếp nhận",
              )}{" "}
              ({totalIntake.count} {t("dashboard.funnel.casesUnit", "phiếu")})
            </span>
            <span className="text-foreground font-semibold">
              {t("dashboard.funnel.chartCompletionRate", "Tỷ lệ hoàn tất")}:{" "}
              {completed.rate ?? 0}%
            </span>
          </div>

          <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {completed.rate ? (
              <div
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                style={{ width: `${completed.rate}%` }}
                title={`Hoàn tất: ${completed.count} phiếu (${completed.rate}%)`}
              />
            ) : null}

            {inProgress.rate ? (
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${inProgress.rate}%` }}
                title={`Đang làm: ${inProgress.count} phiếu (${inProgress.rate}%)`}
              />
            ) : null}

            {cancelled.rate ? (
              <div
                className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                style={{ width: `${cancelled.rate}%` }}
                title={`Đã hủy: ${cancelled.count} phiếu (${cancelled.rate}%)`}
              />
            ) : null}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>
                {t("dashboard.funnel.chartCompleted", "Hoàn tất")}:{" "}
                <strong className="text-foreground">{completed.count}</strong> (
                {completed.rate}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              <span>
                {t("dashboard.funnel.chartInProgress", "Đang làm")}:{" "}
                <strong className="text-foreground">{inProgress.count}</strong>{" "}
                ({inProgress.rate}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>
                {t("dashboard.funnel.chartCancelled", "Đã hủy")}:{" "}
                <strong className="text-foreground">{cancelled.count}</strong> (
                {cancelled.rate}%)
              </span>
            </div>
          </div>
        </div>

        {/* TẦNG 2: TOOLBAR & 3 BIỂU ĐỒ SONG SONG (TIMELINE + 2 DONUT CHARTS) */}
        <div className="flex flex-col gap-3">
          {/* Sub-header / Toolbar for Charts */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border/60">
            <div className="flex items-center gap-2 flex-wrap">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h5 className="text-xs font-semibold text-foreground">
                {t(
                  "dashboard.funnel.chartsSectionTitle",
                  "Phân Tích Xu Hướng & Cơ Cấu Chuyển Đổi",
                )}
              </h5>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                •{" "}
                {selectedMonth === "ALL"
                  ? t("dashboard.funnel.allSixMonthsView", "Toàn bộ 6 tháng")
                  : formatMonthLabel(selectedMonth)}
              </span>
            </div>

            {/* View Mode Toggle Switch: Giá trị (VND) vs Số lượng (Xe) */}
            <div className="flex items-center bg-muted/70 p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setViewMode("AMOUNT")}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer select-none",
                  isAmount
                    ? "bg-surface text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {t("dashboard.funnel.viewByAmount", "Giá trị (VND)")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("COUNT")}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer select-none",
                  !isAmount
                    ? "bg-surface text-foreground shadow-xs font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                {t("dashboard.funnel.viewByCount", "Số lượng (Xe)")}
              </button>
            </div>
          </div>

          {/* Grid 12 cột: Timeline (6 cols) + Donut 1 (3 cols) + Donut 2 (3 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* CỘT 1 (col-span-12 md:col-span-2 lg:col-span-6): TIMELINE MIXED STACKED BAR + LINE CHART */}
            <div className="col-span-12 md:col-span-2 lg:col-span-6 bg-slate-50/50 dark:bg-slate-900/30 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h5 className="text-xs font-semibold text-foreground">
                    {t(
                      "dashboard.funnel.chartTitle",
                      "Biểu đồ Xu Hướng Tiếp Nhận & Tỷ Lệ Hoàn Tất Theo Dòng Thời Gian (6 Tháng)",
                    )}
                  </h5>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t(
                    "dashboard.funnel.timelineChartDesc",
                    "Phân bổ 3 trạng thái và đường % hoàn tất theo từng tháng (Nhấp vào cột để lọc chi tiết)",
                  )}
                </p>
              </div>

              {/* Timeline Chart Canvas */}
              <div className="relative h-[250px] w-full mt-2">
                <Chart
                  type="bar"
                  data={{
                    labels: timelineLabels,
                    datasets: timelineDatasets,
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: "index",
                      intersect: false,
                    },
                    onClick: (event, elements) => {
                      if (elements && elements.length > 0) {
                        const clickedIndex = elements[0].index;
                        const clickedMonth = timelineMonths[clickedIndex];
                        if (clickedMonth) {
                          setSelectedMonth(clickedMonth);
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: "top",
                        align: "end",
                        labels: {
                          boxWidth: 10,
                          boxHeight: 10,
                          usePointStyle: true,
                          pointStyle: "circle",
                          font: { size: 11 },
                          color: tickColor,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: (context: any) => {
                            const datasetLabel = context.dataset.label || "";
                            const val = context.parsed.y;
                            if (val === null || val === undefined)
                              return datasetLabel;
                            if (context.dataset.type === "line") {
                              return `${datasetLabel}: ${val}%`;
                            }
                            return `${datasetLabel}: ${isAmount ? money(val) : `${val} xe`}`;
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { font: { size: 11 }, color: tickColor },
                      },
                      y: {
                        type: "linear",
                        display: true,
                        position: "left",
                        stacked: true,
                        grid: { color: gridColor },
                        border: { display: false },
                        beginAtZero: true,
                        ticks: {
                          font: { size: 10 },
                          color: tickColor,
                          callback: (v: any) =>
                            isAmount ? shortMoney(Number(v)) : `${v} xe`,
                        },
                      },
                      y1: {
                        type: "linear",
                        display: true,
                        position: "right",
                        min: 0,
                        max: 100,
                        grid: { display: false },
                        border: { display: false },
                        ticks: {
                          font: { size: 10 },
                          color: tickColor,
                          callback: (v: any) => `${v}%`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* CỘT 2 (col-span-12 md:col-span-1 lg:col-span-3): DONUT CHART CƠ CẤU NGHIỆP VỤ ERP */}
            <div className="col-span-12 md:col-span-1 lg:col-span-3 bg-slate-50/50 dark:bg-slate-900/30 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <PieIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {t(
                      "dashboard.funnel.donutClassificationTitle",
                      "Cơ Cấu Nghiệp Vụ (ERP)",
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t(
                    "dashboard.funnel.donutClassificationSubtitle",
                    "4 nhóm ERP theo",
                  )}{" "}
                  {isAmount ? "doanh thu" : "số lượng"}
                </p>
              </div>

              {/* Donut Chart Display */}
              <div className="flex flex-col my-auto">
                <div className="h-[145px] w-full flex items-center justify-center relative my-1">
                  <DonutChart
                    items={classificationDonutItems}
                    cutout="62%"
                    valueFormatter={(val) =>
                      isAmount ? money(val) : `${val} xe`
                    }
                  />
                </div>
                <div className="border-t border-border/60 pt-1.5 max-h-[95px] overflow-y-auto">
                  <DonutLegend
                    items={classificationDonutItems}
                    valueFormatter={(val) => {
                      const pct =
                        totalClassificationVal > 0
                          ? ((val / totalClassificationVal) * 100).toFixed(1)
                          : "0.0";
                      return isAmount
                        ? `${shortMoney(val)} (${pct}%)`
                        : `${val} xe (${pct}%)`;
                    }}
                  />
                </div>
              </div>
            </div>

            {/* CỘT 3 (col-span-12 md:col-span-1 lg:col-span-3): DONUT CHART PHÂN BỔ TRẠNG THÁI DV */}
            <div className="col-span-12 md:col-span-1 lg:col-span-3 bg-slate-50/50 dark:bg-slate-900/30 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <PieIcon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-foreground">
                    {t(
                      "dashboard.funnel.donutStatusTitle",
                      "Phân Bổ Trạng Thái Phiếu DV",
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t(
                    "dashboard.funnel.donutStatusSubtitle",
                    "Tỷ lệ trạng thái phiếu tiếp nhận & xử lý",
                  )}
                </p>
              </div>

              {/* Donut Chart Display */}
              <div className="flex flex-col my-auto">
                <div className="h-[145px] w-full flex items-center justify-center relative my-1">
                  <DonutChart
                    items={statusDonutItems}
                    cutout="62%"
                    valueFormatter={(val) =>
                      isAmount ? money(val) : `${val} xe`
                    }
                  />
                </div>
                <div className="border-t border-border/60 pt-1.5 max-h-[95px] overflow-y-auto">
                  <DonutLegend
                    items={statusDonutItems}
                    valueFormatter={(val) => {
                      const pct =
                        totalStatusVal > 0
                          ? ((val / totalStatusVal) * 100).toFixed(1)
                          : "0.0";
                      return isAmount
                        ? `${shortMoney(val)} (${pct}%)`
                        : `${val} xe (${pct}%)`;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 3: BẢNG STANDARDIZED DATATABLE THEO /standardize-table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>
                {t(
                  "dashboard.funnel.tableTitle",
                  "Chi tiết Phễu Chuyển Đổi theo 4 Phân Loại ERP",
                )}
              </span>
            </h5>
            <span className="text-[11px] text-muted-foreground">
              {t(
                "dashboard.funnel.tableDesc",
                "Phân loại chuẩn: Sửa chữa chung • Ký gửi/Nội bộ • OJ Ngoài • Khác",
              )}
            </span>
          </div>

          <DataTable
            items={tableRows}
            getRowKey={(item) => item.id}
            variant="spreadsheet"
            columns={columns}
            summaryRow={summaryRow}
            emptyLabel={t(
              "dashboard.funnel.noFunnelData",
              "Chưa có dữ liệu phân loại trong kỳ",
            )}
            enableColumnResizing={true}
          />
        </div>
      </div>
    </div>
  );
}
