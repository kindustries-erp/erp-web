import React, { useState, useMemo } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Table as TableIcon,
} from "lucide-react";
import { money } from "@/shared/utils/format";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useTranslation } from "react-i18next";
import {
  GarageCollectionSummary,
  GarageCostPaymentSummary,
  GarageTrendItem,
} from "../api/garageDashboardApi";

interface GaragePaymentProgressCardProps {
  collectionSummary?: GarageCollectionSummary;
  costPaymentSummary?: GarageCostPaymentSummary;
  trend?: GarageTrendItem[];
  loading?: boolean;
}

export function GaragePaymentProgressCard({
  collectionSummary,
  costPaymentSummary,
  trend = [],
  loading = false,
}: GaragePaymentProgressCardProps) {
  const { t } = useTranslation("garage");
  const [activeTab, setActiveTab] = useState<"RECEIPT" | "PAYMENT">("RECEIPT");
  const isReceipt = activeTab === "RECEIPT";

  // Receipt (Collection) stats
  const totalBilled = collectionSummary?.totalBilled || 0;
  const totalRevenue = collectionSummary?.totalRevenue || 0;
  const totalPaid = collectionSummary?.totalPaid || 0;
  const totalReceivable = collectionSummary?.totalReceivable || 0;
  const collectionRate = collectionSummary?.collectionRate || 0;

  // Payment (Cost) stats
  const totalCost = costPaymentSummary?.totalCost || 0;
  const totalPaidCost = costPaymentSummary?.totalPaidCost || 0;
  const totalPayableCost = costPaymentSummary?.totalPayableCost || 0;
  const costPaymentRate = costPaymentSummary?.paymentRate || 0;

  const currentRate = isReceipt ? collectionRate : costPaymentRate;
  const currentTotal = isReceipt ? totalBilled : totalCost;
  const currentPaid = isReceipt ? totalPaid : totalPaidCost;

  // Table Column State Hook (Client-side for trend breakdown table)
  const tableId = isReceipt
    ? "garage-payment-progress-receipt"
    : "garage-payment-progress-payment";
  const listHook = useTableColumnState(tableId);

  // Rate badge color helper
  const getBadgeVariant = (rate: number) => {
    if (rate >= 90)
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    if (rate >= 70)
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
    if (rate >= 50)
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return "bg-gradient-to-r from-emerald-500 to-teal-500";
    if (rate >= 70) return "bg-gradient-to-r from-blue-500 to-emerald-500";
    if (rate >= 50) return "bg-gradient-to-r from-amber-500 to-blue-500";
    return "bg-gradient-to-r from-rose-500 to-amber-500";
  };

  const formatMonth = (m: string) => {
    const parts = m.split("-");
    if (parts.length === 2) return `Tháng ${parts[1]}/${parts[0]}`;
    return m;
  };

  // Chỉ hiển thị từ tháng 07/2026 trở đi
  const effectiveTrend = useMemo(() => {
    if (!trend || trend.length === 0) return [];
    return trend.filter((t) => t.label >= "2026-07");
  }, [trend]);

  // Process and sort trend data
  const processedItems = useMemo(() => {
    if (!effectiveTrend || effectiveTrend.length === 0) return [];
    const items = [...effectiveTrend];

    if (listHook.sorts.length > 0) {
      const sort = listHook.sorts[0];
      const isDesc = sort.startsWith("-");
      const field = sort.replace("-", "");

      items.sort((a: any, b: any) => {
        let valA = a[field];
        let valB = b[field];

        if (field === "tienCoThue") {
          valA = a.tienCoThue || a.totalBilled || 0;
          valB = b.tienCoThue || b.totalBilled || 0;
        }

        if (typeof valA === "string") {
          return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return isDesc
          ? Number(valB) - Number(valA)
          : Number(valA) - Number(valB);
      });
    }

    return items;
  }, [effectiveTrend, listHook.sorts]);

  const totalCases = useMemo(() => {
    return effectiveTrend.reduce((sum, item) => sum + (item.caseCount || 0), 0);
  }, [effectiveTrend]);

  // Columns for RECEIPT Tab (Khách hàng)
  const receiptColumns = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {idx}
          </span>
        ),
      },
      {
        key: "label",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.month", "Tháng")}
            sortState={
              listHook.sorts.includes("label")
                ? "asc"
                : listHook.sorts.includes("-label")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("label", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center font-medium",
        cell: (item: GarageTrendItem) => (
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-semibold text-foreground">
              {formatMonth(item.label)}
            </span>
          </div>
        ),
      },
      {
        key: "caseCount",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.caseCount", "Số vụ việc")}
            sortState={
              listHook.sorts.includes("caseCount")
                ? "asc"
                : listHook.sorts.includes("-caseCount")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("caseCount", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 110,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center tabular-nums text-muted-foreground",
        cell: (item: GarageTrendItem) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {item.caseCount} phiếu
          </span>
        ),
      },
      {
        key: "revenue",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.revenue", "Doanh thu thuần (P&L)")}
            sortState={
              listHook.sorts.includes("revenue")
                ? "asc"
                : listHook.sorts.includes("-revenue")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("revenue", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 170,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-semibold tabular-nums text-slate-700 dark:text-slate-300",
        cell: (item: GarageTrendItem) => money(item.revenue),
      },
      {
        key: "tienCoThue",
        header: (
          <TableColumnHeaderFilter
            title={t(
              "progress.columns.totalBilled",
              "Phải thu (Dịch vụ + VAT)",
            )}
            sortState={
              listHook.sorts.includes("tienCoThue")
                ? "asc"
                : listHook.sorts.includes("-tienCoThue")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("tienCoThue", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 180,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right font-bold tabular-nums text-foreground",
        cell: (item: GarageTrendItem) =>
          money(item.tienCoThue || item.totalBilled || 0),
      },
      {
        key: "paid",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.paid", "Đã thu (Thực thu)")}
            sortState={
              listHook.sorts.includes("paid")
                ? "asc"
                : listHook.sorts.includes("-paid")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("paid", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 160,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400",
        cell: (item: GarageTrendItem) => money(item.paid),
      },
      {
        key: "receivable",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.receivable", "Còn nợ (Phải thu)")}
            sortState={
              listHook.sorts.includes("receivable")
                ? "asc"
                : listHook.sorts.includes("-receivable")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("receivable", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 160,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-semibold tabular-nums text-amber-600 dark:text-amber-400",
        cell: (item: GarageTrendItem) => money(item.receivable),
      },
      {
        key: "collectionRate",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.rate", "Tỷ lệ thu & Tiến độ")}
            sortState={
              listHook.sorts.includes("collectionRate")
                ? "asc"
                : listHook.sorts.includes("-collectionRate")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("collectionRate", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 190,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item: GarageTrendItem) => {
          const rate = item.collectionRate;
          const diff = item.collectionRateDiff;
          const isPositive = diff > 0;
          const isZero = diff === 0;

          return (
            <div className="flex flex-col gap-1 w-full max-w-[170px]">
              <div className="flex items-center justify-between gap-1.5">
                <Badge
                  variant="outline"
                  className={`font-semibold px-1.5 py-0 text-[11px] border tabular-nums ${getBadgeVariant(rate)}`}
                >
                  {rate.toFixed(1)}%
                </Badge>

                {!isZero && (
                  <span
                    className={`inline-flex items-center text-[10px] font-bold ${
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {isPositive ? `+${diff}%` : `${diff}%`}
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                <div
                  className={`h-full rounded-full ${getProgressColor(rate)}`}
                  style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                />
              </div>
            </div>
          );
        },
      },
    ],
    [listHook, t],
  );

  // Columns for PAYMENT Tab (Nhà cung cấp / Chi phí)
  const paymentColumns = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {idx}
          </span>
        ),
      },
      {
        key: "label",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.month", "Tháng")}
            sortState={
              listHook.sorts.includes("label")
                ? "asc"
                : listHook.sorts.includes("-label")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("label", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center font-medium",
        cell: (item: GarageTrendItem) => (
          <span className="font-semibold text-foreground">
            {formatMonth(item.label)}
          </span>
        ),
      },
      {
        key: "caseCount",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.caseCount", "Số vụ việc")}
            sortState={
              listHook.sorts.includes("caseCount")
                ? "asc"
                : listHook.sorts.includes("-caseCount")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("caseCount", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 110,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center tabular-nums text-muted-foreground",
        cell: (item: GarageTrendItem) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {item.caseCount} phiếu
          </span>
        ),
      },
      {
        key: "cost",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.cost", "Phải trả (Tổng chi phí NCC)")}
            sortState={
              listHook.sorts.includes("cost")
                ? "asc"
                : listHook.sorts.includes("-cost")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("cost", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 180,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right font-bold tabular-nums text-foreground",
        cell: (item: GarageTrendItem) => money(item.cost),
      },
      {
        key: "paidCost",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.paidCost", "Đã trả (Thực chi)")}
            sortState={
              listHook.sorts.includes("paidCost")
                ? "asc"
                : listHook.sorts.includes("-paidCost")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("paidCost", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 160,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-semibold tabular-nums text-blue-600 dark:text-blue-400",
        cell: (item: GarageTrendItem) => money(item.paidCost),
      },
      {
        key: "payableCost",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.payableCost", "Còn nợ NCC")}
            sortState={
              listHook.sorts.includes("payableCost")
                ? "asc"
                : listHook.sorts.includes("-payableCost")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("payableCost", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 160,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-semibold tabular-nums text-amber-600 dark:text-amber-400",
        cell: (item: GarageTrendItem) => money(item.payableCost),
      },
      {
        key: "costPaymentRate",
        header: (
          <TableColumnHeaderFilter
            title={t("progress.columns.costRate", "Tỷ lệ trả & Tiến độ")}
            sortState={
              listHook.sorts.includes("costPaymentRate")
                ? "asc"
                : listHook.sorts.includes("-costPaymentRate")
                  ? "desc"
                  : "none"
            }
            onSortChange={(state) => listHook.setSort("costPaymentRate", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="center"
          />
        ),
        size: 190,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item: GarageTrendItem) => {
          const rate = item.costPaymentRate;
          const diff = item.costPaymentRateDiff;
          const isPositive = diff > 0;
          const isZero = diff === 0;

          return (
            <div className="flex flex-col gap-1 w-full max-w-[170px]">
              <div className="flex items-center justify-between gap-1.5">
                <Badge
                  variant="outline"
                  className={`font-semibold px-1.5 py-0 text-[11px] border tabular-nums ${getBadgeVariant(rate)}`}
                >
                  {rate.toFixed(1)}%
                </Badge>

                {!isZero && (
                  <span
                    className={`inline-flex items-center text-[10px] font-bold ${
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {isPositive ? `+${diff}%` : `${diff}%`}
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                <div
                  className={`h-full rounded-full ${getProgressColor(rate)}`}
                  style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                />
              </div>
            </div>
          );
        },
      },
    ],
    [listHook, t],
  );

  // Summary row for RECEIPT Tab
  const receiptSummaryRow = useMemo(
    () => ({
      index: (
        <span className="w-full block text-center font-bold text-muted-foreground">
          Σ
        </span>
      ),
      label: (
        <span className="font-bold text-center block uppercase tracking-wider text-xs text-foreground">
          {t("progress.summary.total", "TỔNG CỘNG")}
        </span>
      ),
      caseCount: (
        <span className="font-bold text-center block tabular-nums text-foreground">
          {totalCases} phiếu
        </span>
      ),
      revenue: (
        <span className="font-bold text-right block tabular-nums text-slate-700 dark:text-slate-300">
          {money(totalRevenue)}
        </span>
      ),
      tienCoThue: (
        <span className="font-bold text-right block tabular-nums text-primary text-sm">
          {money(totalBilled)}
        </span>
      ),
      paid: (
        <span className="font-bold text-right block tabular-nums text-emerald-600 dark:text-emerald-400 text-sm">
          {money(totalPaid)}
        </span>
      ),
      receivable: (
        <span className="font-bold text-right block tabular-nums text-amber-600 dark:text-amber-400 text-sm">
          {money(totalReceivable)}
        </span>
      ),
      collectionRate: (
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={`font-bold px-2 py-0.5 text-xs border tabular-nums ${getBadgeVariant(collectionRate)}`}
          >
            {collectionRate.toFixed(1)}% Hoàn tất
          </Badge>
        </div>
      ),
    }),
    [
      totalCases,
      totalRevenue,
      totalBilled,
      totalPaid,
      totalReceivable,
      collectionRate,
      t,
    ],
  );

  // Summary row for PAYMENT Tab
  const paymentSummaryRow = useMemo(
    () => ({
      index: (
        <span className="w-full block text-center font-bold text-muted-foreground">
          Σ
        </span>
      ),
      label: (
        <span className="font-bold text-center block uppercase tracking-wider text-xs text-foreground">
          {t("progress.summary.total", "TỔNG CỘNG")}
        </span>
      ),
      caseCount: (
        <span className="font-bold text-center block tabular-nums text-foreground">
          {totalCases} phiếu
        </span>
      ),
      cost: (
        <span className="font-bold text-right block tabular-nums text-primary text-sm">
          {money(totalCost)}
        </span>
      ),
      paidCost: (
        <span className="font-bold text-right block tabular-nums text-blue-600 dark:text-blue-400 text-sm">
          {money(totalPaidCost)}
        </span>
      ),
      payableCost: (
        <span className="font-bold text-right block tabular-nums text-amber-600 dark:text-amber-400 text-sm">
          {money(totalPayableCost)}
        </span>
      ),
      costPaymentRate: (
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={`font-bold px-2 py-0.5 text-xs border tabular-nums ${getBadgeVariant(costPaymentRate)}`}
          >
            {costPaymentRate.toFixed(1)}% Hoàn tất
          </Badge>
        </div>
      ),
    }),
    [
      totalCases,
      totalCost,
      totalPaidCost,
      totalPayableCost,
      costPaymentRate,
      t,
    ],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
            {isReceipt ? (
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            )}
            Tiến độ Dòng tiền & Công nợ Dịch vụ
          </h4>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 gap-1">
          <button
            onClick={() => setActiveTab("RECEIPT")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              isReceipt
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Tiến độ Thu tiền (Khách hàng)
          </button>
          <button
            onClick={() => setActiveTab("PAYMENT")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              !isReceipt
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Tiến độ Trả tiền (Chi phí NCC)
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm p-5 flex flex-col gap-4">
        {/* Progress Bar & Rate Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {isReceipt
                  ? "Tỷ lệ hoàn tất thu tiền dịch vụ"
                  : "Tỷ lệ hoàn tất chi trả chi phí / NCC"}
              </span>
              <Badge
                variant="outline"
                className={`font-semibold px-2 py-0.5 text-xs border ${getBadgeVariant(currentRate)}`}
              >
                {currentRate.toFixed(1)}% Hoàn tất
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {isReceipt ? "Đã thu" : "Đã trả"}{" "}
              <strong
                className={
                  isReceipt
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-blue-600 dark:text-blue-400 font-semibold"
                }
              >
                {money(currentPaid)}
              </strong>{" "}
              / Tổng {money(currentTotal)}
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(currentRate)}`}
              style={{
                width: `${loading ? 0 : Math.min(100, Math.max(0, currentRate))}%`,
              }}
            />
          </div>
        </div>

        {/* Section: Standardized DataTable Breakdown by Month */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-primary" />
              Chi tiết {isReceipt
                ? "Phải thu & Đã thu"
                : "Phải trả & Đã trả"}{" "}
              theo từng tháng
            </span>
            <span className="text-[11px] text-muted-foreground">
              So sánh chi tiết từng tháng (Phải thu = Doanh thu + VAT, Đã thu
              thực tế và Dư nợ)
            </span>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <DataTable
              items={processedItems}
              getRowKey={(item) => item.label}
              variant="spreadsheet"
              emptyLabel={t(
                "progress.empty",
                "Chưa có dữ liệu giao dịch trong kỳ",
              )}
              loading={loading}
              columns={isReceipt ? receiptColumns : paymentColumns}
              summaryRow={isReceipt ? receiptSummaryRow : paymentSummaryRow}
              enableColumnResizing={true}
              tableId={tableId}
            />
          </div>
        </div>

        {/* Footnote Note */}
        <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 italic bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
          <span>*</span>
          <span>
            {isReceipt
              ? "Tổng tiền dịch vụ hiển thị theo đúng số tiền thực tế khách hàng phải thanh toán (Doanh thu thuần + Thuế GTGT VAT). Dữ liệu được tính từ mốc đối soát dòng tiền tháng 07/2026 trở đi."
              : "Tổng chi phí hiển thị theo giá vốn phụ tùng & chi phí gia công thực tế phát sinh. Dữ liệu được tính từ mốc đối soát dòng tiền tháng 07/2026 trở đi."}
          </span>
        </div>
      </div>
    </div>
  );
}
